
-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  stage TEXT NOT NULL DEFAULT 'nuevo',
  source TEXT,
  goal TEXT,
  score INTEGER DEFAULT 50,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select" ON public.leads FOR SELECT USING (true);
CREATE POLICY "leads_insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE USING (true);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone_number TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT DEFAULT 'consulta',
  status TEXT NOT NULL DEFAULT 'pending',
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE USING (true);

-- Create clinic_settings table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name TEXT DEFAULT 'Clínica Nutrición',
  phone TEXT,
  ticket_avg NUMERIC DEFAULT 60,
  currency TEXT DEFAULT 'USD',
  monthly_revenue_goal NUMERIC DEFAULT 5000,
  working_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinic_settings_select" ON public.clinic_settings FOR SELECT USING (true);
CREATE POLICY "clinic_settings_update" ON public.clinic_settings FOR UPDATE USING (true);
CREATE POLICY "clinic_settings_insert" ON public.clinic_settings FOR INSERT WITH CHECK (true);

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_settings_updated_at
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
