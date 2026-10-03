import { StyleSheet } from "react-native";

export const appointmentCompletedStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        flexGrow: 1,
        paddingBottom: 110,
    },

    // same header positioning as Home
    header: {
        height: 140,
        backgroundColor: "#FFFFFF",
    },

    logoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
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

    logoPurple: {
        color: "#5657C4",
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

    // SUCCESS ICON
    resultIconWrapper: {
        marginTop: 15,
        alignItems: "center",
    },

    circleOuter: {
        width: 130,
        height: 130,
        borderRadius: 65,

        borderWidth: 3,
        borderColor: "#DDDDF8",

        alignItems: "center",
        justifyContent: "center",
    },

    circleMiddle: {
        width: 104,
        height: 104,
        borderRadius: 52,

        borderWidth: 1,
        borderColor: "#8585E6",

        alignItems: "center",
        justifyContent: "center",
    },

    circleInner: {
        width: 78,
        height: 78,
        borderRadius: 39,

        borderWidth: 1,
        borderColor: "#5657C4",

        alignItems: "center",
        justifyContent: "center",
    },

    successCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,

        backgroundColor: "#5657C4",

        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        marginTop: 40,

        fontSize: 18,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        textAlign: "center",
    },

    description: {
        marginTop: 15,
        paddingHorizontal: 23,

        fontSize: 12,
        lineHeight: 17,

        color: "#333333",
        fontFamily: "Montserrat-Regular",

        textAlign: "center",
    },

    ratingTitle: {
        marginTop: 38,

        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        textAlign: "center",
    },

    stars: {
        marginTop: 17,
        gap: 10,

        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    actions: {
        marginTop: "auto",
        paddingHorizontal: 23,
        paddingTop: 45,
    },

    reviewButton: {
        height: 48,

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 24,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#FFFFFF",
    },

    reviewButtonText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    historyButton: {
        height: 48,

        marginTop: 10,

        borderRadius: 24,

        backgroundColor: "#5657C4",

        alignItems: "center",
        justifyContent: "center",
    },

    historyButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    hint: {
        marginTop: 15,

        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",

        textAlign: "center",
    },
});