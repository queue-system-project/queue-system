import { StyleSheet } from "react-native";

// Style panelu pracownika. Header, karty statystyk i karty kolejki
// pochodzą z adminHomeStyle / adminScreensStyle; tu tylko elementy specyficzne.
export const employeePanelStyles = StyleSheet.create({
    // =========================
    // Profile card (home)
    // =========================

    profileName: {
        flex: 1,
        marginLeft: 14,
        marginRight: 6,
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Daily statistic banner
    // =========================

    statisticBanner: {
        marginTop: 34,
        marginHorizontal: 23,
        paddingTop: 30,
        paddingBottom: 26,
        paddingHorizontal: 16,
        backgroundColor: "#5657C4",
        borderRadius: 24,
        alignItems: "center",
    },

    statisticBannerTitle: {
        fontSize: 17,
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: "Montserrat-SemiBold",
    },

    statisticBannerText: {
        marginTop: 20,
        marginHorizontal: 20,
        fontSize: 12,
        lineHeight: 18,
        color: "#F1F1FF",
        textAlign: "center",
        fontFamily: "Montserrat-Regular",
    },

    statisticBannerButton: {
        alignSelf: "stretch",
        height: 36,
        marginTop: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },

    statisticBannerButtonText: {
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Empty / shift ended
    // =========================

    emptyBox: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 23,
    },

    emptyBoxCentered: {
        flex: 1,
        justifyContent: "center",
    },

    emptyTitle: {
        fontSize: 16,
        color: "#111111",
        textAlign: "center",
        fontFamily: "Montserrat-SemiBold",
    },

    emptyText: {
        marginTop: 10,
        fontSize: 12,
        lineHeight: 18,
        color: "#111111",
        textAlign: "center",
        fontFamily: "Montserrat-Regular",
    },

    homeSectionTitle: {
        marginTop: 40,
        marginHorizontal: 23,
        fontSize: 17,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Queue load chart
    // =========================

    chart: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginTop: 22,
        marginHorizontal: 23,
    },

    chartColumn: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 2,
    },

    chartValue: {
        marginBottom: 6,
        fontSize: 10,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    chartHour: {
        marginTop: 6,
        fontSize: 8,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Buttons
    // =========================

    outlineButton: {
        height: 46,
        marginTop: 26,
        marginHorizontal: 23,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
    },

    outlineButtonText: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    primaryButton: {
        alignSelf: "stretch",
        height: 46,
        marginTop: 40,
        backgroundColor: "#5657C4",
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
    },

    primaryButtonText: {
        fontSize: 15,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Queue screen
    // =========================

    queueContent: {
        flexGrow: 1,
        paddingHorizontal: 23,
        paddingBottom: 130,
    },

    searchBar: {
        marginTop: 34,
    },

    queueSectionTitle: {
        marginTop: 30,
        fontSize: 17,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    cardButton: {
        height: 34,
        marginTop: 20,
        backgroundColor: "#5657C4",
        borderRadius: 17,
        justifyContent: "center",
        alignItems: "center",
    },

    cardButtonText: {
        fontSize: 13,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },
});
