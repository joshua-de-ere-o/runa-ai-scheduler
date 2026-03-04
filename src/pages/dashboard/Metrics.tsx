import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Calendar, Clock, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const SOURCE_COLORS = ["hsl(142,71%,45%)", "hsl(142,71%,55%)", "hsl(160,70%,42%)", "hsl(166,76%,50%)", "hsl(120,60%,35%)"];

const FUNNEL_STAGES = [
  { key: "new", label: "Nuevo" },
  { key: "qualified", label: "Calificado" },
  { key: "interested", label: "Interesado" },
  { key: "booked", label: "Agendado" },
  { key: "confirmed", label: "Confirmado" },
];

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [bookingRate, setBookingRate] = useState(0);
  const [totalAppts, setTotalAppts] = useState(0);
  const [noShows, setNoShows] = useState(0);
  const [funnelData, setFunnelData] = useState<{ stage: string; count: number; pct: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [dailyData, setDailyData] = useState<{ day: string; leads: number; agendadas: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Leads this month
      const { data: leads } = await supabase
        .from("leads")
        .select("id, source, pipeline_stage, stage, created_at")
        .gte("created_at", monthStart);

      const leadsArr = leads ?? [];
      setTotalLeads(leadsArr.length);

      const getStage = (l: any) => l.pipeline_stage ?? l.stage ?? "new";
      const booked = leadsArr.filter(l => ["booked", "confirmed"].includes(getStage(l))).length;
      setBookingRate(leadsArr.length > 0 ? Math.round((booked / leadsArr.length) * 100) : 0);

      // Funnel data
      const topCount = leadsArr.length || 1;
      setFunnelData(FUNNEL_STAGES.map(s => {
        const count = leadsArr.filter(l => getStage(l) === s.key).length;
        return { stage: s.label, count, pct: Math.round((count / topCount) * 100) };
      }));

      // Source breakdown
      const sourceCounts: Record<string, number> = {};
      leadsArr.forEach(l => {
        const src = l.source ?? "Desconocido";
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
      });
      setSourceData(Object.entries(sourceCounts).map(([name, value]) => ({ name, value })));

      // Appointments this month
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, status, appointment_date")
        .gte("appointment_date", monthStart);

      const apptsArr = appts ?? [];
      setTotalAppts(apptsArr.length);
      setNoShows(apptsArr.filter(a => a.status === "no_show").length);

      // Daily leads last 7 days
      const days: { day: string; leads: number; agendadas: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
        const dayLabel = d.toLocaleDateString("es-EC", { weekday: "short" });
        const dayLeads = leadsArr.filter(l => {
          const c = new Date(l.created_at);
          return c >= dayStart && c <= dayEnd;
        }).length;
        const dayAppts = apptsArr.filter(a => {
          const c = new Date(a.appointment_date);
          return c >= dayStart && c <= dayEnd;
        }).length;
        days.push({ day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3), leads: dayLeads, agendadas: dayAppts });
      }
      setDailyData(days);
      setLoading(false);
    };
    load();
  }, []);

  const monthLabel = new Date().toLocaleDateString("es-EC", { month: "long", year: "numeric" });

  const KPIS = [
    { label: "Leads este mes", value: String(totalLeads), icon: Users, up: true, delta: "" },
    { label: "Tasa de agendamiento", value: `${bookingRate}%`, icon: Calendar, up: bookingRate > 30, delta: "" },
    { label: "Citas este mes", value: String(totalAppts), icon: Clock, up: true, delta: "" },
    { label: "No-shows", value: String(noShows), icon: Target, up: noShows === 0, delta: "" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Calculando métricas...
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Métricas</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">Período: {monthLabel} · Zona: America/Guayaquil</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {KPIS.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg gradient-green flex items-center justify-center">
                <k.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                k.up ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600")}>
                {k.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {k.up ? "bien" : "revisar"}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-2 bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-4 text-sm">Leads vs. Agendadas (últimos 7 días)</h2>
          {dailyData.every(d => d.leads === 0 && d.agendadas === 0) ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos esta semana</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,14%,91%)", fontSize: 12 }} />
                <Bar dataKey="leads" fill="hsl(166,76%,90%)" radius={[4, 4, 0, 0]} name="Leads" />
                <Bar dataKey="agendadas" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Agendadas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-4 text-sm">Fuente de leads</h2>
          {sourceData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Sin datos</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                    dataKey="value" paddingAngle={3}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,14%,91%)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {sourceData.map((s, i) => {
                  const total = sourceData.reduce((a, b) => a + b.value, 0);
                  return (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{Math.round((s.value / total) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="font-bold text-foreground mb-5 text-sm">Conversión por etapa del funnel</h2>
        {totalLeads === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Sin leads este mes para mostrar el funnel.</div>
        ) : (
          <div className="space-y-3">
            {funnelData.map((f, i) => (
              <div key={f.stage} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-20 text-right">{f.stage}</span>
                <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                    className="h-full gradient-green rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-bold text-foreground">{f.count}</span>
                  <span className="text-xs text-muted-foreground">({f.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
