# Oferty urgent i last-minute

Implementacja serwerowa dla bieżącej kolejki. Przed uruchomieniem należy zastosować
migracje 001–010 po kolei. Migracje 003/004 zastosowano w lokalnej bazie demonstracyjnej
23.09.2026, a 005 — 24.09.2026; nie zastosowano ich do wspólnej bazy zespołu.
Mechanizm czasowy i oferty włącza się jawnie:

```dotenv
QUEUE_TIMERS_ENABLED=1
QUEUE_OFFERS_ENABLED=1
```

Należy ponownie uruchomić API z jednym procesem roboczym. Osobny proces Firebase
jest potrzebny tylko do dostarczania push; historia i WebSocket działają niezależnie.
Włączenie automatyki wpływa na istniejące wpisy waiting: terminy odpowiedzi
zaczynają być faktycznie egzekwowane.

## Działanie

Po anulowaniu, pominięciu lub wcześniejszym zakończeniu wizyty serwer sprawdza
dostępność aktywnego pracownika danej usługi. Jeśli pracownik jest wolny, a nowa
usługa o standardowym czasie trwania nie koliduje z obiecanym czasem
potwierdzonego klienta, otwierane jest jedno okno oferty dla usługi.
Drugie okno nie powstaje, jeśli poprzednie nadal jest aktywne.

Oferta urgent trafia kolejno do klientów waiting. Na odpowiedź przysługuje
client_response_minutes (domyślnie 2), jednak nie dłużej niż do obowiązującego
terminu zwykłego potwierdzenia. Odrzucenie oferty nie anuluje pierwotnego wpisu;
zwykły termin potwierdzenia nadal obowiązuje. Przyjęcie zmienia stan na confirmed,
przypisuje pracownika, zapisuje wybrany czas przybycia i priorytet.
Obsługiwane opcje to teraz/5/10/15 minut; opcje 5/10/15 zależą od ustawień instytucji.

Gdy wszyscy dostępni kandydaci odmówią, przekroczą termin lub przestaną spełniać
warunki, otwiera się last-minute. Obowiązuje przez client_response_minutes od
otwarcia. Jest to przyjęta reguła implementacji, ponieważ dokument źródłowy nie
określa osobnego terminu last-minute.
Pierwszy klient, który skutecznie zaakceptuje ofertę, otrzymuje miejsce od razu.
Istniejący wpis waiting przesuwa się w kolejce; dla klienta bez aktywnego wpisu
powstaje nowy. Oferty cudze, wygasłe, zajęte i powodujące konflikt są odrzucane.
Limit pojemności kolejki jest sprawdzany również przy zapisie przez last-minute.

Jeśli pracownik przestaje być dostępny, okno zostaje zamknięte. Zmiana warunków
między wyświetleniem a kliknięciem może spowodować odpowiedź 409; należy wtedy
odświeżyć listę ofert. Ponowne skuteczne przyjęcie przez tego samego użytkownika
zwraca ten sam wpis bez zmiany czasu przybycia.
Osobne powiadomienie jest zapisywane przy przyznaniu urgent i otwarciu last-minute;
przy przyjęciu zapisywane jest powiadomienie confirmed.
Wszystkie zapisy są atomowe względem operacji.

## API dla frontendu

Wszystkie żądania wymagają Bearer access_token.

| Żądanie | Wynik |
| --- | --- |
| GET /api/offers | Własne urgent i last-minute dla usług, w których klient oczekuje |
| GET /api/offers/last-minute/{service_id} | Otwarte last-minute wybranej usługi, także dla nowego klienta |
| POST /api/offers/urgent/{offer_id}/respond | Body `{"accept":true,"minutes":5}` albo `{"accept":false}` |
| POST /api/offers/last-minute/{window_id}/accept | Bez body; wyłącznie rola client |

Urgent zawiera id, window_id, queue_entry_id, service_id, options (dozwolone minuty)
i expires_at. Last-minute zawiera id okna, service_id i expires_at. Daty są w UTC z Z.
Przyjęcie zwraca QueueResponse ze statusem, ETA i arrival_time.
401 oznacza brak sesji, 403 — niedozwoloną rolę, 404 — cudzą lub nieistniejącą ofertę,
409 — upływ terminu, zajęte miejsce albo zmianę warunków.

Do user_snapshot dodano `offers: {urgent: [], last_minute: []}`.
Nowi klienci spoza kolejki pobierają last-minute przez GET wybranej usługi;
dane osobowe kolejki nie są rozsyłane publicznie.

## Ograniczenia i przechowywanie

- Jedno aktywne okno na usługę to zachowawczy wariant, także przy kilku pracownikach.
- Oferty dotyczą bieżącej daty i dostępności w godzinach pracy; przyszłe
  rezerwacje nie są kandydatami. Zob. [calendar-working-hours.md](calendar-working-hours.md).
- Potwierdzony czas przybycia nie jest skracany. W razie konfliktu oferta nie jest
  wystawiana albo jej przyjęcie zostaje odrzucone.
- Ekrany zespołu nadal używają mockData. Przyciski ofert trzeba połączyć z API;
  obecność ekranu nie oznacza gotowej integracji.
- Nowa tabela queue_offer_windows przechowuje wolne miejsce i zwycięzcę;
  queue_offers przechowuje historię kolejnych ofert indywidualnych.
  Stare nieużywane urgent_offers/last_minute_offers nie są usuwane ani nadpisywane.
- Priorytet znajduje się w queue_entries.priority_at. Pozycja, HTTP i WebSocket
  korzystają z tego samego porządku. Wpisy in_service są zawsze przed oczekującymi.

## Weryfikacja

Testy obejmują prywatność, odmowę, przyjęcie i ponowienie, wygaśnięcie,
przesunięcie na początek, wycofanie transakcji oraz rywalizację dwóch klientów
o last-minute na PostgreSQL.
Migrację 004 sprawdzono na pierwotnym zrzucie SQL po wcześniejszych migracjach,
również przez ponowne zastosowanie. Na odrębnym testowym PostgreSQL wykonano
rzeczywisty scenariusz HTTP: anulowanie → urgent → +5 minut.
Firebase nie wysyła w tych testach wiadomości na telefony.
