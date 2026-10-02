# Ręczna weryfikacja w przeglądarce

Scenariusz sprawdza lokalny backend przez Swagger i WebSocket, bez aplikacji
mobilnej. Wymaga osobnej bazy PostgreSQL. Testy automatyczne tworzą tymczasowe
bazy i nie przygotowują danych dla Swaggera.

## 1. Instalacja PostgreSQL

Jeśli PostgreSQL jest już zainstalowany i działa, przejdź dalej. W przeciwnym
razie zainstaluj aktualną stabilną wersję z
[oficjalnej strony dla Windows](https://www.postgresql.org/download/windows/).
Pozostaw komponenty PostgreSQL Server, pgAdmin i Command Line Tools. Port: 5432.
Zapamiętaj hasło użytkownika postgres. Stack Builder nie jest potrzebny.

Scenariusz używa wyłącznie osobnej bazy `queue_system_local` na Twoim komputerze,
bez wspólnej bazy zespołu.

## 2. Utworzenie bazy testowej

W PowerShell wykonaj:

```powershell
cd 'C:\path\to\queue-system\backend' # Podaj własny katalog projektu.
$pgTool = (Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\psql.exe' | Sort-Object FullName -Descending | Select-Object -First 1).FullName
& $pgTool -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 -c 'CREATE DATABASE queue_system_local;'
```

Przy pytaniu Password wpisz hasło wybrane podczas instalacji PostgreSQL.
Znaki mogą nie być widoczne. Jeśli `$pgTool` jest pusty, PostgreSQL znajduje się
w innym katalogu lub brakuje Command Line Tools; podaj pełną ścieżkę do psql.exe.

Poniższe polecenia wykonuj pojedynczo, dopiero po powodzeniu poprzedniego:

```powershell
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\app\database\db.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\001_notifications.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\002_push.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\003_eta_timers.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\004_queue_offers.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\005_queue_read_index.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\006_day_closure.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\007_calendar_booking.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\008_working_hours.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\009_reports_warsaw.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\migrations\010_email_verification.sql'
& $pgTool -h 127.0.0.1 -U postgres -d queue_system_local -v ON_ERROR_STOP=1 -f '.\scripts\seed_manual_demo.sql'
```

Pierwotny zrzut importuj tylko raz do nowej pustej bazy. Jeśli baza już istnieje
lub import zgłosi błąd, zachowaj pierwszy błąd zamiast ponawiać wszystkie polecenia.
Skrypt danych demonstracyjnych sprawdza nazwę bazy i nie nadpisuje istniejących wpisów.

## 3. Konfiguracja i uruchomienie serwera

W tym samym katalogu:

```powershell
python -m venv .venv
& '.\.venv\Scripts\python.exe' -m pip install -r requirements-dev.txt
& '.\.venv\Scripts\python.exe' '.\scripts\configure_local.py'
```

Wpisz hasło PostgreSQL. Skrypt utworzy lokalny `.env`, zakoduje znaki specjalne
hasła w adresie URL i wygeneruje JWT_SECRET. Hasło i sekret nie są wypisywane.
Istniejący `.env` nie zostanie zmieniony.

Uruchomienie:

```powershell
& '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Pozostaw okno otwarte. Poczekaj na `Application startup complete`.
Otwórz [Swagger](http://127.0.0.1:8000/docs). Serwer można zatrzymać przez Ctrl+C.
W tym scenariuszu pozostaw QUEUE_TIMERS_ENABLED i QUEUE_OFFERS_ENABLED wyłączone.

## 4. Logowanie klienta 1 i dołączenie do kolejki

Dla każdego żądania w Swaggerze: rozwiń wiersz → Try it out → wypełnij
body/parametry → Execute. Sprawdzaj rzeczywiste Server response,
a nie przykład w sekcji Responses.

Otwórz POST `/api/auth/login`:

```json
{"login":"client1@example.com","password":"Demo-Queue-2026"}
```

Oczekiwany kod: 200. Skopiuj `access_token`. Na górze Swaggera wybierz Authorize,
wklej sam token bez słowa Bearer, następnie Authorize → Close.

POST `/api/queue/join`:

```json
{
  "user_id":"10000000-0000-4000-8000-000000000001",
  "service_id":"30000000-0000-4000-8000-000000000001"
}
```

Oczekiwany kod: 201, status waiting, queue_position 1. Zachowaj `id` odpowiedzi:
jest to `queue_entry_id` pierwszego klienta.

GET `/api/notifications` bez dodatkowych parametrów powinien zwrócić powiadomienie
„You are in the queue”. Skopiuj jego `id` do PATCH
`/api/notifications/{notification_id}/read`. Oczekiwane: 200 i `is_read: true`.
Ponowny PATCH także powinien zwrócić 200.

## 5. Logowanie klienta 2

POST `/api/auth/login`:

```json
{"login":"client2@example.com","password":"Demo-Queue-2026"}
```

Zachowaj jego access_token osobno. W Authorize wybierz Logout i wklej nowy token.
Samo żądanie login nie przełącza automatycznie tokenu w Swaggerze.

POST `/api/queue/join`:

```json
{
  "user_id":"10000000-0000-4000-8000-000000000002",
  "service_id":"30000000-0000-4000-8000-000000000001"
}
```

Oczekiwana pozycja: 2. Przy ponownej próbie, jeśli zostały aktywne wpisy, możliwy
jest kod 409. Sprawdź je przez GET `/api/queue/status/{user_id}` z tokenem danego
klienta i anuluj przez POST `/api/queue/cancel`, podając user_id i queue_entry_id.
Dla wpisu in_service pracownik musi najpierw zakończyć wizytę.

## 6. Połączenie WebSocket klienta 2

Swagger sprawdza HTTP, ale nie wyświetla zdarzeń WebSocket. Otwórz tę samą stronę
Swagger w Chrome lub Edge, naciśnij F12 → Console. Jeśli przeglądarka wbudowana
nie udostępnia narzędzi deweloperskich, użyj zwykłej przeglądarki.

Zastąp `TOKEN_CLIENT_2` tokenem access_token klienta 2:

```javascript
var queueDemoSocket = new WebSocket('ws://127.0.0.1:8000/ws/user/10000000-0000-4000-8000-000000000002');
queueDemoSocket.onopen = () => queueDemoSocket.send(JSON.stringify({
  type: 'authenticate',
  access_token: 'TOKEN_CLIENT_2'
}));
queueDemoSocket.onmessage = event => console.log('QUEUE UPDATE', JSON.parse(event.data));
queueDemoSocket.onclose = event => console.log('CLOSED', event.code);
queueDemoSocket.onerror = event => console.error('SOCKET ERROR', event);
```

Pierwszy komunikat QUEUE UPDATE powinien zawierać type user_snapshot oraz
`data.queue[0].queue_position: 2`. Pozostaw Console otwartą. Token jest wysyłany
tylko do lokalnego serwera w pierwszej ramce, nie w URL.
Nie publikuj go na zrzutach ekranu ani w wiadomościach.

Jeśli przeglądarka blokuje wklejanie kodu do konsoli, możesz wpisać kod ręcznie.
Nie trzeba wyłączać ochrony przeglądarki.

## 7. Zakończenie pierwszej wizyty przez pracownika

W Swaggerze wykonaj POST `/api/auth/login`:

```json
{"login":"staff@example.com","password":"Demo-Queue-2026"}
```

W Authorize ustaw token pracownika. WebSocket pozostaje połączony jako klient 2:
zmiana tokenu Swaggera nie zmienia tokenu otwartego połączenia.

POST `/api/visit/start` — podaj zachowane id wpisu pierwszego klienta:

```json
{
  "queue_entry_id":"QUEUE_ENTRY_ID_CLIENT_1",
  "employee_id":"40000000-0000-4000-8000-000000000001"
}
```

Oczekiwane: 201 i status in_service. Zachowaj `id` odpowiedzi — teraz jest to
`visit_id`, a nie identyfikator wpisu kolejki.

POST `/api/visit/end`:

```json
{
  "visit_id":"VISIT_ID",
  "employee_id":"40000000-0000-4000-8000-000000000001"
}
```

Oczekiwane: 200 i status done. W Console pojawia się nowy QUEUE UPDATE bez
odświeżania strony: klient 2 przechodzi na pozycję 1. Ponowne end powinno zwrócić
200 bez utworzenia kolejnego powiadomienia o zakończeniu.

## 8. Ręczne wysyłanie powiadomienia

Z tokenem pracownika wykonaj POST `/api/notifications/send`:

```json
{
  "user_id":"10000000-0000-4000-8000-000000000002",
  "institution_id":"20000000-0000-4000-8000-000000000001",
  "source_event_id":"60000000-0000-4000-8000-000000000001",
  "title":"Test",
  "message":"Hello from the local backend"
}
```

Pierwsze żądanie: 201; powiadomienie pojawia się w kolejnej migawce user_snapshot.
Ponowienie tego samego body: 200 z poprzednim id.
Zmiana message przy zachowanym source_event_id: 409.
Nowa wiadomość wymaga nowego source_event_id.

## 9. Uprawnienia i ponowne połączenie

- Z tokenem klienta 2: GET `/api/notifications/10000000-0000-4000-8000-000000000001` → 403.
- Z tokenem klienta 2: ręczna wysyłka z kroku 8 → 403.
- Usuń token przez Authorize → Logout i wykonaj GET `/api/notifications` → 401.
  Przycisk usuwa token tylko ze Swaggera; nie unieważnia sesji serwera.
- W Console wykonaj `queueDemoSocket.close()`, a następnie ponownie kod z kroku 6.
  Początkowa migawka powinna już pokazywać pozycję 1.
- Aby sprawdzić rzeczywiste wylogowanie, ustaw w Swaggerze ten sam token klienta 2,
  którego używa WebSocket, i wykonaj POST `/api/auth/logout`.
  Połączenie zamknie się z kodem 1008 przy kolejnej kontroli, zwykle w ciągu
  30 sekund. Kolejne logowanie tworzy nową sesję.

Access_token jest ważny przez 15 minut. W razie 401 lub CLOSED 1008 zaloguj się
ponownie, zaktualizuj Authorize i połącz WebSocket nowym tokenem.

## Zakres tej weryfikacji

Scenariusz sprawdza zapis powiadomień, rozdzielenie dostępu, współdziałanie HTTP
i WebSocket, zmianę pozycji, ponawianie operacji i odtworzenie stanu.
Obiekty kolejki zawierają ETA. Automatyczne potwierdzenia włącza się osobno przez
QUEUE_TIMERS_ENABLED=1; zob. [eta-confirmations.md](eta-confirmations.md).
Dla powyższego scenariusza pozostaw mechanizm czasowy wyłączony.
Push na telefon nie jest tutaj sprawdzany: wymaga Firebase, klienta mobilnego
i osobnego procesu wysyłającego. Uruchamiaj go dopiero po konfiguracji własnego
projektu Firebase.

W razie błędu zachowaj pierwszy komunikat i polecenie, które go wywołało,
bez zawartości `.env` i tokenów.

Konfigurację instytucji wykonuje konto `admin@example.com` (lokalne hasło demonstracyjne
`Demo-Queue-2026`). Obsługę wizyt nadal wykonuje `staff@example.com`.
Nowa rejestracja wymaga SMTP; gotowe konta demonstracyjne są już zweryfikowane.
