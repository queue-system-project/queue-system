# Powiadomienia i aktualizacje w czasie rzeczywistym

Moduł zapisuje powiadomienia o zmianach kolejki i przesyła aktualny stan do uwierzytelnionych użytkowników. ETA i harmonogram potwierdzeń opisano w [eta-confirmations.md](eta-confirmations.md), a oferty urgent/last-minute w [queue-offers.md](queue-offers.md).

## Zakres

- Historia powiadomień bieżącego użytkownika i oznaczanie jako przeczytane.
- Ręczne wysyłanie przez pracownika lub administratora z aktywnym przypisaniem do instytucji.
- Automatyczne powiadomienia dla stanów waiting, confirmed, in_service, done, cancelled i skipped.
- WebSocket klienta oraz WebSocket kolejki dla personelu instytucji.
- Wspólna weryfikacja JWT i sesji dla HTTP i WebSocket.
- Aktualizacja po commit, odbudowanie stanu po ponownym połączeniu, obsługa kilku urządzeń.
- Rejestracja urządzeń, trwała kolejka push i osobny worker Firebase z ponowieniami.

## Uruchomienie

1. Zainstalować zależności z `backend/requirements.txt` (do testów: `requirements-dev.txt`).
2. Przygotować PostgreSQL według `app/database/db.sql`. Nie importować dumpa do istniejącej bazy z danymi.
3. Na istniejącej bazie wykonać kolejno `backend/migrations/001_notifications.sql` i `002_push.sql` oraz `003_eta_timers.sql` i `004_queue_offers.sql`, a następnie `005_queue_read_index.sql` , `006_day_closure.sql`, `007_calendar_booking.sql` i `008_working_hours.sql`, `009_reports_warsaw.sql` i `010_email_verification.sql` przed uruchomieniem zmienionej aplikacji. Skrypty dodają kolumny, indeksy i kolejkę push; nie usuwają danych. W tym zadaniu nie były uruchamiane na bazie zespołu. Druga migracja zatrzyma się, jeśli istnieją duplikaty tokenów urządzeń; ich właścicieli trzeba najpierw ustalić, bez automatycznego usuwania rekordów.
4. Utworzyć lokalny `backend/.env` na podstawie `.env.example`. Ustawić własne DATABASE_URL i JWT_SECRET.
5. Z katalogu backend uruchomić `python -m uvicorn app.main:app --reload --workers 1`.
6. Testy: z katalogu backend `python -m pytest -q`.

Testy tworzą odrębną bazę SQLite w nowym katalogu `backend/.pytest-tmp-<losowy identyfikator>` dla każdego uruchomienia i używają prawdziwych podpisanych tokenów testowych. Dzięki temu nie zależą od uprawnień wspólnego katalogu Windows Temp. Można wskazać własny katalog przez `--basetemp`. Katalogi testowe są ignorowane przez Git. Nie łączą się z PostgreSQL zespołu. Wariant `python -m pytest -q --postgres` sprawdza również PostgreSQL w izolowanych schematach; obejmuje konkurencyjne ticki i potwierdzenie przy upływie terminu. Szczegóły: eta-confirmations.md.

## HTTP API

Wymagany nagłówek `Authorization: Bearer <access_token>`.

### GET /api/notifications

Zwraca listę powiadomień zalogowanego użytkownika. Parametry: `limit` 1–100 (domyślnie 50), `offset` od 0, opcjonalnie `is_read=true/false`. Kolejność: created_at malejąco, następnie id malejąco. Wersja z `/api/notifications/{user_id}` pozostaje zgodna ze starym adresem, ale działa wyłącznie dla właściciela.

Paginacja offsetowa zachowuje dotychczasowy format. Przy nowych wpisach między pobraniem stron element może się powtórzyć; klient powinien scalać po id lub odświeżyć pierwszą stronę.

### PATCH /api/notifications/{id}/read

Brak body. Zwraca aktualne powiadomienie. Powtórzenie jest dozwolone. Obce i nieistniejące identyfikatory zwracają 404. Oznaczenie jako przeczytane nie potwierdza przybycia na wizytę.

### POST /api/notifications/send

