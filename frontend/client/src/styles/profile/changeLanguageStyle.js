import { StyleSheet } from "react-native";

export const changeLanguageStyles = StyleSheet.create({
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

    title: {
        marginTop: 35,

        fontSize: 20,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    content: {
        flex: 1,

        paddingHorizontal: 23,
        paddingBottom: 35,
    },

    languages: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 60,
    },

    languageOption: {
        alignItems: "center",
    },

    flagWrapper: {
        width: 120,
        height: 120,

        borderRadius: 60,

        borderWidth: 1.5,
        borderColor: "transparent",

        alignItems: "center",
        justifyContent: "center",
    },

    flagWrapperSelected: {
        borderColor: "#5657C4",
    },

    confirmButton: {
        width: "100%",
        height: 46,

        borderRadius: 23,
        backgroundColor: "#5657C4",

        alignItems: "center",
        justifyContent: "center",
    },

    confirmText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },
});