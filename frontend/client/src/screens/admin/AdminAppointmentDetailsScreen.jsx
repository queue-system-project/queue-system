import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminBackHeader from "../../components/admin/AdminBackHeader";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";
import RoomBadge from "../../components/admin/RoomBadge";

import { useLanguage } from "../../context/LanguageContext";
import { adminAppointmentsMock } from "../../constants/admin/adminAppointmentsMock";
import { adminQueuesMock } from "../../constants/admin/adminQueuesMock";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import { APPOINTMENT_STATUSES } from "../../constants/admin/appointmentStatuses";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminAppointmentDetailsScreen({ navigation, route }) {
    const { t } = useLanguage();

    // TODO: podmienić na szczegóły wizyty z API.
    const appointment = route?.params?.appointment ?? adminAppointmentsMock[0];
    const { service, client } = appointment;

    const status = APPOINTMENT_STATUSES[appointment.status] ?? APPOINTMENT_STATUSES.waiting;
    const queue = adminQueuesMock.find(item => item.id === appointment.queue_id);
    const employee = queue?.employee ?? null;
    const fullEmployee = employee && adminEmployeesMock.find(item => item.id === employee.id);

    const start = new Date(appointment.start);
    const date = start.toLocaleDateString(t.locale || "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const time = start.toLocaleTimeString(t.locale || "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <View style={styles.container}>
            <AdminBackHeader title={t.appointmentDetailsTitle} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* SERVICE */}
                <Text style={[styles.serviceName, { marginTop: 24, textAlign: "center", fontSize: 19 }]}>
                    {service.name}
                </Text>
                <Text style={styles.queueDuration}>
                    {service.standard_duration} {t.min}
                </Text>

                <View style={[styles.statsRow, { marginTop: 26 }]}>
                    <View style={[styles.liveCard, styles.liveCardGrey]}>
                        <Text style={[styles.liveCardLabel, styles.liveCardTextDark]}>{t.appointmentDate}</Text>
                        <Text style={[styles.liveCardValue, styles.liveCardTextDark, { fontSize: 17 }]}>{date}</Text>
                    </View>

                    <View style={[styles.liveCard, styles.liveCardLight]}>
                        <Text style={[styles.liveCardLabel, styles.liveCardTextDark]}>{t.appointmentTime}</Text>
                        <Text style={[styles.liveCardValue, styles.liveCardTextDark, { fontSize: 17 }]}>{time}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { fontSize: 13 }]}>{t.appointmentStatus}</Text>
                    <View style={[styles.statusBadge, { marginTop: 0, backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{t[status.label]}</Text>
                    </View>
                </View>

                {/* CLIENT */}
                <Text style={styles.subsectionTitle}>{t.appointmentClient}</Text>
                <View style={styles.smallCard}>
                    <View style={styles.employeeRow}>
                        <View style={styles.clientAvatar}>
                            <Ionicons name="person-outline" size={24} color="#111111"/>
                        </View>
                        <Text style={styles.employeeName}>
                            {[client.first_name, client.last_name].filter(Boolean).join(" ")}
                        </Text>
                    </View>

                    {!!client.phone && (
                        <View style={styles.contactRow}>
                            <Ionicons name="call" size={16} color="#111111"/>
                            <Text style={styles.contactText}>{client.phone}</Text>
                        </View>
                    )}

                    {!!client.email && (
                        <View style={[styles.contactRow, { marginTop: 12 }]}>
                            <Ionicons name="mail" size={16} color="#111111"/>
                            <Text style={styles.contactText}>{client.email}</Text>
                        </View>
                    )}

                    {!!appointment.note && (
                        <>
                            <Text style={[styles.fieldLabel, { marginTop: 18, marginBottom: 6 }]}>
                                {t.appointmentNote}
                            </Text>
                            <Text style={styles.infoValue}>{appointment.note}</Text>
                        </>
                    )}
                </View>

                {/* EMPLOYEE */}
                {!!employee && (
                    <>
                        <Text style={styles.subsectionTitle}>{t.appointmentEmployee}</Text>
                        <TouchableOpacity
                            style={[styles.employeeCard, { marginTop: 14 }]}
                            activeOpacity={0.8}
                            disabled={!fullEmployee}
                            onPress={() => navigation.navigate("AdminEmployeeDetails", { employee: fullEmployee })}
                        >
                            <EmployeeAvatar employee={employee}/>
                            <Text style={styles.employeeName} numberOfLines={2}>
                                {getEmployeeName(employee)}
                            </Text>
                            <RoomBadge room={employee.room}/>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="queues"/>
        </View>
    );
}
