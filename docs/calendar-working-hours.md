# Rezerwacje i godziny pracy

Wymagane są migracje 001–010. Daty kolejki, godziny tygodniowe i dni wolne
należą do **Europe/Warsaw**, z automatyczną zmianą czasu letniego/zimowego.
Znaczniki czasu w bazie i odpowiedziach HTTP/WebSocket pozostają UTC z `Z`.
Dzień przejścia czasu może mieć 23 lub 25 godzin. Nieistniejącą granicę godziny
wiosną przycina się do końca luki; jesienią wcześniejsze otwarcie i późniejsze
zamknięcie obejmują oba wystąpienia powtórzonej godziny. Nocne zmiany przez
północ nie należą do obsługiwanego zakresu.

## Rezerwacja slotu

`GET /api/services/{service_id}/slots` zwraca dostępne przyszłe sloty.
Uwzględnia aktywność usługi i pracownika, przypisanie do usługi, grafik,
dni wolne, zamknięcie dnia oraz istniejącą aktywną rezerwację.

`POST /api/queue/join`, pod tokenem klienta:

```json
{"user_id":"UUID_KLIENTA","service_id":"UUID_USŁUGI","slot_id":"UUID_SLOTU"}
```

Bez `slot_id` powstaje zapis do kolejki bieżącego dnia. Slot określa pracownika,
`queue_date` i `scheduled_at`. Limit długości i zakaz duplikatów klient/usługa
obowiązują osobno dla daty. Zajęcie slotu jest chronione blokadą instytucji/usługi
i częściowymi indeksami unikalnymi. Konflikt zwraca 409.

Anulowanie zwalnia przyszły slot do kolejnej rezerwacji; historia pozostaje.
Zmiana lub usunięcie slotu powiązanego z historią kolejki nadal jest blokowana.
Tworzenie, zmiana i usuwanie slotów wymagają aktywnej przynależności administratora do instytucji.

Pozycje w HTTP i WebSocket liczone są osobno dla usługi i daty. ETA nie wyprzedza
terminu slotu i omija przerwy. Przy braku miejsca w godzinach pracy ma wartość
`null`; zapis nie jest automatycznie przenoszony na następny dzień.
Przybycie potwierdza się w dniu wizyty. Przyszłe rezerwacje nie otrzymują dziś
próśb o potwierdzenie ani ofert urgent. Przyjęta oferta z bieżącego dnia może
przyspieszyć pierwotny termin; utrwalony czas przybycia nadal obowiązuje.

## Grafik instytucji

`GET /api/institutions/{id}/working-hours` udostępnia konfigurację.
`PUT` pod tym samym adresem zastępuje całą konfigurację i wymaga aktywnego
administratora tej instytucji:

```json
{
  "enabled": true,
  "intervals": [
    {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
    {"day_of_week": 0, "start_time": "13:00", "end_time": "16:00"}
  ],
  "holidays": [{"holiday_date": "2026-12-25", "description": "Dzień wolny"}]
}
```

`0` oznacza poniedziałek, `6` niedzielę. W przykładzie godziny są lokalne;
przerwa trwa 12:00–13:00, a pozostałe dni tygodnia są zamknięte. Nakładające się
przedziały, powtórzone święta i przedział przez północ są odrzucane.
Zmiany nocne przez północ nie są obecnie obsługiwane; końce przedziałów nie należą do czasu pracy.

Bez włączonego grafiku instytucji zachowana jest dotychczasowa całodobowa
dostępność. Jawnie zapisane dni wolne i grafik pracownika nadal obowiązują.
Włączony grafik bez przedziałów oznacza brak dni roboczych.
Zmiana nie może unieważnić aktywnej rezerwacji slotu: w takim przypadku zwraca
409 i wycofuje całą aktualizację. Najpierw należy rozstrzygnąć rezerwację.

## Grafik pracownika

`GET/PUT /api/employees/{id}/working-hours` wymaga przynależności do instytucji.
Body `PUT` zawiera `intervals` w tym samym formacie. Przedziały pracownika są
przecinane z godzinami instytucji. Jeśli grafik pracownika zawiera wpisy,
pominięty dzień jest wolny. Pusta lista usuwa grafik indywidualny: pracownik
dziedziczy godziny instytucji. Całkowite wyłączenie pracownika wymaga jego
nieaktywnego statusu.

## Automatyczne zamknięcie

Przy `QUEUE_TIMERS_ENABLED=1` i włączonym grafiku instytucji timer co około
5 sekund sprawdza koniec ostatniego przedziału. Przerwa w środku dnia nie zamyka
kolejki. Po ostatnim przedziale anuluje pozostałe wpisy zgodnie z
[day-closure.md](day-closure.md); `closed_by=null` oznacza zamknięcie automatyczne.
W dzień wolny zamknięcie obowiązuje od początku dnia.

Po restarcie timer domyka również poprzednie dni z nieobsłużonymi wpisami.
Rozpoczęte wizyty kończy pracownik. Ręczne zamknięcie pozostaje dostępne i nie
jest cofane przez zmianę grafiku. Zamknięcie dzisiaj nie blokuje rezerwacji
otwartego przyszłego dnia.

## Weryfikacja

Testy obejmują izolację dat, limity, zwalnianie slotów, role, przerwy, dni wolne,
grafiki pracowników, zamknięcie i restart. PostgreSQL dodatkowo sprawdza wyścig
dwóch klientów o slot i dwa jednoczesne zapisy jednego klienta na ten sam dzień.
Migracja 007 przerywa działanie przy zastanych aktywnych duplikatach; nie usuwa
ich automatycznie. Migracje 007 i 008 można stosować ponownie.
