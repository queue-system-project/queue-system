import { StyleSheet } from "react-native";

export const editProfileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        paddingBottom: 40,
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 105,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 35,
    },

    saveButton: {
        width: 40,
        height: 40,
        alignItems: "flex-end",
        justifyContent: "center",
        marginTop: 35,
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
});