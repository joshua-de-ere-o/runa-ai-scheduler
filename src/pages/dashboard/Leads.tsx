import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Star, TrendingUp, MessageCircle, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STAGES = [
  { key: "new", label: "Nuevo", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "qualified", label: "Calificado", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { key: "interested", label: "Interesado", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { key: "booked", label: "Agendado", color: "bg-accent text-accent-foreground border-primary/20" },
  { key: "confirmed", label: "Confirmado", color: "bg-primary/10 text-primary border-primary/20" },
];

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  phone_number: string | null;
  goal: string | null;
  source: string | null;
  score: number | null;
  pipeline_stage: string | null;
  objection: string | null;
  tags: string[] | null;
  stage: string;
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("id, name, phone, phone_number, goal, source, score, pipeline_stage, objection, tags, stage")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (!error) setLeads((data ?? []) as Lead[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Normalize stage: use pipeline_stage if available, else stage
  const getStageKey = (lead: Lead) => lead.pipeline_stage ?? lead.stage ?? "new";

  const byStage = STAGES.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s.key] = leads.filter(l => getStageKey(l) === s.key);
    return acc;
  }, {});

  const bookedConfirmed = leads.filter(l => ["booked", "confirmed"].includes(getStageKey(l))).length;
  const convRate = leads.length > 0 ? Math.round((bookedConfirmed / leads.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando leads...
    </div>
  );

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
            <span className="font-semibold text-foreground">{leads.length}</span>
            <span>leads activos</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm bg-card rounded-lg border border-border px-3 py-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{convRate}%</span>
            <span className="text-muted-foreground">conv. rate</span>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Sin leads aún</p>
          <p className="text-sm mt-1">Los leads aparecerán automáticamente cuando alguien escriba al WhatsApp.</p>
        </div>
      ) : (
        <>
          {/* Kanban */}
          <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-2">
            {STAGES.map((stage, si) => (
              <motion.div key={stage.key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.07 }}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center justify-between px-1">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", stage.color)}>
                    {stage.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{byStage[stage.key]?.length || 0}</span>
                </div>
                <div className="space-y-2 min-h-32">
                  {(byStage[stage.key] || []).map(lead => (
                    <div key={lead.id} className="bg-card rounded-xl border border-border p-3 shadow-card hover:shadow-elevated transition-all cursor-pointer group">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {lead.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{lead.goal ?? "Sin objetivo"}</p>
                        </div>
                      </div>
                      <ScoreBar score={lead.score ?? 50} />
                      <div className="flex items-center gap-1 mt-2">
                        {lead.source && (
                          <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{lead.source}</span>
                        )}
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
                          <Phone className="w-3 h-3" /> {(lead.phone_number ?? lead.phone ?? "").slice(-8)}
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
                    {["Nombre", "Teléfono", "Objetivo", "Fuente", "Stage", "Score", "Objeción"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map(lead => {
                    const stageKey = getStageKey(lead);
                    const stageInfo = STAGES.find(s => s.key === stageKey);
                    return (
                      <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {lead.name[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{lead.phone_number ?? lead.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.goal ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-muted text-muted-foreground rounded px-2 py-1">{lead.source ?? "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          {stageInfo ? (
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", stageInfo.color)}>
                              {stageInfo.label}
                            </span>
                          ) : <span className="text-muted-foreground text-xs">{stageKey}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-foreground">{lead.score ?? 50}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.objection ? (
                            <span className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-0.5">{lead.objection}</span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
