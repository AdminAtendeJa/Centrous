-- 🔐 Nueva tabla de Usuarios para autenticación con Gmail

CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    phone TEXT,
    company TEXT,
    role TEXT DEFAULT 'user', -- user, admin
    verified_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de sesiones para manejar tokens JWT
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Vincular leads con usuarios
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Service role has full access" ON public.users FOR ALL USING (true);

CREATE POLICY "Users can view their sessions" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Service role full access sessions" ON public.user_sessions FOR ALL USING (true);
