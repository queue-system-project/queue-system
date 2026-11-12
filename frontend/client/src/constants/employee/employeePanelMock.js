// Przykładowe dane panelu pracownika (dzień pracy, kolejka, obciążenie godzinowe).
// Docelowo zastąpić odpowiedziami z API:
//   godziny pracy: GET /api/employees/{id}/working-hours
//   raport dnia:   GET /api/reports/daily
// zachowując kształt obiektów.

import { adminEmployeesMock } from "../admin/adminEmployeesMock";
import { adminEmployeeLiveStatsMock } from "../admin/adminEmployeeStatsMock";

// Profil z panelu admina służy za źródło godzin pracy, urlopów i statystyk.
export const employeeProfileMock = adminEmployeesMock[0];

export const employeeLiveStatsMock = adminEmployeeLiveStatsMock.default;

// Liczba klientów w kolejce w kolejnych godzinach dnia; null = godzina jeszcze nie minęła.
export const employeeQueueLoadMock = [
    { hour: "8:00", value: 11 },
    { hour: "9:00", value: 13 },
    { hour: "10:00", value: 14 },
    { hour: "11:00", value: 15 },
    { hour: "12:00", value: 7 },
    { hour: "13:00", value: 9 },
    { hour: "14:00", value: null },
    { hour: "15:00", value: null },
    { hour: "16:00", value: null },
    { hour: "17:00", value: null },
];

// Statystyki kolejki pracownika z bieżącego dnia.
export const employeeQueueStatsMock = {
    maxQueueLoad: 15,
    maxDelayMinutes: 10,
    inService: 1,
    waiting: 6,
    missed: 20,
    cancelled: 15,
};

// Czy pracownik jest teraz w trakcie zmiany (dzień roboczy, bez urlopu, w godzinach pracy).
export function isShiftActive(employee, now = new Date()) {
    const weekday = (now.getDay() + 6) % 7; // 0 = poniedziałek
    if ((employee.holidays ?? []).includes(weekday)) return false;

    const hours = (employee.working_hours ?? []).find(item => item.day_of_week === weekday);
    if (!hours) return false;

    const pad = value => String(value).padStart(2, "0");
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return time >= hours.start_time && time < hours.end_time;
}

// Profil pracownika: dane osobowe z konta, reszta z mocka (do czasu API).
export function buildEmployeeProfile(user) {
    return {
        ...employeeProfileMock,
        title: "",
        first_name: user?.first_name ?? employeeProfileMock.first_name,
        last_name: user?.last_name ?? employeeProfileMock.last_name,
        profile_image: user?.profile_image ?? null,
    };
}
