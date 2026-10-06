import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { queueStatusStyles as styles } from "../../styles/queue/queueStatusStyle";
import { useLanguage } from "../../context/LanguageContext";
import { getAppointments } from "../../api/appointments/appointmentsApi";

export default function QueueStatusScreen({ navigation, route }) {
    const { t } = useLanguage();
    const { appointmentId } = route.params;

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAppointment = async () => {
            try {
                const data = await getAppointments();

                const selectedAppointment = data.find(
                    item => String(item.id) === String(appointmentId)
                );

                console.log(
                    "QUEUE STATUS APPOINTMENT:",
                    JSON.stringify(selectedAppointment, null, 2)
                );

                setAppointment(selectedAppointment ?? null);

            } catch (error) {
                console.error("Failed to load appointment:", error);
                setAppointment(null);

            } finally {
                setLoading(false);
            }
        };

        loadAppointment();
    }, [appointmentId]);

    const position = appointment?.queue_position ?? "-";

    const formatTime = value => {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleTimeString(t.locale || "en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const estimatedTime = formatTime(
        appointment?.estimated_start_at
    );

    const waitingTime =
        appointment?.estimated_wait_time != null
            ? `${appointment.estimated_wait_time} ${t.min}`
            : "-";

    const employee = appointment?.employee
        ? `${appointment.employee.first_name ?? ""} ${appointment.employee.last_name ?? ""}`.trim()
        : "-";

    const room = appointment?.employee?.room ?? "-";

    const service =
        appointment?.service?.name ??
        appointment?.service_name ??
        "-";

    const getStatus = () => {
        const numericPosition = Number(position);

        if (!Number.isFinite(numericPosition)) {
            return {
                color: "#5657C4",
                background: "#F0F0FA",
            };
        }

        if (numericPosition <= 2) {
            return {
                color: "#2ECC40",
                background: "#DDF8DF",
            };
        }

        if (numericPosition <= 5) {
            return {
                color: "#FFBD16",
                background: "#FFF1AE",
            };
        }

        return {
            color: "#F21B0C",
            background: "#FFDADA",
        };
    };

    const status = getStatus();

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF"/>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        {t.queueStatusTitle}
                    </Text>

                    <Text style={styles.headerDescription}>
                        {t.queueStatusDescription}
                    </Text>
                </View>

                {/* POSITION */}
                <View
                    style={[
                        styles.positionCircle,
                        { borderColor: status.color },
                    ]}
                >
                    <Text style={styles.positionNumber}>
                        {loading ? "-" : position}
                    </Text>

                    <Text style={styles.positionText}>
                        {t.position}
                    </Text>
                </View>

                <Text style={styles.infoText}>
                    {t.queueStatusInfo}
                </Text>

                {/* INFORMATION */}
                <View style={styles.cards}>
                    <View
                        style={[
                            styles.smallCard,
                            {
                                backgroundColor: status.background,
                                borderColor: status.color,
                            },
                        ]}
                    >
                        <Text style={styles.cardLabel}>
                            {t.estimatedEntryTime}
                        </Text>

                        <Text style={styles.cardValue}>
                            {estimatedTime}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.smallCard,
                            {
                                backgroundColor: status.background,
                                borderColor: status.color,
                            },
                        ]}
                    >
                        <Text style={styles.cardLabel}>
                            {t.approximateWaitingTime}
                        </Text>

                        <Text style={styles.cardValue}>
                            {waitingTime}
                        </Text>
                    </View>

                    <View style={styles.smallCard}>
                        <Text style={styles.cardLabel}>
                            {t.employee}
                        </Text>

                        <Text style={styles.cardValue}>
                            {employee}
                        </Text>
                    </View>

                    <View style={styles.smallCard}>
                        <Text style={styles.cardLabel}>
                            {t.roomLabel}
                        </Text>

                        <Text style={styles.cardValue}>
                            {room}
                        </Text>
                    </View>

                    <View style={styles.serviceCard}>
                        <Text style={styles.cardLabel}>
                            {t.serviceName}
                        </Text>

                        <Text style={styles.cardValue}>
                            {service}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}