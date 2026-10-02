# Nieobecność i zamknięcie dnia

Wymagane są migracje 001–010; migracja 006 wprowadza zapis zamknięcia dnia.
Nie zmienia ona istniejących statusów. Dodaje powód anulowania, audyt nieobecności
oraz trwały zapis zamknięcia dnia instytucji.

## Ręczne oznaczenie nieobecności

`POST /api/queue/missed` wymaga tokenu aktywnego pracownika przypisanego do usługi.
Przykładowe body:

```json
{"employee_id":"UUID_PRACOWNIKA","queue_entry_id":"UUID_WPISU"}
```

Można zmienić wyłącznie `waiting` lub `confirmed`. Nie można oznaczyć nieobecności
przed potwierdzonym czasem przybycia ani przed terminem powiązanego slotu.
Serwer zapisuje `missed_at` i identyfikator użytkownika w `missed_by`, zwalnia
pozycję, przelicza kolejkę i zapisuje powiadomienie wraz z zadaniem push.
Powtórzenie nie zmienia audytu i nie tworzy duplikatów. Błędna rola lub przypisanie
zwraca 403, a niedozwolona zmiana stanu — 409.

Nieobecności nie nadaje timer. Brak odpowiedzi na prośbę o potwierdzenie nadal
powoduje `skipped`, a odmowa — `cancelled`.

## Zamknięcie dnia

`POST /api/institutions/{institution_id}/close-day`, bez body, wymaga aktywnego
pracownika lub administratora tej instytucji. Operacja ręczna dotyczy bieżącej daty Europe/Warsaw. Timer może zamknąć dzień zgodnie z grafikiem.

- Nieobsłużone `waiting` i `confirmed` zostają anulowane z
  `cancellation_reason=institution_closed` i powiadomieniem wyjaśniającym przyczynę.
- Wizyty `in_service` pozostają aktywne. Pracownik kończy je przez istniejące
  `/api/visit/end`; zapisywany jest rzeczywisty czas zakończenia.
- Pozostałe statusy i powiązane sloty przyszłych dni pozostają bez zmian.
- Oferty urgent/last-minute wygasają. Zamknięcie nie generuje nowych ofert.
- Do końca dnia nowe zapisy na ten dzień, potwierdzenia oczekujących wpisów, rozpoczęcia wizyt
  i przyjęcia ofert są odrzucane kodem 409.
- Zapisy nie są automatycznie przenoszone na następny dzień.

Odpowiedź zawiera `day`, `closed_at`, `closed_by` i `cancelled_count`.
Powtórne zamknięcie zwraca pierwotny wynik. Wpis zamknięcia, anulowania i
powiadomienia należą do jednej transakcji: błąd wycofuje całą operację.
Nowa data nie dziedziczy blokady poprzedniego dnia.

Operacje kolejki blokują teraz najpierw instytucję, potem usługę; timer przestrzega
tej samej kolejności. Szereguje to zapisy także między usługami jednej instytucji,
co należy uwzględnić w następnych pomiarach wydajności.

## Kontrola terminu rozpoczęcia

`/api/visit/start` sprawdza również powiązany slot: jego istnienie, usługę,
najwcześniejszy czas rozpoczęcia i przypisanego pracownika. Naruszenie zwraca 409.
Przyjęta oferta pilna może przyspieszyć pierwotny slot w bieżącym dniu.

## Dalsza integracja

Rezerwacje, godziny lokalne, przerwy i automatyczne zamknięcie opisano w
[calendar-working-hours.md](calendar-working-hours.md). Obowiązuje Europe/Warsaw; nocne zmiany nie są obsługiwane.
Zamknięcie zapisuje raport dzienny; trwająca wizyta pozostawia go wstępnym.
Szczegóły: [auth-reports-administration.md](auth-reports-administration.md).
Testy PostgreSQL uruchamia się przez `python -m pytest -q --postgres`;
obejmują również równoczesne zamknięcia i zapis klienta podczas zamykania.
