# System zarządzania kolejkami

Powiadomienia i aktualizacje w czasie rzeczywistym opisano w
[docs/notifications-realtime.md](docs/notifications-realtime.md).
Przed uruchomieniem z istniejącą bazą należy zastosować migracje 001–010.
Obliczanie ETA, terminy potwierdzeń i ograniczenia opisano w
[docs/eta-confirmations.md](docs/eta-confirmations.md).

Polecenia wykonywane z katalogu `backend`:

```sh
python -m pip install -r requirements-dev.txt
python -m pytest -q
python -m uvicorn app.main:app --reload --workers 1
```

Połączenie z PostgreSQL i JWT_SECRET należy ustawić w `backend/.env`;
przykład znajduje się w `.env.example`.
Testy domyślnie używają odrębnej tymczasowej bazy SQLite, a nie bazy zespołu.
Polecenie `python -m pytest -q --postgres` sprawdza również blokady PostgreSQL
w tymczasowych schematach lokalnej bazy. Konfigurację opisano w dokumencie o ETA.

Wysyłanie przez Firebase jest opcjonalne i działa w osobnym procesie.
Przed uruchomieniem należy sprawdzić `backend/requirements-push.txt`
oraz dokumentację modułu.

Oferty urgent i last-minute: [docs/queue-offers.md](docs/queue-offers.md).
Weryfikacja i wydajność backendu: [docs/backend-performance.md](docs/backend-performance.md).
Integracja ekranów mobilnych i obsługa iOS pozostają osobnymi zadaniami.
Nieobecność i zamknięcie dnia: [docs/day-closure.md](docs/day-closure.md).

Rezerwacje i godziny pracy: [docs/calendar-working-hours.md](docs/calendar-working-hours.md).

Konta, administracja i raporty: [docs/auth-reports-administration.md](docs/auth-reports-administration.md).
