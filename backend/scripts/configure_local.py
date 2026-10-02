"""Interaktywne tworzenie lokalnego .env bez wyświetlania hasła bazy."""
from getpass import getpass
from pathlib import Path
from secrets import token_urlsafe
from urllib.parse import quote


def main():
    target = Path(__file__).resolve().parents[1] / ".env"
    if target.exists():
        raise SystemExit("backend/.env already exists; kept unchanged. Edit it manually if needed.")
    password = getpass("Local PostgreSQL password for postgres: ")
    if not password:
        raise SystemExit("Empty password; no file written.")
    text = (
        "DATABASE_URL=postgresql+asyncpg://postgres:"
        + quote(password, safe="")
        + "@127.0.0.1:5432/queue_system_local\n"
        + "JWT_SECRET=" + token_urlsafe(48) + "\n"
    )
    # Wyłączne tworzenie zapobiega nadpisaniu także przy dwóch jednoczesnych uruchomieniach.
    with target.open("x", encoding="utf-8") as handle:
        handle.write(text)
    print("Created backend/.env for queue_system_local. Credentials were not printed.")


if __name__ == "__main__":
    main()
