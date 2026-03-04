// ============================================================
// Runa AI — YCloud WhatsApp Webhook (Edge Function)
// Cerebro: recibe inbound → dedupe → memoria → Erika (OpenAI) → responde YCloud
// PROHIBIDO: ninguna referencia a Twilio
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// YCloud Provider Adapter
// ============================================================
interface OutboundMessage {
  to: string;
  text?: string;
  interactive?: unknown;
}

class YCloudProvider {
  private apiKey: string;
  private baseUrl: string;
  private senderId: string;

  constructor(apiKey: string, baseUrl: string, senderId: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.senderId = senderId;
  }

  async sendMessage(msg: OutboundMessage): Promise<{ messageId: string }> {
    const body: Record<string, unknown> = {
      from: this.senderId,
      to: msg.to,
      type: msg.text ? "text" : "interactive",
    };
    if (msg.text) body.text = { body: msg.text };
    if (msg.interactive) body.interactive = msg.interactive;

    const res = await fetch(`${this.baseUrl}/whatsapp/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YCloud sendMessage failed: ${res.status} ${err}`);
    }
    const data = await res.json();
    return { messageId: data.id ?? data.messageId ?? "unknown" };
  }

  parseInbound(payload: Record<string, unknown>): {
    from: string;
    text: string;
    messageId: string;
    timestamp: string;
  } | null {
    try {
      // YCloud webhook structure
      const message = (payload as any)?.message ?? payload;
      const from = message?.from ?? (payload as any)?.from;
      const text =
        message?.text?.body ??
        message?.text ??
        (payload as any)?.body ??
        "";
      const messageId = message?.id ?? (payload as any)?.messageId ?? "";
      const timestamp =
        message?.timestamp ?? (payload as any)?.timestamp ?? new Date().toISOString();

      if (!from || !messageId) return null;
      return { from: String(from), text: String(text), messageId: String(messageId), timestamp: String(timestamp) };
    } catch {
      return null;
    }
  }
}

