import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Eye, EyeOff, ArrowLeft, Lock, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: mode === "login" ? "Sesión iniciada" : "Cuenta creada",
        description: "Conectá Lovable Cloud para activar autenticación real.",
      });
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 rounded-full bg-primary/8 blur-2xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <div className="bg-card shadow-elevated rounded-2xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl gradient-green flex items-center justify-center mx-auto mb-4 shadow-green">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Runa AI</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login" ? "Acceso para el equipo interno" : "Crear cuenta"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name" type="text" placeholder="Ej. María González"
                  value={name} onChange={e => setName(e.target.value)} required
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  className="h-11 pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  className="h-11 pl-9 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="w-full h-11 gradient-green text-primary-foreground shadow-green hover:opacity-90 transition-opacity font-semibold">
              {loading ? "Procesando..." : mode === "login" ? "Ingresar al dashboard" : "Crear cuenta"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>¿Primera vez? <button onClick={() => setMode("register")} className="text-primary font-medium hover:underline">Crear cuenta</button></>
            ) : (
              <>¿Ya tenés cuenta? <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Ingresar</button></>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Acceso restringido al equipo interno de la Dra. Kely León.
        </p>
      </motion.div>
    </div>
  );
}
