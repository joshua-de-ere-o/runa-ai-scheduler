import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search, Phone, CheckCheck, Clock, User,
  MessageSquare, Tag, Star, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PIPELINE_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  qualified: "bg-yellow-100 text-yellow-700",
  interested: "bg-orange-100 text-orange-700",
  booked: "bg-accent text-accent-foreground",
  confirmed: "bg-primary/10 text-primary",
  followup: "bg-purple-100 text-purple-700",
  lost: "bg-red-100 text-red-700",
  do_not_contact: "bg-gray-100 text-gray-500",
};
const PIPELINE_LABELS: Record<string, string> = {
  new: "Nuevo", qualified: "Calificado", interested: "Interesado",
  booked: "Agendado", confirmed: "Confirmado", followup: "Seguimiento",
  lost: "Perdido", do_not_contact: "No contactar",
};

type Conversation = {
  id: string;
  phone_number: string;
  status: string;
  last_message_at: string;
  lead?: { id: string; name: string; score: number; pipeline_stage: string; tags: string[] | null; goal: string | null };
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  created_at: string;
  provider_message_id: string | null;
};

export default function Inbox() {
  const { toast } = useToast();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select(`id, phone_number, status, last_message_at,
        lead:leads(id, name, score, pipeline_stage, tags, goal)`)
      .order("last_message_at", { ascending: false })
      .limit(50);
    if (error) console.error("Error loading conversations:", error);
    else {
      const mapped = (data ?? []).map((c: any) => ({
        ...c,
        lead: Array.isArray(c.lead) ? c.lead[0] : c.lead,
      }));
      setConvs(mapped);
      if (!selected && mapped.length > 0) setSelected(mapped[0]);
    }
    setLoadingConvs(false);
  };

  // Load messages for selected conversation
  const loadMessages = async (convId: string) => {
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from("messages")
      .select("id, direction, content, created_at, provider_message_id")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) console.error("Error loading messages:", error);
    else setMessages((data ?? []) as Message[]);
    setLoadingMsgs(false);
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscriptions
  useEffect(() => {
    const msgChannel = supabase
      .channel("inbox-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (selected && (payload.new as any).conversation_id === selected.id) {
          setMessages(prev => [...prev, newMsg]);
        }
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [selected?.id]);

  const sendManual = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      // Insert outbound message
      const { error: msgErr } = await supabase.from("messages").insert({
        conversation_id: selected.id,
        phone_number: selected.phone_number,
        direction: "outbound",
        content: reply.trim(),
        provider: "ycloud",
      });
      if (msgErr) throw msgErr;

      // Call YCloud to actually send
      const ycApiKey = "0b5def037d3be17f5a4be937138a5a14";
      const senderId = "+593963803030";
      await fetch("https://api.ycloud.com/v2/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": ycApiKey },
        body: JSON.stringify({
          from: senderId, to: selected.phone_number,
          type: "text", text: { body: reply.trim() }
        }),
      });

      setReply("");
      toast({ title: "Mensaje enviado" });
    } catch (e: any) {
      toast({ title: "Error al enviar", description: e.message, variant: "destructive" });
    }
    setSending(false);
  };

  const filtered = convs.filter(c => {
    const name = c.lead?.name ?? c.phone_number;
    return name.toLowerCase().includes(search.toLowerCase()) || c.phone_number.includes(search);
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
    if (diffH < 48) return "ayer";
    return d.toLocaleDateString("es-EC", { day: "numeric", month: "short" });
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Conversaciones activas de WhatsApp</p>
        </div>
        <Badge className="gradient-green text-primary-foreground border-0 gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          Erika activa
        </Badge>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Lista */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loadingConvs ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Sin conversaciones aún.<br />Los mensajes de WhatsApp aparecerán aquí.
              </div>
            ) : filtered.map(c => {
              const name = c.lead?.name ?? c.phone_number;
              const stage = c.lead?.pipeline_stage ?? "new";
              return (
                <button key={c.id} onClick={() => setSelected(c)}
                  className={cn("w-full p-3 text-left hover:bg-muted transition-colors",
                    selected?.id === c.id && "bg-accent")}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">{name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(c.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{c.phone_number}</p>
                      <span className={cn("inline-block text-xs px-1.5 py-0.5 rounded-full font-medium mt-1",
                        PIPELINE_COLORS[stage] || "bg-muted text-muted-foreground")}>
                        {PIPELINE_LABELS[stage] ?? stage}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        {selected ? (
          <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-primary-foreground font-bold">
                  {(selected.lead?.name ?? selected.phone_number)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{selected.lead?.name ?? "Sin nombre"}</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{selected.phone_number}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.lead?.pipeline_stage && (
                  <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
                    PIPELINE_COLORS[selected.lead.pipeline_stage])}>
                    {PIPELINE_LABELS[selected.lead.pipeline_stage]}
                  </span>
                )}
                {selected.lead?.score != null && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{selected.lead.score}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags/Goal */}
            {(selected.lead?.tags?.length || selected.lead?.goal) && (
              <div className="px-4 py-2 border-b border-border flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {selected.lead?.goal && (
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{selected.lead.goal}</span>
                )}
                {selected.lead?.tags?.map(t => (
                  <span key={t} className="text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5">{t}</span>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Sin mensajes en esta conversación.
                </div>
              ) : messages.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className={cn("flex", m.direction === "inbound" ? "justify-start" : "justify-end")}
                >
                  {m.direction === "inbound" && (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-sm",
                    m.direction === "inbound"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "gradient-green text-primary-foreground rounded-tr-sm"
                  )}>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    <div className={cn("flex items-center justify-end gap-1 mt-1",
                      m.direction === "inbound" ? "text-muted-foreground" : "text-primary-foreground/70")}>
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-xs">{formatTime(m.created_at)}</span>
                      {m.direction === "outbound" && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input placeholder="Escribir mensaje manual..."
                  value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendManual()}
                  className="flex-1 h-10 text-sm" />
                <Button size="sm" onClick={sendManual} disabled={sending || !reply.trim()}
                  className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Enviar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Erika gestiona automáticamente. Esto envía un mensaje manual.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-card rounded-xl border border-border text-muted-foreground text-sm">
            Seleccioná una conversación
          </div>
        )}
      </div>
    </div>
  );
}
