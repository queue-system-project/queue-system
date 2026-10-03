import React, {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
    useFocusEffect,
} from "@react-navigation/native";

import {
    appointmentsStyles as styles,
} from "../../styles/appointments/appointmentsStyle";

import BottomNavigation
    from "../../components/BottomNavigation";

import EmptyState
    from "../../components/EmptyState";

import {
    useLanguage,
} from "../../context/LanguageContext";

import {
    authorizedRequest,
} from "../../api/authorizedRequest";


function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function formatTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return date.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }
    );
}


function getAppointmentSection(
    appointment
) {
    if (!appointment.queue_date) {
        return "";
    }

    const appointmentDate =
        new Date(
            `${appointment.queue_date}T00:00:00`
        );

    const today = new Date();

    const isToday =
        appointmentDate.getFullYear()
        === today.getFullYear()
        &&
        appointmentDate.getMonth()
        === today.getMonth()
        &&
        appointmentDate.getDate()
        === today.getDate();

    if (isToday) {
        return "today";
    }

    return appointmentDate
        .toLocaleDateString(
            "en-GB",
            {
                month: "long",
            }
        )
        .toLowerCase();
}


function mapAppointment(item) {
    const service =
        item.service ?? null;

    const client =
        item.client ?? null;

    const employee =
        item.employee ?? null;

    const institution =
        item.institution ?? null;


    const serviceName =
        service?.name
        ?? item.service_name
        ?? "-";


    const standardDuration =
        service?.standard_duration
        ?? item.standard_duration
        ?? null;


    const employeeName =
        employee
            ? [
                employee.first_name,
                employee.last_name,
            ]
                .filter(Boolean)
                .join(" ")
            : "";


    const clientName =
        client
            ? [
                client.first_name,
                client.last_name,
            ]
                .filter(Boolean)
                .join(" ")
            : "";


    const scheduledTime =
        item.scheduled_at;

    const estimatedTime =
        item.estimated_start_at;


    return {
        // =========================
        // BASIC
        // =========================

        id: item.id,

        serviceId:
            item.service_id
            ?? service?.id
            ?? null,

        employeeId:
            item.employee_id
            ?? employee?.id
            ?? null,

        clientId:
            item.client_id
            ?? client?.id
            ?? null,

        institutionId:
            item.institution_id
            ?? institution?.id
            ?? null,


        // =========================
        // SECTION
        // =========================

        section:
            getAppointmentSection(
                item
            ),


        // =========================
        // SERVICE
        // =========================

        service:
        serviceName,

        serviceData:
        service,

        serviceDescription:
            service?.description
            ?? item.service_description
            ?? null,

        duration:
            standardDuration != null
                ? `${standardDuration} min`
                : "-",

        standardDuration:
        standardDuration,


        // =========================
        // DATE / TIME
        // =========================

        queueDate:
        item.queue_date,

        date:
            formatDate(
                item.queue_date
            ),

        scheduledAt:
        scheduledTime,

        time:
            formatTime(
                scheduledTime
            ),

        estimatedStartAt:
        estimatedTime,

        estimatedTime:
            estimatedTime
                ? formatTime(
                    estimatedTime
                )
                : null,

        initialEstimatedStartAt:
            item.initial_estimated_start_at
            ?? null,

        etaUpdatedAt:
            item.eta_updated_at
            ?? null,


        // =========================
        // QUEUE
        // =========================

        position:
        item.queue_position,

        waitingTime:
            item.estimated_wait_time
            != null
                ? `${
                    item.estimated_wait_time
                } min`
                : null,

        estimatedWaitTime:
            item.estimated_wait_time
            ?? null,

        delay:
            item.delay_time
            ?? 0,

        status:
        item.status,

        clientNote:
            typeof item.client_note === "string"
            && item.client_note.trim()
                ? item.client_note.trim()
                : null,

        // =========================
        // CLIENT
        // =========================

        client:
        client,

        clientName:
            clientName || "-",

        clientPhone:
            client?.phone
            ?? null,

        clientEmail:
            client?.email
            ?? null,

        clientImage:
            client?.profile_image
            ?? null,


        // =========================
        // EMPLOYEE
        // =========================

        employee:
        employee,

        doctor:
            employeeName
            || "Not assigned",

        room:
            employee?.room
            ?? "—",

        image:
            employee?.profile_image
            ?? null,

        employeePhone:
            employee?.phone
            ?? null,

        employeeEmail:
            employee?.email
            ?? null,


        // =========================
        // INSTITUTION
        // =========================

        institution:
        institution,

        institutionName:
            institution?.name
            ?? "-",

        institutionDescription:
            institution?.description
            ?? null,

        institutionAddress:
            institution?.address
            ?? null,

        institutionPhone:
            institution?.phone
            ?? null,

        institutionEmail:
            institution?.email
            ?? null,

        institutionPhoto:
            institution?.photo_url
            ?? null,

        institutionRating:
            institution?.rating
            ?? null,

        institutionCategory:
            institution?.category
            ?? null,
    };
}


