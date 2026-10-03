import { StyleSheet } from "react-native";

export const institutionDetailsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    scrollView: {
        flex: 1,
    },

    content: {
        paddingBottom: 110,
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
    // Institution
    // =========================

    institution: {
        paddingHorizontal: 23,
        marginTop: 10,
        marginBottom: 40,
        flexDirection: "row",
        alignItems: "center",
    },

    institutionImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 22,
    },

    institutionInfo: {
        flex: 1,
    },

    badges: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },

    categoryBadge: {
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        marginRight: 7,
    },

    categoryText: {
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF7D7",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 14,
    },

    ratingText: {
        marginLeft: 3,
        fontSize: 12,
        color: "#DCA900",
        fontFamily: "Montserrat-Medium",
    },

    institutionName: {
        fontSize: 20,
        lineHeight: 25,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        marginBottom: 5,
    },

    address: {
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Tabs
    // =========================

    tabs: {
        height: 58,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    tab: {
        width: "50%",
        alignItems: "center",
        justifyContent: "center",
    },

    activeTab: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderBottomColor: "#FFFFFF",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },

    tabText: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    activeTabText: {
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Info
    // =========================

    tabContent: {
        paddingHorizontal: 23,
        paddingTop: 28,
    },

    description: {
        fontSize: 12,
        lineHeight: 19,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        marginBottom: 23,
    },

    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },

    contactText: {
        marginLeft: 10,
        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },

    sectionTitle: {
        marginTop: 13,
        marginBottom: 13,
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

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

    closed: {
        width: 82,

        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "right",
    },

    holiday: {
        width: 82,

        fontSize: 12,
        color: "#E21D25",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "right",
    },

    // =========================
    // Map
    // =========================

    mapContainer: {
        width: "100%",
        height: 220,
        marginTop: 24,
        borderRadius: 20,
        overflow: "hidden",
    },

    map: {
        width: "100%",
        height: "100%",
    },

    // =========================
    // Services
    // =========================

    servicesContent: {
        paddingHorizontal: 23,
        paddingTop: 24,
    },

    search: {
        width: "100%",
        height: 48,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 17,
        marginBottom: 17,
    },

    searchInput: {
        flex: 1,
        marginLeft: 10,
        paddingVertical: 0,
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    serviceCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 22,
        paddingHorizontal: 22,
        paddingVertical: 21,
        marginBottom: 17,
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
        marginBottom: 19,
    },

    serviceDescription: {
        fontSize: 12,
        lineHeight: 17,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        marginBottom: 18,
    },

    queueRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 17,
    },

    serviceStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        marginBottom: 16,
    },

    spotsBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 18,
    },

    queueBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#FFF0A6",
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 18,
    },

    waitingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 18,
    },

    waitingText: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Medium",
    },

    serviceStatText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    yellowQueue: {
        backgroundColor: "#FFF0A6",
    },

    greenQueue: {
        backgroundColor: "#D5F5D8",
    },

    queueText: {
        marginLeft: 4,
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    joinButton: {
        width: "100%",
        height: 42,
        borderRadius: 22,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    joinButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    bottomSpace: {
        height: 20,
    },
    noServices: {
        marginTop: 25,
        textAlign: "center",
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
    },


});