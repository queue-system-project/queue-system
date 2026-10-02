BEGIN;
-- Daty zapisów wynikają z lokalnego dnia instytucji, a znaczniki czasu pozostają UTC.
DROP INDEX IF EXISTS uq_queue_active_client_day;
UPDATE queue_entries SET queue_date =
    (COALESCE(scheduled_at, created_at, now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Warsaw')::date;
ALTER TABLE queue_entries ALTER COLUMN queue_date SET DEFAULT ((now() AT TIME ZONE 'Europe/Warsaw')::date);
CREATE UNIQUE INDEX uq_queue_active_client_day ON queue_entries(client_id, service_id, queue_date)
WHERE status IN ('waiting', 'confirmed', 'in_service');
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS finalized BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS payload JSON;
CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_report_institution_day ON daily_reports(institution_id, report_date);
COMMIT;
