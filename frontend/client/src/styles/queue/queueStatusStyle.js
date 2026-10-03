import { StyleSheet } from "react-native";

export const queueStatusStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        flexGrow: 1,
        paddingBottom: 40,
    },

    // HEADER
    header: {
        height: 265,
        backgroundColor: "#5657C4",

        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,

        alignItems: "center",
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

    headerTitle: {
        marginTop: 57,

        fontSize: 20,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    headerDescription: {
        marginTop: 35,

        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Regular",

        textAlign: "center",
    },

    // POSITION
    positionCircle: {
        width: 210,
        height: 210,

        borderRadius: 105,
        borderWidth: 4,

        backgroundColor: "#FFFFFF",

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        marginTop: -110,
    },

    positionNumber: {
        fontSize: 48,
        lineHeight: 65,

        color: "#000000",
        fontFamily: "Montserrat-SemiBold",
    },

    positionText: {
        marginTop: 3,

        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    infoText: {
        marginTop: 42,
        paddingHorizontal: 23,

        fontSize: 12,
        lineHeight: 17,

        color: "#222222",
        fontFamily: "Montserrat-Regular",

        textAlign: "center",
    },

    // CARDS
    cards: {
        marginTop: 40,
        paddingHorizontal: 23,

        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    smallCard: {
        width: "48.5%",
        minHeight: 118,

        marginBottom: 12,
        paddingHorizontal: 19,
        paddingVertical: 20,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        backgroundColor: "#FFFFFF",
    },

    cardLabel: {
        fontSize: 12,
        lineHeight: 15,

        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    cardValue: {
        marginTop: 11,

        fontSize: 18,
        lineHeight: 24,

        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    serviceCard: {
        width: "100%",
        minHeight: 82,

        paddingHorizontal: 19,
        paddingVertical: 17,

        borderWidth: 1,
        borderColor: "#D7D7EA",

        borderRadius: 16,

        backgroundColor: "#F0F0FF",
    },
});