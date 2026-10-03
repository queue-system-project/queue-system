import { StyleSheet } from "react-native";

export const changePasswordStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 28,
    },

    // =========================
    // Logo
    // =========================

    logo: {
        marginTop: 145,

        textAlign: "center",

        fontSize: 55,
        fontFamily: "Nunito-ExtraBold",
    },

    logoGreen: {
        color: "#3BDB3D",
    },

    logoBlue: {
        color: "#5657C4",
    },

    // =========================
    // Title
    // =========================

    title: {
        marginTop: 105,
        marginBottom: 75,

        textAlign: "center",

        fontSize: 25,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Inputs
    // =========================

    inputWrapper: {
        height: 44,

        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 20,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 14,

        marginBottom: 10,
    },

    inputIcon: {
        width: 20,
        height: 20,

        marginRight: 8,

        resizeMode: "contain",
    },

    input: {
        flex: 1,

        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    eyeIcon: {
        width: 16,
        height: 16,

        resizeMode: "contain",
    },

    // =========================
    // Buttons
    // =========================

    confirmButton: {
        height: 40,

        marginTop: 110, // було 156

        borderRadius: 50,
        backgroundColor: "#5657C4",

        justifyContent: "center",
        alignItems: "center",
    },

    confirmButtonText: {
        fontSize: 16,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    backButton: {
        height: 40,

        marginTop: 10,

        borderRadius: 50,

        borderWidth: 1,
        borderColor: "#E5E5E5",

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",
    },

    backButtonText: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },
});