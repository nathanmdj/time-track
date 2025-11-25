-- Seed Data for Time Tracker
-- Optional: Run this after schema to populate with sample data
--
-- To apply: Run in Supabase SQL Editor after running schema.sql
-- https://supabase.com/dashboard/project/_/sql

-- Sample clients
INSERT INTO clients (name, email, hourly_rate) VALUES
  ('Acme Corporation', 'contact@acme.com', 75.00),
  ('TechStart Inc', 'hello@techstart.io', 100.00),
  ('Design Studio', 'projects@designstudio.co', 85.00)
ON CONFLICT DO NOTHING;

-- Sample time entries (using the clients we just created)
-- Note: These will only work if the clients above were inserted
DO $$
DECLARE
  acme_id UUID;
  techstart_id UUID;
  design_id UUID;
BEGIN
  SELECT id INTO acme_id FROM clients WHERE name = 'Acme Corporation' LIMIT 1;
  SELECT id INTO techstart_id FROM clients WHERE name = 'TechStart Inc' LIMIT 1;
  SELECT id INTO design_id FROM clients WHERE name = 'Design Studio' LIMIT 1;

  IF acme_id IS NOT NULL THEN
    INSERT INTO time_entries (client_id, description, start_time, end_time, duration_minutes) VALUES
      (acme_id, 'Website redesign planning', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', 120),
      (acme_id, 'Frontend development', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours', 240);
  END IF;

  IF techstart_id IS NOT NULL THEN
    INSERT INTO time_entries (client_id, description, start_time, end_time, duration_minutes) VALUES
      (techstart_id, 'API integration', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 hours', 180),
      (techstart_id, 'Code review', NOW() - INTERVAL '1 day' + INTERVAL '4 hours', NOW() - INTERVAL '1 day' + INTERVAL '5 hours', 60);
  END IF;

  IF design_id IS NOT NULL THEN
    INSERT INTO time_entries (client_id, description, start_time, end_time, duration_minutes) VALUES
      (design_id, 'Logo concepts', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '1.5 hours', 90);
  END IF;
END $$;
