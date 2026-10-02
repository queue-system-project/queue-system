-- Zastosuj do istniejącej bazy PostgreSQL przed uruchomieniem tej wersji.
BEGIN;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS event_key VARCHAR(200);
CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_event_key
    ON notifications (event_key);
CREATE INDEX IF NOT EXISTS ix_notifications_user_created_id
    ON notifications (user_id, created_at DESC NULLS LAST, id DESC);
COMMIT;
