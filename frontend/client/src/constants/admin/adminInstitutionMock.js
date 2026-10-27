// Przykładowe dane instytucji admina i jej usług.
// Docelowo zastąpić odpowiedziami z API (GET /api/institutions/{id}, /services)
// zachowując ten sam kształt obiektów.

export const adminInstitutionMock = {
    id: 1,
    name: "Nova Medical Clinic",
    address: "24 Green Street, Warsaw",
    category: "Healthcare",
    rating: 4.5,
    photo_url: null,
    description: "Modern clinic offering medical consultations, diagnostics, laboratory tests, and fast electronic service.",
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
        name: "General Consultation",
        standard_duration: 20,
        description: "Consultation with a doctor for health assessment, diagnosis, medical advice, and treatment recommendations.",
        spots: 10,
        max_queue_length: 31,
        queue: 10,
        delay: 5,
    },
    {
        id: 2,
        name: "Blood Test",
        standard_duration: 10,
        description: "Collection of a blood sample for laboratory analysis and routine health screening.",
        spots: 18,
        max_queue_length: 25,
        queue: 4,
        delay: 0,
    },
    {
        id: 3,
        name: "Vaccination",
        standard_duration: 15,
        description: "Administration of recommended vaccines with a short post-vaccination observation.",
        spots: 6,
        max_queue_length: 15,
        queue: 7,
        delay: 3,
    },
];
