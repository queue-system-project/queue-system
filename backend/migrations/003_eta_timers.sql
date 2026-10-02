BEGIN;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS estimated_wait_time integer;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS delay_time integer;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS arrival_time timestamp;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS estimated_start_at timestamp;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS initial_estimated_start_at timestamp;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS eta_updated_at timestamp;
CREATE INDEX IF NOT EXISTS ix_queue_active_service
    ON queue_entries(service_id, created_at, id)
    WHERE status IN ('waiting', 'confirmed', 'in_service');
CREATE INDEX IF NOT EXISTS ix_queue_confirmation_deadline
    ON queue_entries(confirmation_expires_at) WHERE status = 'waiting';
-- Przerwij przy niespójnych istniejących ustawieniach zamiast wybierać dowolny wiersz.
CREATE UNIQUE INDEX IF NOT EXISTS uq_system_settings_institution ON system_settings(institution_id);
COMMIT;
