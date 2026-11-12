import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavigation from "../../components/BottomNavigation";
import AdminBackHeader from "../../components/admin/AdminBackHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import AppointmentCard, { getClientName } from "../../components/admin/AppointmentCard";

import { useLanguage } from "../../context/LanguageContext";
import { adminAppointmentsMock } from "../../constants/admin/adminAppointmentsMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

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
