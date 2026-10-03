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
        paddingTop: 55,
        paddingBottom: 35,

        justifyContent: "space-between",
    },

    languages: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 70,
    },

    languageOption: {
        alignItems: "center",
    },

    flagWrapper: {
        width: 100,
        height: 100,

        borderRadius: 50,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#FFFFFF",
    },

    flagWrapperSelected: {
        borderWidth: 2,
        borderColor: "#5657C4",
    },

    flag: {
        fontSize: 60,
    },

    languageName: {
        marginTop: 10,

        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    languageNameSelected: {
        color: "#5657C4",
        fontFamily: "Montserrat-Medium",
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