```json
{
  "user_id": "00000000-0000-4000-8000-000000000001",
  "institution_id": "00000000-0000-4000-8000-000000000002",
  "source_event_id": "00000000-0000-4000-8000-000000000003",
  "title": "Informacja",
  "message": "Prosimy sprawdzić aktualny status wizyty."
}
```

Adresat musi być pracownikiem tej instytucji lub mieć w niej zapis w kolejce. Rola admin bez aktywnego wpisu w institution_employees nie daje globalnego dostępu. To konserwatywna polityka do uzgodnienia z zespołem, ponieważ osobna relacja administrator–instytucja nie istnieje w obecnym modelu.

Nowa wiadomość zwraca 201. Ponowienie tego samego source_event_id przez tego samego nadawcę dla tej samej instytucji i odbiorcy zwraca wcześniejsze powiadomienie z kodem 200. Zmiana treści przy tym samym kluczu daje 409. Nie generować nowego klucza przy ponawianiu żądania.

## WebSocket

Używany jest zwykły WebSocket, nie Socket.IO. Adresy zachowano:

- `/ws/user/{user_id}` — wyłącznie własna kolejka i ostatnie 50 powiadomień.
- `/ws/queue/{service_id}` — kolejka usługi dla aktywnego personelu tej instytucji. Klient indywidualny używa kanału user, aby nie otrzymywać danych innych klientów.

Klient natywny może przesłać nagłówek Authorization przy połączeniu. Alternatywnie pierwsza ramka musi nadejść w ciągu 5 sekund:

```json
{"type": "authenticate", "access_token": "ACCESS_TOKEN"}
```

Nie przesyłać tokenu w URL. W środowisku udostępnionym używać HTTPS/WSS. Połączenie jest akceptowane na poziomie transportu przed tą ramką, ale żadne dane nie są przekazywane przed autoryzacją. Błędne dane lub brak uprawnień zamykają kanał kodem 1008. Błąd serwera daje 1011.

Format zachowuje kompatybilność z dotychczasowym kodem:

```json
{"type": "user_snapshot", "data": {"notifications": [], "queue": [], "offers": {"urgent": [], "last_minute": []}}}
```

Kanał personelu używa `queue_snapshot` i listy w `data`. Klient zastępuje poprzedni snapshot nowym, a nie dopisuje całą listę ponownie. Po utracie połączenia powinien odnowić token HTTP, połączyć się ponownie i przyjąć początkowy snapshot. Przepis na automatyczny reconnect w aplikacji mobilnej nie został jeszcze dodany.

## Transakcje i wydajność

`queue_changed(db, entry)` zapisuje powiadomienie w tej samej transakcji co zmiana kolejki. Następnie rejestruje kanały do odświeżenia. Hook SQLAlchemy after_commit budzi odpowiednie połączenia; rollback usuwa oczekujące sygnały. Powiadomienie nie jest wysyłane przed commit. Stabilny klucz queue:id:status zapobiega duplikatom przy ponowieniu obecnych jednokierunkowych przejść statusów. Jeśli system zacznie przywracać zakończone wpisy do waiting, potrzebna będzie wersja przejścia zamiast klucza opartego na statusie.

Sygnały są łączone za pomocą asyncio.Event. Nie powstaje nieograniczona kolejka wiadomości dla wolnego klienta. Wysłanie snapshotu ma limit 5 sekund. W stanie bez zmian nie ma odpytywania co 2 sekundy; co 30 sekund wykonywana jest weryfikacja dostępu i odczyt naprawczy. Sesja i uprawnienia są sprawdzane także przed każdym snapshotem. Wylogowanie lub wygaśnięcie sesji zamyka bezczynne połączenie najpóźniej przy następnym sprawdzeniu; limit zależy też od dostępności bazy.

Hub działa w pamięci jednego procesu. Dla wielu workers potrzebna jest wspólna szyna, np. Redis. Sygnały nie są trwałym dziennikiem zdarzeń. Po awarii procesu historia pozostaje w bazie; aktualny stan wraca przez ponowne połączenie/odczyt naprawczy. Nie deklarujemy gwarantowanej dostawy każdego zdarzenia ani obsługi wielu workers.

## Punkty integracji i dalsza praca

Podłączone operacje: join, cancel, confirm, skip, visit/start, visit/end, visit/cancel. Dla nich dodano również uwierzytelnienie i sprawdzenie tożsamości klienta/pracownika. Poprawiono mapowanie QueueEntry.employee_id i błędne budowanie zapytań statystycznych.

