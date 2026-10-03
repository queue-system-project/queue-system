# Konta, administracja i raporty

Wymagane są migracje 001–010 i zależności z `backend/requirements.txt`.
Migracja 009 przelicza daty kolejki na Europe/Warsaw i dodaje pola archiwum
raportów. W razie kolizji aktywnych zapisów lub dawnych duplikatów raportów
wycofuje transakcję; nie usuwa danych w celu obejścia konfliktu.
Migracja 010 unieważnia dawne kody bez terminu ważności.

## Uprawnienia

| Operacja | Dostęp |
|---|---|
| Zmiana profilu i języka | Właściciel konta |
| Odczyt cudzego profilu | Administrator powiązanej instytucji; pracownik tylko dla aktualnie obsługiwanego klienta |
| Tworzenie, zmiana, wyłączenie pracownika | Administrator swojej instytucji |
| Zmiana usług, slotów, grafiku i ustawień | Administrator swojej instytucji |
| Obsługa wizyty i oznaczenie nieobecności | Aktywny przypisany pracownik |
| Raport instytucji | Administrator swojej instytucji |
| Statystyki pracownika | Właściciel konta pracownika |
| Historia klienta | Klient będący właścicielem |
| Historia instytucji | Administrator; pracownik tylko dla przypisanych mu wpisów i oznaczonych przez niego nieobecności |

Sama rola `admin` nie daje globalnego dostępu. Członkostwo zapisane jest
w `institution_employees`. Pierwszego administratora instytucji należy przypisać
przy przygotowaniu bazy; publiczna rejestracja tworzy wyłącznie klienta.
Lokalny scenariusz demonstracyjny dodaje `admin@example.com` z hasłem
`Demo-Queue-2026`. To konto służy tylko do osobnej bazy testowej.

Zmiany konfiguracji są zapisywane w `audit_logs` w tej samej transakcji.
Hasła, kody i tokeny nie są częścią dziennika.

## Usługi i historia

- `POST /api/services`: `institution_id`, `name`, `standard_duration`, opcjonalnie
  `description`, `max_queue_length` i `is_active`.
- `PUT /api/services/{id}`: te same pola bez `institution_id`.
- `DELETE /api/services/{id}`: wyłączenie usługi bez usuwania historii.
- `GET/PUT /api/institutions/{id}/settings`: progi potwierdzenia,
  czas odpowiedzi oraz włączanie opcji oferty za 5/10/15 minut.
- `GET /api/users/{id}/queue-history`: historia własnych zapisów.
- `GET /api/institutions/{id}/queue-history`: historia instytucji,
  opcjonalny `day=YYYY-MM-DD`.

Historia przyjmuje `limit` (1–100) i `offset`; obejmuje także aktualne wpisy.
Wyłączenie usługi lub zmiana standardowego czasu obsługi wymaga rozstrzygnięcia
jej aktywnych zapisów. Zmiana przypisań pracownika wymaga najpierw rozstrzygnięcia
jego rezerwacji i zakończenia aktywnej wizyty.

## Email, SMS i odzyskiwanie dostępu

Publiczna rejestracja tworzy wyłącznie konto klienta. Użytkownik może
zarejestrować się za pomocą adresu email albo numeru telefonu oraz musi
zaakceptować regulamin. Konto musi zostać zweryfikowane przed pierwszym
logowaniem.

Dla adresów email kody weryfikacyjne są wysyłane przez SMTP.
Dla numerów telefonu wykorzystywana jest usługa Twilio Verify.
Numery telefonu są przekazywane w formacie międzynarodowym E.164,
np. `+48537086013`.

W prywatnym `backend/.env` należy ustawić konfigurację SMTP:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURITY=starttls
SMTP_USER=sender@example.com
SMTP_PASSWORD=
SMTP_FROM=sender@example.com
```

Hasło SMTP wprowadza się lokalnie zgodnie z wymaganiami dostawcy poczty.
Alternatywą jest SMTP_SECURITY=ssl i port 465.
Brak konfiguracji lub błąd wysłania wiadomości powoduje zwrócenie błędu 503.
Dla obsługi SMS należy skonfigurować Twilio Verify:
```dotenv
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

