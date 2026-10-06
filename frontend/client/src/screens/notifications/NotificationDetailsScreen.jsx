import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { notificationDetailsStyles as styles } from "../../styles/notifications/notificationDetailsStyle";
import { useLanguage } from "../../context/LanguageContext";

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === "") return null;

    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

export default function NotificationDetailsScreen({ navigation, route }) {
    const { t } = useLanguage();
    const notification = route?.params?.notification ?? null;

    if (!notification) return null;

    const getStatusText = () => {
        switch (notification.type) {
            case "waiting":
                return t.waiting;

            case "confirmed":
                return t.confirmed;

            case "turn":
                return t.ready;

            case "confirm":
                return t.confirmationRequired;

            case "available":
                return t.spotAvailable;

            case "lastChance":
                return t.lastChance;

            case "completed":
                return t.completed;

            case "cancelled":
                return t.cancelled;

            case "skipped":
                return t.skipped;

            case "missed":
                return t.missed;

            default:
                return null;
        }
    };

    const statusText = getStatusText();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={28} color="#5657C4"/>
                </TouchableOpacity>

                <Text style={styles.headerTitle}>
                    {t.notificationDetailsTitle}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>
                        {(notification.title ?? "").replace("🔥", "").trim()}
                    </Text>

                    {!!notification.time && (
                        <Text style={styles.time}>
                            {notification.time}
                        </Text>
                    )}
                </View>

                {!!(notification.details ?? notification.message) && (
                    <Text style={styles.description}>
                        {notification.details ?? notification.message}
                    </Text>
                )}

                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>
                        {t.details}
                    </Text>

                    <DetailRow
                        label={t.status}
                        value={statusText}
                    />

                    <DetailRow
                        label={t.date}
                        value={notification.date}
                    />

                    <DetailRow
                        label={t.time}
                        value={notification.time}
                    />
                </View>
            </ScrollView>
        </View>
    );
}