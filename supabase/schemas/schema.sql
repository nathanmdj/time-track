-- Time Tracker Database Schema
-- This file represents the current database structure
-- For fresh setup, run migrations in order or use this file directly
--
-- To apply: Run in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

--
-- TABLES
--

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pay_cycle_interval TEXT CHECK (pay_cycle_interval IS NULL OR pay_cycle_interval IN ('weekly', 'biweekly', 'monthly')),
  pay_cycle_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN clients.pay_cycle_interval IS 'Payment cycle frequency: weekly, biweekly, or monthly';
COMMENT ON COLUMN clients.pay_cycle_start_date IS 'Start date for calculating pay cycle periods';

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

--
-- INDEXES
--

CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);

--
-- FUNCTIONS
--

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- TRIGGERS
--

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

--
-- ROW LEVEL SECURITY
--

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Development policies (replace with auth-based policies for production)
CREATE POLICY "Allow all operations on clients" ON clients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on time_entries" ON time_entries
  FOR ALL USING (true) WITH CHECK (true);
