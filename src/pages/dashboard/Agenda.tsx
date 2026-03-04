import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar, Clock, User, CheckCircle2, XCircle,
  AlertCircle, Plus, ChevronLeft, ChevronRight
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  done: "bg-muted text-muted-foreground border-border",
  no_show: "bg-orange-50 text-orange-700 border-orange-200",
};
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  done: "Realizada",
  no_show: "No asistió",
};

const APPOINTMENTS = [
  { id: "1", name: "María García", service: "Consulta Inicial", start: "09:00", end: "10:00", date: "Lun 3 Mar", status: "confirmed", phone: "+593 99 123 4567" },
  { id: "2", name: "Ana López", service: "Control Mensual", start: "10:30", end: "11:00", date: "Lun 3 Mar", status: "confirmed", phone: "+593 98 222 3333" },
  { id: "3", name: "Jorge Silva", service: "Consulta Inicial", start: "14:00", end: "15:00", date: "Lun 3 Mar", status: "pending", phone: "+593 97 444 5555" },
  { id: "4", name: "Luis Torres", service: "Control Semanal", start: "16:00", end: "16:30", date: "Mar 4 Mar", status: "confirmed", phone: "+593 98 111 2233" },
  { id: "5", name: "Sofía Mendoza", service: "Consulta Inicial", start: "11:00", end: "12:00", date: "Mié 5 Mar", status: "confirmed", phone: "+593 99 987 6543" },
  { id: "6", name: "Pedro Ramos", service: "Control Mensual", start: "17:00", end: "17:30", date: "Jue 6 Mar", status: "pending", phone: "+593 99 666 7777" },
];

const STATS = [
  { label: "Esta semana", value: "12", icon: Calendar, color: "text-primary" },
  { label: "Confirmadas", value: "9", icon: CheckCircle2, color: "text-primary" },
  { label: "Pendientes", value: "3", icon: AlertCircle, color: "text-yellow-600" },
  { label: "No-shows mes", value: "1", icon: XCircle, color: "text-red-600" },
];

export default function Agenda() {
  const grouped = APPOINTMENTS.reduce<Record<string, typeof APPOINTMENTS>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Semana del 3 al 9 de Marzo 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium text-foreground px-2">Mar 2025</span>
          <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="w-4 h-4" /></Button>
          <Button className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5 ml-2">
            <Plus className="w-4 h-4" />
            Nueva cita
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

      {/* List by day */}
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
              {apts.map((a) => (
                <div key={a.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="text-center w-16 flex-shrink-0">
                    <p className="text-lg font-extrabold text-primary">{a.start}</p>
                    <p className="text-xs text-muted-foreground">{a.end}</p>
                  </div>
                  <div className="w-px h-10 bg-border flex-shrink-0" />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                      {a.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{a.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{a.service}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{a.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs font-medium", STATUS_STYLES[a.status])}>
                    {STATUS_LABELS[a.status]}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:bg-accent">Confirmar</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">Reagendar</Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
