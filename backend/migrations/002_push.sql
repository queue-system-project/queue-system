BEGIN;
ALTER TABLE push_tokens ADD COLUMN IF NOT EXISTS session_id UUID;
-- Przerywa bez zmiany danych, jeśli istnieją starsze zduplikowane rejestracje tokenów.
-- Przed ponowieniem sprawdź te wpisy i ustal właściwego właściciela.
CREATE UNIQUE INDEX IF NOT EXISTS ux_push_tokens_token ON push_tokens(token);
CREATE TABLE IF NOT EXISTS notification_push_jobs (
    notification_id UUID PRIMARY KEY REFERENCES notifications(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_error VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS ix_push_jobs_pending
    ON notification_push_jobs(available_at, notification_id) WHERE status = 'pending';
COMMIT;
