import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_ID_KEY = "user_id";
const USER_ROLE_KEY = "user_role";


export async function saveAuthData(data) {
    const values = [];

    if (data.access_token) {
        values.push([
            ACCESS_TOKEN_KEY,
            String(data.access_token),
        ]);
    }

    if (data.refresh_token) {
        values.push([
            REFRESH_TOKEN_KEY,
            String(data.refresh_token),
        ]);
    }

    if (data.user_id) {
        values.push([
            USER_ID_KEY,
            String(data.user_id),
        ]);
    }

    if (data.role) {
        values.push([
            USER_ROLE_KEY,
            String(data.role),
        ]);
    }

    if (values.length > 0) {
        await AsyncStorage.multiSet(values);
    }
}


export async function getAccessToken() {
    return AsyncStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}


export async function getRefreshToken() {
    return AsyncStorage.getItem(
        REFRESH_TOKEN_KEY
    );
}


export async function getUserId() {
    return AsyncStorage.getItem(
        USER_ID_KEY
    );
}


export async function getUserRole() {
    return AsyncStorage.getItem(
        USER_ROLE_KEY
    );
}


export async function clearAuthData() {
    await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_ID_KEY,
        USER_ROLE_KEY,
    ]);
}