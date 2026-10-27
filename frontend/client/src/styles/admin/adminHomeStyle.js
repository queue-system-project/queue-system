import { StyleSheet } from "react-native";

export const adminHomeStyles = StyleSheet.create({
    // =========================
    // Base
    // =========================

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        paddingBottom: 130,
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 175,
        backgroundColor: "#5657C4",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    logoContainer: {
        alignItems: "center",
        paddingTop: 45,
    },

    logo: {
        fontSize: 39,
        fontFamily: "Nunito-ExtraBold",
        textAlign: "center",
    },

    logoGreen: {
        color: "#3BDB3D",
    },

    logoWhite: {
        color: "#FFFFFF",
    },

    notificationButton: {
        position: "absolute",
        top: 54,
        right: 34,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },

    // =========================
    // Institution card
    // =========================

    institutionCard: {
        flexDirection: "row",
        alignItems: "center",

        marginHorizontal: 23,
        marginTop: -55,
        paddingVertical: 20,
        paddingHorizontal: 14,

        backgroundColor: "#FFFFFF",
        borderRadius: 24,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },

    institutionPhoto: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#EEEEF9",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    institutionPhotoImage: {
        width: "100%",
        height: "100%",
    },

    institutionInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 6,
    },

    institutionName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    institutionAddress: {
        marginTop: 6,
        fontSize: 10,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    dateContainer: {
        alignItems: "center",
    },

    dateBadge: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        backgroundColor: "#5657C4",
        borderRadius: 18,
    },

    dateBadgeText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Medium",
    },

    todayText: {
        marginTop: 10,
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Statistics
    // =========================

    sectionTitle: {
        marginTop: 45,
        marginHorizontal: 23,
        fontSize: 19,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    groupLabel: {
        marginTop: 22,
        marginBottom: 12,
        marginHorizontal: 23,
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Medium",
    },

    statsRow: {
        flexDirection: "row",
        marginHorizontal: 23,
        gap: 14,
    },

    statsRowSpaced: {
        marginTop: 14,
    },

    statCard: {
        flex: 1,
        minHeight: 90,
        paddingVertical: 18,
        paddingHorizontal: 20,

        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 22,
    },

    statLabel: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    statValue: {
        marginTop: 12,
        fontSize: 21,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Charts
    // =========================

    chartHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 45,
        marginHorizontal: 23,
    },

    chartTitle: {
        fontSize: 19,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    chartFilter: {
        fontSize: 12,
        color: "#858585",
        fontFamily: "Montserrat-Medium",
    },

    chartContainer: {
        marginTop: 18,
        marginHorizontal: 23,
    },

    chartAxisRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },

    chartAxisLabel: {
        fontSize: 9,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    barsRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },

    barColumn: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 2,
    },

    barValue: {
        marginBottom: 6,
        fontSize: 12,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    barValueTop: {
        color: "#C0392B",
    },

    barName: {
        marginTop: 8,
        fontSize: 9,
        lineHeight: 12,
        color: "#111111",
        textAlign: "center",
        fontFamily: "Montserrat-Regular",
    },
});