function AppointmentCard({
                             appointment,
                             navigation,
                         }) {
    const { t } = useLanguage();


    const openAppointmentDetails =
        () => {
            navigation.navigate(
                "AppointmentDetails",
                {
                    appointment,
                }
            );
        };


    const openQueueStatus =
        (event) => {
            event.stopPropagation();

            navigation.navigate(
                "QueueStatus",
                {
                    appointmentId:
                    appointment.id,
                }
            );
        };


    const showQueueStatus = [
        "waiting",
        "confirmed",
        "in_service",
    ].includes(
        appointment.status
    );


    return (
        <TouchableOpacity
            style={
                styles.appointmentCard
            }
            activeOpacity={0.9}
            onPress={
                openAppointmentDetails
            }
        >

            {/* ===================== */}
            {/* SERVICE */}
            {/* ===================== */}

            <View
                style={
                    styles.serviceRow
                }
            >

                <View
                    style={
                        styles.serviceInfo
                    }
                >
                    <Text
                        style={
                            styles.serviceName
                        }
                    >
                        {
                            appointment.service
                        }
                    </Text>

                    <Text
                        style={
                            styles.duration
                        }
                    >
                        {
                            appointment.duration
                        }
                    </Text>
                </View>


                <View
                    style={
                        styles.dateTimeRow
                    }
                >

                    <View
                        style={
                            styles.dateBadge
                        }
                    >
                        <Text
                            style={
                                styles.dateText
                            }
                        >
                            {
                                appointment.date
                            }
                        </Text>
                    </View>


                    <View
                        style={[
                            styles.timeBadge,

                            showQueueStatus
                                ? styles.timeBadgeActive
                                : styles.timeBadgeUpcoming,
                        ]}
                    >

                        <Ionicons
                            name="time-outline"
                            size={13}
                            color="#333333"
                        />

                        <Text
                            style={
                                styles.timeText
                            }
                        >
                            {
                                appointment
                                    .estimatedTime
                                ||
                                appointment.time
                                ||
                                "—"
                            }
                        </Text>

                    </View>

                </View>

            </View>


            {/* ===================== */}
            {/* DIVIDER */}
            {/* ===================== */}

            <View
                style={
                    styles.divider
                }
            />


            {/* ===================== */}
            {/* EMPLOYEE */}
            {/* ===================== */}

            <View
                style={
                    styles.doctorRow
                }
            >

                <View
                    style={
                        styles.doctorInfo
                    }
                >

                    {
                        appointment.image
                            ? (
                                <Image
                                    source={{
                                        uri:
                                        appointment
                                            .image,
                                    }}
                                    style={
                                        styles
                                            .doctorImage
                                    }
                                />
                            )
                            : (
                                <View
                                    style={
                                        styles
                                            .doctorAvatar
                                    }
                                >
                                    <Ionicons
                                        name={
                                            "person-outline"
                                        }
                                        size={24}
                                        color={
                                            "#111111"
                                        }
                                    />
                                </View>
                            )
                    }


                    <Text
                        style={
                            styles.doctorName
                        }
                    >
                        {
                            appointment.doctor
                        }
                    </Text>

                </View>


                <View
                    style={
                        styles.roomInfo
                    }
                >

                    <View
                        style={
                            styles.roomBadge
                        }
                    >
                        <Text
                            style={
                                styles.roomNumber
                            }
                        >
                            {
                                appointment.room
                            }
                        </Text>
                    </View>

                    <Text
                        style={
                            styles.roomLabel
                        }
                    >
                        {t.roomLabel}
                    </Text>

                </View>

            </View>


            {/* ===================== */}
            {/* QUEUE STATUS */}
            {/* ===================== */}

            {
                showQueueStatus
                && (
                    <TouchableOpacity
                        style={
                            styles.queueButton
                        }
                        activeOpacity={
                            0.9
                        }
                        onPress={
                            openQueueStatus
                        }
                    >
                        <Text
                            style={
                                styles
                                    .queueButtonText
                            }
                        >
                            {
                                t.queueButtonStatus
                            }
                        </Text>
                    </TouchableOpacity>
                )
            }

        </TouchableOpacity>
    );
}


