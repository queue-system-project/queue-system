import React, { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
    appointmentDetailsStyles as styles,
} from "../../styles/appointments/appointmentDetailsStyle";

import {
    useLanguage,
} from "../../context/LanguageContext";

import {
    useMessage,
} from "../../context/MessageContext";

import {
    authorizedRequest,
} from "../../api/authorizedRequest";


export default function AppointmentDetailsScreen({
                                                     navigation,
                                                     route,
                                                 }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const [
        cancelling,
        setCancelling,
    ] = useState(false);

    const [
        cancelModalVisible,
        setCancelModalVisible,
    ] = useState(false);


    const appointment =
        route?.params?.appointment ?? null;


    if (!appointment) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            navigation.goBack()
                        }
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 24,
                    }}
                >
                    <Text>
                        Appointment not found
                    </Text>
                </View>
            </View>
        );
    }


    const client =
        appointment.client ?? null;

    const employee =
        appointment.employee ?? null;

    const institution =
        appointment.institution ?? null;

    const category =
        institution?.category
        ?? appointment.institutionCategory
        ?? null;


    const clientName =
        appointment.clientName
        || [
            client?.first_name,
            client?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
        || "-";


    const employeeName =
        appointment.doctor
        || [
            employee?.first_name,
            employee?.last_name,
        ]
            .filter(Boolean)
            .join(" ")
        || "-";


    const serviceDescription =
        appointment.serviceDescription
        ?? appointment.serviceData?.description
        ?? null;


    const institutionRating =
        institution?.rating
        ?? appointment.institutionRating
        ?? null;


    const institutionPhoto =
        institution?.photo_url
        ?? appointment.institutionPhoto
        ?? null;


    const openEmployee = () => {
        if (!employee) {
            return;
        }

        navigation.navigate(
            "EmployeeDetails",
            {
                employee,
                employeeId:
                    appointment.employeeId
                    ?? employee.id,
            }
        );
    };


    const openInstitution = () => {
        if (!institution) {
            return;
        }

        navigation.navigate(
            "InstitutionDetails",
            {
                institution: {
                    ...institution,

                    category:
                        category?.name
                        ?? null,

                    categoryData:
                    category,

                    rating:
                    institutionRating,

                    image:
                    institutionPhoto,
                },
            }
        );
    };

    const clientPhone =
        appointment.clientPhone
        ?? client?.phone
        ?? null;

    const clientEmail =
        appointment.clientEmail
        ?? client?.email
        ?? null;

    const clientNote =
        appointment.client_note
        ?? appointment.clientNote
        ?? null;

    const visibleClientNote =
        typeof clientNote === "string"
        && clientNote.trim()
            ? clientNote.trim()
            : null;

    const canCancel = [
        "waiting",
        "confirmed",
    ].includes(
        appointment.status
    );


    const cancelAppointment =
        async () => {

            if (cancelling) {
                return;
            }

            const userId =
                appointment.clientId
                ?? client?.id
                ?? null;

            if (
                !userId
                || !appointment.id
            ) {
                showMessage(
                    "Could not cancel appointment",
                    "error"
                );

                return;
            }


            try {
                setCancelling(true);

                const response =
                    await authorizedRequest(
                        "/api/queue/cancel",
                        "POST",
                        {
                            user_id:
                            userId,

                            queue_entry_id:
                            appointment.id,
                        }
                    );


                console.log(
                    "CANCEL APPOINTMENT:",
                    response
                );


                setCancelModalVisible(
                    false
                );


                showMessage(
                    "Appointment cancelled",
                    "success"
                );


                navigation.goBack();

            } catch (error) {

                console.error(
                    "CANCEL APPOINTMENT ERROR:",
                    error
                );


                showMessage(
                    error?.message
                    || "Could not cancel appointment",
                    "error"
                );

            } finally {

                setCancelling(false);
            }
        };


    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        navigation.goBack()
                    }
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color="#5657C4"
                    />
                </TouchableOpacity>
            </View>


            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
            >

                {/* ====================== */}
                {/* SERVICE */}
                {/* ====================== */}

                <Text style={styles.sectionTitle}>
                    {t.service}
                </Text>


                <View style={styles.details}>

                    {/* NAME */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.name}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {
                                appointment.service
                                ?? "-"
                            }
                        </Text>
                    </View>


                    {/* DESCRIPTION */}
                    {serviceDescription && (
                        <View
                            style={
                                styles.detailRow
                            }
                        >
                            <Text
                                style={
                                    styles.detailLabel
                                }
                            >
                                {t.description}
                            </Text>

                            <Text
                                style={
                                    styles.detailValue
                                }
                            >
                                {
                                    serviceDescription
                                }
                            </Text>
                        </View>
                    )}


                    {/* DURATION */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.duration}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {
                                appointment.duration
                                ?? "-"
                            }
                        </Text>
                    </View>


                    {/* DATE */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.date ?? "Date"}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {
                                appointment.date
                                ?? "-"
                            }
                        </Text>
                    </View>


                    {/* ESTIMATED TIME */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.estimatedTimeLabel}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {
                                appointment
                                    .estimatedTime
                                ||
                                appointment.time
                                ||
                                "-"
                            }
                        </Text>
                    </View>


                    {/* ROOM */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.roomLabel}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {
                                appointment.room
                                ?? "-"
                            }
                        </Text>
                    </View>

                </View>


                {/* ====================== */}
                {/* CLIENT */}
                {/* ====================== */}

                <Text style={styles.sectionTitle}>
                    {t.client}
                </Text>


                <View style={styles.clientHeader}>

                    {appointment.clientImage ? (
                        <Image
                            source={{
                                uri:
                                appointment
                                    .clientImage,
                            }}
                            style={
                                styles.employeeImage
                            }
                        />
                    ) : (
                        <View
                            style={
                                styles.clientAvatar
                            }
                        >
                            <Ionicons
                                name="person-outline"
                                size={31}
                                color="#111111"
                            />
                        </View>
                    )}


                    <Text
                        style={
                            styles.clientName
                        }
                    >
                        {clientName}
                    </Text>

                </View>


                <View style={styles.details}>

                    {/* CLIENT NAME */}
                    <View style={styles.detailRow}>
                        <Text
                            style={
                                styles.detailLabel
                            }
                        >
                            {t.name}
                        </Text>

                        <Text
                            style={
                                styles.detailValue
                            }
                        >
                            {clientName}
                        </Text>
                    </View>


                    {/* PHONE */}
                    {clientPhone && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {t.phoneNumberTitle}:
                            </Text>

                            <Text style={styles.detailValue}>
                                {clientPhone}
                            </Text>
                        </View>
                    )}


                    {/* EMAIL */}
                    {clientEmail && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {t.email}:
                            </Text>

                            <Text style={styles.detailValue}>
                                {clientEmail}
                            </Text>
                        </View>
                    )}

                    {/* NOTE */}
                    {visibleClientNote && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                                {t.note ?? "Note"}:
                            </Text>

                            <Text style={styles.detailValue}>
                                {visibleClientNote}
                            </Text>
                        </View>
                    )}

                </View>


                {/* ====================== */}
                {/* EMPLOYEE */}
                {/* ====================== */}

                <Text style={styles.sectionTitle}>
                    {t.employee}
                </Text>


                <TouchableOpacity
                    style={styles.employeeCard}
                    activeOpacity={0.9}
                    onPress={openEmployee}
                    disabled={!employee}
                >

                    <View style={styles.employeeInfo}>

                        {appointment.image ? (
                            <Image
                                source={{
                                    uri:
                                    appointment
                                        .image,
                                }}
                                style={
                                    styles.employeeImage
                                }
                            />
                        ) : (
                            <View
                                style={
                                    styles.clientAvatar
                                }
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={31}
                                    color="#111111"
                                />
                            </View>
                        )}


                        <Text
                            style={
                                styles.employeeName
                            }
                        >
                            {employeeName}
                        </Text>

                    </View>


                    <View style={styles.roomInfo}>

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
                                    ?? employee?.room
                                    ?? "-"
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

                </TouchableOpacity>


                {/* ====================== */}
                {/* LOCATION */}
                {/* ====================== */}

                <Text style={styles.sectionTitle}>
                    {t.location}
                </Text>


                <TouchableOpacity
                    style={styles.locationCard}
                    activeOpacity={0.85}
                    onPress={openInstitution}
                    disabled={!institution}
                >

                    {institutionPhoto ? (
                        <Image
                            source={{
                                uri:
                                institutionPhoto,
                            }}
                            style={
                                styles.locationImage
                            }
                        />
                    ) : (
                        <View
                            style={[
                                styles.locationImage,
                                {
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                },
                            ]}
                        >
                            <Ionicons
                                name="business-outline"
                                size={30}
                                color="#777777"
                            />
                        </View>
                    )}


                    <View
                        style={
                            styles.locationInfo
                        }
                    >

                        {/* CATEGORY + RATING */}
                        <View
                            style={
                                styles.tagsRow
                            }
                        >

                            {category?.name && (
                                <View
                                    style={
                                        styles
                                            .categoryTag
                                    }
                                >
                                    <Text
                                        style={
                                            styles
                                                .categoryText
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </Text>
                                </View>
                            )}


                            {institutionRating != null && (
                                <View
                                    style={
                                        styles
                                            .ratingTag
                                    }
                                >
                                    <Text
                                        style={
                                            styles.star
                                        }
                                    >
                                        ★
                                    </Text>

                                    <Text
                                        style={
                                            styles
                                                .ratingText
                                        }
                                    >
                                        {
                                            institutionRating
                                        }
                                    </Text>
                                </View>
                            )}

                        </View>


                        {/* INSTITUTION NAME */}
                        <Text
                            style={
                                styles.locationName
                            }
                        >
                            {
                                institution?.name
                                ?? appointment
                                    .institutionName
                                ?? "-"
                            }
                        </Text>


                        {/* ADDRESS */}
                        <Text
                            style={
                                styles
                                    .locationAddress
                            }
                        >
                            {
                                institution?.address
                                ?? appointment
                                    .institutionAddress
                                ?? "-"
                            }
                        </Text>

                    </View>

                </TouchableOpacity>


                {/* ====================== */}
                {/* CANCEL */}
                {/* ====================== */}

                {canCancel && (
                    <TouchableOpacity
                        style={
                            styles.cancelButton
                        }
                        activeOpacity={0.9}
                        onPress={() =>
                            setCancelModalVisible(
                                true
                            )
                        }
                    >
                        <Text
                            style={
                                styles.cancelButtonText
                            }
                        >
                            {t.cancelAppointment}
                        </Text>
                    </TouchableOpacity>
                )}


                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>


            {/* ====================== */}
            {/* CANCEL MODAL */}
            {/* ====================== */}

            <Modal
                visible={
                    cancelModalVisible
                }
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setCancelModalVisible(
                        false
                    )
                }
            >

                <View
                    style={
                        styles.modalOverlay
                    }
                >

                    <View
                        style={
                            styles.modalContent
                        }
                    >

                        <Text
                            style={
                                styles.modalTitle
                            }
                        >
                            {
                                t.modalTitleAppointment
                            }
                        </Text>


                        <TouchableOpacity
                            style={
                                styles
                                    .modalBackButton
                            }
                            activeOpacity={0.9}
                            onPress={() =>
                                setCancelModalVisible(
                                    false
                                )
                            }
                        >
                            <Text
                                style={
                                    styles
                                        .modalBackText
                                }
                            >
                                {t.back}
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={[
                                styles.modalCancelButton,

                                cancelling && {
                                    opacity: 0.6,
                                },
                            ]}
                            activeOpacity={0.9}
                            disabled={cancelling}
                            onPress={
                                cancelAppointment
                            }
                        >
                            <Text
                                style={
                                    styles.modalCancelText
                                }
                            >
                                {
                                    cancelling
                                        ? "Cancelling..."
                                        : t.cancelAppointment
                                }
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>

            </Modal>

        </View>
    );
}