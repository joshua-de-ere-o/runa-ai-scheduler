import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search, Filter, Phone, CheckCheck, Clock, User,
  MessageSquare, MoreHorizontal, Tag, Star
} from "lucide-react";

const STAGES = ["Todos", "Nuevo", "Calificado", "Interesado", "Agendado", "Confirmado", "Seguimiento"];
const STAGE_COLORS: Record<string, string> = {
  "Nuevo": "bg-blue-100 text-blue-700",
  "Calificado": "bg-yellow-100 text-yellow-700",
  "Interesado": "bg-orange-100 text-orange-700",
  "Agendado": "bg-accent text-accent-foreground",
  "Confirmado": "bg-primary/10 text-primary",
  "Seguimiento": "bg-purple-100 text-purple-700",
};

const MOCK_CONVERSATIONS = [
  {
    id: "1", name: "María García", phone: "+593 99 123 4567",
    stage: "Agendado", lastMessage: "Perfecto, confirmo para el jueves.",
    time: "10:32", unread: 2, score: 85, tags: ["bajar grasa", "primera vez"],
    messages: [
      { from: "user", text: "Hola, quiero bajar de peso", time: "10:20" },
      { from: "bot", text: "Hola, soy Erika, asistente virtual de la Dra. Kely León. ¿Me dices tu nombre y si tu objetivo es bajar grasa o mejorar hábitos?", time: "10:20" },
      { from: "user", text: "Me llamo María, quiero bajar grasa.", time: "10:22" },
      { from: "bot", text: "Gracias María. ¿Preferís mañana o tarde para la consulta?", time: "10:22" },
      { from: "user", text: "Tarde, el jueves.", time: "10:30" },
      { from: "bot", text: "Tengo disponibilidad el Jue 7 Mar a las 17:00 y 18:00. ¿Cuál te va mejor?", time: "10:31" },
      { from: "user", text: "Perfecto, confirmo para el jueves.", time: "10:32" },
    ]
  },
  {
    id: "2", name: "Carlos Pérez", phone: "+593 98 765 4321",
    stage: "Calificado", lastMessage: "¿Cuánto cuesta la primera consulta?",
    time: "09:15", unread: 1, score: 60, tags: ["energía"],
    messages: [
      { from: "user", text: "¿Cuánto cuesta?", time: "09:10" },
      { from: "bot", text: "Depende del tipo de consulta. ¿Es tu primera vez? Si me dices tu disponibilidad, te propongo 2 horarios.", time: "09:11" },
      { from: "user", text: "¿Cuánto cuesta la primera consulta?", time: "09:15" },
    ]
  },
  {
    id: "3", name: "Sofía Mendoza", phone: "+593 99 987 6543",
    stage: "Confirmado", lastMessage: "Ok, ahí estaré. Gracias Erika.",
    time: "ayer", unread: 0, score: 95, tags: ["recomposición", "control"],
    messages: [
      { from: "user", text: "Ok, ahí estaré. Gracias Erika.", time: "ayer" },
    ]
  },
  {
    id: "4", name: "Luis Torres", phone: "+593 98 111 2233",
    stage: "Nuevo", lastMessage: "Hola, quiero información.",
    time: "ayer", unread: 3, score: 20, tags: [],
    messages: [
      { from: "user", text: "Hola, quiero información.", time: "ayer" },
    ]
  },
];

export default function Inbox() {
  const [search, setSearch] = useState("");
  const [activeStage, setActiveStage] = useState("Todos");
  const [selected, setSelected] = useState(MOCK_CONVERSATIONS[0]);
  const [reply, setReply] = useState("");

  const filtered = MOCK_CONVERSATIONS.filter(c => {
    const matchStage = activeStage === "Todos" || c.stage === activeStage;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return matchStage && matchSearch;
  });

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
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm" />
            </div>
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {STAGES.map(s => (
                <button key={s} onClick={() => setActiveStage(s)}
                  className={cn("text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0",
                    activeStage === s ? "gradient-green text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  )}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={cn("w-full p-3 text-left hover:bg-muted transition-colors",
                  selected.id === c.id && "bg-accent")}>
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", STAGE_COLORS[c.stage] || "bg-muted text-muted-foreground")}>
                        {c.stage}
                      </span>
                      {c.unread > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full gradient-green text-primary-foreground text-xs flex items-center justify-center font-bold">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-primary-foreground font-bold">
                {selected.name[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{selected.name}</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{selected.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", STAGE_COLORS[selected.stage])}>
                {selected.stage}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{selected.score}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Tags */}
          {selected.tags.length > 0 && (
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {selected.tags.map(t => (
                <span key={t} className="text-xs bg-accent text-accent-foreground rounded-full px-2 py-0.5">{t}</span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selected.messages.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={cn("flex", m.from === "user" ? "justify-start" : "justify-end")}
              >
                {m.from === "user" && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className={cn(
                  "max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-sm",
                  m.from === "user"
                    ? "bg-muted text-foreground rounded-tl-sm"
                    : "gradient-green text-primary-foreground rounded-tr-sm"
                )}>
                  <p className="leading-relaxed">{m.text}</p>
                  <div className={cn("flex items-center justify-end gap-1 mt-1", m.from === "user" ? "text-muted-foreground" : "text-primary-foreground/70")}>
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-xs">{m.time}</span>
                    {m.from === "bot" && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reply */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input placeholder="Escribir mensaje manual..." value={reply}
                onChange={e => setReply(e.target.value)}
                className="flex-1 h-10 text-sm" />
              <Button size="sm" className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Enviar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Erika gestiona automáticamente. Esto envía un mensaje manual.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
