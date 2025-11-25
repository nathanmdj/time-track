-- Migration: Add Pay Cycle to Clients
-- Created: 2025-11-25
-- Description: Add pay cycle interval and start date columns to clients table

-- Add pay_cycle_interval column
-- Values: 'weekly', 'biweekly', 'monthly', or NULL (no pay cycle configured)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS pay_cycle_interval TEXT;

-- Add pay_cycle_start_date column
-- The date from which pay cycles are calculated
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS pay_cycle_start_date DATE;

-- Add check constraint for valid interval values
ALTER TABLE clients
ADD CONSTRAINT valid_pay_cycle_interval
CHECK (pay_cycle_interval IS NULL OR pay_cycle_interval IN ('weekly', 'biweekly', 'monthly'));

-- Add comment for documentation
COMMENT ON COLUMN clients.pay_cycle_interval IS 'Payment cycle frequency: weekly, biweekly, or monthly';
COMMENT ON COLUMN clients.pay_cycle_start_date IS 'Start date for calculating pay cycle periods';
