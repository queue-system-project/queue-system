import { StyleSheet } from "react-native";

export const completeProfileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 105,
        position: "relative",
        alignItems: "center",
    },

    logo: {
        position: "absolute",
        top: 45,

        fontSize: 39,
        fontFamily: "Nunito-ExtraBold",
        textAlign: "center",
    },

    logoGreen: {
        color: "#3BDB3D",
    },

    logoBlue: {
        color: "#5657C4",
    },

    languageButton: {
        position: "absolute",
        top: 55,
        right: 24,

        height: 34,
        width: 100,

        paddingHorizontal: 14,

        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#E5E5E5",

        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    languageText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    title: {
        marginTop: 120,
        marginBottom: 30,

        fontSize: 25,
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
        color: "#111111",
    },

    // =========================
    // Avatar
    // =========================

    avatarSection: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 42,
    },

    avatar: {
        width: 150,
        height: 150,

        borderRadius: 75,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",
    },

    changePhotoButton: {
        position: "absolute",

        right: 4,
        bottom: 7,

        width: 32,
        height: 32,

        borderRadius: 16,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",
    },

    // =========================
    // Form
    // =========================

    form: {
        paddingHorizontal: 23,
    },

    field: {
        marginBottom: 27,
    },

    label: {
        marginBottom: 11,

        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    input: {
        width: "100%",
        height: 56,

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,

        paddingHorizontal: 18,
        paddingVertical: 0,

        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",

        backgroundColor: "#FFFFFF",
    },

    // =========================
    // Continue
    // =========================

    continueButton: {
        width: "100%",
        height: 56,

        marginTop: 35,

        backgroundColor: "#5657C4",
        borderRadius: 28,

        alignItems: "center",
        justifyContent: "center",
    },

    continueButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    required: {
        color: "red",
    },
});