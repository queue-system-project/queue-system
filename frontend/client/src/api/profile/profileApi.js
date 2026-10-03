import { authorizedRequest } from "../authorizedRequest";

export async function getProfile(userId) {
    return authorizedRequest(`/api/users/${userId}`);
}

export async function logoutUser() {
    return authorizedRequest(
        "/api/auth/logout",
        "POST"
    );
}

export async function deleteAccount() {
    return authorizedRequest(
        "/api/users/me",
        "DELETE"
    );
}