export default function AppointmentsScreen({
                                               navigation,
                                           }) {
    const { t } = useLanguage();

    const [
        appointments,
        setAppointments,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);


    const loadAppointments =
        useCallback(
            async () => {
                try {
                    setLoading(true);

                    const data =
                        await authorizedRequest(
                            "/api/visit/appointments",
                            "GET"
                        );

                    console.log(
                        "APPOINTMENTS DATA:",
                        data
                    );

                    const formattedAppointments =
                        Array.isArray(data)
                            ? data.map(
                                mapAppointment
                            )
                            : [];

                    setAppointments(
                        formattedAppointments
                    );

                } catch (error) {

                    console.error(
                        "APPOINTMENTS ERROR:",
                        error
                    );

                    setAppointments([]);

                } finally {

                    setLoading(false);
                }
            },
            []
        );


    useFocusEffect(
        useCallback(
            () => {
                loadAppointments();
            },
            [
                loadAppointments,
            ]
        )
    );


    const getSectionTitle =
        (section) => {

            if (
                section
                === "today"
            ) {
                return t.today;
            }

            if (!section) {
                return "";
            }

            return (
                section
                    .charAt(0)
                    .toUpperCase()
                +
                section.slice(1)
            );
        };


    return (
        <View
            style={
                styles.container
            }
        >

            <ScrollView
                style={
                    styles.scrollView
                }
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >

                {/* ================= */}
                {/* HEADER */}
                {/* ================= */}

                <View
                    style={
                        styles.header
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        {
                            t.appointmentsTitle
                        }
                    </Text>
                </View>


                <TouchableOpacity
                    style={
                        styles
                            .notificationButton
                    }
                    activeOpacity={1}
                    onPress={() =>
                        navigation.navigate(
                            "Notifications"
                        )
                    }
                >
                    <Ionicons
                        name="notifications"
                        size={27}
                        color="#111111"
                    />
                </TouchableOpacity>


                {/* ================= */}
                {/* APPOINTMENTS */}
                {/* ================= */}

                {
                    loading
                        ? (
                            <View
                                style={
                                    styles.emptyState
                                }
                            >
                                <ActivityIndicator
                                    size="small"
                                />
                            </View>
                        )

                        : appointments.length
                        === 0

                            ? (
                                <EmptyState
                                    title={
                                        t.noActiveAppointments
                                    }
                                    description={
                                        t
                                            .noActiveAppointmentsDescription
                                    }
                                    style={
                                        styles.emptyState
                                    }
                                    titleStyle={
                                        styles.emptyTitle
                                    }
                                    descriptionStyle={
                                        styles
                                            .emptyDescription
                                    }
                                />
                            )

                            : (
                                appointments.map(
                                    (
                                        appointment
                                    ) => (
                                        <View
                                            key={
                                                appointment.id
                                            }
                                            style={
                                                styles.section
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles
                                                        .sectionTitle
                                                }
                                            >
                                                {
                                                    getSectionTitle(
                                                        appointment
                                                            .section
                                                    )
                                                }
                                            </Text>


                                            <AppointmentCard
                                                appointment={
                                                    appointment
                                                }
                                                navigation={
                                                    navigation
                                                }
                                            />

                                        </View>
                                    )
                                )
                            )
                }


                {/* ================= */}
                {/* HISTORY */}
                {/* ================= */}

                <TouchableOpacity
                    style={
                        styles.historyButton
                    }
                    activeOpacity={0.9}
                    onPress={() =>
                        navigation.navigate(
                            "AppointmentsHistory"
                        )
                    }
                >
                    <Text
                        style={
                            styles
                                .historyButtonText
                        }
                    >
                        {
                            t.appointmentsHistory
                        }
                    </Text>
                </TouchableOpacity>


                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>


            <BottomNavigation
                navigation={
                    navigation
                }
                active="appointments"
            />

        </View>
    );
}