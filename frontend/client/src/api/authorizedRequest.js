import {
    clearAuthData,
    getAccessToken,
    getRefreshToken,
    saveAuthData,
} from "./auth/tokenStorage";

import {
    API_URL,
} from "./auth/authApi";


let refreshPromise = null;


async function refreshSession() {
    const refreshToken =
        await getRefreshToken();

    if (!refreshToken) {
        await clearAuthData();

        throw new Error(
            "Authentication required or session expired"
        );
    }


    const response =
        await fetch(
            `${API_URL}/api/auth/refresh`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    refresh_token:
                    refreshToken,
                }),
            }
        );


    const data =
        await response
            .json()
            .catch(
                () => ({})
            );


    if (!response.ok) {
        await clearAuthData();

        throw new Error(
            data.detail
            ||
            "Authentication required or session expired"
        );
    }


    await saveAuthData(
        data
    );

    return data.access_token;
}


async function getFreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise =
            refreshSession()
                .finally(
                    () => {
                        refreshPromise =
                            null;
                    }
                );
    }

    return refreshPromise;
}


async function sendRequest(
    path,
    method,
    body,
    accessToken
) {
    const headers = {
        "Content-Type":
            "application/json",
    };


    if (accessToken) {
        headers.Authorization =
            `Bearer ${accessToken}`;
    }


    const options = {
        method,
        headers,
    };


    if (body !== null) {
        options.body =
            JSON.stringify(
                body
            );
    }


    const url =
        `${API_URL}${path}`;


    return await fetch(
        url,
        options
    );
}


export async function authorizedRequest(
    path,
    method = "GET",
    body = null
) {
    let accessToken =
        await getAccessToken();


    let response =
        await sendRequest(
            path,
            method,
            body,
            accessToken
        );


    /*
     * Access token expired.
     * Refresh it and repeat
     * the original request once.
     */
    if (
        response.status
        === 401
    ) {
        accessToken =
            await getFreshAccessToken();

        response =
            await sendRequest(
                path,
                method,
                body,
                accessToken
            );
    }


    const data =
        await response
            .json()
            .catch(
                () => ({})
            );


    if (!response.ok) {
        throw new Error(
            data.detail
            ||
            "Something went wrong"
        );
    }


    return data;
}