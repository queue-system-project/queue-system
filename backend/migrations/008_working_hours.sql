BEGIN;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS calendar_enabled BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS institution_working_hours (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time)
);
-- Tabele pracowników i świąt istnieją w pierwotnym db.sql; ich dane pozostają bez zmian.
ALTER TABLE institution_day_closures ALTER COLUMN closed_by DROP NOT NULL;
COMMIT;
