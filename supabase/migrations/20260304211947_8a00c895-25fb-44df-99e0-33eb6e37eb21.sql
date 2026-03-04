
-- ── conversations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    text UNIQUE NOT NULL,
  lead_id         uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status          text NOT NULL DEFAULT 'open',
  last_message_at timestamp with time zone DEFAULT now(),
  created_at      timestamp with time zone NOT NULL DEFAULT now(),
  updated_at      timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE USING (true);

-- ── messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  phone_number        text NOT NULL,
  direction           text NOT NULL CHECK (direction IN ('inbound','outbound')),
  content             text,
  provider            text DEFAULT 'ycloud',
  provider_message_id text UNIQUE,
  raw_payload         jsonb,
  created_at          timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (true);

-- ── services ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  active       boolean NOT NULL DEFAULT true,
  created_at   timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_select" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "services_update" ON public.services FOR UPDATE USING (true);

INSERT INTO public.services (name, duration_min, active) VALUES
  ('Consulta Inicial', 60, true),
  ('Control Mensual', 45, true),
  ('Control Semanal', 30, true)
ON CONFLICT DO NOTHING;

-- ── leads: add missing columns ────────────────────────────────
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contact_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS funnel_stage text DEFAULT 'tofu',
  ADD COLUMN IF NOT EXISTS objection text,
  ADD COLUMN IF NOT EXISTS consent boolean DEFAULT false;

UPDATE public.leads SET phone_number = phone WHERE phone_number IS NULL AND phone IS NOT NULL;

-- ── appointments: add missing columns ────────────────────────
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS start_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS end_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id);

UPDATE public.appointments SET start_at = appointment_date WHERE start_at IS NULL;
