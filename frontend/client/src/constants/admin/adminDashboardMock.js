// Przykładowe dane dashboardu admina.
// Docelowo zastąpić odpowiedzią z API (np. GET /api/institutions/{id}/dashboard)
// zachowując ten sam kształt obiektu.

import { adminInstitutionMock } from "./adminInstitutionMock";

export const adminDashboardMock = {
    institution: adminInstitutionMock,

    // null = dzisiejsza data
    date: null,

    clients: {
        total: 66,
        waiting: 43,
    },

    employees: {
        total: 24,
        active: 20,
        idle: 4,
    },

    appointments: {
        completed: 40,
        avgDelayMinutes: 14,
        inProgress: 12,
        missed: 2,
        cancelled: 4,
    },

    services: {
        total: 12,
        avgServiceMinutes: 23,
    },

    appointmentsOverTime: [
        { label: "08:00", value: 124 },
        { label: "09:00", value: 50 },
        { label: "10:00", value: 90 },
        { label: "11:00", value: 243 },
        { label: "12:00", value: 100 },
        { label: "13:00", value: 115 },
        { label: "14:00", value: 40 },
        { label: "15:00", value: 55 },
    ],

    employeeLoad: [
        { id: 1, name: "Daria Muller", value: 23 },
        { id: 2, name: "Daria Muller", value: 20 },
        { id: 3, name: "Daria Muller", value: 17 },
        { id: 4, name: "Daria Muller", value: 15 },
        { id: 5, name: "Daria Muller", value: 14 },
        { id: 6, name: "Daria Muller", value: 13 },
        { id: 7, name: "Daria Muller", value: 11 },
        { id: 8, name: "Daria Muller", value: 7 },
        { id: 9, name: "Daria Muller", value: 3 },
        { id: 10, name: "Daria Muller", value: 1 },
    ],
};
