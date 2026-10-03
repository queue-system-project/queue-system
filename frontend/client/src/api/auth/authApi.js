export const API_URL = "http://127.0.0.1:8000"; // web

// Для фізичного iPhone:
// export const API_URL = "http://192.168.1.3:8000";


async function request(path, method, body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    console.log(
        "API REQUEST:",
        method,
        `${API_URL}${path}`
    );

    const response = await fetch(
        `${API_URL}${path}`,
        options
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail || "Something went wrong"
        );
    }

    return data;
}


export function registerUser(data) {
    return request(
        "/api/auth/register",
        "POST",
        data
    );
}


export function loginUser(data) {
    return request(
        "/api/auth/login",
        "POST",
        data
    );
}


export function verifyUser(data) {
    return request(
        "/api/auth/verify",
        "POST",
        data
    );
}


export function forgotPasswordUser(data) {
    return request(
        "/api/auth/forgot-password",
        "POST",
        data
    );
}


export function verifyResetCodeUser(data) {
    return request(
        "/api/auth/verify-reset-code",
        "POST",
        data
    );
}


export function resetPasswordUser(data) {
    return request(
        "/api/auth/reset-password",
        "POST",
        data
    );
}


export function resendVerificationUser(data) {
    return request(
        "/api/auth/resend-verification",
        "POST",
        data
    );
}