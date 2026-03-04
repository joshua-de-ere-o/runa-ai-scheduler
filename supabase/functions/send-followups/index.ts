// Runa AI — send-followups Edge Function
// Seguimiento a leads mofu/bofu sin cita, respetando do_not_contact y anti-spam

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOLLOWUP_SEQUENCE = [
  { offsetHours: 6,  templateKey: "followup_1", msg: (name: string) => `Hola ${name}, ¿pudiste revisar la información? Quedé aquí para ayudarte a agendar.` },
  { offsetHours: 24, templateKey: "followup_2", msg: (name: string) => `Hola ${name}, quería contarte que tenemos disponibilidad esta semana. ¿Te gustaría agendar tu consulta con la Dra. Kely?` },
  { offsetHours: 72, templateKey: "followup_3", msg: (name: string) => `Hola ${name}, este es mi último mensaje. Si en algún momento querés consultar, acá estamos. ¡Cuídate!` },
];

async function sendWhatsApp(to: string, text: string, apiKey: string, baseUrl: string, senderId: string) {
  const res = await fetch(`${baseUrl}/whatsapp/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ from: senderId, to, type: "text", text: { body: text } }),
  });
  if (!res.ok) throw new Error(`YCloud error: ${res.status} ${await res.text()}`);
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await supabase.from("clinic_settings").select("*").eq("id", 1).single();
    const apiKey = Deno.env.get("YCLOUD_API_KEY") ?? "";
    const baseUrl = Deno.env.get("YCLOUD_API_BASE_URL") ?? settings?.yc_api_base_url ?? "https://api.ycloud.com/v2";
    const senderId = Deno.env.get("YCLOUD_SENDER_ID") ?? settings?.yc_sender_id ?? "";

    const now = new Date();
    const results = { sent: 0, skipped: 0, errors: 0 };

    // ── Leads elegibles: mofu/bofu, sin cita confirmada, no do_not_contact ──
    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .in("funnel_stage", ["mofu", "bofu"])
      .not("pipeline_stage", "in", '("confirmed","do_not_contact","lost")')
      .not("last_contact_at", "is", null);

    for (const lead of leads ?? []) {
      try {
        // Check if they have a confirmed/pending appointment
        const { data: appts } = await supabase
          .from("appointments")
          .select("id")
          .eq("lead_id", lead.id)
          .in("status", ["pending", "confirmed"]);
        if (appts && appts.length > 0) { results.skipped++; continue; }

        const lastContact = new Date(lead.last_contact_at);
        const hoursSinceContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60);

        // Count how many followups already sent (via messages outbound)
        const { count: followupCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("phone_number", lead.phone_number)
          .eq("direction", "outbound")
          .gte("created_at", new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString());

        const sent = followupCount ?? 0;
        if (sent >= FOLLOWUP_SEQUENCE.length) { results.skipped++; continue; }

        const seq = FOLLOWUP_SEQUENCE[sent];
        if (hoursSinceContact < seq.offsetHours) { results.skipped++; continue; }

        const name = lead.full_name?.split(" ")[0] ?? "hola";
        const msg = seq.msg(name);
        await sendWhatsApp(lead.phone_number, msg, apiKey, baseUrl, senderId);

        // Save outbound message
        const { data: conv } = await supabase
          .from("conversations")
          .select("id").eq("phone_number", lead.phone_number).single();

        if (conv?.id) {
          await supabase.from("messages").insert({
            conversation_id: conv.id, phone_number: lead.phone_number,
            direction: "outbound", content: msg, provider: "ycloud",
          });
        }

        await supabase.from("leads").update({
          last_contact_at: now.toISOString(),
          pipeline_stage: sent >= FOLLOWUP_SEQUENCE.length - 1 ? "followup" : lead.pipeline_stage,
        }).eq("id", lead.id);

        results.sent++;
      } catch (e) {
        console.error("followup error for lead", lead.id, e);
        results.errors++;
      }
    }

    console.log("send-followups results:", results);
    return new Response(JSON.stringify({ ok: true, ...results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-followups fatal:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
