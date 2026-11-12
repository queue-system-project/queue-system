import React from "react";
import { Text, View } from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

const BREAKDOWN = [
    { key: "inService", label: "inService", color: "#B8F0BE" },
    { key: "waiting", label: "waitingLabel", color: "#FFF0A6" },
    { key: "missed", label: "missedLabel", color: "#FFFFFF" },
    { key: "cancelled", label: "cancelledLabel", color: "#FADBDB" },
];

// Najkrótszy pasek, żeby małe wartości (także 0 i brak danych) były widoczne.
const MIN_BAR_PERCENT = 10;

// stats: { inService, waiting, missed, cancelled }; null = brak danych, wyświetlany jako "-".
export default function QueueBreakdownCard({ stats }) {
    const { t } = useLanguage();

    const maxValue = Math.max(...BREAKDOWN.map(item => stats[item.key] ?? 0), 1);

    return (
        <View style={styles.breakdownCard}>
            {BREAKDOWN.map(item => {
                const value = stats[item.key];
                const percent = Math.max(((value ?? 0) / maxValue) * 100, MIN_BAR_PERCENT);

                return (
                    <View key={item.key}>
                        <Text style={styles.breakdownLabel}>{t[item.label]}</Text>

                        <View style={styles.breakdownRow}>
                            <View style={[styles.breakdownTrack, { width: `${percent * 0.85}%` }]}>
                                <View style={[styles.breakdownBar, { backgroundColor: item.color }]}/>
                            </View>
                            <Text style={styles.breakdownValue}>{value ?? "-"}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
