import { authorizedRequest } from "../authorizedRequest";

export async function getRecentAppointments() {
    return authorizedRequest("/api/visit/history");
}

export async function getAppointments() {
    return authorizedRequest("/api/visit/appointments");
}