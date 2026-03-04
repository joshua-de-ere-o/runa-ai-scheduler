import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Users, Calendar, CheckCircle2,
  DollarSign, Target, AlertCircle, Download, ChevronDown
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface Metrics {
  leads_month: number;
  appointments_month: number;
  confirmed_month: number;
  estimated_revenue: number;
  projected_revenue: number;
  lead_to_booking_rate: number;
  booking_to_confirm_rate: number;
  no_show_rate: number;
  ticket_avg: number;
  currency: string;
  monthly_revenue_goal: number;
  daily_leads: { date: string; count: number }[];
  funnel: { stage: string; count: number }[];
  recent_appointments: {
    patient_name: string;
    appointment_date: string;
    appointment_type: string;
    status: string;
    phone_number: string;
  }[];
  day_of_month: number;
  days_in_month: number;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary",
  pending: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  no_show: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  no_show: "No-show",
};

const STAGE_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  interesado: "Interesado",
  agendado: "Agendado",
  confirmado: "Confirmado",
};

function fmt(currency: string, value: number) {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

function KpiCard({
  label, value, icon: Icon, sub, highlight, delay
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
      className={cn(
        "rounded-xl border border-border p-5 shadow-card flex flex-col gap-2",
        highlight ? "gradient-green text-primary-foreground" : "bg-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          highlight ? "bg-white/20" : "gradient-green"
        )}>
          <Icon className={cn("w-4 h-4", highlight ? "text-white" : "text-primary-foreground")} />
        </div>
      </div>
      <p className={cn("text-3xl font-extrabold leading-none", highlight ? "text-white" : "text-foreground")}>{value}</p>
      <p className={cn("text-xs font-medium", highlight ? "text-white/80" : "text-muted-foreground")}>{label}</p>
      {sub && <p className={cn("text-xs", highlight ? "text-white/60" : "text-muted-foreground/70")}>{sub}</p>}
    </motion.div>
  );
}

function SecondaryKpi({
  label, value, icon: Icon, delay
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0 }}
      className="bg-card rounded-xl border border-border p-4 shadow-card flex items-center gap-4"
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Performance() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/functions/v1/get-performance-metrics`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const handleExport = (type: string) => {
    const url = `${SUPABASE_URL}/functions/v1/export-dashboard-data?type=${type}`;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "");
    // Add auth header via fetch + blob URL
    fetch(url, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `${type}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm animate-pulse">Cargando métricas…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive text-sm">Error cargando métricas: {error}</div>
      </div>
    );
  }

  const funnelMax = data.funnel.length > 0 ? Math.max(...data.funnel.map((f) => f.count), 1) : 1;
  const goalPct = data.monthly_revenue_goal > 0
    ? Math.min(100, Math.round((data.estimated_revenue / data.monthly_revenue_goal) * 100))
    : 0;

  const chartData = data.daily_leads.map((d) => ({
    day: d.date.slice(5),
    leads: d.count,
  }));

  const monthName = new Date().toLocaleString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Rendimiento</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {monthName} · Día {data.day_of_month} de {data.days_in_month}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar datos
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("leads")}>Exportar leads</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("appointments")}>Exportar citas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("metrics")}>Exportar métricas</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("revenue")}>Exportar rendimiento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Leads este mes"
          value={String(data.leads_month)}
          icon={Users}
          sub="Generados en el período"
          delay={0}
        />
        <KpiCard
          label="Citas agendadas"
          value={String(data.appointments_month)}
          icon={Calendar}
          sub={`${data.lead_to_booking_rate}% conversión lead→cita`}
          delay={0.06}
        />
        <KpiCard
          label="Citas confirmadas"
          value={String(data.confirmed_month)}
          icon={CheckCircle2}
          sub={`${data.booking_to_confirm_rate}% confirmación`}
          delay={0.12}
        />
        <KpiCard
          label="Ingreso estimado"
          value={fmt(data.currency, data.estimated_revenue)}
          icon={DollarSign}
          sub={`${data.confirmed_month} citas × ${fmt(data.currency, data.ticket_avg)}`}
          highlight
          delay={0.18}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SecondaryKpi
          label="Conv. Lead → Cita"
          value={`${data.lead_to_booking_rate}%`}
          icon={TrendingUp}
          delay={0.22}
        />
        <SecondaryKpi
          label="Conv. Cita → Confirmada"
          value={`${data.booking_to_confirm_rate}%`}
          icon={CheckCircle2}
          delay={0.26}
        />
        <SecondaryKpi
          label="Tasa de no-show"
          value={`${data.no_show_rate}%`}
          icon={AlertCircle}
          delay={0.30}
        />
        <SecondaryKpi
          label="Ticket promedio"
          value={fmt(data.currency, data.ticket_avg)}
          icon={Target}
          delay={0.34}
        />
      </div>

      {/* Revenue prediction + Line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projection card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="bg-card rounded-xl border border-border p-6 shadow-card flex flex-col gap-4"
        >
          <h2 className="font-bold text-foreground text-sm">Predicción de ingresos</h2>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Proyección del mes</p>
            <p className="text-4xl font-extrabold text-primary leading-none">
              {fmt(data.currency, data.projected_revenue)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Ingreso actual</span>
              <span className="font-semibold text-foreground">{fmt(data.currency, data.estimated_revenue)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Objetivo mensual</span>
              <span className="font-semibold text-foreground">{fmt(data.currency, data.monthly_revenue_goal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso actual</span>
              <span className="font-semibold text-primary">{goalPct}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full gradient-green rounded-full"
            />
          </div>

          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            Ritmo diario: <span className="font-semibold text-foreground">
              {data.day_of_month > 0 ? (data.leads_month / data.day_of_month).toFixed(1) : 0} leads/día
            </span>
          </div>
        </motion.div>

        {/* Daily leads line chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <h2 className="font-bold text-foreground text-sm mb-4">Leads por día (últimos 30 días)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  fontSize: 12,
                  background: "hsl(var(--card))",
                }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46 }}
        className="bg-card rounded-xl border border-border p-5 shadow-card"
      >
        <h2 className="font-bold text-foreground text-sm mb-5">Conversión del funnel</h2>
        <div className="space-y-3">
          {data.funnel.map((f, i) => {
            const pct = funnelMax > 0 ? Math.round((f.count / funnelMax) * 100) : 0;
            return (
              <div key={f.stage} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground w-24 text-right">{STAGE_LABELS[f.stage] ?? f.stage}</span>
                <div className="flex-1 h-7 bg-muted rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.55 + i * 0.08, duration: 0.6 }}
                    className="h-full gradient-green rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-bold text-foreground">{f.count}</span>
                  <span className="text-xs text-muted-foreground">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent appointments table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52 }}
        className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground text-sm">Citas recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Paciente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                    No hay citas registradas aún
                  </td>
                </tr>
              ) : (
                data.recent_appointments.map((appt, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{appt.patient_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(appt.appointment_date).toLocaleDateString("es-ES", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{appt.appointment_type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{appt.phone_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        STATUS_STYLES[appt.status] ?? "bg-muted text-muted-foreground"
                      )}>
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
