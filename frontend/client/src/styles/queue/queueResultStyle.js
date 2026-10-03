import { StyleSheet } from "react-native";

export const queueResultStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        flexGrow: 1,
        paddingBottom: 110,
    },

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

    resultIconWrapper: {
        marginTop: 45,
        alignItems: "center",
        justifyContent: "center",
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

    circleOuterError: {
        borderColor: "#F6CCCC",
    },

    circleMiddleError: {
        borderColor: "#EF8E8E",
    },

    circleInnerError: {
        borderColor: "#E85B5B",
    },

    errorCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#E85B5B",
        alignItems: "center",
        justifyContent: "center",
    },

    message: {
        paddingHorizontal: 23,
        marginTop: 43,
        alignItems: "center",
    },

    title: {
        fontSize: 18,
        lineHeight: 25,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
    },

    description: {
        marginTop: 14,
        fontSize: 12,
        lineHeight: 17,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },

    bottomContent: {
        marginTop: "auto",
        paddingHorizontal: 23,
        paddingTop: 50,
        alignItems: "center",
    },

    primaryButton: {
        width: "100%",
        height: 48,
        borderRadius: 24,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    primaryButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    hint: {
        marginTop: 16,
        fontSize: 12,
        lineHeight: 15,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },


});