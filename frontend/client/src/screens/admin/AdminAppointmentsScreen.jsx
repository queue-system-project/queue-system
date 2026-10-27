import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminBackHeader from "../../components/admin/AdminBackHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";

import { useLanguage } from "../../context/LanguageContext";
import { adminAppointmentsMock } from "../../constants/admin/adminAppointmentsMock";
import { APPOINTMENT_STATUSES } from "../../constants/admin/appointmentStatuses";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

const getClientName = client =>
    [client.first_name, client.last_name].filter(Boolean).join(" ");

function AppointmentCard({ appointment, t, onPress }) {
    const status = APPOINTMENT_STATUSES[appointment.status] ?? APPOINTMENT_STATUSES.waiting;
    const start = new Date(appointment.start);

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.appointmentTop}>
                <View style={styles.appointmentService}>
                    <Text style={styles.serviceName}>{appointment.service.name}</Text>
                    <Text style={styles.duration}>
                        {appointment.service.standard_duration} {t.min}
                    </Text>
                </View>

                <View style={styles.appointmentBadges}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.badgeText}>
                            {start.toLocaleDateString(t.locale || "en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </Text>
                    </View>

                    <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={12} color="#111111"/>
                        <Text style={styles.badgeText}>
                            {start.toLocaleTimeString(t.locale || "en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider}/>

            <View style={styles.employeeRow}>
                <View style={styles.clientAvatar}>
                    <Ionicons name="person-outline" size={24} color="#111111"/>
                </View>

                <Text style={styles.employeeName} numberOfLines={2}>
                    {getClientName(appointment.client)}
                </Text>

                <View style={[styles.statusBadge, { marginTop: 0, backgroundColor: status.color }]}>
                    <Text style={styles.statusText}>{t[status.label]}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function AdminAppointmentsScreen({ navigation, route }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");

    // TODO: podmienić na wizyty z API. Bez queueId pokazujemy wszystkie.
    const queueId = route?.params?.queueId;
    const appointments = adminAppointmentsMock
        .filter(item => queueId == null || item.queue_id === queueId)
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const query = search.trim().toLowerCase();
    const filtered = appointments.filter(item =>
        getClientName(item.client).toLowerCase().includes(query)
    );

    const current = filtered.find(item => item.status === "in_service");
    const next = filtered.find(item => item.status === "waiting");
    const upcoming = filtered.filter(item => item !== current && item !== next);

    const sections = [
        { key: "current", title: t.currentAppointment, items: current ? [current] : [] },
        { key: "next", title: t.nextAppointment, items: next ? [next] : [] },
        { key: "upcoming", title: t.upcomingAppointments, items: upcoming },
    ].filter(section => section.items.length > 0);

    return (
        <View style={styles.container}>
            <AdminBackHeader title={t.appointmentsTitle} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <AdminSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.searchClientName}
                    style={{ marginTop: 28 }}
                />

                {sections.length === 0 ? (
                    <Text style={styles.emptyText}>{t.adminNoAppointments}</Text>
                ) : (
                    sections.map(section => (
                        <View key={section.key}>
                            <Text style={[styles.subsectionTitle, { marginTop: 30, marginBottom: 0 }]}>
                                {section.title}
                            </Text>

                            {section.items.map(item => (
                                <AppointmentCard
                                    key={item.id}
                                    appointment={item}
                                    t={t}
                                    onPress={() => navigation.navigate("AdminAppointmentDetails", { appointment: item })}
                                />
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="queues"/>
        </View>
    );
}
