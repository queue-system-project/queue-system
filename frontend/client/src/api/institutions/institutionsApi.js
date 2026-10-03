import { API_URL } from "../auth/authApi";


export async function getInstitutions() {
    const response = await fetch(
        `${API_URL}/api/institutions`
    );

    const data =
        await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load institutions"
        );
    }

    return data;
}


export async function getInstitutionServices(
    institutionId
) {
    const response = await fetch(
        `${API_URL}/api/institutions/${institutionId}/services`
    );

    const data =
        await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load services"
        );
    }

    return data;
}


export async function getInstitutionWorkingHours(
    institutionId
) {
    const response = await fetch(
        `${API_URL}/api/institutions/${institutionId}/working-hours`
    );

    const data =
        await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to load working hours"
        );
    }

    return data;
}