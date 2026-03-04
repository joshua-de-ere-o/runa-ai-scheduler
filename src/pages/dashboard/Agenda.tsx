import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, User, CheckCircle2, XCircle,
  AlertCircle, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  done: "bg-muted text-muted-foreground border-border",
  no_show: "bg-orange-50 text-orange-700 border-orange-200",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada", pending: "Pendiente", cancelled: "Cancelada",
  done: "Realizada", no_show: "No asistió",
};

type Appointment = {
  id: string;
  patient_name: string;
  phone_number: string | null;
  status: string;
  appointment_date: string;
  appointment_type: string | null;
  notes: string | null;
};

export default function Agenda() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate week range
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  const loadAppointments = async () => {
    setLoading(true);
    const { start, end } = getWeekRange(weekOffset);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, patient_name, phone_number, status, appointment_date, appointment_type, notes")
      .gte("appointment_date", start.toISOString())
      .lte("appointment_date", end.toISOString())
      .order("appointment_date", { ascending: true });
    if (!error) setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  };

  useEffect(() => { loadAppointments(); }, [weekOffset]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast({ title: `Cita ${STATUS_LABELS[status]?.toLowerCase() ?? status}` });
    }
  };

  const { start, end } = getWeekRange(weekOffset);
  const weekLabel = `${start.toLocaleDateString("es-EC", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("es-EC", { day: "numeric", month: "short", year: "numeric" })}`;

  // Group by date
  const grouped = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    const d = new Date(a.appointment_date).toLocaleDateString("es-EC", { weekday: "short", day: "numeric", month: "short" });
    const key = d.charAt(0).toUpperCase() + d.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const total = appointments.length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const pending = appointments.filter(a => a.status === "pending").length;
  const noShow = appointments.filter(a => a.status === "no_show").length;

  const STATS = [
    { label: "Esta semana", value: String(total), icon: Calendar, color: "text-primary" },
    { label: "Confirmadas", value: String(confirmed), icon: CheckCircle2, color: "text-primary" },
    { label: "Pendientes", value: String(pending), icon: AlertCircle, color: "text-yellow-600" },
    { label: "No asistió", value: String(noShow), icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} className="text-xs px-3">
            Esta semana
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl border border-border p-4 shadow-card"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando citas...
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin citas esta semana</p>
          <p className="text-sm mt-1">Las citas agendadas por Erika aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, apts], di) => (
            <motion.div key={date}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-bold text-foreground">{date}</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{apts.length} cita{apts.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {apts.map(a => {
                  const d = new Date(a.appointment_date);
                  const startTime = d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={a.id}
                      className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 shadow-card hover:shadow-elevated transition-shadow"
                    >
                      <div className="text-center w-16 flex-shrink-0">
                        <p className="text-lg font-extrabold text-primary">{startTime}</p>
                        <p className="text-xs text-muted-foreground">{a.appointment_type ?? "consulta"}</p>
                      </div>
                      <div className="w-px h-10 bg-border flex-shrink-0" />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                          {a.patient_name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{a.patient_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{a.phone_number ?? "—"}</span>
                            {a.notes && <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground truncate max-w-40">{a.notes}</span>
                            </>}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs font-medium flex-shrink-0", STATUS_STYLES[a.status] ?? "")}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </Badge>
                      <div className="flex gap-1 flex-shrink-0">
                        {a.status === "pending" && (
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:bg-accent"
                            onClick={() => updateStatus(a.id, "confirmed")}>
                            Confirmar
                          </Button>
                        )}
                        {["pending", "confirmed"].includes(a.status) && (
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                            onClick={() => updateStatus(a.id, "no_show")}>
                            No asistió
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
