// Przykładowe wizyty w kolejkach (queue_id = id z adminQueuesMock).
// status: "in_service" | "waiting" | "missed" | "cancelled" | "completed"
// Docelowo zastąpić odpowiedzią z API, zachowując ten sam kształt obiektów.

const today = new Date();
const at = (hours, minutes) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes).toISOString();

const CONSULTATION = { name: "General Consultation", standard_duration: 20 };
const BLOOD_TEST = { name: "Blood Test", standard_duration: 10 };

export const adminAppointmentsMock = [
    { id: 1, queue_id: 1, service: CONSULTATION, client: { first_name: "Devid", last_name: "Jonson", phone: "+48 501 234 567", email: "devid.jonson@gmail.com" }, note: "First visit, please bring previous test results.", start: at(12, 30), status: "in_service" },
    { id: 2, queue_id: 1, service: CONSULTATION, client: { first_name: "Anna", last_name: "Kowalczyk", phone: "+48 602 345 678", email: null }, start: at(12, 50), status: "waiting" },
    { id: 3, queue_id: 1, service: CONSULTATION, client: { first_name: "Marek", last_name: "Lis" }, start: at(13, 10), status: "waiting" },
    { id: 4, queue_id: 1, service: CONSULTATION, client: { first_name: "Olga", last_name: "Zając" }, start: at(13, 30), status: "missed" },
    { id: 5, queue_id: 1, service: CONSULTATION, client: { first_name: "Tomasz", last_name: "Wróbel" }, start: at(13, 50), status: "cancelled" },
    { id: 6, queue_id: 1, service: CONSULTATION, client: { first_name: "Karolina", last_name: "Mazur" }, start: at(14, 10), status: "waiting" },
    { id: 7, queue_id: 2, service: CONSULTATION, client: { first_name: "Piotr", last_name: "Nowicki" }, start: at(11, 0), status: "in_service" },
    { id: 8, queue_id: 2, service: CONSULTATION, client: { first_name: "Ewa", last_name: "Krawczyk" }, start: at(11, 20), status: "waiting" },
    { id: 9, queue_id: 3, service: BLOOD_TEST, client: { first_name: "Jakub", last_name: "Pawlak" }, start: at(9, 30), status: "in_service" },
    { id: 10, queue_id: 3, service: BLOOD_TEST, client: { first_name: "Maria", last_name: "Dudek" }, start: at(9, 40), status: "waiting" },
];
