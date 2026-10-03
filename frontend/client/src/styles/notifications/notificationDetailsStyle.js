import { StyleSheet } from "react-native";

export const notificationDetailsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 105,
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

    headerTitle: {
        marginTop: 35,

        fontSize: 20,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    scrollView: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 23,
        paddingTop: 25,
        paddingBottom: 40,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",

        marginBottom: 20,
    },

    title: {
        flex: 1,

        fontSize: 15,
        lineHeight: 25,

        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginRight: 15,
    },

    time: {
        marginTop: 4,

        fontSize: 11,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
    },

    description: {
        fontSize: 12,
        lineHeight: 21,

        color: "#333333",
        fontFamily: "Montserrat-Regular",

        marginBottom: 30,
    },

    detailsSection: {
        marginTop: 4,
    },

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 20,
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",

        marginBottom: 14,
    },

    detailLabel: {
        width: 155,

        fontSize: 12,
        lineHeight: 17,

        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    detailValue: {
        flex: 1,

        fontSize: 12,
        lineHeight: 17,

        color: "#111111",
        fontFamily: "Montserrat-Medium",

        textAlign: "right",
    },

    infoLabel: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    infoValue: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    timer: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#F5F5F5",

        paddingHorizontal: 12,
        paddingVertical: 8,

        borderRadius: 18,
    },

    timerText: {
        marginLeft: 5,

        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },
});