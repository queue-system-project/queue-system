// Przykładowe statystyki pracownika.
// Wszystkie czasy w minutach. Docelowo zastąpić odpowiedziami z API,
// zachowując kształt: { confirmed, avgServiceMinutes, workMinutes, idleMinutes }.

// Statystyki "na żywo" (bieżący dzień). Klucz = id pracownika, "default" dla pozostałych.
export const adminEmployeeLiveStatsMock = {
    default: { confirmed: 5, avgServiceMinutes: 15, workMinutes: 320, idleMinutes: 20 },
    2: { confirmed: 2, avgServiceMinutes: 18, workMinutes: 190, idleMinutes: 75 },
    3: { confirmed: 9, avgServiceMinutes: 12, workMinutes: 360, idleMinutes: 5 },
};

// Zakresy wartości generowanych dla jednego dnia pracy: [min, max].
const DAILY_RANGES = {
    confirmed: [10, 25],
    avgServiceMinutes: [12, 24],
    workMinutes: [360, 510],
    idleMinutes: [10, 60],
};

// Powtarzalna pseudolosowa liczba 0..1 dla danego pracownika i dnia.
const seeded = (...numbers) => {
    let hash = 2166136261;
    numbers.forEach(number => {
        hash ^= number;
        hash = Math.imul(hash, 16777619);
    });
    return ((hash >>> 0) % 1000) / 1000;
};

const EMPTY_DAY = { confirmed: 0, avgServiceMinutes: 0, workMinutes: 0, idleMinutes: 0, working: false };

// Statystyki jednego dnia. Dni przyszłe zwracają null, dni wolne i urlopowe zera.
export function getEmployeeDailyStats(employee, date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) return null;

    const weekday = (date.getDay() + 6) % 7; // 0 = poniedziałek
    const worksThatDay = (employee.working_hours ?? []).some(item => item.day_of_week === weekday);
    if (!worksThatDay || (employee.holidays ?? []).includes(weekday)) return EMPTY_DAY;

    const day = [employee.id, date.getFullYear(), date.getMonth(), date.getDate()];
    const result = { working: true };
    Object.entries(DAILY_RANGES).forEach(([key, [min, max]], index) => {
        result[key] = Math.round(min + seeded(...day, index) * (max - min));
    });
    return result;
}
