import { StyleSheet } from "react-native";

export const profileDetailsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    scrollView: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 23,
        paddingBottom: 120,
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 105,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 40,
        height: 40,
        alignItems: "flex-start",
        justifyContent: "center",
        marginLeft: -8,
        marginTop: 25,
    },

    editButton: {
        width: 40,
        height: 40,
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: -3,
        marginTop: 25,
    },

    // =========================
    // User
    // =========================

    user: {
        alignItems: "center",
        marginTop: 12,
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

    name: {
        marginTop: 25,

        fontSize: 20,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Contacts
    // =========================

    contacts: {
        marginTop: 32,
    },

    contactRow: {
        minHeight: 40,

        flexDirection: "row",
        alignItems: "center",
    },

    contactText: {
        marginLeft: 10,

        fontSize: 14,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },
});