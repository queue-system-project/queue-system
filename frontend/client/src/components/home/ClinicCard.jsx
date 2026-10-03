import React from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { homeStyles as styles } from "../../styles/home/homeStyles";

export default function ClinicCard({
                                       clinic,
                                       appointment = null,
                                       onPress,
                                   }) {
    const CardWrapper = onPress
        ? TouchableOpacity
        : View;

    const image =
        clinic.photo_url
        || clinic.image;

    const category =
        clinic.category_name
        || clinic.category;

    const hasRealImage =
        image
        && !image.includes("example.com");

    return (
        <CardWrapper
            style={styles.clinicCard}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <View style={styles.clinicTop}>
                {hasRealImage ? (
                    <Image
                        source={{ uri: image }}
                        style={styles.clinicImage}
                    />
                ) : (
                    <View
                        style={styles.clinicImagePlaceholder}
                    >
                        <MaterialCommunityIcons
                            name="office-building"
                            size={30}
                            color="#5657C4"
                        />
                    </View>
                )}

                <View style={styles.clinicInfo}>
                    <View style={styles.tagsRow}>
                        <View style={styles.categoryTag}>
                            <Text style={styles.categoryTagText}>
                                {category || "Institution"}
                            </Text>
                        </View>

                        {clinic.rating != null && (
                            <View style={styles.ratingTag}>
                                <Text style={styles.star}>
                                    ★
                                </Text>

                                <Text style={styles.ratingText}>
                                    {Number(
                                        clinic.rating
                                    ).toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text
                        style={styles.clinicName}
                        numberOfLines={1}
                    >
                        {clinic.name}
                    </Text>

                    <Text
                        style={styles.clinicAddress}
                        numberOfLines={1}
                    >
                        {clinic.address}
                    </Text>
                </View>
            </View>

            {appointment && (
                <View style={styles.appointmentInfo}>
                    <View>
                        <Text
                            style={styles.appointmentTitle}
                            numberOfLines={2}
                        >
                            {appointment.service}
                        </Text>

                        <Text style={styles.appointmentDuration}>
                            {appointment.duration}
                        </Text>
                    </View>

                    <View style={styles.dateTag}>
                        <Text style={styles.dateText}>
                            {appointment.date}{" "}
                            {appointment.time}
                        </Text>
                    </View>
                </View>
            )}
        </CardWrapper>
    );
}
