// Przykładowe aktywne kolejki instytucji (usługa + obsługujący pracownik).
// employee.id = id z adminEmployeesMock.
// spots = wolne miejsca, queue = obciążenie kolejki, delay = opóźnienie w minutach.
// Docelowo zastąpić odpowiedzią z API, zachowując ten sam kształt obiektów.

export const adminQueuesMock = [
    {
        id: 1,
        service: {
            name: "Konsultacja ogólna",
            standard_duration: 20,
            description: "Konsultacja lekarska obejmująca ocenę stanu zdrowia, diagnozę, poradę medyczną i zalecenia dotyczące leczenia.",
        },
        spots: 10,
        queue: 10,
        delay: 5,
        stats: {
            inService: 1,
            waiting: 10,
            missed: 3,
            cancelled: 1,
            maxQueueLength: 31,
        },
        employee: {
            id: 1,
            first_name: "Emma",
            last_name: "Ficher",
            title: "dr",
            room: "305 A",
            profile_image: null,
        },
    },
    {
        id: 2,
        service: {
            name: "Konsultacja ogólna",
            standard_duration: 20,
            description: "Konsultacja lekarska obejmująca ocenę stanu zdrowia, diagnozę, poradę medyczną i zalecenia dotyczące leczenia.",
        },
        spots: 10,
        queue: 5,
        delay: 0,
        stats: {
            inService: 1,
            waiting: 4,
            missed: 0,
            cancelled: 0,
            maxQueueLength: 20,
        },
        employee: {
            id: 2,
            first_name: "Zuzanna",
            last_name: "Ficher",
            title: "dr",
            room: "306 B",
            profile_image: null,
        },
    },
    {
        id: 3,
        service: {
            name: "Badanie krwi",
            standard_duration: 10,
            description: "Pobranie próbki krwi do analizy laboratoryjnej i rutynowych badań profilaktycznych.",
        },
        spots: 18,
        queue: 4,
        delay: 0,
        stats: {
            inService: 1,
            waiting: 3,
            missed: 1,
            cancelled: 0,
            maxQueueLength: 25,
        },
        employee: {
            id: 3,
            first_name: "Jan",
            last_name: "Kowalski",
            title: "",
            room: "101",
            profile_image: null,
        },
    },
];
