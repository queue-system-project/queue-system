// Kolejka pracownika na dziś: mock trzymany w pamięci, wspólny dla ekranów
// Home / Kolejka / Wizyta, żeby "Rozpocznij wizytę" było widać wszędzie od razu.
// TODO: zastąpić kolejką z API (GET kolejki usługi pracownika + akcje wizyty).

import { useSyncExternalStore } from "react";

const CONSULTATION = { name: "Konsultacja ogólna", standard_duration: 20 };

const today = new Date();
const at = (hours, minutes) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes).toISOString();

const client = (first_name, last_name) => ({ first_name, last_name });

// status: "in_service" | "waiting" | "missed" | "cancelled" | "completed"
let entries = [
    { id: 1, service: CONSULTATION, client: client("Devid", "Jonson"), start: at(12, 30), status: "waiting" },
    { id: 2, service: CONSULTATION, client: client("Anna", "Kowalczyk"), start: at(12, 50), status: "waiting" },
    { id: 3, service: CONSULTATION, client: client("Marek", "Lis"), start: at(13, 10), status: "missed" },
    { id: 4, service: CONSULTATION, client: client("Karolina", "Mazur"), start: at(13, 30), status: "waiting" },
    { id: 5, service: CONSULTATION, client: client("Piotr", "Nowicki"), start: at(13, 50), status: "waiting" },
    { id: 6, service: CONSULTATION, client: client("Ewa", "Krawczyk"), start: at(14, 10), status: "waiting" },
    { id: 7, service: CONSULTATION, client: client("Jakub", "Pawlak"), start: at(14, 30), status: "missed" },
    { id: 8, service: CONSULTATION, client: client("Maria", "Dudek"), start: at(14, 50), status: "waiting" },
    { id: 9, service: CONSULTATION, client: client("Olga", "Zając"), start: at(15, 10), status: "cancelled" },
    { id: 10, service: CONSULTATION, client: client("Tomasz", "Wróbel"), start: at(15, 30), status: "waiting" },
    { id: 11, service: CONSULTATION, client: client("Zofia", "Wójcik"), start: at(15, 50), status: "waiting" },
    { id: 12, service: CONSULTATION, client: client("Adam", "Kamiński"), start: at(16, 10), status: "missed" },
    { id: 13, service: CONSULTATION, client: client("Natalia", "Lewandowska"), start: at(16, 30), status: "waiting" },
    { id: 14, service: CONSULTATION, client: client("Michał", "Zieliński"), start: at(16, 50), status: "waiting" },
    { id: 15, service: CONSULTATION, client: client("Julia", "Szymańska"), start: at(17, 10), status: "waiting" },
];

// Opóźnienie kolejki w minutach.
const DELAY_MINUTES = 5;

const listeners = new Set();
let snapshot = null;

const buildSnapshot = () => {
    const sorted = [...entries].sort((a, b) => new Date(a.start) - new Date(b.start));
    const count = status => sorted.filter(item => item.status === status).length;

    return {
        entries: sorted,
        current: sorted.find(item => item.status === "in_service") ?? null,
        stats: {
            queueLoad: sorted.length,
            delayMinutes: DELAY_MINUTES,
            inService: count("in_service"),
            waiting: count("waiting"),
            missed: count("missed"),
            cancelled: count("cancelled"),
        },
    };
};

const update = next => {
    entries = next;
    snapshot = buildSnapshot();
    listeners.forEach(listener => listener());
};

const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getSnapshot = () => {
    if (!snapshot) snapshot = buildSnapshot();
    return snapshot;
};

// Rozpoczęcie wizyty: klient przechodzi do obsługi (tylko jeden naraz).
export function startAppointment(id) {
    if (entries.some(item => item.status === "in_service")) return;

    // TODO: wywołać akcję API rozpoczęcia wizyty.
    update(entries.map(item => (item.id === id ? { ...item, status: "in_service" } : item)));
}

export function useEmployeeQueue() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
