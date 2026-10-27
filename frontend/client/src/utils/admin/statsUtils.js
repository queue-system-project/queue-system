// Formatowanie i agregacja statystyk pracownika (czasy w minutach).

export const formatDuration = minutes => {
    const hours = Math.floor(minutes / 60);
    const rest = Math.round(minutes % 60);

    if (hours === 0) return `${rest} m`;
    if (rest === 0) return `${hours} h`;
    return `${hours} h ${rest} m`;
};

export const startOfWeek = date => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return result;
};

export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const daysBetween = (start, endExclusive) => {
    const days = [];
    for (let day = new Date(start); day < endExclusive; day = addDays(day, 1)) {
        days.push(day);
    }
    return days;
};

// Suma potwierdzonych i czasu pracy; średni czas obsługi ważony liczbą wizyt;
// średni czas bezczynności liczony na dzień pracy.
export const aggregateStats = days => {
    const worked = days.filter(day => day && day.working);
    const confirmed = worked.reduce((sum, day) => sum + day.confirmed, 0);
    const serviceTotal = worked.reduce((sum, day) => sum + day.avgServiceMinutes * day.confirmed, 0);

    return {
        confirmed,
        avgServiceMinutes: confirmed ? Math.round(serviceTotal / confirmed) : 0,
        workMinutes: worked.reduce((sum, day) => sum + day.workMinutes, 0),
        avgIdleMinutes: worked.length
            ? Math.round(worked.reduce((sum, day) => sum + day.idleMinutes, 0) / worked.length)
            : 0,
    };
};
