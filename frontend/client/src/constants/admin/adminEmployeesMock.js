// Przykładowi pracownicy instytucji admina.
// status: "active" | "idle" | "overloaded" | "offline"
// service_ids: id usług z adminServicesMock.
// working_hours: day_of_week 0 = poniedziałek; brak dnia na liście = dzień wolny.
// holidays: dni (day_of_week) oznaczone jako urlop.
// Docelowo zastąpić odpowiedzią z API, zachowując ten sam kształt obiektów.

const WEEKDAYS_10_20 = [0, 1, 2, 3, 4].map(day => ({
    day_of_week: day,
    start_time: "10:00",
    end_time: "20:00",
}));

export const adminEmployeesMock = [
    {
        id: 1, title: "Dr.", first_name: "Emma", last_name: "Ficher",
        email: "emma.ficher@novamedical.pl", room: "305 A", status: "active", profile_image: null,
        service_ids: [1, 3], working_hours: WEEKDAYS_10_20, holidays: [2],
    },
    {
        id: 2, title: "Dr.", first_name: "Zuzanna", last_name: "Ficher",
        email: "zuzanna.ficher@novamedical.pl", room: "306 B", status: "idle", profile_image: null,
        service_ids: [1], working_hours: WEEKDAYS_10_20, holidays: [],
    },
    {
        id: 3, title: "Dr.", first_name: "Jan", last_name: "Kowalski",
        email: "jan.kowalski@novamedical.pl", room: "201", status: "overloaded", profile_image: null,
        service_ids: [1, 2], working_hours: WEEKDAYS_10_20, holidays: [4],
    },
    {
        id: 4, title: "", first_name: "Ewa", last_name: "Nowak",
        email: "ewa.nowak@novamedical.pl", room: "102", status: "offline", profile_image: null,
        service_ids: [2], working_hours: WEEKDAYS_10_20.slice(0, 3), holidays: [],
    },
    {
        id: 5, title: "Dr.", first_name: "Piotr", last_name: "Wiśniewski",
        email: "piotr.wisniewski@novamedical.pl", room: "307", status: "active", profile_image: null,
        service_ids: [3], working_hours: WEEKDAYS_10_20, holidays: [],
    },
    {
        id: 6, title: "", first_name: "Daria", last_name: "Muller",
        email: "daria.muller@novamedical.pl", room: "104", status: "active", profile_image: null,
        service_ids: [2, 3], working_hours: WEEKDAYS_10_20, holidays: [0, 1],
    },
];
