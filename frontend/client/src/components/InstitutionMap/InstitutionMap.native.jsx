import React from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function InstitutionMap({ institution, styles }) {
    if (
        institution.latitude == null ||
        institution.longitude == null
    ) {
        return null;
    }

    const latitude = Number(institution.latitude);
    const longitude = Number(institution.longitude);

    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={{
                        latitude,
                        longitude,
                    }}
                    title={institution.name}
                    description={institution.address}
                />
            </MapView>
        </View>
    );
}