Dodano ETA, opóźnienia i harmonogram potwierdzeń; pola czasu są dostępne w snapshotach (ograniczenia: eta-confirmations.md). Dodano backend urgent/last-minute (queue-offers.md). Pozostaje pełna integracja mobilna. Rzeczywiste powiadomienia Firebase sprawdzono na Androidzie w tle i przy otwartej aplikacji; iOS/APNs odłożono. Nie zostały zmienione wszystkie pozostałe endpointy projektu; starsze moduły zarządzania personelem, slotami i profilem nadal wymagają osobnego przeglądu uprawnień. To nie jest deklaracja bezpieczeństwa całej aplikacji.

Przed wspólnym uruchomieniem należy sprawdzić migracje na docelowej bazie, uzgodnić przypisanie administratora do instytucji oraz sprawdzić pełny scenariusz mobilny i docelowe obciążenie. Testy PostgreSQL, lokalne pomiary p95 i test push na Androidzie opisano w [backend-performance.md](backend-performance.md).

## Firebase push

API i worker nie są uruchamiane razem automatycznie. Historia i WebSocket działają bez konta Firebase. Każde nowe powiadomienie tworzy w tej samej transakcji zadanie w notification_push_jobs; rollback usuwa oba wpisy. Starsze powiadomienia nie są automatycznie rozsyłane.

Po zalogowaniu aplikacja mobilna rejestruje natywny token FCM (nie ExpoPushToken):

```text
POST /api/notifications/devices
Authorization: Bearer <access_token>
{"token": "NATIVE_FCM_TOKEN", "device_type": "android"}
```

Odpowiedź zawiera id urządzenia. Powtórna rejestracja tego samego tokenu aktualizuje właściciela i sesję, co obsługuje zmianę konta na jednym urządzeniu. DELETE /api/notifications/devices/{id} usuwa wyłącznie własną rejestrację. Przed wylogowaniem frontend powinien wyrejestrować urządzenie. Worker dodatkowo odrzuca tokeny bez aktywnej sesji (np. po logout) i usuwa je. Stare tokeny bez session_id wymagają ponownej rejestracji.

Uruchomienie workera, dopiero po konfiguracji własnego projektu Firebase:

```sh
python -m pip install -r requirements-push.txt
# Ustaw GOOGLE_APPLICATION_CREDENTIALS na plik konta usługi poza repozytorium Git.
python -m app.push_worker --once
python -m app.push_worker
```

Worker pobiera zadanie z blokadą FOR UPDATE SKIP LOCKED. Brak urządzeń kończy je jako no_devices; historia nadal jest dostępna. Błąd wysyłki powoduje maksymalnie trzy próby z odstępami 30 i 60 sekund, a następnie status failed. last_error przechowuje klasę błędu, bez tokenów i odpowiedzi chmury. Token odrzucony jako Unregistered jest usuwany. Wyłączone konto nie otrzymuje push.

Przy częściowym powodzeniu lub awarii po przyjęciu wiadomości przez Firebase możliwe są ponowienia. Aplikacja powinna identyfikować wiadomość po data.notification_id. Gwarancja exactly-once nie jest zapewniana. Worker wysyła podgląd tytułu (100 znaków) i treści (500 znaków); pełna treść pozostaje w historii. Domyślnie wysyła na wszystkie aktywne rejestracje, także gdy aplikacja jest otwarta; sposób prezentacji i unikanie podwójnego toastu ustala frontend.

Transakcja workera utrzymuje blokadę zadania i urządzeń podczas żądań Firebase z timeoutem HTTP 10 sekund. To wariant dla małego wdrożenia dyplomowego. Przy dużej liczbie urządzeń trzeba przejść na osobne zadania dostawy per urządzenie i krótkie dzierżawy. Testy lokalne używają zastępczego gateway; rzeczywista konfiguracja APNs/FCM i dostawa w tle wymagają telefonu i uprawnień do projektu Firebase.

## Podstawa techniczna

- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
- [SQLAlchemy Session Events](https://docs.sqlalchemy.org/en/20/orm/session_events.html)
- [Firebase Admin SDK messaging](https://firebase.google.com/docs/cloud-messaging/send/admin-sdk)
