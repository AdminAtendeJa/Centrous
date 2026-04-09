-- 🚀 WorkHub AI / Centro: Supabase Init Script

-- 1. Crear tabla de Leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    value NUMERIC DEFAULT 0,
    stage TEXT DEFAULT 'new',
    channel TEXT DEFAULT 'API',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla para los mensajes/interacciones del lead (Bandeja Unificada)
CREATE TABLE IF NOT EXISTS public.lead_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'gmail', -- Ej: gmail, whatsapp, instagram
    direction TEXT DEFAULT 'received', -- received / sent
    time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permisos rápidos (Si quieres usar RLS luego, puedes activarlo, pero como interactuaremos vía Node con Service Role, por defecto estará ok)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir a la SERVICE ROLE todo (por defecto viene así, pero nos aseguramos)
CREATE POLICY "Allow Service Role full access on leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow Service Role full access on lead_messages" ON public.lead_messages FOR ALL USING (true);
CREATE POLICY "Allow Service Role full access on tasks" ON public.tasks FOR ALL USING (true);
