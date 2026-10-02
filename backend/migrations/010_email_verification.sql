BEGIN;
CREATE TABLE IF NOT EXISTS auth_challenges (
    user_id UUID NOT NULL REFERENCES users(id),
    purpose VARCHAR(20) NOT NULL,
    code_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, purpose)
);
-- Dawne kody bez terminu ważności nie mogą autoryzować resetowania hasła.
UPDATE users SET verification_code = NULL WHERE verification_code IS NOT NULL;
COMMIT;
