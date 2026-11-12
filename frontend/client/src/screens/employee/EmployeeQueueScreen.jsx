import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AppointmentCard, { getClientName } from "../../components/admin/AppointmentCard";
import QueueBreakdownCard from "../../components/admin/QueueBreakdownCard";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
    buildEmployeeProfile,
    employeeQueueStatsMock,
    isShiftActive,
} from "../../constants/employee/employeePanelMock";
import { startAppointment, useEmployeeQueue } from "../../constants/employee/employeeQueueStore";
import { adminScreensStyles as adminStyles } from "../../styles/admin/adminScreensStyle";
import { employeePanelStyles as styles } from "../../styles/employee/employeePanelStyle";

// Klienci, którzy jeszcze mogą zostać obsłużeni dziś (anulowani i obsłużeni odpadają).
const UPCOMING_STATUSES = ["waiting", "missed"];

function LiveCard({ label, value }) {
    return (
        <View style={adminStyles.liveCard}>
            <Text style={adminStyles.liveCardLabel}>{label}</Text>
            <Text style={adminStyles.liveCardValue}>{value}</Text>
        </View>
    );
}

function EmptyMessage({ title, text, centered }) {
    return (
        <View style={[styles.emptyBox, centered && styles.emptyBoxCentered]}>
            <Text style={styles.emptyTitle}>{title}</Text>
            {!!text && <Text style={styles.emptyText}>{text}</Text>}
        </View>
    );
}

export default function EmployeeQueueScreen({ navigation }) {
    const { t } = useLanguage();
    const { user } = useAuth();

    const [search, setSearch] = useState("");

    // TODO: podmienić na kolejkę pracownika z API.
    const employee = buildEmployeeProfile(user);
    const shiftActive = isShiftActive(employee);
    const queue = useEmployeeQueue();

    // Po zakończeniu zmiany: maksima z dnia, nikt nie jest obsługiwany ani nie czeka.
    const endedStats = employeeQueueStatsMock;
    const cards = shiftActive
        ? [
            { label: t.queueLoad, value: queue.stats.queueLoad },
            { label: t.delayTime, value: `+ ${queue.stats.delayMinutes} ${t.min}` },
        ]
        : [
            { label: t.maxQueueLoad, value: endedStats.maxQueueLoad },
            { label: t.maxDelayTime, value: `${endedStats.maxDelayMinutes} ${t.min}` },
        ];
    const breakdown = shiftActive
        ? queue.stats
        : { ...endedStats, inService: null, waiting: null };

    const query = search.trim().toLowerCase();
    const matches = item => getClientName(item.client).toLowerCase().includes(query);

    const remaining = queue.entries.filter(item => UPCOMING_STATUSES.includes(item.status) && matches(item));
    const next = remaining.find(item => item.status === "waiting") ?? null;
    const upcoming = remaining.filter(item => item !== next);
    const current = queue.current && matches(queue.current) ? queue.current : null;

    const renderQueue = () => {
        if (query && !current && remaining.length === 0) {
            return <EmptyMessage title={t.noClientsFound}/>;
        }

        return (
            <>
                <Text style={[styles.queueSectionTitle, { marginTop: 24 }]}>{t.currentClient}</Text>
                {current ? (
                    <AppointmentCard
                        appointment={current}
                        onPress={() => navigation.navigate("EmployeeAppointment")}
                    />
                ) : (
                    <EmptyMessage title={t.noCurrentAppointment} text={t.noCurrentAppointmentText}/>
                )}

                {next && (
                    <>
                        <Text style={styles.queueSectionTitle}>{t.nextClient}</Text>
                        <AppointmentCard appointment={next}>
                            {/* Nowa wizyta dopiero po zakończeniu bieżącej. */}
                            {!queue.current && (
                                <TouchableOpacity
                                    style={styles.cardButton}
                                    activeOpacity={0.85}
                                    onPress={() => startAppointment(next.id)}
                                >
                                    <Text style={styles.cardButtonText}>{t.startAppointment}</Text>
                                </TouchableOpacity>
                            )}
                        </AppointmentCard>
                    </>
                )}

                {upcoming.length > 0 && (
                    <>
                        <Text style={styles.queueSectionTitle}>{t.upcomingClient}</Text>
                        {upcoming.map(item => (
                            <AppointmentCard key={item.id} appointment={item}/>
                        ))}
                    </>
                )}

                {!next && upcoming.length === 0 && !query && (
                    <EmptyMessage title={t.queueEmpty} text={t.queueEmptyText}/>
                )}
            </>
        );
    };

    return (
        <View style={adminStyles.container}>
            <View style={adminStyles.header}>
                <Text style={adminStyles.headerTitle}>{t.employeeQueueTitle}</Text>

                <TouchableOpacity
                    style={adminStyles.notificationButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Notifications")}
                >
                    <Ionicons name="notifications" size={25} color="#111111"/>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.queueContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[adminStyles.statsRow, { marginTop: 24 }]}>
                    {cards.map(card => (
                        <LiveCard key={card.label} label={card.label} value={card.value}/>
                    ))}
                </View>

                <QueueBreakdownCard stats={breakdown}/>

                <AdminSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.searchClientName}
                    style={styles.searchBar}
                />

                {shiftActive
                    ? renderQueue()
                    : <EmptyMessage title={t.shiftEnded} text={t.shiftEndedText} centered/>}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="queue"/>
        </View>
    );
}
