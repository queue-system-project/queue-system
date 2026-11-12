// Przykładowe dane instytucji admina i jej usług.
// Docelowo zastąpić odpowiedziami z API (GET /api/institutions/{id}, /services)
// zachowując ten sam kształt obiektów.

export const adminInstitutionMock = {
    id: 1,
    name: "Nova Medical Clinic",
    address: "ul. Zielona 24, Warszawa",
    category: "Zdrowie",
    rating: 4.5,
    photo_url: null,
    description: "Nowoczesna przychodnia oferująca konsultacje lekarskie, diagnostykę, badania laboratoryjne i szybką obsługę elektroniczną.",
    phone: "+48 123 456 789",
    email: "novamedical@gmail.com",
    latitude: 52.2297,
    longitude: 21.0122,

    // Kształt jak z GET /api/institutions/{id}/working-hours; day_of_week: 0 = poniedziałek.
    // Brak dnia na liście = zamknięte.
    working_hours: [
        { day_of_week: 0, start_time: "10:00", end_time: "20:00" },
        { day_of_week: 1, start_time: "10:00", end_time: "20:00" },
        { day_of_week: 2, start_time: "10:00", end_time: "20:00" },
        { day_of_week: 3, start_time: "10:00", end_time: "20:00" },
        { day_of_week: 4, start_time: "10:00", end_time: "20:00" },
    ],
};

export const adminServicesMock = [
    {
        id: 1,
        name: "Konsultacja ogólna",
        standard_duration: 20,
        description: "Konsultacja lekarska obejmująca ocenę stanu zdrowia, diagnozę, poradę medyczną i zalecenia dotyczące leczenia.",
        spots: 10,
        max_queue_length: 31,
        queue: 10,
        delay: 5,
    },
    {
        id: 2,
        name: "Badanie krwi",
        standard_duration: 10,
        description: "Pobranie próbki krwi do analizy laboratoryjnej i rutynowych badań profilaktycznych.",
        spots: 18,
        max_queue_length: 25,
        queue: 4,
        delay: 0,
    },
    {
        id: 3,
        name: "Szczepienie",
        standard_duration: 15,
        description: "Podanie zalecanych szczepionek z krótką obserwacją po szczepieniu.",
        spots: 6,
        max_queue_length: 15,
        queue: 7,
        delay: 3,
    },
];
