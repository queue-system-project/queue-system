import { StyleSheet } from "react-native";

export const searchStyles = StyleSheet.create({
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
        fontSize: 20,
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
    // Search
    // =========================

    searchSection: {
        backgroundColor: "#FFFFFF",
    },

    searchWrapper: {
        height: 64,

        marginHorizontal: 23,

        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 27,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 20,

        backgroundColor: "#FFFFFF",
    },
    searchInput: {
        flex: 1,
        height: "100%",

        marginLeft: 8,

        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",

        paddingVertical: 0,
    },

    // =========================
    // Categories
    // =========================

    categoriesScroll: {
        flexGrow: 0,
    },

    categories: {
        paddingLeft: 25,
        paddingRight: 10,
        paddingTop: 15,
        paddingBottom: 15,
    },

    categoryButton: {
        marginRight: 22,
        alignItems: "flex-start",
    },

    categoryText: {
        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },

    categoryTextActive: {
        color: "#5657C4",
        fontFamily: "Montserrat-Medium",
    },

    categoryUnderline: {
        width: "100%",
        height: 2,

        marginTop: 3,

        backgroundColor: "#5657C4",
        borderRadius: 2,
    },

    // =========================
    // Results header
    // =========================

    resultsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 23,

        marginTop: 20,
        marginBottom: 14,
    },

    resultsTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    resultsCount: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 15,
        paddingVertical: 10,

        borderRadius: 20,
    },

    resultsCountText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Results
    // =========================

    results: {
        flex: 1,
    },

    resultsContent: {
        paddingHorizontal: 23,
    },

    // =========================
    // Clinic card
    // =========================

    clinicCard: {
        width: "100%",
        minHeight: 105,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginBottom: 14,
    },

    clinicCardExpanded: {
        paddingBottom: 15,
    },

    clinicTop: {
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

    categoryTagText: {
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
        color: "#FFBC18",
        fontSize: 12,
        marginRight: 3,
    },

    ratingText: {
        fontSize: 12,
        color: "#C58D00",
        fontFamily: "Montserrat-Medium",
    },

    clinicName: {
        fontSize: 15,
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
    // Bottom navigation
    // =========================

    bottomSpace: {
        height: 100,
    },


    // =========================
// Service
// =========================

    serviceContainer: {
        marginTop: 26,

        paddingTop: 25,

        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },

    serviceName: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",

        marginBottom: 5,
    },

    serviceDuration: {
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",

        marginBottom: 21,
    },

    serviceDescription: {
        fontSize: 12,
        lineHeight: 18,

        color: "#333333",
        fontFamily: "Montserrat-Regular",

        marginBottom: 18,
    },

// =========================
// Queue info
// =========================

    queueInfo: {
        flexDirection: "row",
        alignItems: "center",

        marginBottom: 17,
    },

    spotsBadge: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 12,
        paddingVertical: 9,

        borderRadius: 18,

        marginRight: 8,
    },

    spotsText: {
        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    queueBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFF0A6",

        paddingHorizontal: 12,
        paddingVertical: 9,

        borderRadius: 18,

        marginRight: 8,
    },

    queueText: {
        marginLeft: 4,

        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    waitingBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFDCDC",

        paddingHorizontal: 12,
        paddingVertical: 9,

        borderRadius: 18,
    },

    waitingText: {
        marginLeft: 4,

        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

// =========================
// Join queue
// =========================

    joinButton: {
        width: "100%",
        height: 46,

        backgroundColor: "#5657C4",

        borderRadius: 23,

        alignItems: "center",
        justifyContent: "center",
        marginTop: 10
    },

    joinButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    scrollContent: {
        paddingTop: 0,
    },

    emptyState: {
        minHeight: 260,
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