Dane dostępowe Twilio są przechowywane wyłącznie w prywatnym pliku .env
i nie powinny być zapisywane w repozytorium.
Kody weryfikacyjne mają cztery cyfry. Dla emaila kod jest generowany
przez backend, a w bazie przechowywany jest jego HMAC zamiast wartości
jawnej. Dla numeru telefonu kod jest generowany i weryfikowany przez
Twilio Verify.
Backend rozróżnia kody potwierdzania konta (verify) oraz odzyskiwania
hasła (reset). Ponowne wysłanie kodu jest ograniczone czasowo, aby
zapobiec wielokrotnemu wysyłaniu wiadomości w krótkim czasie.
Przepływ rejestracji:
POST /api/auth/register
→ wysłanie kodu przez email lub SMS
→ POST /api/auth/verify
→ logowanie.
POST /api/auth/resend-verification umożliwia ponowne wysłanie kodu
weryfikacyjnego i przyjmuje identyfikator użytkownika w polu login
(email albo numer telefonu).
Przepływ odzyskiwania hasła:
POST /api/auth/forgot-password
→ wysłanie kodu przez email lub SMS
→ formularz ustawienia nowego hasła
→ POST /api/auth/reset-password.
Endpoint /api/auth/reset-password otrzymuje login, kod weryfikacyjny
oraz nowe hasło. Kod jest sprawdzany podczas resetowania hasła.
Po poprawnym resecie kod zostaje zużyty, a dotychczasowe sesje
użytkownika są unieważniane.
Logowanie obsługuje zarówno email, jak i numer telefonu. Pole is_active
określa, czy konto jest aktywne i może się logować; nie oznacza ono
aktualnej obecności użytkownika online.
Nowe hasła używają PBKDF2-HMAC-SHA256 z losową solą i 600 000 iteracji.
Poprawne logowanie kontem posiadającym starszy format hasła powoduje
automatyczną migrację hasła do aktualnego formatu.

## Archiwum raportów

Zamknięcie dnia zapisuje jeden rekord `daily_reports` na instytucję i lokalną
datę. Zawiera liczbę zapisów według statusów, wizyty rozpoczęte, średni czas
obsługi, odchylenie czasu obsługi i podsumowania pracowników. Dane źródłowe
pozostają w kolejce i historii wizyt.

Gdy trwa jeszcze przyjęcie, raport ma `finalized=false`. Ręczne zakończenie
wizyty odświeża archiwum, także przy zakończeniu po północy.
Pracownicy i administratorzy otrzymują powiadomienie o raporcie; jeśli był
wstępny, drugie powiadomienie informuje o wersji końcowej. Ponowienia nie
powielają tych samych powiadomień.

`GET /api/reports/daily?institution_id=...&report_date=YYYY-MM-DD` zwraca
dotychczasowe statystyki rozpoczętych wizyt oraz pole `archive` z zapisanym
raportem. `archive.summary.total_entries` obejmuje również anulowane zapisy,
które nigdy nie stały się rozpoczętą wizytą.
`GET /api/statistics/employee/{id}?report_date=YYYY-MM-DD` udostępnia własną
część raportu pracownika.

Idle-time to czas zaplanowanej pracy do zamknięcia dnia pomniejszony o zajętość,
bez przerw i świąt. Bez skonfigurowanego grafiku ma wartość `null`.
Grafik do obliczenia raportu jest utrwalany przy pierwszym zamknięciu, aby
późniejsza edycja godzin nie zmieniała historycznej podstawy obliczeń.

## Weryfikacja

Testy używają przechwytywania emaili zamiast realnego SMTP. Sprawdzają TLS,
ważność i próby kodu, jednorazowy reset, unieważnienie sesji, granice uprawnień,
archiwum i aktualizację po późnym zakończeniu wizyty. Test PostgreSQL obejmuje
pełny przepływ od rejestracji przez WebSocket i wizytę do raportu i wylogowania.
Osobna próba integracyjna z rzeczywistym SMTP potwierdziła wysyłkę kodów
rejestracji i resetu oraz pełny przepływ zmiany hasła na bazie testowej.
Odbiór wiadomości testowej potwierdzono ręcznie; po wdrożeniu należy również
kontrolować folder spam i dostarczalność do innych skrzynek.
