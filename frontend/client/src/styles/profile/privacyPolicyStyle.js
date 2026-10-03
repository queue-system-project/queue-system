import { StyleSheet } from "react-native";

export const privacyPolicyStyles = StyleSheet.create({
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

    title: {
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
        paddingHorizontal: 23,
        paddingTop: 20,
        paddingBottom: 40,
    },

    sectionTitle: {
        fontSize: 16,
        lineHeight: 21,

        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 14,
    },

    paragraph: {
        fontSize: 12,
        lineHeight: 20,

        color: "#333333",
        fontFamily: "Montserrat-Regular",

        marginBottom: 26,
    },
});