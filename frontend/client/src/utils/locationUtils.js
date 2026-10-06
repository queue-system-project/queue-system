import * as Location from "expo-location";

export async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return null;

    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
    });

    return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
}

export function calculateDistance(latitude1, longitude1, latitude2, longitude2) {
    const earthRadius = 6371;

    const toRadians = value => (value * Math.PI) / 180;

    const latitudeDifference = toRadians(latitude2 - latitude1);

    const longitudeDifference = toRadians(longitude2 - longitude1);

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(latitude1)) *
        Math.cos(toRadians(latitude2)) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}

export function sortInstitutionsByDistance(institutions, userLocation) {
    if (!userLocation) return [];

    return institutions.filter(
        institution => institution.latitude != null && institution.longitude != null
        ).map(institution => {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                Number(institution.latitude),
                Number(institution.longitude)
            );

            return {
                ...institution,
                distance,
            };
        })
        .sort(
            (first, second) =>
                first.distance - second.distance
        );
}