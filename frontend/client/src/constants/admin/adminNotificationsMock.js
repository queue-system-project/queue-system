// Przykładowe powiadomienia admina (dzienna statystyka).
// Kształt jak z GET /api/notifications; event_key "report:" mapuje się na typ "statistic".
// Tytuł i treść pochodzą z tłumaczeń (titleKey / messageKey), bo to szablon systemowy.
// TODO: zastąpić odpowiedzią z API, gdy backend zacznie wysyłać raporty dzienne.

const at = (daysAgo, hours, minutes) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
};

export const adminNotificationsMock = [
    {
        id: "admin-report-today",
        event_key: "report:daily:today",
        titleKey: "dailyStatisticTitle",
        messageKey: "dailyStatisticMessage",
        created_at: at(0, 15, 34),
        is_read: false,
    },
    {
        id: "admin-report-week",
        event_key: "report:daily:week",
        titleKey: "dailyStatisticTitle",
        messageKey: "dailyStatisticMessage",
        created_at: at(3, 15, 34),
        is_read: true,
    },
];
