import { API_URL } from "../auth/authApi";

export async function getCategories() {
    const response = await fetch(`${API_URL}/api/categories`);

    const data = await response.json().catch(() => []);

    if (!response.ok) {
        throw new Error(data.detail || "Failed to load categories");
    }

    return data;
}