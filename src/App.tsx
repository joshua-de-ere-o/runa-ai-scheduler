import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import Inbox from "./pages/dashboard/Inbox";
import Agenda from "./pages/dashboard/Agenda";
import Leads from "./pages/dashboard/Leads";
import Metrics from "./pages/dashboard/Metrics";
import Performance from "./pages/dashboard/Performance";
import SettingsPage from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardLayout><Inbox /></DashboardLayout>} />
          <Route path="/dashboard/agenda" element={<DashboardLayout><Agenda /></DashboardLayout>} />
          <Route path="/dashboard/leads" element={<DashboardLayout><Leads /></DashboardLayout>} />
          <Route path="/dashboard/metrics" element={<DashboardLayout><Metrics /></DashboardLayout>} />
          <Route path="/dashboard/performance" element={<DashboardLayout><Performance /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
