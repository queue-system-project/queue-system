-- Ogranicz migawki użytkownika do usług, w których ma aktywne wpisy.
BEGIN;
CREATE INDEX IF NOT EXISTS ix_queue_active_client_service
    ON queue_entries(client_id, service_id)
    WHERE status IN ('waiting', 'confirmed', 'in_service');
COMMIT;
