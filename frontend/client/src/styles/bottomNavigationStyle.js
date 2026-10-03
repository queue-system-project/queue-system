import { StyleSheet } from "react-native";

export const bottomNavigationStyles = StyleSheet.create({
    bottomNavigation: {
        position: "absolute",

        left: 0,
        right: 0,
        bottom: 0,

        height: 90,

        backgroundColor: "#FFFFFF",

        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",

        paddingHorizontal: 10,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,

        elevation: 8,
    },

    navItem: {
        width: "25%",
        alignItems: "center",
        justifyContent: "center",
    },

    navText: {
        marginTop: 5,

        fontSize: 10,
        color: "#111111",

        fontFamily: "Montserrat-Regular",
    },

    activeText: {
        color: "#5657C4",
        fontFamily: "Montserrat-Medium",
    },
});