import { authorizedRequest } from "../authorizedRequest";

export function getUser(userId) {
    return authorizedRequest(`/api/users/${userId}`);
}

export function completeProfile(data) {
    return authorizedRequest("/api/users/complete-profile", "PUT", data);
}