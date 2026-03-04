import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Star, TrendingUp, MessageCircle, ChevronRight, Phone } from "lucide-react";

const STAGES = [
  { key: "new", label: "Nuevo", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "qualified", label: "Calificado", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { key: "interested", label: "Interesado", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { key: "booked", label: "Agendado", color: "bg-accent text-accent-foreground border-primary/20" },
  { key: "confirmed", label: "Confirmado", color: "bg-primary/10 text-primary border-primary/20" },
];

const MOCK_LEADS = [
  { id: "1", name: "María García", phone: "+593 99 123 4567", stage: "booked", goal: "Bajar grasa", source: "Instagram", score: 85, objection: null, tags: ["primera vez"] },
  { id: "2", name: "Carlos Pérez", phone: "+593 98 765 4321", stage: "qualified", goal: "Energía", source: "Ads", score: 60, objection: "precio", tags: [] },
  { id: "3", name: "Sofía Mendoza", phone: "+593 99 987 6543", stage: "confirmed", goal: "Recomposición", source: "Referido", score: 95, objection: null, tags: ["control"] },
  { id: "4", name: "Luis Torres", phone: "+593 98 111 2233", stage: "new", goal: "Digestión", source: "TikTok", score: 20, objection: "tiempo", tags: [] },
  { id: "5", name: "Ana López", phone: "+593 98 222 3333", stage: "interested", goal: "Bajar grasa", source: "Instagram", score: 72, objection: "precio", tags: ["primera vez"] },
  { id: "6", name: "Pedro Ramos", phone: "+593 99 666 7777", stage: "booked", goal: "Hábitos", source: "Ads", score: 78, objection: null, tags: [] },
];

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram", ads: "Ads", tiktok: "TikTok", referral: "Referido", unknown: "Desconocido"
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full gradient-green rounded-full transition-all" style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-6 text-right">{score}</span>
    </div>
  );
}

export default function Leads() {
  const byStage = STAGES.reduce<Record<string, typeof MOCK_LEADS>>((acc, s) => {
    acc[s.key] = MOCK_LEADS.filter(l => l.stage === s.key);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Leads & Funnel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pipeline de conversión de WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card rounded-lg border border-border px-3 py-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{MOCK_LEADS.length}</span>
            <span>leads activos</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm bg-card rounded-lg border border-border px-3 py-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">42%</span>
            <span className="text-muted-foreground">conv. rate</span>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2">
        {STAGES.map((stage, si) => (
          <motion.div key={stage.key}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.07 }}
            className="flex flex-col gap-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", stage.color)}>
                  {stage.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {byStage[stage.key]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-32">
              {(byStage[stage.key] || []).map((lead) => (
                <div key={lead.id} className="bg-card rounded-xl border border-border p-3 shadow-card hover:shadow-elevated transition-all cursor-pointer group">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {lead.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.goal}</p>
                    </div>
                  </div>
                  <ScoreBar score={lead.score} />
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{lead.source}</span>
                    {lead.objection && (
                      <span className="text-xs text-orange-600 bg-orange-50 rounded px-1.5 py-0.5">{lead.objection}</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" /> Chat
                    </button>
                    <span className="text-muted-foreground">·</span>
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                      <Phone className="w-3 h-3" /> {lead.phone.slice(-8)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">Todos los leads</h2>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5" /> Exportar
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Nombre", "Teléfono", "Objetivo", "Fuente", "Stage", "Score", "Objeción", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_LEADS.map(lead => {
                const stageInfo = STAGES.find(s => s.key === lead.stage);
                return (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {lead.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{lead.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.goal}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted text-muted-foreground rounded px-2 py-1">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3">
                      {stageInfo && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", stageInfo.color)}>
                          {stageInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-foreground">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.objection ? (
                        <span className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-0.5">{lead.objection}</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
