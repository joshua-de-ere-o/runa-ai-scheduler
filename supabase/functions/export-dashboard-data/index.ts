import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") ?? "leads";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let data: Record<string, unknown>[] = [];
    let filename = "export.csv";

    if (type === "leads") {
      const res = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      data = res.data ?? [];
      filename = "leads.csv";
    } else if (type === "appointments") {
      const res = await supabase.from("appointments").select("*").order("appointment_date", { ascending: false });
      data = res.data ?? [];
      filename = "appointments.csv";
    } else if (type === "metrics" || type === "revenue") {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const leadsRes = await supabase.from("leads").select("*").gte("created_at", startOfMonth);
      const apptRes = await supabase.from("appointments").select("*").gte("appointment_date", startOfMonth);
      const settingsRes = await supabase.from("clinic_settings").select("ticket_avg, currency").limit(1);
      const ticket_avg = Number(settingsRes.data?.[0]?.ticket_avg ?? 60);
      const leads = leadsRes.data ?? [];
      const appts = apptRes.data ?? [];
      const confirmed = appts.filter((a) => a.status === "confirmed").length;

      data = [{
        periodo: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
        leads_mes: leads.length,
        citas_agendadas: appts.length,
        citas_confirmadas: confirmed,
        ingreso_estimado: confirmed * ticket_avg,
        tasa_conversion_pct: leads.length > 0 ? Math.round((appts.length / leads.length) * 1000) / 10 : 0,
        ticket_promedio: ticket_avg,
        currency: settingsRes.data?.[0]?.currency ?? "USD",
      }];
      filename = type === "revenue" ? "rendimiento_ingresos.csv" : "metricas.csv";
    }

    const csv = toCSV(data);

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
