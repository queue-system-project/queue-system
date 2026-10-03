import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 255,

        backgroundColor: "#5657C4",

        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },


    logoContainer: {
        alignItems: "center",
        paddingTop: 45,
        zIndex: 2,
    },

    logo: {
        fontSize: 39,
        fontFamily: "Nunito-ExtraBold",
    },

    logoGreen: {
        color: "#3BDB3D",
    },

    logoWhite: {
        color: "#FFFFFF",
    },

    notificationButton: {
        position: "absolute",
        top: 54,
        right: 34,

        width: 32,
        height: 32,

        alignItems: "center",
        justifyContent: "center",

        zIndex: 2,
    },

    // =========================
    // Content
    // =========================

    scrollView: {
        flex: 1,
    },

    content: {
        paddingBottom: 120,
    },

    // =========================
    // Profile card
    // =========================

    profileCard: {
        marginHorizontal: 23,
        marginTop: -145,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 25,

        paddingHorizontal: 26,
        paddingTop: 30,
        paddingBottom: 5,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,

        marginBottom: 5,
    },

    userRow: {
        flexDirection: "row",
        alignItems: "center",

        marginBottom: 23,
    },

    avatar: {
        width: 110,
        height: 110,

        borderRadius: 55,

        borderWidth: 1,
        borderColor: "#E1E1E1",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 29,
    },

    userInfo: {
        flex: 1,
    },

    userName: {
        fontSize: 20,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",

        marginBottom: 9,
    },

    userEmail: {
        fontSize: 14,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Menu
    // =========================

    menu: {
        width: "100%",
    },

    menuItem: {
        minHeight: 76,

        paddingHorizontal: 23,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    menuText: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    logoutText: {
        fontSize: 16,
        color: "#999999",
        fontFamily: "Montserrat-Regular",
    },

    deleteText: {
        fontSize: 16,
        color: "#E21D25",
        fontFamily: "Montserrat-Regular",
    },

    modalOverlay: {
        flex: 1,

        backgroundColor: "rgba(0, 0, 0, 0.30)",

        justifyContent: "center",

        paddingHorizontal: 23,
    },

    modalContent: {
        width: "100%",

        backgroundColor: "#FFFFFF",

        borderRadius: 20,

        paddingHorizontal: 22,
        paddingTop: 30,
        paddingBottom: 24,
    },

    modalTitle: {
        fontSize: 16,
        lineHeight: 22,

        color: "#111111",
        fontFamily: "Montserrat-Medium",

        textAlign: "center",

        marginBottom: 28,
    },

    modalCancelButton: {
        width: "100%",
        height: 46,

        backgroundColor: "#5657C4",
        borderRadius: 23,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 10,
    },

    modalCancelText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    modalDeleteButton: {
        width: "100%",
        height: 46,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 23,

        alignItems: "center",
        justifyContent: "center",
    },

    modalDeleteText: {
        fontSize: 14,
        color: "#E21D25",
        fontFamily: "Montserrat-Medium",
    },

    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 100,
    },
});