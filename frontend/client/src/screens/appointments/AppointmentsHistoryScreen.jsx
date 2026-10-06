import React, { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { appointmentsHistoryStyles as styles } from "../../styles/appointments/appointmentsHistoryStyle";
import BottomNavigation from "../../components/BottomNavigation";
import EmptyState from "../../components/EmptyState";
import { useLanguage } from "../../context/LanguageContext";
import { authorizedRequest } from "../../api/authorizedRequest";

const MONTH_KEYS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
];

function formatDate(value, locale = "en-GB") {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatTime(value, locale = "en-GB") {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function getHistorySection(value) {
    if (!value) return "other";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "other";

    const today = new Date();

    const isToday =
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();

    if (isToday) return "today";

    return `month-${date.getMonth()}`;
}

function mapHistoryAppointment(item, locale) {
    const service = item.service ?? null;
    const client = item.client ?? null;
    const employee = item.employee ?? null;
    const institution = item.institution ?? null;
    const category = institution?.category ?? null;

    const employeeName = employee ? [employee.first_name, employee.last_name].filter(Boolean).join(" ") : "";

    const clientName = client ? [client.first_name, client.last_name].filter(Boolean).join(" ") : "";

    const appointmentDate = item.actual_start ?? item.actual_end ?? null;

    const standardDuration = item.standard_duration ?? service?.standard_duration ?? null;

    return {
        id: item.queue_entry_id,
        visitId: item.id,
        queueEntryId: item.queue_entry_id,

        serviceId: item.service_id ?? service?.id ?? null,
        employeeId: item.employee_id ?? employee?.id ?? null,
        clientId: client?.id ?? null,
        institutionId: institution?.id ?? null,

        section: getHistorySection(appointmentDate),
        status: item.status,
        rated: item.rated === true,
        reviewRating: item.review_rating ?? null,

        service: service?.name ?? "-",
        serviceData: service,
        serviceDescription: service?.description ?? null,
        standardDuration,
        duration:
            standardDuration != null
                ? `${standardDuration} min`
                : "-",

        actualStart: item.actual_start ?? null,
        actualEnd: item.actual_end ?? null,
        actualDuration: item.actual_duration ?? null,

        date: formatDate(appointmentDate, locale),
        time: formatTime(appointmentDate, locale),

        client,
        clientName: clientName || "-",
        clientPhone: client?.phone ?? null,
        clientEmail: client?.email ?? null,
        clientImage: client?.profile_image ?? null,
        clientNote:
            typeof item.client_note === "string" &&
            item.client_note.trim()
                ? item.client_note.trim()
                : null,

        employee,
        doctor: employeeName || null,
        room: employee?.room ?? "—",
        image: employee?.profile_image ?? null,
        employeePhone: employee?.phone ?? null,
        employeeEmail: employee?.email ?? null,

        institution,
        clinic: institution?.name ?? "-",
        institutionName: institution?.name ?? "-",
        address: institution?.address ?? "",
        institutionAddress: institution?.address ?? null,
        institutionDescription: institution?.description ?? null,
        institutionPhone: institution?.phone ?? null,
        institutionEmail: institution?.email ?? null,
        institutionPhoto: institution?.photo_url ?? null,
        institutionRating: institution?.rating ?? null,
        rating: institution?.rating ?? null,

        institutionCategory: category,
        category: category?.name ?? null,
        categoryKey: category?.key ?? null,
    };
}

function HistoryCard({ appointment, navigation }) {
    const { t } = useLanguage();

    const getCategoryName = (category) => {
        const categories = {
            Healthcare: t.categoryHealthcare,
            "Banking & Finance": t.categoryBankingFinance,
            "Government Services": t.categoryGovernmentServices,
            "Beauty & Wellness": t.categoryBeautyWellness,
            Education: t.categoryEducation,
            Transport: t.categoryTransport,
            Insurance: t.categoryInsurance,
            "Legal Services": t.categoryLegalServices,
        };

        return categories[category] ?? category;
    };

    const openAppointmentDetails = () => {
        navigation.navigate("AppointmentDetails", {
            appointment,
        });
    };

    const openRateVisit = (event) => {
        event.stopPropagation();

        navigation.navigate("AppointmentCompleted", {
            appointment,
        });
    };

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={openAppointmentDetails}
        >
            {/* CLINIC */}
            <View style={styles.clinicRow}>
                {appointment.institutionPhoto ? (
                    <Image source={{ uri: appointment.institutionPhoto }} style={styles.clinicImage}/>
                ) : (
                    <View
                        style={[
                            styles.clinicImage,
                            {
                                alignItems: "center",
                                justifyContent: "center",
                            },
                        ]}
                    >
                        <Ionicons name="business-outline" size={28} color="#777777"/>
                    </View>
                )}

                <View style={styles.clinicInfo}>
                    <View style={styles.tagsRow}>
                        {appointment.category && (
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryText} numberOfLines={1}>
                                    {getCategoryName(appointment.category)}
                                </Text>
                            </View>
                        )}

                        {appointment.rating != null && (
                            <View style={styles.ratingTag}>
                                <Text style={styles.star}>★</Text>

                                <Text style={styles.ratingText}>
                                    {Number(appointment.rating).toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.clinicName} numberOfLines={1}>
                        {appointment.clinic}
                    </Text>

                    <Text style={styles.clinicAddress} numberOfLines={1}>
                        {appointment.address}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* APPOINTMENT */}
            <View style={styles.appointmentRow}>
                <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName} numberOfLines={2}>
                        {appointment.service}
                    </Text>

                    <Text style={styles.duration}>
                        {appointment.duration}
                    </Text>
                </View>

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText} numberOfLines={1}>
                            {appointment.date}
                        </Text>
                    </View>

                    <View style={styles.timeBadge}>
                        <Ionicons name="time-outline" size={13} color="#333333"/>

                        <Text style={styles.timeText} numberOfLines={1}>
                            {appointment.time || "—"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* RATE VISIT */}
            {!appointment.rated && (
                <TouchableOpacity
                    style={styles.rateButton}
                    activeOpacity={0.9}
                    onPress={openRateVisit}
                >
                    <Text style={styles.rateButtonText}>{t.rateVisit}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

export default function AppointmentsHistoryScreen({ navigation }) {
    const { t } = useLanguage();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        try {
            setLoading(true);

            const data = await authorizedRequest(
                "/api/visit/history",
                "GET"
            );

            console.log("APPOINTMENTS HISTORY:", data);

            const locale = t.locale || "en-GB";

            const formatted = Array.isArray(data) ? data.map((item) => mapHistoryAppointment(item, locale)) : [];

            setAppointments(formatted);

        } catch (error) {
            console.error("APPOINTMENTS HISTORY ERROR:", error);
            setAppointments([]);

        } finally {
            setLoading(false);
        }
    }, [t.locale]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    const getSectionTitle = (section) => {
        if (section === "today") return t.today;
        if (!section || section === "other") return "";

        if (section.startsWith("month-")) {
            const monthIndex = Number(section.replace("month-", ""));
            const key = MONTH_KEYS[monthIndex];
            return key ? t[key] : "";
        }

        return "";
    };

    const groupedAppointments = appointments.reduce(
        (groups, appointment) => {
            const section = appointment.section || "other";

            if (!groups[section]) {
                groups[section] = [];
            }

            groups[section].push(appointment);
            return groups;
        }
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {t.appointmentsHistory}
                </Text>

                <TouchableOpacity
                    style={styles.notificationButton}
                    activeOpacity={1}
                    onPress={() => navigation.navigate("Notifications")}
                >
                    <Ionicons name="notifications" size={27} color="#111111"/>
                </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="small" />
                    </View>

                ) : appointments.length === 0 ? (
                    <EmptyState
                        title={t.noAppointmentsHistory}
                        description={t.noAppointmentsHistoryDescription}
                        style={styles.emptyState}
                        titleStyle={styles.emptyTitle}
                        descriptionStyle={styles.emptyDescription}
                    />

                ) : (
                    Object.entries(groupedAppointments).map(
                        ([section, sectionAppointments]) => {
                            const sectionTitle =
                                getSectionTitle(section);

                            return (
                                <View key={section} style={styles.section}>
                                    {!!sectionTitle && (
                                        <Text style={ styles.sectionTitle }>
                                            {sectionTitle}
                                        </Text>
                                    )}

                                    {sectionAppointments.map(
                                        (appointment, index) => (
                                            <View key={appointment.id}
                                                  style={
                                                    index !==
                                                    sectionAppointments.length - 1
                                                        ? {
                                                            marginBottom: 14,
                                                        }
                                                        : null
                                                }
                                            >
                                                <HistoryCard appointment={appointment} navigation={navigation}/>
                                            </View>
                                        )
                                    )}
                                </View>
                            );
                        }
                    )
                )}

                <View style={styles.bottomSpace} />
            </ScrollView>

            <BottomNavigation navigation={navigation} active="appointments"/>
        </View>
    );
}