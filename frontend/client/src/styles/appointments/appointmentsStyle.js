import { StyleSheet } from "react-native";

export const appointmentsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 105,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },

    title: {
        fontSize: 24,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        marginTop: 22,
    },

    notificationButton: {
        position: "absolute",
        right: 32,
        top: 52,

        width: 36,
        height: 36,

        alignItems: "center",
        justifyContent: "center",
    },

    // =========================
    // Content
    // =========================

    scrollView: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 23,
        paddingTop: 5,
    },

    section: {
        marginBottom: 43,
    },

    sectionTitle: {
        marginBottom: 24,

        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Appointment card
    // =========================

    appointmentCard: {
        width: "100%",

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 22,

        paddingHorizontal: 16,
        paddingTop: 25,
        paddingBottom: 20,
    },

    // =========================
    // Service
    // =========================

    serviceRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    serviceInfo: {
        flex: 1,
        marginRight: 10,
    },

    serviceName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",

        marginBottom: 5,
    },

    duration: {
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Date + time
    // =========================

    dateTimeRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    dateBadge: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 12,
        paddingVertical: 9,

        borderRadius: 18,

        marginRight: 7,
    },

    dateText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    timeBadge: {
        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 10,
        paddingVertical: 9,

        borderRadius: 18,
    },

    timeBadgeActive: {
        backgroundColor: "#DDF7DF",
    },

    timeBadgeUpcoming: {
        backgroundColor: "#E5E3FF",
    },

    timeText: {
        marginLeft: 3,

        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Divider
    // =========================

    divider: {
        height: 1,

        backgroundColor: "#EEEEEE",

        marginTop: 27,
        marginBottom: 27,
    },

    // =========================
    // Doctor
    // =========================

    doctorRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: 25,
    },

    doctorInfo: {
        flexDirection: "row",
        alignItems: "center",

        flex: 1,
    },

    doctorName: {
        flex: 1,

        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
        marginLeft: 14,
    },

    // =========================
    // Room
    // =========================

    roomInfo: {
        alignItems: "center",
    },

    roomBadge: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 15,
        paddingVertical: 9,

        borderRadius: 18,

        marginBottom: 5,
    },

    roomNumber: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    roomLabel: {
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Buttons
    // =========================

    queueButton: {
        width: "100%",
        height: 38,

        backgroundColor: "#5657C4",

        borderRadius: 20,

        alignItems: "center",
        justifyContent: "center",
    },

    queueButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // History
    // =========================

    historyButton: {
        width: "100%",
        height: 48,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 24,

        alignItems: "center",
        justifyContent: "center",

        marginTop: 4,
    },

    historyButtonText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    bottomSpace: {
        height: 110,
    },

    emptyState: {
        minHeight: 560,
        paddingHorizontal: 23,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
    },

    emptyDescription: {
        width: 270,
        marginTop: 10,
        fontSize: 12,
        lineHeight: 15,
        color: "#444444",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },


    doctorImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    doctorAvatar: {
        width: 50,
        height: 50,

        borderRadius: 25,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",
    },
});