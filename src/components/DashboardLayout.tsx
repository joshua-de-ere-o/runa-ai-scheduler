import { useState } from "react";
import kelyLeonLogo from "@/assets/kely-leon-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Calendar, Users, BarChart3, Settings, Leaf,
  Menu, X, LogOut, Bell, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: MessageCircle, label: "Inbox", badge: 3 },
  { href: "/dashboard/agenda", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/leads", icon: Users, label: "Leads & Funnel" },
  { href: "/dashboard/metrics", icon: BarChart3, label: "Métricas" },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-60" : "w-16"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
          <img src={kelyLeonLogo} alt="Kely León Nutrióloga" className={sidebarOpen ? "h-10 w-auto" : "h-8 w-8 object-contain"} />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
            const active = location.pathname === href || (href !== "/dashboard" && location.pathname.startsWith(href));
            return (
              <Link key={href} to={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                  active
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary")} />
                {sidebarOpen && (
                  <>
                    <span className="text-sm flex-1">{label}</span>
                    {badge && (
                      <Badge className="h-5 px-1.5 text-xs gradient-green text-primary-foreground border-0">{badge}</Badge>
                    )}
                    {active && <ChevronRight className="w-3 h-3 text-primary" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border p-2">
          <div className={cn("flex items-center gap-3 px-2 py-2 rounded-lg", sidebarOpen && "justify-between")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-green flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">K</div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-foreground leading-none">Dra. Kely León</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <button className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <Button size="sm" className="gradient-green text-primary-foreground shadow-green hover:opacity-90 gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp activo
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
