import { StyleSheet } from "react-native";

export const notificationsStyles = StyleSheet.create({
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

    backButton: {
        position: "absolute",
        left: 15,
        top: 52,

        width: 40,
        height: 40,

        alignItems: "flex-start",
        justifyContent: "center",
    },

    headerTitle: {
        marginTop: 35,
        fontSize: 20,
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
        paddingHorizontal: 18,
        paddingBottom: 110,
    },

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginTop: 4,
        marginBottom: 27,
    },

    lastWeekTitle: {
        marginTop: 36,
    },

    // =========================
    // Notification card
    // =========================

    card: {
        width: "100%",
        minHeight: 105,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 22,

        paddingHorizontal: 20,
        paddingVertical: 17,

        marginBottom: 19,

        justifyContent: "center",
    },

    cardContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 43,
        alignItems: "flex-start",
        justifyContent: "center",
    },

    notificationInfo: {
        flex: 1,
        minWidth: 0,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: 7,
    },

    cardTitle: {
        flex: 1,

        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",

        marginRight: 8,
    },

    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
    },

    cardText: {
        flex: 1,

        fontSize: 12,
        lineHeight: 17,

        color: "#333333",
        fontFamily: "Montserrat-Regular",

        paddingRight: 8,
    },

    highlight: {
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    time: {
        fontSize: 11,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Purple / Your turn
    // =========================

    turnCard: {
        backgroundColor: "#5657C4",
        borderColor: "#5657C4",
    },

    whiteText: {
        color: "#FFFFFF",
    },

    turnDescription: {
        color: "#F1F1FF",
    },

    turnHighlight: {
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    turnTime: {
        color: "#F1F1FF",
    },

    // =========================
    // Yellow / Spot available
    // =========================

    availableCard: {
        backgroundColor: "#FFF1A8",
        borderColor: "#E8D477",
    },

    // =========================
    // Green / Last chance
    // =========================

    lastChanceCard: {
        backgroundColor: "#BDF1C5",
        borderColor: "#8DDA99",
    },

    // =========================
    // Completed
    // =========================

    completedCard: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E1E1E1",
    },

    completedText: {
        color: "#999999",
    },

    // =========================
    // Timer
    // =========================

    timerBadge: {
        minWidth: 80,
        height: 31,

        paddingHorizontal: 12,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#FFFFFF",

        borderRadius: 18,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,

        elevation: 2,
    },

    timerText: {
        marginLeft: 4,

        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    bottomSpace: {
        height: 20,
    },

    // =========================
// Read notification
// =========================

    readTitle: {
        color: "#8F8F8F",
        opacity: 0.55,
    },

    readText: {
        color: "#AAAAAA",
    },

    readTime: {
        color: "#B0B0B0",
    },


    readHighlight: {
        color: "#9D9DC8",
        fontFamily: "Montserrat-Medium",
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