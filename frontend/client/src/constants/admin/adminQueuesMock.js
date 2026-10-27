// Przykładowe aktywne kolejki instytucji (usługa + obsługujący pracownik).
// employee.id = id z adminEmployeesMock.
// spots = wolne miejsca, queue = obciążenie kolejki, delay = opóźnienie w minutach.
// Docelowo zastąpić odpowiedzią z API, zachowując ten sam kształt obiektów.

export const adminQueuesMock = [
    {
        id: 1,
        service: {
            name: "General Consultation",
            standard_duration: 20,
            description: "Consultation with a doctor for health assessment, diagnosis, medical advice, and treatment recommendations.",
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
            title: "Dr.",
            room: "305 A",
            profile_image: null,
        },
    },
    {
        id: 2,
        service: {
            name: "General Consultation",
            standard_duration: 20,
            description: "Consultation with a doctor for health assessment, diagnosis, medical advice, and treatment recommendations.",
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
            title: "Dr.",
            room: "306 B",
            profile_image: null,
        },
    },
    {
        id: 3,
        service: {
            name: "Blood Test",
            standard_duration: 10,
            description: "Collection of a blood sample for laboratory analysis and routine health screening.",
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
