import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Calendar, TrendingUp, Shield, Clock, Users,
  Star, CheckCircle2, ChevronRight, Leaf, Brain, Zap, ArrowRight,
  Phone, Mail, MapPin
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } }),
};

const BENEFITS = [
  { icon: Brain, title: "Evaluación personalizada", desc: "Análisis completo de tu composición corporal, hábitos y objetivos de salud." },
  { icon: Leaf, title: "Plan claro y alcanzable", desc: "Sin dietas restrictivas. Un plan real que se adapta a tu vida y tus metas." },
  { icon: TrendingUp, title: "Seguimiento continuo", desc: "Controles periódicos para ajustar tu plan y asegurar resultados duraderos." },
  { icon: Zap, title: "Resultados medibles", desc: "Métricas concretas de progreso: peso, composición, energía y bienestar." },
];

const METHOD = [
  { step: "01", title: "Primera consulta", desc: "Evaluación integral: historial, composición corporal y objetivos." },
  { step: "02", title: "Plan nutricional", desc: "Diseño de tu plan personalizado basado en evidencia clínica." },
  { step: "03", title: "Seguimiento activo", desc: "Controles regulares con ajustes precisos para maximizar resultados." },
];

const TESTIMONIALS = [
  { name: "María G.", stars: 5, text: "Bajé 8 kg en 3 meses siguiendo el plan de la Dra. Kely. Lo mejor fue que nunca pasé hambre." },
  { name: "Carlos P.", stars: 5, text: "Mejoré mis niveles de energía y por fin entiendo cómo comer bien para mi rendimiento." },
  { name: "Sofía M.", stars: 5, text: "Después de años de dietas fallidas, por fin tengo un plan que funciona y que puedo mantener." },
];

const FAQ = [
  { q: "¿Cómo funciona la consulta virtual?", a: "La consulta se realiza por videollamada. Solo necesitas tu dispositivo y estar en un lugar tranquilo." },
  { q: "¿Cuánto dura la primera consulta?", a: "La consulta inicial dura aproximadamente 60 minutos. Los controles posteriores son de 30-45 minutos." },
  { q: "¿Qué necesito para la primera cita?", a: "Solo tus datos básicos y ganas de cambiar. La Dra. Kely te guía desde el primer momento." },
  { q: "¿Ofrecen seguimiento entre consultas?", a: "Sí. Puedes contactar al equipo por WhatsApp para dudas puntuales entre consultas." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">Runa AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#benefits" className="hover:text-foreground transition-colors">Beneficios</a>
            <a href="#method" className="hover:text-foreground transition-colors">Método</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonios</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">Acceso equipo</Button>
            </Link>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gradient-green text-primary-foreground shadow-green hover:opacity-90 transition-opacity">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 pb-16 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-primary/8 blur-2xl" />
        </div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <Badge variant="secondary" className="mb-6 bg-accent text-accent-foreground border-0 px-4 py-1.5">
                <Leaf className="w-3 h-3 mr-1.5" />
                Nutriología Clínica · Dra. Kely León
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight text-balance mb-6"
            >
              Tu salud empieza con{" "}
              <span className="text-primary">la nutrición correcta</span>
            </motion.h1>
            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed"
            >
              Agenda tu consulta con la Dra. Kely León y obtén un plan nutricional personalizado basado en evidencia clínica. Atención profesional, resultados reales.
            </motion.p>
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="https://wa.me/1234567890?text=Hola,%20quiero%20agendar%20una%20consulta" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gradient-green text-primary-foreground shadow-green hover:opacity-90 transition-all animate-pulse-green text-base px-8 gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Agendar por WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#method">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Conocer el método
                </Button>
              </a>
            </motion.div>
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              {[
                { icon: Shield, text: "Consulta segura y confidencial" },
                { icon: Clock, text: "Primera cita en 24–48h" },
                { icon: Users, text: "+500 pacientes atendidos" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 max-w-sm mx-auto"
          >
            <div className="bg-card shadow-elevated rounded-2xl p-5 border border-border animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-primary-foreground font-bold text-sm">E</div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Erika</p>
                  <p className="text-xs text-muted-foreground">Asistente virtual · Dra. Kely León</p>
                </div>
                <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              <div className="bg-accent rounded-xl p-3 text-sm text-accent-foreground">
                Hola, soy Erika 👋 ¿Buscas bajar grasa, mejorar digestión o recomposición corporal?
              </div>
              <div className="mt-3 flex gap-2">
                {["Bajar grasa", "Energía", "Digestión"].map(opt => (
                  <span key={opt} className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1 border border-border">{opt}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-accent text-accent-foreground border-0">Beneficios</Badge>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Lo que obtenés en tu consulta</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Un enfoque integral que va más allá de las dietas genéricas.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="gradient-card shadow-card rounded-2xl p-6 border border-border hover:shadow-elevated transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl gradient-green flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <b.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section id="method" className="py-24 gradient-hero">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-accent text-accent-foreground border-0">El Método</Badge>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Así es el proceso</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tres pasos simples para transformar tu relación con la alimentación.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {METHOD.map((m, i) => (
              <motion.div
                key={m.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="relative text-center"
              >
                {i < METHOD.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[-50%] h-px bg-border" />
                )}
                <div className="w-16 h-16 rounded-2xl gradient-green flex items-center justify-center mx-auto mb-4 shadow-green text-primary-foreground font-extrabold text-lg">
                  {m.step}
                </div>
                <h3 className="font-bold text-foreground mb-2 text-lg">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={3}
            className="text-center mt-12"
          >
            <a href="https://wa.me/1234567890?text=Hola,%20quiero%20agendar%20una%20consulta" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gradient-green text-primary-foreground shadow-green hover:opacity-90 transition-all text-base px-8 gap-2">
                <Calendar className="w-5 h-5" />
                Comenzar ahora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-accent text-accent-foreground border-0">Testimonios</Badge>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Lo que dicen nuestros pacientes</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-card shadow-card rounded-2xl p-6 border border-border"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 gradient-hero">
        <div className="container max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 bg-accent text-accent-foreground border-0">FAQ</Badge>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Preguntas frecuentes</h2>
          </motion.div>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <motion.div
                key={f.q}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-card shadow-card rounded-xl p-6 border border-border"
              >
                <div className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{f.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-background">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="gradient-green rounded-3xl p-12 shadow-green relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5" />
              <div className="relative">
                <h2 className="text-4xl font-extrabold text-primary-foreground mb-4 text-balance">
                  ¿Listo para transformar tu salud?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                  Agenda tu consulta hoy. Erika, nuestra asistente virtual, te ayuda a encontrar el horario perfecto.
                </p>
                <a href="https://wa.me/1234567890?text=Hola,%20quiero%20agendar%20una%20consulta" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base px-10 gap-2 font-bold shadow-elevated">
                    <MessageCircle className="w-5 h-5" />
                    Agendar por WhatsApp ahora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">Runa AI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma de gestión nutricional para la consulta de la Dra. Kely León.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contacto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span>+593 XX XXX XXXX</span></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span>hola@drakelynutri.com</span></div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Guayaquil, Ecuador</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Horarios</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Lun – Vie: 09:00 – 18:00</p>
                <p>Sáb: 09:00 – 13:00</p>
                <p>Zona: America/Guayaquil</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© 2025 Runa AI · Dra. Kely León – Nutriología. Todos los derechos reservados.</p>
            <p>Erika es un asistente virtual. No reemplaza consulta médica.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
