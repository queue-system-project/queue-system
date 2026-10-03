import { StyleSheet } from "react-native";

export const appointmentsHistoryStyles = StyleSheet.create({
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
        marginTop: 35,
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
        paddingTop: 15,
    },

    section: {
        marginBottom: 43,
    },

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 24,
    },

    // =========================
    // Card
    // =========================

    card: {
        width: "100%",

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 22,

        paddingHorizontal: 16,
        paddingTop: 22,
        paddingBottom: 20,
    },

    // =========================
    // Clinic
    // =========================

    clinicRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    clinicImage: {
        width: 62,
        height: 62,

        borderRadius: 31,

        marginRight: 12,
    },

    clinicInfo: {
        flex: 1,
        minWidth: 0,
    },

    tagsRow: {
        flexDirection: "row",
        alignItems: "center",

        marginBottom: 7,
    },

    categoryTag: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 8,
        paddingVertical: 4,

        borderRadius: 10,

        marginRight: 5,
    },

    categoryText: {
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Medium",
    },

    ratingTag: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFF5D8",

        paddingHorizontal: 7,
        paddingVertical: 4,

        borderRadius: 10,
    },

    star: {
        fontSize: 12,
        color: "#FFBC18",

        marginRight: 3,
    },

    ratingText: {
        fontSize: 12,
        color: "#C58D00",
        fontFamily: "Montserrat-Medium",
    },

    clinicName: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 3,
    },

    clinicAddress: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Divider
    // =========================

    divider: {
        height: 1,
        backgroundColor: "#EEEEEE",

        marginTop: 26,
        marginBottom: 26,
    },

    // =========================
    // Service
    // =========================

    appointmentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    serviceInfo: {
        width: 140,
        marginRight: 8,
    },

    serviceName: {
        fontSize: 15,
        lineHeight: 19,
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
        backgroundColor: "#F4F4F4",

        paddingHorizontal: 10,
        paddingVertical: 8,

        borderRadius: 14,

        marginRight: 6,

        flexShrink: 0,
    },

    dateText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    timeBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#F4F4F4",

        paddingHorizontal: 9,
        paddingVertical: 8,

        borderRadius: 14,

        flexShrink: 0,
    },

    timeText: {
        marginLeft: 3,

        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // More
    // =========================

    bottomSpace: {
        height: 100,
    },

    rateButton: {
        height: 38,
        marginTop: 28,
        borderRadius: 22,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    rateButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
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
});