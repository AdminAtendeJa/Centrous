-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Integration Credentials
CREATE TABLE IF NOT EXISTS integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON integration_credentials
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- 3. Unified Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  instagram_id TEXT,
  linkedin_id TEXT,
  source_channel TEXT,
  crm_stage TEXT DEFAULT 'lead',
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, phone),
  UNIQUE(organization_id, email)
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON contacts
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- 4. Unified Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  thread_id TEXT,
  external_id TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'received',
  ai_summary TEXT,
  ai_suggested_reply TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_isolation" ON messages
  USING (organization_id = (auth.jwt() ->> 'org_id')::uuid);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 5. Integration Events (Audit Log)
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment Events
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'BRL',
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
