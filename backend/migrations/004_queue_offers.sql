BEGIN;
ALTER TABLE queue_entries ADD COLUMN IF NOT EXISTS priority_at timestamp;
CREATE TABLE IF NOT EXISTS queue_offer_windows (
 id uuid PRIMARY KEY, service_id uuid NOT NULL REFERENCES services(id),
 source_entry_id uuid NOT NULL REFERENCES queue_entries(id), source_event varchar(150) NOT NULL UNIQUE,
 phase varchar(20) NOT NULL DEFAULT 'urgent' CHECK (phase IN ('urgent','last_minute')),
 status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','taken','expired')),
 created_at timestamp NOT NULL, expires_at timestamp NOT NULL,
 taken_by uuid, accepted_entry_id uuid
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_offer_active_service ON queue_offer_windows(service_id)
 WHERE status='active';
CREATE TABLE IF NOT EXISTS queue_offers (
 id uuid PRIMARY KEY, window_id uuid NOT NULL REFERENCES queue_offer_windows(id),
 queue_entry_id uuid NOT NULL REFERENCES queue_entries(id),
 status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
 expires_at timestamp NOT NULL, selected_minutes integer,
 UNIQUE(window_id,queue_entry_id)
);
CREATE INDEX IF NOT EXISTS ix_offer_pending ON queue_offers(window_id,status);
COMMIT;
