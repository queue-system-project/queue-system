import React from "react";
import { View } from "react-native";

// Zakres widoku wokół pinezki (w stopniach).
const DELTA = 0.006;

// Na web react-native-maps nie działa, więc osadzamy mapę OpenStreetMap.
export default function InstitutionMap({ institution, styles }) {
    if (
        institution.latitude == null ||
        institution.longitude == null
    ) {
        return null;
    }

    const latitude = Number(institution.latitude);
    const longitude = Number(institution.longitude);

    const bbox = [
        longitude - DELTA,
        latitude - DELTA,
        longitude + DELTA,
        latitude + DELTA,
    ].join(",");

    const src =
        "https://www.openstreetmap.org/export/embed.html" +
        `?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

    return (
        <View style={styles.mapContainer}>
            <iframe
                title={institution.name}
                src={src}
                style={{ width: "100%", height: "100%", border: 0 }}
                loading="lazy"
            />
        </View>
    );
}
