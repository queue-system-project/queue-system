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

## Email i odzyskiwanie dostępu

W aktualnym wariancie rejestracja wymaga emaila i akceptacji regulaminu;
telefon może być dodatkowym identyfikatorem logowania. Obsługa SMS nie jest
podłączona. Nowe konto musi potwierdzić email przed pierwszym logowaniem.

W prywatnym `backend/.env` należy ustawić:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURITY=starttls
SMTP_USER=sender@example.com
SMTP_PASSWORD=
SMTP_FROM=sender@example.com
```

Hasło wprowadza się lokalnie zgodnie z wymaganiami dostawcy poczty.
Alternatywą jest `SMTP_SECURITY=ssl` i port 465. Nieszyfrowane SMTP jest
odrzucane. Brak konfiguracji lub błąd wysłania zwraca 503.

Kody mają cztery cyfry, ważność 10 minut i maksymalnie pięć błędnych prób.
Ponowne wysłanie jest możliwe po 60 sekundach. W bazie przechowywany jest
HMAC kodu, a nie kod jawny. Kody potwierdzania konta i resetu hasła są oddzielne.
Odpowiedzi API nie zawierają kodów; formularz mobilny musi przyjmować cztery cyfry.

Przepływ rejestracji: `/api/auth/register` → email → `/api/auth/verify` → login.
`POST /api/auth/resend-verification` przyjmuje `{"login":"email"}`.
Przepływ odzyskiwania: `/api/auth/forgot-password` → email → opcjonalnie
`/api/auth/verify-reset-code` → `/api/auth/reset-password`.
Reset zużywa kod i unieważnia wszystkie dotychczasowe sesje użytkownika.

Nowe hasła używają PBKDF2-HMAC-SHA256 z losową solą i 600 000 iteracji,
zgodnie z [zaleceniem OWASP dla PBKDF2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
Poprawne logowanie starszym hasłem SHA-256 automatycznie zapisuje nowy format.
Nie wymaga to ręcznego resetowania kont demonstracyjnych.

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
