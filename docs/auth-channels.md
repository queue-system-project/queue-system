# Weryfikacja kontaktów i odzyskiwanie dostępu

## Kanał i odbiorca

Przy rejestracji użytkownik wybiera email lub SMS. Jeśli podano tylko jeden
kontakt, kanał wynika z tego kontaktu. Przy dwóch kontaktach wymagane jest
`verification_channel: "email"` albo `verification_channel: "sms"`.

`POST /api/auth/resend-verification` oraz `POST /api/auth/forgot-password`
przyjmują `login`: adres email albo numer telefonu należący do konta.
Ten kontakt wyznacza kanał dostawy. Przy odzyskiwaniu dostępu kontakt musi być
wcześniej potwierdzony. Odpowiedź nie ujawnia, czy konto lub potwierdzony kontakt
istnieje. Nie następuje automatyczne przełączenie SMS na email.

Potwierdzenie jednego kontaktu umożliwia logowanie, ale nie potwierdza drugiego.
Zalogowany właściciel może potwierdzić drugi, już zapisany kontakt:

1. `POST /api/users/me/contact-verification` z `{"channel":"sms"}` lub `{"channel":"email"}`.
2. `POST /api/users/me/contact-verification/confirm` z `{"login":"+48500100200","code":"1234"}`.

Te operacje nie służą do zmiany adresu ani numeru. W interfejsie należy umożliwić
wybór kanału, a przy odzyskiwaniu dostępu wpisanie wybranego, potwierdzonego kontaktu.

## Kody i Twilio

Email korzysta z SMTP; SMS z Twilio Verify. Obecny zakres SMS obejmuje polskie
numery zapisane jako `+48` i dziewięć cyfr. Czterocyfrowy kod jest wymagany zarówno
przez formularze API, jak i ustawienie `code_length=4` w Verify Service.
Adapter sprawdza ustawienie przed wysłaniem SMS i odrzuca niezgodną konfigurację.

Każde wyzwanie zawiera cel, kanał, odbiorcę, termin ważności oraz SID konkretnej
weryfikacji SMS. Termin lokalny wynosi 10 minut, limit wynosi 5 nieudanych prób,
a ponowne wysłanie dla tego samego celu jest możliwe po 60 sekundach.
Zmiana kanału nie omija tego odstępu. Nowa weryfikacja SMS unieważnia poprzednią
weryfikację SMS konta, aby kod dostawcy nie był współdzielony między celami.

Twilio zużywa weryfikację przy pierwszej odpowiedzi `approved`.
Dlatego `POST /api/auth/verify-reset-code` zapisuje lokalnie skrót zaakceptowanego
kodu, zachowując jego pierwotny termin i limit prób. Ostateczny reset sprawdza
ten skrót, zmienia hasło, usuwa wyzwanie i unieważnia sesje w jednej transakcji.
Powtórzenie resetu nie może ponownie użyć kodu. Kod rejestracji nie jest kodem resetu.

Awaria, brak konfiguracji lub limit ruchu dostawcy powoduje HTTP 503, bez
zaliczenia nieudanej próby kodu. Nieprawidłowy lub wygasły kod oraz wyczerpanie
limitu prób weryfikacji powodują HTTP 400.
Synchroniczne wywołania SDK są wykonywane poza pętlą HTTP/WebSocket z limitem
czasu połączenia. Treść wyjątków dostawcy nie jest zwracana klientowi.

Źródła: [Verification Check](https://www.twilio.com/docs/verify/api/verification-check),
[Verification Service](https://www.twilio.com/docs/verify/api/service),
[Verifications](https://www.twilio.com/docs/verify/api/verification).

## Migracja

Przed uruchomieniem zastosować `013_auth_channels.sql` po migracjach 001–012.
Dodaje ona potwierdzenia osobnych kontaktów i metadane wyzwań. Dawne wyzwania
bez kanału i odbiorcy są usuwane; użytkownik powinien poprosić o nowy kod.
Przy wcześniej potwierdzonym koncie z jednym kontaktem potwierdzenie jest zachowane.
Przy dwóch kontaktach dawna flaga `is_verified` nie wskazuje, który kontakt
potwierdzono: użytkownik może zalogować się hasłem i potwierdzić wybrany kontakt
przed użyciem go do odzyskiwania dostępu. Migracja nie zgaduje tego przypisania.

Nie należy uruchamiać tej migracji na wspólnej bazie bez uzgodnienia wdrożenia.

## Weryfikacja lokalna i sprawdzenie dostawy

Testy `test_sms_auth.py` i `test_sms_gateway.py` zastępują Twilio implementacją
testową: nie wysyłają SMS, nie potrzebują konta dostawcy i nie zużywają salda.
Obejmują wybór kanału, powtórzenia, limit prób, wygaśnięcie, awarie,
potwierdzenie drugiego kontaktu oraz równoczesny reset na PostgreSQL.

Na istniejącym koncie pozostaje sprawdzić konfigurację i rzeczywistą dostawę:
aktywność Verify Service, cztery cyfry, dostępność SMS do Polski, poprawną
rejestrację i odzyskiwanie dostępu na telefonie testowym. Dostępów nie zapisuje
się w repozytorium. Sukces testów lokalnych nie potwierdza dostawy operatora.
