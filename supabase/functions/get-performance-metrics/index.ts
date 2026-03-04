import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Parallel queries
    const [leadsRes, appointmentsRes, settingsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("id, created_at, stage")
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth),
      supabase
        .from("appointments")
        .select("id, status, appointment_date")
        .gte("appointment_date", startOfMonth)
        .lte("appointment_date", endOfMonth),
      supabase.from("clinic_settings").select("ticket_avg, currency, monthly_revenue_goal").limit(1),
    ]);

    const leads = leadsRes.data ?? [];
    const appointments = appointmentsRes.data ?? [];
    const settings = settingsRes.data?.[0] ?? { ticket_avg: 60, currency: "USD", monthly_revenue_goal: 5000 };

    const leads_month = leads.length;
    const appointments_month = appointments.length;
    const confirmed_month = appointments.filter((a) => a.status === "confirmed").length;
    const no_show_count = appointments.filter((a) => a.status === "no_show").length;
    const ticket_avg = Number(settings.ticket_avg ?? 60);
    const estimated_revenue = confirmed_month * ticket_avg;

    // Conversion rates
    const lead_to_booking_rate = leads_month > 0 ? (appointments_month / leads_month) * 100 : 0;
    const booking_to_confirm_rate = appointments_month > 0 ? (confirmed_month / appointments_month) * 100 : 0;
    const no_show_rate = confirmed_month > 0 ? (no_show_count / confirmed_month) * 100 : 0;

    // Projection
    const daily_lead_rate = dayOfMonth > 0 ? leads_month / dayOfMonth : 0;
    const estimated_leads_month = daily_lead_rate * daysInMonth;
    const conversion_rate = leads_month > 0 ? confirmed_month / leads_month : 0;
    const estimated_confirmed_month = estimated_leads_month * conversion_rate;
    const projected_revenue = estimated_confirmed_month * ticket_avg;

    // Daily leads for chart (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const allLeadsRes = await supabase
      .from("leads")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }
    (allLeadsRes.data ?? []).forEach((l) => {
      const key = l.created_at.split("T")[0];
      if (key in dailyMap) dailyMap[key]++;
    });
    const daily_leads = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    // Funnel stages
    const allLeadsStageRes = await supabase.from("leads").select("stage");
    const allLeads = allLeadsStageRes.data ?? [];
    const stages = ["nuevo", "calificado", "interesado", "agendado", "confirmado"];
    const funnel = stages.map((stage) => ({
      stage,
      count: allLeads.filter((l) => l.stage === stage).length,
    }));

    // Recent appointments
    const recentRes = await supabase
      .from("appointments")
      .select("patient_name, appointment_date, appointment_type, status, phone_number")
      .order("appointment_date", { ascending: false })
      .limit(10);

    return new Response(
      JSON.stringify({
        leads_month,
        appointments_month,
        confirmed_month,
        estimated_revenue,
        projected_revenue: Math.round(projected_revenue),
        lead_to_booking_rate: Math.round(lead_to_booking_rate * 10) / 10,
        booking_to_confirm_rate: Math.round(booking_to_confirm_rate * 10) / 10,
        no_show_rate: Math.round(no_show_rate * 10) / 10,
        ticket_avg,
        currency: settings.currency ?? "USD",
        monthly_revenue_goal: settings.monthly_revenue_goal ?? 5000,
        daily_leads,
        funnel,
        recent_appointments: recentRes.data ?? [],
        day_of_month: dayOfMonth,
        days_in_month: daysInMonth,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
