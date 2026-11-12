import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { notificationsStyles as styles } from "../../styles/notifications/notificationsStyle";
import BottomNavigation from "../../components/BottomNavigation";
import EmptyState from "../../components/EmptyState";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { adminNotificationsMock } from "../../constants/admin/adminNotificationsMock";

import {
    getNotifications,
    mapNotification,
    markNotificationRead,
} from "../../api/notifications/notificationsApi";

function isToday(date) {
    if (!date) return false;

    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

function groupNotifications(data) {
    const grouped = {
        today: [],
        lastWeek: [],
    };

    const mapped = Array.isArray(data)
        ? data.map(mapNotification)
        : [];

    mapped.forEach(notification => {
        if (isToday(notification.createdDate)) {
            grouped.today.push(notification);
        } else {
            grouped.lastWeek.push(notification);
        }
    });

    return grouped;
}

function NotificationIcon({ notification, isRead }) {
    if (notification.type === "statistic") {
        return (
            <MaterialCommunityIcons
                name="file-chart-outline"
                size={30}
                color="#FFFFFF"
            />
        );
    }

    if (notification.type === "turn") {
        return (
            <MaterialCommunityIcons
                name="door-open"
                size={29}
                color={isRead ? "#AAAAAA" : "#FFFFFF"}
            />
        );
    }

    if (notification.type === "completed") {
        return (
            <Ionicons
                name="checkmark-circle-outline"
                size={30}
                color={isRead ? "#A8CDAE" : "#57D96B"}
            />
        );
    }

    if (notification.type === "confirmed") {
        return (
            <Ionicons
                name="checkmark-circle-outline"
                size={30}
                color={isRead ? "#AAAAAA" : "#00C817"}
            />
        );
    }

    if (
        notification.type === "cancelled" ||
        notification.type === "skipped" ||
        notification.type === "missed"
    ) {
        return (
            <Ionicons
                name="close-circle-outline"
                size={30}
                color={isRead ? "#AAAAAA" : "#FF1717"}
            />
        );
    }

    if (
        notification.type === "available" ||
        notification.type === "lastChance"
    ) {
        return (
            <Ionicons
                name="flash-outline"
                size={30}
                color={isRead ? "#AAAAAA" : "#111111"}
            />
        );
    }

    if (notification.type === "confirm") {
        return (
            <Ionicons
                name="alert-circle-outline"
                size={30}
                color={isRead ? "#AAAAAA" : "#111111"}
            />
        );
    }

    return (
        <Ionicons
            name={notification.type === "waiting"
                ? "time-outline"
                : "notifications-outline"}
            size={29}
            color={isRead ? "#AAAAAA" : "#111111"}
        />
    );
}

function NotificationCard({ notification, onPress }) {
    const isRead = notification.read;
    const isTurn = notification.type === "turn";
    const isStatistic = notification.type === "statistic";

    // Karta statystyki ma biały tekst także po przeczytaniu (jaśniejsze tło).
    const isWhite = (isTurn && !isRead) || isStatistic;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[
                styles.card,
                !isRead &&
                notification.type === "turn" &&
                styles.turnCard,

                !isRead &&
                notification.type === "available" &&
                styles.availableCard,

                !isRead &&
                notification.type === "lastChance" &&
                styles.lastChanceCard,

                isRead && styles.readCard,

                isStatistic &&
                (isRead ? styles.statisticReadCard : styles.statisticCard),
            ]}
        >
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <NotificationIcon
                        notification={notification}
                        isRead={isRead}
                    />
                </View>

                <View style={styles.notificationInfo}>
                    <View style={styles.titleRow}>
                        <Text
                            style={[
                                styles.cardTitle,
                                isWhite && styles.whiteText,
                                isRead && !isStatistic && styles.readTitle,
                            ]}
                        >
                            {notification.title
                                ?.replace("🔥", "")
                                .trim()}
                        </Text>
                    </View>

                    <View style={styles.messageRow}>
                        <Text
                            style={[
                                styles.cardText,
                                isWhite && styles.turnDescription,
                                isRead && !isStatistic && styles.readText,
                            ]}
                        >
                            {notification.text}
                        </Text>

                        <Text
                            style={[
                                styles.time,
                                isWhite && styles.turnTime,
                                isRead && !isStatistic && styles.readTime,
                            ]}
                        >
                            {notification.time}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function NotificationsScreen({ navigation }) {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Admin i pracownik dostają raporty dzienne zamiast powiadomień klienta.
    const isStaff = user?.role === "admin" || user?.role === "employee";

    const [notifications, setNotifications] = useState({
        today: [],
        lastWeek: [],
    });

    const [loading, setLoading] = useState(true);

    const loadNotifications = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);

            // TODO: admin i pracownik dostają mock, dopóki backend nie wysyła raportów dziennych.
            if (isStaff) {
                setNotifications(groupNotifications(
                    adminNotificationsMock.map(item => ({
                        ...item,
                        title: t[item.titleKey],
                        message: t[item.messageKey],
                    }))
                ));
                return;
            }

            const data = await getNotifications();
            setNotifications(groupNotifications(data));

        } catch (error) {
            console.error("NOTIFICATIONS ERROR:", error);

        } finally {
            if (showLoading) setLoading(false);
        }
    }, [isStaff, t]);

    useFocusEffect(
        useCallback(() => {
            loadNotifications(true);
        }, [loadNotifications])
    );

    useEffect(() => {
        if (isStaff) return undefined;

        const interval = setInterval(() => {
            loadNotifications();
        }, 3000);

        return () => clearInterval(interval);
    }, [isStaff, loadNotifications]);

    const openNotification = async notification => {
        const updated = {
            ...notification,
            read: true,
            is_read: true,
        };

        setNotifications(prev => ({
            today: prev.today.map(item =>
                item.id === notification.id
                    ? updated
                    : item
            ),

            lastWeek: prev.lastWeek.map(item =>
                item.id === notification.id
                    ? updated
                    : item
            ),
        }));

        // TODO: przy API raportów zastąpić przez markNotificationRead.
        if (isStaff) {
            const mock = adminNotificationsMock.find(item => item.id === notification.id);
            if (mock) mock.is_read = true;
        }

        // Statystyka prowadzi do dashboardu admina ze statystykami dnia.
        if (notification.type === "statistic") {
            navigation.navigate("Home");
        } else {
            navigation.navigate("NotificationDetails", {
                notification: updated,
            });
        }

        if (!notification.read && !isStaff) {
            try {
                await markNotificationRead(notification.id);
            } catch (error) {
                console.error("MARK READ ERROR:", error);
                await loadNotifications();
            }
        }
    };

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
                    {t.notificationsTitle}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>
                    {t.today}
                </Text>

                {!loading && notifications.today.length === 0 ? (
                    <EmptyState
                        title={t.noNotificationsToday}
                        description={t.noNotificationsTodayDescription}
                        style={styles.emptyState}
                        titleStyle={styles.emptyTitle}
                        descriptionStyle={styles.emptyDescription}
                    />
                ) : (
                    notifications.today.map(notification => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onPress={() =>
                                openNotification(notification)
                            }
                        />
                    ))
                )}

                {notifications.lastWeek.length > 0 && (
                    <>
                        <Text
                            style={[
                                styles.sectionTitle,
                                styles.lastWeekTitle,
                            ]}
                        >
                            {t.lastWeek}
                        </Text>

                        {notifications.lastWeek.map(notification => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onPress={() =>
                                    openNotification(notification)
                                }
                            />
                        ))}
                    </>
                )}

                <View style={styles.bottomSpace}/>
            </ScrollView>

            <BottomNavigation navigation={navigation}/>
        </View>
    );
}