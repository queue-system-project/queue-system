# ETA i potwierdzanie przybycia

Zaimplementowano obliczanie ETA dla bieżącej kolejki usługi oraz automatyczne
prośby o potwierdzenie. Oferty urgent i last-minute opisano w
[queue-offers.md](queue-offers.md). Zamykanie dnia nie zostało jeszcze zaimplementowane.

## Uruchomienie

Przed uruchomieniem zaktualizowanego API należy kolejno zastosować migracje
`001_notifications.sql`, `002_push.sql`, `003_eta_timers.sql`,
`004_queue_offers.sql`, `005_queue_read_index.sql`, `006_day_closure.sql`, `007_calendar_booking.sql`, `008_working_hours.sql`, `009_reports_warsaw.sql` i `010_email_verification.sql`.
Trzecia migracja dodaje pola i indeksy bez usuwania wpisów. Jeśli instytucja ma
kilka wierszy system_settings, migracja zatrzyma się: najpierw trzeba wyjaśnić
niejednoznaczną konfigurację. Sprawdzono ją na odrębnym testowym PostgreSQL.
23.09.2026 migracje 003 i 004 zastosowano także w lokalnym klastrze
`.postgres-local`.

Aby włączyć automatykę, ustawić w backend/.env `QUEUE_TIMERS_ENABLED=1`
i ponownie uruchomić API z jednym procesem roboczym. Domyślnie mechanizm jest
wyłączony, więc istniejące wpisy demonstracyjne nie zostaną niespodziewanie
pominięte. Cykl wykonuje się co 5 sekund.
Dostarczanie FCM obsługuje osobny proces `python -m app.push_worker`;
historia i WebSocket działają także bez niego. Dostarczenie push nie przedłuża
terminu odpowiedzi wyznaczonego przez serwer.

## Obliczenia

- Pozycja jest wspólna dla całej usługi. Wpisy in_service są pierwsze, następnie
  wpisy z priority_at, a pozostałe są porządkowane według created_at i id.
- Oczekiwanie zależy od czasu trwania usługi oraz dostępnych aktywnych pracowników
  do niej przypisanych. Uwzględnia rozpoczęte wizyty, także w innych usługach.
- Dla trwającej wizyty używane jest actual_start + standard_duration. Po
  przekroczeniu tej chwili pracownik jest traktowany jako zajęty przez co najmniej
  kolejną minutę. To aktualizowana ocena, nie obietnica zakończenia za minutę.
- Dla potwierdzonego klienta arrival_time stanowi najwcześniejszy czas rozpoczęcia.
  Wcześniejsze zakończenie poprzedniej wizyty nie wymusza wcześniejszego przybycia.
  Rozpoczęcie przed arrival_time zwraca 409.
- Brak dostępnego przypisanego pracownika oznacza ETA=null; prośba o potwierdzenie
  nie jest wtedy wysyłana.
- delay_time to różnica w minutach względem pierwszej obliczonej chwili rozpoczęcia.
  delay_duration wizyty to actual_duration minus standard_duration.

Jest to ocena bieżącej kolejki. Nie obejmuje jeszcze terminów kalendarzowych,
godzin pracy ani świąt. Kolejki oczekujących do różnych usług tego samego
pracownika nie tworzą wspólnego harmonogramu. Należy uwzględnić te ograniczenia
przy planowaniu zapisów na przyszłe dni. Przy wyłączonym mechanizmie czasowym
ETA aktualizuje się tylko podczas operacji na kolejce.

## Potwierdzenia

Ustawienia pochodzą z system_settings instytucji: confirmation_time_minutes
(domyślnie 20) i client_response_minutes (domyślnie 2).
Zmiana ustawienia nie przedłuża już wyznaczonego terminu odpowiedzi.

Gdy ETA jest mniejsze lub równe progowi, wpis waiting otrzymuje
confirmation_sent_at i confirmation_expires_at. Powiadomienie i zadanie push
są zapisywane w tej samej transakcji. Kolejny cykl lub restart nie tworzy
ponownej prośby ani nie przesuwa terminu.

- „Tak”: POST /api/queue/confirm → confirmed; zapis confirmed_at i arrival_time.
- „Nie”: POST /api/queue/cancel → cancelled; ponowne przeliczenie kolejki.
- Upływ terminu: automatyczny skipped, zwolnienie pozycji i przeliczenie kolejki.
- Po terminie potwierdzenie i rozpoczęcie wizyty waiting są odrzucane, nawet jeśli
  cykl nie zdążył jeszcze zapisać skipped. Ponowne potwierdzenie wpisu confirmed
  jest idempotentne.
- Dla zachowania zgodności klient nadal może potwierdzić przybycie przed
  automatyczną prośbą, lecz dopiero w dniu wizyty.

Nieobecność `missed` oznacza pracownik przez `/api/queue/missed`; nie jest wykrywana automatycznie.
Ręczne zamknięcie dnia opisano w [day-closure.md](day-closure.md). Oferty urgent/last-minute
włącza się osobno; zob. [queue-offers.md](queue-offers.md).

## HTTP i WebSocket

Obiekty kolejki zawierają estimated_wait_time, delay_time, estimated_start_at,
eta_updated_at, confirmation_sent_at, confirmation_expires_at, confirmed_at
i arrival_time. Czas jest podawany w UTC z Z. Klient powinien wyświetlać termin
wyznaczony przez serwer, a nie odliczać nowe dwie minuty od otwarcia powiadomienia.
Pola są dostępne w join/confirm/skip, odczycie statusu i kolejki instytucji oraz
w migawkach WebSocket. Zmiana ETA nie tworzy za każdym razem push:
aktualizacja ekranu przychodzi przez WebSocket.

## Weryfikacja

```powershell
python -m pytest -q
python -m pytest -q --postgres
```

Drugi wariant tworzy losowe schematy test_queue_* wyłącznie w lokalnej bazie
queue_system_local, a następnie usuwa własny schemat. Można wskazać osobny
QUEUE_TEST_POSTGRES_URL (localhost/127.0.0.1). Testy nie używają tabel użytkownika
w schemacie public. SQLite nie sprawdza blokad; testy wymagające współbieżności
PostgreSQL są na niej pomijane.

Sprawdzono pozostały czas i opóźnienie wizyty, dwóch pracowników, brak pracownika,
ustawienia terminów, brak duplikatów, wycofanie transakcji, wygaśnięcie i anulowanie,
zachowanie czasu przybycia, dwa jednoczesne cykle oraz potwierdzenie przy upływie terminu.
Na PostgreSQL sprawdzono też scenariusz: pierwotny db.sql → migracje 001–003 →
logowanie → join → ETA → automatyczna prośba → confirm → logout.
Ponowne zastosowanie migracji 003 kończy się poprawnie.

Podział na daty i ograniczenia grafiku: [calendar-working-hours.md](calendar-working-hours.md).
