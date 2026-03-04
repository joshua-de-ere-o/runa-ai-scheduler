// Runa AI — send-reminders Edge Function
// Recordatorios 24h y 2h vía YCloud (sin Twilio)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsApp(to: string, text: string, apiKey: string, baseUrl: string, senderId: string) {
  const res = await fetch(`${baseUrl}/whatsapp/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ from: senderId, to, type: "text", text: { body: text } }),
  });
  if (!res.ok) throw new Error(`YCloud error: ${res.status} ${await res.text()}`);
  return await res.json();
}

function formatDate(iso: string, tz: string): string {
  return new Date(iso).toLocaleString("es-EC", {
    timeZone: tz, weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings } = await supabase.from("clinic_settings").select("*").eq("id", 1).single();
    const tz = settings?.timezone ?? "America/Guayaquil";
    const apiKey = Deno.env.get("YCLOUD_API_KEY") ?? "";
    const baseUrl = Deno.env.get("YCLOUD_API_BASE_URL") ?? settings?.yc_api_base_url ?? "https://api.ycloud.com/v2";
    const senderId = Deno.env.get("YCLOUD_SENDER_ID") ?? settings?.yc_sender_id ?? "";

    const now = new Date();
    const results = { reminder24: 0, reminder2h: 0, errors: 0 };

    // ── 24h Reminders ────────────────────────────────────────
    const tomorrow_start = new Date(now);
    tomorrow_start.setDate(tomorrow_start.getDate() + 1);
    tomorrow_start.setHours(0, 0, 0, 0);
    const tomorrow_end = new Date(tomorrow_start);
    tomorrow_end.setHours(23, 59, 59, 999);

    const { data: appts24 } = await supabase
      .from("appointments")
      .select("*, leads(full_name, phone_number)")
      .eq("status", "confirmed")
      .eq("reminder_24h_sent", false)
      .gte("start_at", tomorrow_start.toISOString())
      .lte("start_at", tomorrow_end.toISOString());

    for (const appt of appts24 ?? []) {
      try {
        const name = appt.patient_name ?? (appt.leads as { full_name?: string })?.full_name ?? "paciente";
        const fecha = formatDate(appt.start_at, tz);
        const msg = `Hola ${name}, te recordamos tu consulta con la Dra. Kely León mañana ${fecha}. ¿Confirmas tu asistencia? Responde SÍ para confirmar.`;
        await sendWhatsApp(appt.phone_number, msg, apiKey, baseUrl, senderId);
        await supabase.from("appointments").update({ reminder_24h_sent: true }).eq("id", appt.id);
        results.reminder24++;
      } catch (e) {
        console.error("reminder_24h error:", e);
        results.errors++;
      }
    }

    // ── 2h Reminders ─────────────────────────────────────────
    const window_start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const window_end = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const { data: appts2h } = await supabase
      .from("appointments")
      .select("*, leads(full_name, phone_number)")
      .eq("status", "confirmed")
      .eq("reminder_2h_sent", false)
      .gte("start_at", window_start.toISOString())
      .lte("start_at", window_end.toISOString());

    for (const appt of appts2h ?? []) {
      try {
        const name = appt.patient_name ?? (appt.leads as { full_name?: string })?.full_name ?? "paciente";
        const msg = `Hola ${name}, en 2 horas tenés tu consulta con la Dra. Kely León. ¡Te esperamos!`;
        await sendWhatsApp(appt.phone_number, msg, apiKey, baseUrl, senderId);
        await supabase.from("appointments").update({ reminder_2h_sent: true }).eq("id", appt.id);
        results.reminder2h++;
      } catch (e) {
        console.error("reminder_2h error:", e);
        results.errors++;
      }
    }

    console.log("send-reminders results:", results);
    return new Response(JSON.stringify({ ok: true, ...results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-reminders fatal:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
