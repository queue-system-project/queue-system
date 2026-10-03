import { StyleSheet } from "react-native";

export const helpSupportStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 105,
        alignItems: "center",
        justifyContent: "center",

        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
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

    content: {
        paddingHorizontal: 23,
        paddingTop: 25,
    },

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 9,
    },

    emailRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    email: {
        fontSize: 14,
        color: "#222222",
        fontFamily: "Montserrat-Regular",

        marginRight: 8,
    },
});