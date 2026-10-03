import { StyleSheet } from "react-native";

export const employeeDetailsStyles = StyleSheet.create({
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
    },

    backButton: {
        position: "absolute",
        left: 15,
        top: 52,

        width: 40,
        height: 40,

        alignItems: "flex-start",
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

    // =========================
    // Employee
    // =========================

    employeeHeader: {
        alignItems: "center",
        marginBottom: 27,
    },


    roomBadge: {
        marginTop: -7,

        backgroundColor: "#F5F5F5",

        paddingHorizontal: 14,
        paddingVertical: 7,

        borderRadius: 16,
    },

    roomNumber: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    roomLabel: {
        marginTop: 4,

        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    employeeName: {
        marginTop: 12,

        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Contact
    // =========================

    contacts: {
        marginBottom: 29,
    },

    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },

    contactText: {
        marginLeft: 7,

        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Sections
    // =========================

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 20,
    },

    // =========================
    // Working hours
    // =========================

    workingHours: {
        marginBottom: 31,
    },

    workingRow: {
        minHeight: 24,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    day: {
        width: 100,

        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    timeGroup: {
        width: 82,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    timeLabel: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    time: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    dayOff: {
        width: "100%",
        textAlign: "right",

        fontSize: 12,
        lineHeight: 18,

        color: "#111111",

        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Institution
    // =========================

    institutionCard: {
        width: "100%",
        minHeight: 105,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        flexDirection: "row",
        alignItems: "center",

        marginBottom: 32,
    },

    institutionImage: {
        width: 62,
        height: 62,
        borderRadius: 31,

        marginRight: 12,
    },

    institutionInfo: {
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

    institutionName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 3,
    },

    institutionAddress: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Services
    // =========================

    serviceCard: {
        width: "100%",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginBottom: 14,
    },

    serviceName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",

        marginBottom: 4,
    },

    serviceDuration: {
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",

        marginBottom: 16,
    },

    serviceDescription: {
        fontSize: 12,
        lineHeight: 15,

        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    bottomSpace: {
        height: 40,
    },

    employeeAvatar: {
        width: 82,
        height: 82,

        borderRadius: 41,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#FFFFFF",

        overflow: "hidden",

        marginBottom: 12,
    },

    employeeImage: {
        width: "100%",
        height: "100%",
        borderRadius: 41,
    },

    employeeAvatarIcon: {
        alignItems: "center",
        justifyContent: "center",
    },
});