"""Losowa sól i PBKDF2; starsze SHA-256 migrują przy poprawnym logowaniu."""
import hashlib
import hmac
import secrets


def hash_password(password):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600000).hex()
    return f"pbkdf2_sha256$600000${salt}${digest}"


def verify_password(password, stored):
    try:
        if stored.startswith("pbkdf2_sha256$"):
            _, rounds, salt, digest = stored.split("$")
            if not 100000 <= int(rounds) <= 2000000:
                return False
            actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(rounds)).hex()
        else:
            actual, digest = hashlib.sha256(password.encode()).hexdigest(), stored
        return hmac.compare_digest(actual, digest)
    except (ValueError, TypeError, AttributeError):
        return False
