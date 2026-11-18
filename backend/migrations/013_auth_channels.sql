BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE auth_challenges ADD COLUMN IF NOT EXISTS channel VARCHAR(10);
ALTER TABLE auth_challenges ADD COLUMN IF NOT EXISTS recipient VARCHAR(254);
ALTER TABLE auth_challenges ADD COLUMN IF NOT EXISTS provider_sid VARCHAR(34);
-- Przy jednym kontakcie dawne potwierdzenie ma jednoznaczne znaczenie.
-- Konta z dwoma kontaktami wymagają potwierdzenia wybranego kontaktu po zalogowaniu.
UPDATE users SET email_verified_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
WHERE is_verified AND email IS NOT NULL AND phone IS NULL AND email_verified_at IS NULL;
UPDATE users SET phone_verified_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
WHERE is_verified AND phone IS NOT NULL AND email IS NULL AND phone_verified_at IS NULL;
-- Dawny kod bez informacji o odbiorcy wymaga ponownego wysłania.
DELETE FROM auth_challenges WHERE channel IS NULL OR recipient IS NULL;
COMMIT;
