-- Nie zmienia istniejących statusów; zamknięcie dnia wymaga jawnego żądania.
BEGIN;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(80);
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS missed_at TIMESTAMP;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS missed_by UUID REFERENCES users(id);
CREATE TABLE IF NOT EXISTS institution_day_closures (
    institution_id UUID NOT NULL REFERENCES institutions(id),
    day DATE NOT NULL,
    closed_at TIMESTAMP NOT NULL,
    closed_by UUID NOT NULL REFERENCES users(id),
    cancelled_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (institution_id, day)
);
COMMIT;
