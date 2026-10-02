BEGIN;

-- Kategorie instytucji
CREATE TABLE IF NOT EXISTS institution_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    logo_url TEXT,
    key VARCHAR(100) NOT NULL UNIQUE
);

-- Dodatkowe dane instytucji
ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS category_id UUID;

ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Powiązanie instytucji z kategorią
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'institutions_category_id_fkey'
    ) THEN
        ALTER TABLE institutions
            ADD CONSTRAINT institutions_category_id_fkey
            FOREIGN KEY (category_id)
            REFERENCES institution_categories(id);
    END IF;
END $$;

-- Numer pokoju pracownika
ALTER TABLE institution_employees
    ADD COLUMN IF NOT EXISTS room VARCHAR(50);

-- Godziny pracy są obecnie definiowane na poziomie instytucji
DROP TABLE IF EXISTS service_working_hours;

COMMIT;