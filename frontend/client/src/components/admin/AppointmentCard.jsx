import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useLanguage } from "../../context/LanguageContext";
import { APPOINTMENT_STATUSES } from "../../constants/admin/appointmentStatuses";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export const getClientName = client =>
    [client.first_name, client.last_name].filter(Boolean).join(" ");

// Karta wizyty: usługa, data i godzina, klient ze statusem.
// `children` renderuje się na dole karty (np. przycisk akcji).
export default function AppointmentCard({ appointment, onPress, children }) {
    const { t } = useLanguage();

    const status = APPOINTMENT_STATUSES[appointment.status] ?? APPOINTMENT_STATUSES.waiting;
    const start = new Date(appointment.start);
    const locale = t.locale || "en-GB";

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            disabled={!onPress}
            onPress={onPress}
        >
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
                            {start.toLocaleDateString(locale, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </Text>
                    </View>

                    <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={12} color="#111111"/>
                        <Text style={styles.badgeText}>
                            {start.toLocaleTimeString(locale, {
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

            {children}
        </TouchableOpacity>
    );
}
