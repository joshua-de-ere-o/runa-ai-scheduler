import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Building2, Clock, MessageSquare, Webhook, Globe, Save,
  Plus, Trash2, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const DEFAULT_HOURS = {
  Lunes: { active: true, from: "09:00", to: "18:00" },
  Martes: { active: true, from: "09:00", to: "18:00" },
  Miércoles: { active: true, from: "09:00", to: "18:00" },
  Jueves: { active: true, from: "09:00", to: "18:00" },
  Viernes: { active: true, from: "09:00", to: "18:00" },
  Sábado: { active: true, from: "09:00", to: "13:00" },
  Domingo: { active: false, from: "09:00", to: "13:00" },
};

const SERVICES_DEFAULT = [
  { id: "1", name: "Consulta Inicial", duration: 60, active: true },
  { id: "2", name: "Control Mensual", duration: 45, active: true },
  { id: "3", name: "Control Semanal", duration: 30, active: true },
];

const TEMPLATES_DEFAULT = [
  { key: "welcome", label: "Bienvenida", content: "Hola, soy Erika, asistente virtual de la Dra. Kely León. ¿Buscas bajar grasa, mejorar digestión/energía o recomposición corporal?" },
  { key: "reminder_24h", label: "Recordatorio 24h", content: "Hola {{nombre}}, te recordamos tu consulta con la Dra. Kely León mañana {{fecha}} a las {{hora}}. ¿Confirmas tu asistencia?" },
  { key: "reminder_2h", label: "Recordatorio 2h", content: "Hola {{nombre}}, en 2 horas tenés tu consulta con la Dra. Kely León. ¡Te esperamos!" },
  { key: "followup_1", label: "Seguimiento 6h", content: "Hola {{nombre}}, ¿pudiste revisar la información? Quedé aquí para ayudarte a agendar." },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [services, setServices] = useState(SERVICES_DEFAULT);
  const [clinicName, setClinicName] = useState("Consulta Nutriológica – Dra. Kely León");
  const [clinicPhone, setClinicPhone] = useState("+593 XX XXX XXXX");
  const [ycApiKey, setYcApiKey] = useState("");
  const [ycSenderId, setYcSenderId] = useState("");
  const [ycWebhookToken, setYcWebhookToken] = useState("");

  const save = () => {
    toast({ title: "Configuración guardada", description: "Los cambios se aplicarán de inmediato." });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestión del sistema Runa AI</p>
      </div>

      <Tabs defaultValue="clinic">
        <TabsList className="grid grid-cols-5 w-full bg-muted rounded-xl p-1 h-auto">
          {[
            { value: "clinic", label: "Clínica", icon: Building2 },
            { value: "hours", label: "Horarios", icon: Clock },
            { value: "services", label: "Servicios", icon: Plus },
            { value: "templates", label: "Plantillas", icon: MessageSquare },
            { value: "ycloud", label: "YCloud", icon: Webhook },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value}
              className="flex items-center gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-card data-[state=active]:text-primary">
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* CLINIC */}
        <TabsContent value="clinic">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
            <h2 className="font-bold text-foreground">Datos de la clínica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nombre de la clínica</Label>
                <Input value={clinicName} onChange={e => setClinicName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={clinicPhone} onChange={e => setClinicPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input placeholder="hola@drakelynutri.com" type="email" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Dirección</Label>
                <Input placeholder="Ej. Av. Principal 123, Guayaquil" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Zona horaria</Label>
                <Input value="America/Guayaquil" readOnly className="bg-muted" />
                <p className="text-xs text-muted-foreground">Fija para esta instalación. Contactar soporte para cambiar.</p>
              </div>
            </div>
            <Button onClick={save} className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5">
              <Save className="w-4 h-4" /> Guardar cambios
            </Button>
          </motion.div>
        </TabsContent>

        {/* HOURS */}
        <TabsContent value="hours">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-bold text-foreground mb-5">Horarios de atención</h2>
            <div className="space-y-3">
              {DAYS.map(day => {
                const h = hours[day as keyof typeof hours];
                return (
                  <div key={day} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-colors",
                    h.active ? "border-border bg-muted/30" : "border-border/50 opacity-60")}>
                    <Switch checked={h.active} onCheckedChange={v => setHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], active: v } }))} />
                    <span className="text-sm font-medium text-foreground w-24">{day}</span>
                    <div className="flex items-center gap-2">
                      <Input type="time" value={h.from} disabled={!h.active}
                        onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], from: e.target.value } }))}
                        className="w-28 h-8 text-sm" />
                      <span className="text-muted-foreground text-sm">–</span>
                      <Input type="time" value={h.to} disabled={!h.active}
                        onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day as keyof typeof prev], to: e.target.value } }))}
                        className="w-28 h-8 text-sm" />
                    </div>
                    {!h.active && <span className="text-xs text-muted-foreground ml-auto">Cerrado</span>}
                  </div>
                );
              })}
            </div>
            <Button onClick={save} className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5 mt-5">
              <Save className="w-4 h-4" /> Guardar horarios
            </Button>
          </motion.div>
        </TabsContent>

        {/* SERVICES */}
        <TabsContent value="services">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-foreground">Servicios</h2>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Plus className="w-3.5 h-3.5" /> Agregar servicio</Button>
            </div>
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                  <Switch checked={s.active} onCheckedChange={v => setServices(prev => prev.map(x => x.id === s.id ? { ...x, active: v } : x))} />
                  <div className="flex-1">
                    <Input value={s.name} onChange={e => setServices(prev => prev.map(x => x.id === s.id ? { ...x, name: e.target.value } : x))}
                      className="h-8 text-sm border-0 bg-transparent p-0 font-semibold focus-visible:ring-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <Input type="number" value={s.duration} onChange={e => setServices(prev => prev.map(x => x.id === s.id ? { ...x, duration: +e.target.value } : x))}
                      className="w-16 h-8 text-sm text-center" />
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                  <button onClick={() => setServices(prev => prev.filter(x => x.id !== s.id))}
                    className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={save} className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5 mt-5">
              <Save className="w-4 h-4" /> Guardar servicios
            </Button>
          </motion.div>
        </TabsContent>

        {/* TEMPLATES */}
        <TabsContent value="templates">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-bold text-foreground">Plantillas de mensajes</h2>
            {TEMPLATES_DEFAULT.map(t => (
              <div key={t.key} className="space-y-2">
                <Label className="text-sm font-semibold">{t.label}</Label>
                <textarea defaultValue={t.content}
                  className="w-full h-20 text-sm rounded-lg border border-border bg-muted/20 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
                <p className="text-xs text-muted-foreground">Variables: {`{{nombre}}`}, {`{{fecha}}`}, {`{{hora}}`}</p>
              </div>
            ))}
            <Button onClick={save} className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5">
              <Save className="w-4 h-4" /> Guardar plantillas
            </Button>
          </motion.div>
        </TabsContent>

        {/* YCLOUD */}
        <TabsContent value="ycloud">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-bold text-foreground">Integración YCloud</h2>
              <p className="text-sm text-muted-foreground mt-1">Configurá el proveedor de WhatsApp (YCloud). No se usa Twilio.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>YCloud API Key</Label>
                <div className="relative">
                  <Input type={showApiKey ? "text" : "password"} value={ycApiKey} onChange={e => setYcApiKey(e.target.value)}
                    placeholder="sk-..." className="pr-10" />
                  <button type="button" onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <Input value="https://api.ycloud.com/v2" readOnly className="bg-muted text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>Sender ID (número de WhatsApp)</Label>
                <Input value={ycSenderId} onChange={e => setYcSenderId(e.target.value)} placeholder="+593XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Webhook Verify Token</Label>
                <Input value={ycWebhookToken} onChange={e => setYcWebhookToken(e.target.value)} placeholder="token-secreto" />
              </div>
              <div className="bg-accent rounded-lg p-4 border border-primary/20">
                <p className="text-xs font-semibold text-accent-foreground mb-1">URL del Webhook (Edge Function)</p>
                <code className="text-xs text-primary break-all">
                  https://skfthkxfcwaxgcvypkco.supabase.co/functions/v1/ycloud-webhook-whatsapp
                </code>
                <p className="text-xs text-muted-foreground mt-2">Pegá esta URL en tu panel de YCloud como webhook URL. El Verify Token es: <strong>runa-webhook-2026</strong></p>
              </div>
            </div>
            <Button onClick={save} className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5">
              <Save className="w-4 h-4" /> Guardar configuración YCloud
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
