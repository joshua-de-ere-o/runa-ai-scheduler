import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Calendar, Clock, MessageCircle, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const KPIS = [
  { label: "Leads este mes", value: "48", delta: "+12%", up: true, icon: Users },
  { label: "Tasa de agendamiento", value: "42%", delta: "+5%", up: true, icon: Calendar },
  { label: "Tiempo primera resp.", value: "1m 24s", delta: "-18s", up: true, icon: Clock },
  { label: "No-shows", value: "3", delta: "-2", up: true, icon: Target },
];

const DAILY = [
  { day: "Lun", leads: 8, agendadas: 4 },
  { day: "Mar", leads: 12, agendadas: 5 },
  { day: "Mié", leads: 6, agendadas: 3 },
  { day: "Jue", leads: 14, agendadas: 7 },
  { day: "Vie", leads: 10, agendadas: 4 },
  { day: "Sáb", leads: 5, agendadas: 2 },
];

const FUNNEL_DATA = [
  { stage: "Nuevo", count: 48, pct: 100 },
  { stage: "Calificado", count: 32, pct: 67 },
  { stage: "Interesado", count: 22, pct: 46 },
  { stage: "Agendado", count: 16, pct: 33 },
  { stage: "Confirmado", count: 12, pct: 25 },
];

const SOURCE_DATA = [
  { name: "Instagram", value: 38 },
  { name: "Ads", value: 28 },
  { name: "TikTok", value: 18 },
  { name: "Referido", value: 16 },
];
const SOURCE_COLORS = ["hsl(142,71%,45%)", "hsl(142,71%,55%)", "hsl(160,70%,42%)", "hsl(166,76%,50%)"];

export default function Metrics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Métricas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Período: Marzo 2025 · Zona: America/Guayaquil</p>
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
                {k.delta}
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Leads/day bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="col-span-2 bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-4 text-sm">Leads vs. Agendadas por día</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,14%,91%)", fontSize: 12 }} />
              <Bar dataKey="leads" fill="hsl(166,76%,90%)" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="agendadas" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="Agendadas" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="font-bold text-foreground mb-4 text-sm">Fuente de leads</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                dataKey="value" paddingAngle={3}>
                {SOURCE_DATA.map((_, i) => (
                  <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220,14%,91%)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {SOURCE_DATA.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-semibold text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="font-bold text-foreground mb-5 text-sm">Conversión por etapa del funnel</h2>
        <div className="space-y-3">
          {FUNNEL_DATA.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-20 text-right">{f.stage}</span>
              <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                  className="h-full gradient-green rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2 w-16">
                <span className="text-sm font-bold text-foreground">{f.count}</span>
                <span className="text-xs text-muted-foreground">({f.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
