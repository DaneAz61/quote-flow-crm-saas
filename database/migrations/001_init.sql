
-- Create tables for QuoteFlow CRM SaaS
-- This migration establishes the initial database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom type for roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Users table (extending auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  industry TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  amount_total DECIMAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quote items table
CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Stages table
CREATE TABLE public.crm_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Leads table
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.crm_stages(id),
  next_action_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default CRM stages
INSERT INTO public.crm_stages (id, name, position, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Novo', 1, NOW(), NOW()),
  (uuid_generate_v4(), 'Enviado', 2, NOW(), NOW()),
  (uuid_generate_v4(), 'Negociação', 3, NOW(), NOW()),
  (uuid_generate_v4(), 'Fechado-Ganho', 4, NOW(), NOW()),
  (uuid_generate_v4(), 'Fechado-Perdido', 5, NOW(), NOW());

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "users_own_data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "admin_all_users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for customers
CREATE POLICY "customers_own_data" ON public.customers
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "admin_all_customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for quotes
CREATE POLICY "quotes_own_data" ON public.quotes
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "admin_all_quotes" ON public.quotes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for quote_items
CREATE POLICY "quote_items_via_quotes" ON public.quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.owner_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_quote_items" ON public.quote_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for CRM leads
CREATE POLICY "crm_leads_via_quotes" ON public.crm_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quotes
      WHERE quotes.id = crm_leads.quote_id
      AND quotes.owner_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_crm_leads" ON public.crm_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "subscriptions_own_data" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "admin_all_subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for activity_log
CREATE POLICY "activity_log_own_data" ON public.activity_log
  FOR SELECT USING (auth.uid() = actor_id);

CREATE POLICY "admin_all_activity_log" ON public.activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers for automatically updating updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modified
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customers_modified
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quotes_modified
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quote_items_modified
BEFORE UPDATE ON public.quote_items
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_crm_stages_modified
BEFORE UPDATE ON public.crm_stages
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_crm_leads_modified
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_subscriptions_modified
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Trigger to automatically create a user record when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
