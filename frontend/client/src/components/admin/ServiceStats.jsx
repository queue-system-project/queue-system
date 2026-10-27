import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useLanguage } from "../../context/LanguageContext";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

// Kolejka powyżej tego progu jest oznaczana na żółto, poniżej na zielono.
const BUSY_QUEUE_THRESHOLD = 5;

export default function ServiceStats({ spots, queue, delay }) {
    const { t } = useLanguage();

    const isBusy = queue > BUSY_QUEUE_THRESHOLD;
    const isDelayed = Number(delay) > 0;

    return (
        <View style={styles.serviceStats}>
            <View style={styles.chip}>
                <Text style={styles.chipText}>
                    {spots} {t.spotsRemaining}
                </Text>
            </View>

            <View style={[styles.chip, isBusy ? styles.chipYellow : styles.chipGreen]}>
                <MaterialCommunityIcons name="account-group-outline" size={14} color="#111111"/>
                <Text style={styles.chipText}>
                    {queue} {t.queue}
                </Text>
            </View>

            <View style={[styles.chip, isDelayed ? styles.chipRed : styles.chipGreen]}>
                <MaterialCommunityIcons name="timer-alert-outline" size={14} color="#111111"/>
                <Text style={styles.chipText}>
                    + {Number(delay) || 0} {t.min}
                </Text>
            </View>
        </View>
    );
}
