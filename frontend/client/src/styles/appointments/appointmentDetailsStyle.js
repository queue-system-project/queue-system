import { StyleSheet } from "react-native";

export const appointmentDetailsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 90,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },

    backButton: {
        position: "absolute",
        left: 15,
        top: 52,

        width: 40,
        height: 40,

        justifyContent: "center",
        alignItems: "flex-start",
    },

    title: {
        marginTop: 35,

        fontSize: 24,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
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

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 24,
    },

    // =========================
    // General details
    // =========================

    details: {
        marginBottom: 34,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
    },

    detailLabel: {
        width: 92,
        paddingRight: 10,

        fontSize: 12,
        lineHeight: 18,
        color: "#555555",
        fontFamily: "Montserrat-Regular",

        flexShrink: 0,
        flexWrap: "wrap",
    },

    detailValue: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,

        fontSize: 12,
        lineHeight: 18,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },


    // =========================
    // Client
    // =========================

    clientHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },

    clientAvatar: {
        width: 58,
        height: 58,

        borderRadius: 29,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 17,
    },

    clientName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Employee
    // =========================

    employeeCard: {
        width: "100%",
        minHeight: 105,

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: 37,
    },

    employeeInfo: {
        flexDirection: "row",
        alignItems: "center",

        flex: 1,
    },

    employeeImage: {
        width: 62,
        height: 62,

        borderRadius: 31,

        marginRight: 14,
    },

    employeeName: {
        flex: 1,

        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

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
    // Location
    // =========================

    locationCard: {
        width: "100%",
        minHeight: 105,

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,

        backgroundColor: "#FFFFFF",

        paddingHorizontal: 16,
        paddingVertical: 15,

        flexDirection: "row",
        alignItems: "center",

        marginBottom: 41,
    },

    locationImage: {
        width: 62,
        height: 62,

        borderRadius: 31,

        marginRight: 12,
    },

    locationInfo: {
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

    locationName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 3,
    },

    locationAddress: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Cancel
    // =========================

    cancelButton: {
        width: "100%",
        height: 42,

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 22,

        backgroundColor: "#FFFFFF",

        alignItems: "center",
        justifyContent: "center",
    },

    cancelButtonText: {
        fontSize: 14,
        color: "#E21D25",
        fontFamily: "Montserrat-SemiBold",
    },

    bottomSpace: {
        height: 50,
    },

    // =========================
// Cancel modal
// =========================

    modalOverlay: {
        flex: 1,

        backgroundColor: "rgba(0, 0, 0, 0.30)",

        justifyContent: "flex-end",

        paddingHorizontal: 26,
        paddingVertical: 350,
    },

    modalContent: {
        width: "100%",

        backgroundColor: "#FFFFFF",

        borderRadius: 20,

        paddingHorizontal: 22,
        paddingTop: 31,
        paddingBottom: 29,
    },

    modalTitle: {
        fontSize: 16,
        lineHeight: 21,

        color: "#111111",
        fontFamily: "Montserrat-Medium",

        textAlign: "center",

        marginBottom: 32,
    },

    modalBackButton: {
        width: "100%",
        height: 38,

        backgroundColor: "#5657C4",

        borderRadius: 20,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 9,
    },

    modalBackText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    modalCancelButton: {
        width: "100%",
        height: 38,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        alignItems: "center",
        justifyContent: "center",
    },

    modalCancelText: {
        fontSize: 14,
        color: "#E21D25",
        fontFamily: "Montserrat-SemiBold",
    },
});