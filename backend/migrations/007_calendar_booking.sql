-- Istniejące rezerwacje zachowują dzień slotu, pozostałe dzień utworzenia w UTC.
BEGIN;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS queue_date DATE;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
UPDATE queue_entries q SET queue_date = s.slot_start::date, scheduled_at = s.slot_start
FROM service_slots s WHERE q.slot_id = s.id AND q.queue_date IS NULL;
UPDATE queue_entries SET queue_date = COALESCE(created_at::date, (now() AT TIME ZONE 'UTC')::date)
WHERE queue_date IS NULL;
ALTER TABLE queue_entries ALTER COLUMN queue_date SET NOT NULL;
ALTER TABLE queue_entries ALTER COLUMN queue_date SET DEFAULT ((now() AT TIME ZONE 'UTC')::date);
-- Duplikaty wymagają świadomego rozstrzygnięcia; migracja ich nie usuwa.
CREATE UNIQUE INDEX IF NOT EXISTS uq_queue_active_client_day ON queue_entries(client_id, service_id, queue_date)
WHERE status IN ('waiting', 'confirmed', 'in_service');
CREATE UNIQUE INDEX IF NOT EXISTS uq_queue_active_slot ON queue_entries(slot_id)
WHERE status IN ('waiting', 'confirmed', 'in_service') AND slot_id IS NOT NULL;
COMMIT;