// ============================================================
// OpenAI Tool Schemas
// ============================================================
const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_settings",
      description: "Obtiene la configuración de la clínica (horarios, timezone, servicios).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead",
      description: "Actualiza datos del lead: nombre, objetivo, stage, score, objeción, consentimiento.",
      parameters: {
        type: "object",
        properties: {
          lead_id: { type: "string" },
          full_name: { type: "string" },
          goal: { type: "string" },
          funnel_stage: { type: "string", enum: ["tofu", "mofu", "bofu"] },
          pipeline_stage: { type: "string", enum: ["new","qualified","interested","booked","confirmed","followup","lost","do_not_contact"] },
          objection: { type: "string" },
          score_delta: { type: "number", description: "Incremento/decremento del score (-100..100)" },
          consent: { type: "boolean" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["lead_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_slots",
      description: "Sugiere 3 horarios disponibles dado un rango de fechas y duración.",
      parameters: {
        type: "object",
        properties: {
          range_start_iso: { type: "string", description: "Inicio del rango ISO 8601" },
          range_end_iso: { type: "string", description: "Fin del rango ISO 8601" },
          duration_min: { type: "number" },
        },
        required: ["range_start_iso", "range_end_iso", "duration_min"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_availability",
      description: "Verifica si un slot específico está disponible.",
      parameters: {
        type: "object",
        properties: {
          start_iso: { type: "string" },
          end_iso: { type: "string" },
        },
        required: ["start_iso", "end_iso"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment",
      description: "Crea una cita en estado pending.",
      parameters: {
        type: "object",
        properties: {
          lead_id: { type: "string" },
          patient_name: { type: "string" },
          service_id: { type: "string" },
          start_iso: { type: "string" },
          end_iso: { type: "string" },
        },
        required: ["lead_id", "patient_name", "start_iso", "end_iso"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "confirm_appointment",
      description: "Confirma una cita (pending → confirmed).",
      parameters: {
        type: "object",
        properties: { appointment_id: { type: "string" } },
        required: ["appointment_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_appointment",
      description: "Cancela una cita.",
      parameters: {
        type: "object",
        properties: { appointment_id: { type: "string" } },
        required: ["appointment_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_do_not_contact",
      description: "Marca al lead como do_not_contact (STOP).",
      parameters: {
        type: "object",
        properties: { lead_id: { type: "string" } },
        required: ["lead_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "handoff_to_human",
      description: "Deriva la conversación al equipo humano.",
      parameters: {
        type: "object",
        properties: {
          conversation_id: { type: "string" },
          reason: { type: "string" },
        },
        required: ["conversation_id", "reason"],
      },
    },
  },
];

// ============================================================
// Tool Executor
// ============================================================
async function executeTool(
  name: string,
  args: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  lead: { id: string; score: number }
): Promise<string> {
  try {
    switch (name) {
      case "get_settings": {
        const { data } = await supabase.from("clinic_settings").select("*").eq("id", 1).single();
        const { data: svcs } = await supabase.from("services").select("name,duration_min").eq("active", true);
        return JSON.stringify({ settings: data, services: svcs });
      }
      case "update_lead": {
        const { lead_id, score_delta, ...fields } = args as Record<string, unknown>;
        const update: Record<string, unknown> = { ...fields };
        if (score_delta) {
          const newScore = Math.max(0, Math.min(100, (lead.score ?? 0) + Number(score_delta)));
          update.score = newScore;
        }
        await supabase.from("leads").update(update).eq("id", lead_id);
        return JSON.stringify({ ok: true });
      }
      case "suggest_slots": {
        const { range_start_iso, duration_min } = args as { range_start_iso: string; duration_min: number };
        const base = new Date(range_start_iso);
        const slots = [9, 11, 14, 16, 17].map(h => {
          const s = new Date(base); s.setHours(h, 0, 0, 0);
          const e = new Date(s); e.setMinutes(e.getMinutes() + duration_min);
          return { start: s.toISOString(), end: e.toISOString() };
        }).slice(0, 3);
        return JSON.stringify({ slots });
      }
      case "check_availability": {
        const { start_iso, end_iso } = args as { start_iso: string; end_iso: string };
        const { data } = await supabase
          .from("appointments")
          .select("id")
          .in("status", ["pending", "confirmed"])
          .lt("start_at", end_iso)
          .gt("end_at", start_iso);
        return JSON.stringify({ available: !data?.length });
      }
      case "create_appointment": {
        const { lead_id, patient_name, service_id, start_iso, end_iso } = args as Record<string, string>;
        const lead_row = await supabase.from("leads").select("phone_number").eq("id", lead_id).single();
        const { data } = await supabase.from("appointments").insert({
          lead_id, patient_name,
          service_id: service_id ?? null,
          phone_number: lead_row.data?.phone_number ?? "",
          start_at: start_iso, end_at: end_iso, status: "pending",
        }).select("id").single();
        await supabase.from("leads").update({ pipeline_stage: "booked" }).eq("id", lead_id);
        return JSON.stringify({ appointment_id: data?.id });
      }
      case "confirm_appointment": {
        const { appointment_id } = args as { appointment_id: string };
        await supabase.from("appointments").update({ status: "confirmed" }).eq("id", appointment_id);
        const { data: appt } = await supabase.from("appointments").select("lead_id").eq("id", appointment_id).single();
        if (appt?.lead_id) await supabase.from("leads").update({ pipeline_stage: "confirmed" }).eq("id", appt.lead_id);
        return JSON.stringify({ ok: true });
      }
      case "cancel_appointment": {
        await supabase.from("appointments").update({ status: "cancelled" }).eq("id", args.appointment_id);
        return JSON.stringify({ ok: true });
      }
      case "set_do_not_contact": {
        await supabase.from("leads").update({ pipeline_stage: "do_not_contact" }).eq("id", args.lead_id);
        return JSON.stringify({ ok: true });
      }
      case "handoff_to_human": {
        await supabase.from("conversations").update({ status: "handoff" }).eq("id", args.conversation_id);
        return JSON.stringify({ ok: true, message: "Conversación derivada al equipo humano." });
      }
      default:
        return JSON.stringify({ error: "Herramienta desconocida: " + name });
    }
  } catch (e) {
    console.error(`Tool ${name} error:`, e);
    return JSON.stringify({ error: String(e) });
  }
}

// ============================================================
// Main Handler
// ============================================================
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── 1. Init Supabase (always needed) ─────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    // OpenAI initialized lazily below — after webhook GET verification

    // ── 2. Load YCloud config ────────────────────────────────
    const { data: settings } = await supabase
      .from("clinic_settings").select("*").eq("id", 1).single();

    // ── 3. Webhook verification (GET) ───────────────────────
    const webhookToken = (Deno.env.get("YCLOUD_WEBHOOK_TOKEN") ?? settings?.yc_webhook_verify_token ?? "").trim();
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = (url.searchParams.get("verify_token") ?? url.searchParams.get("hub.verify_token") ?? "").trim();
      const challenge = url.searchParams.get("challenge") ?? url.searchParams.get("hub.challenge");
      console.log("Webhook verify — received token:", token, "expected length:", webhookToken.length);
      if (token === webhookToken) {
        return new Response(challenge ?? "ok", { headers: { "Content-Type": "text/plain" } });
      }
      return new Response("Unauthorized", { status: 401 });
    }

    // ── 4. Parse payload ─────────────────────────────────────
    const payload = await req.json();
    const provider = new YCloudProvider(
      Deno.env.get("YCLOUD_API_KEY") ?? "",
      "https://api.ycloud.com/v2",
      Deno.env.get("YCLOUD_SENDER_ID") ?? settings?.yc_sender_id ?? ""
    );
    const parsed = provider.parseInbound(payload);
    if (!parsed) {
      console.log("YCloud: no parseable message in payload");
      return new Response("ok", { status: 200 });
    }
    const { from, text, messageId, timestamp } = parsed;

    // ── 5. Deduplication ─────────────────────────────────────
    const { data: existing } = await supabase
      .from("messages").select("id").eq("provider_message_id", messageId).single();
    if (existing) {
      console.log("Dedup: messageId already processed:", messageId);
      return new Response("ok", { status: 200 });
    }

    // ── 6. Upsert lead ───────────────────────────────────────
    const { data: lead } = await supabase
      .from("leads")
      .upsert({ phone_number: from, last_contact_at: new Date().toISOString() }, { onConflict: "phone_number" })
      .select().single();

    // ── 7. Upsert conversation ───────────────────────────────
    const { data: conv } = await supabase
      .from("conversations")
      .upsert({
        phone_number: from,
        lead_id: lead?.id,
        last_message_at: new Date().toISOString(),
        status: "open",
      }, { onConflict: "phone_number" })
      .select().single();

    // ── 8. Insert inbound message ────────────────────────────
    await supabase.from("messages").insert({
      conversation_id: conv?.id,
      phone_number: from,
      direction: "inbound",
      content: text,
      provider: "ycloud",
      provider_message_id: messageId,
      raw_payload: payload,
    });

    // ── 9. Handle STOP ───────────────────────────────────────
    const stopWords = ["stop", "no me escribas", "no me contactes", "baja", "elimina"];
    if (stopWords.some(w => text.toLowerCase().includes(w))) {
      await supabase.from("leads").update({ pipeline_stage: "do_not_contact" }).eq("id", lead?.id);
      const stopMsg = "Entendido. No volveremos a contactarte por este canal.";
      await provider.sendMessage({ to: from, text: stopMsg });
      await supabase.from("messages").insert({
        conversation_id: conv?.id, phone_number: from,
        direction: "outbound", content: stopMsg, provider: "ycloud",
      });
      return new Response("ok", { status: 200 });
    }

    // ── 10. Memory: last 15 messages ─────────────────────────
    const { data: history } = await supabase
      .from("messages")
      .select("direction,content,created_at")
      .eq("conversation_id", conv?.id)
      .order("created_at", { ascending: true })
      .limit(15);

    // ── 11. Build timezone context ───────────────────────────
    const tz = settings?.timezone ?? "America/Guayaquil";
    const localNow = new Date().toLocaleString("es-EC", { timeZone: tz, dateStyle: "full", timeStyle: "short" });

    // ── 12. Build services string ────────────────────────────
    const { data: svcs } = await supabase.from("services").select("name,duration_min").eq("active", true);
    const servicesStr = svcs?.map((s: { name: string; duration_min: number }) => `${s.name} (${s.duration_min} min)`).join(", ") ?? "Consulta Inicial, Control Mensual";

    // ── 13. System Prompt Erika ───────────────────────────────
    const systemPrompt = `Eres ERIKA, asistente virtual de agenda de la Dra. Kely León (Nutriología).
Tu objetivo único: convertir conversaciones en CITAS AGENDADAS Y CONFIRMADAS, con mínima fricción.

Zona horaria de la clínica: ${tz}. Hora local actual: ${localNow}.
Servicios disponibles: ${servicesStr}.
Horarios de atención: ${JSON.stringify(settings?.working_hours)}.
Lead ID actual: ${lead?.id ?? "desconocido"}.
Conversation ID actual: ${conv?.id ?? "desconocido"}.

REGLAS CLÍNICAS/LEGALES
- No diagnosticas, no prescribes dietas, no recomiendas medicación ni suplementos como tratamiento.
- No prometes resultados.
- Si el usuario reporta signos de alarma (dolor fuerte, desmayo, sangrado, embarazo con complicaciones, ideación suicida, TCA severo, emergencia médica): deriva urgencias + usa handoff_to_human.
- Antes de guardar nombre/objetivo/disponibilidad pide consentimiento: "¿Me autorizas a guardar estos datos solo para agendar tu cita?"
- Si el usuario dice "STOP", "NO", "no me escribas": usar set_do_not_contact y despedir.

ESTILO
- Español LatAm. Mensajes cortos (1–3 líneas). Una pregunta por turno.
- Tono profesional, cálido y directo. Sin emojis (salvo que el usuario use; máximo 1).
- Siempre termina con una acción concreta.

FUNNEL
- TOFU: entender objetivo con 1 pregunta.
- MOFU: resolver 1 objeción + pedir dato mínimo.
- BOFU: proponer 2–3 horarios concretos y cerrar confirmación.

PROTOCOLO
1) Si es primer contacto: "Hola, soy Erika, asistente virtual de la Dra. Kely León. ¿Buscas bajar grasa, mejorar digestión/energía o recomposición corporal?"
2) Calificación mínima: nombre → objetivo → preferencia de horario
3) Cierre: ofrecer 2–3 slots → confirmar datos → create_appointment(pending) → pedir "¿Confirmas?" → confirm_appointment → recordatorio 24h

OBJECIONES
- Precio: "Entiendo. ¿Te propongo 2 horarios y te explico opciones antes de confirmar?"
- Tiempo: "¿Te va mejor entre semana o sábado?"
- "Ya intenté todo": "¿Tu principal bloqueo es ansiedad, estancamiento o falta de rutina?"

FORMATO FECHAS
- Interno: ISO 8601 con offset. Al usuario: "Jue 7 Mar, 17:00".`;

    // ── 14. Build messages for OpenAI ─────────────────────────
    const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((m: { direction: string; content: string }) => ({
        role: m.direction === "inbound" ? "user" as const : "assistant" as const,
        content: m.content ?? "",
      })),
    ];

    // ── 15. OpenAI with tool calling loop ────────────────────
    // Lazy init — only instantiated here so GET webhook verification works without OPENAI_API_KEY
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") ?? "" });
    const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
    let response = await openai.chat.completions.create({
      model, messages: chatMessages, tools: TOOLS, tool_choice: "auto",
    });

    // Agentic loop: execute tools until no more tool calls
    let iterations = 0;
    while (response.choices[0]?.finish_reason === "tool_calls" && iterations < 5) {
      iterations++;
      const toolCalls = response.choices[0].message.tool_calls ?? [];
      chatMessages.push(response.choices[0].message);

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments || "{}");
        console.log(`Tool call: ${tc.function.name}`, args);
        const result = await executeTool(tc.function.name, args, supabase, { id: lead?.id ?? "", score: lead?.score ?? 0 });
        chatMessages.push({ role: "tool", tool_call_id: tc.id, content: result });
      }

      response = await openai.chat.completions.create({ model, messages: chatMessages, tools: TOOLS, tool_choice: "auto" });
    }

    const reply = response.choices[0]?.message?.content ?? "Disculpá, hubo un inconveniente. El equipo te contactará pronto.";

    // ── 16. Send outbound via YCloud ──────────────────────────
    await provider.sendMessage({ to: from, text: reply });

    // ── 17. Save outbound message ─────────────────────────────
    await supabase.from("messages").insert({
      conversation_id: conv?.id, phone_number: from,
      direction: "outbound", content: reply, provider: "ycloud",
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("ycloud-webhook-whatsapp fatal error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
