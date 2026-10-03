import { StyleSheet } from "react-native";

export const popUpWindowStyles = StyleSheet.create({
    container: {
        marginHorizontal: 23,
        marginTop: 27,
        paddingHorizontal: 20,
        paddingTop: 72,
        paddingBottom: 20,
        borderRadius: 22,
        position: "relative",
    },

    confirmationContainer: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E1E1E1",
    },

    urgentContainer: {
        backgroundColor: "#FFF0A3",
    },

    lastMinuteContainer: {
        backgroundColor: "#B8F1BD",
    },

    // TIMER
    timer: {
        position: "absolute",
        top: 22,
        right: 22,
        height: 34,
        paddingHorizontal: 14,
        borderRadius: 17,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    timerText: {
        marginLeft: 5,
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // TITLE
    title: {
        fontSize: 16,
        lineHeight: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
    },

    description: {
        marginTop: 18,
        fontSize: 12,
        lineHeight: 16,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },

    // INSTITUTION
    institutionCard: {
        minHeight: 78,
        marginTop: 24,
        padding: 10,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    institutionImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 10,
    },

    institutionInfo: {
        flex: 1,
    },

    tagsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },

    categoryTag: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: "#F4F4F4",
        marginRight: 6,
    },

    categoryText: {
        fontSize: 7,
        color: "#444444",
        fontFamily: "Montserrat-Regular",
    },

    ratingTag: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: "#FFF7D8",
        flexDirection: "row",
        alignItems: "center",
    },

    star: {
        marginRight: 3,
        fontSize: 8,
        color: "#FFB800",
    },

    ratingText: {
        fontSize: 7,
        color: "#FFB800",
        fontFamily: "Montserrat-Medium",
    },

    institutionName: {
        fontSize: 10,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    address: {
        marginTop: 3,
        fontSize: 7,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    // APPOINTMENT
    appointmentCard: {
        minHeight: 66,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },

    serviceName: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    duration: {
        marginTop: 4,
        fontSize: 8,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
    },

    appointmentRight: {
        flexDirection: "row",
        alignItems: "center",
    },

    dateBadge: {
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 15,
        backgroundColor: "#F5F5F5",
        marginRight: 7,
    },

    dateText: {
        fontSize: 8,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    timeBadge: {
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 15,
        backgroundColor: "#B9F1BE",
        flexDirection: "row",
        alignItems: "center",
    },

    timeText: {
        marginLeft: 4,
        fontSize: 10,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // CONFIRMATION
    confirmationButtons: {
        marginTop: 22,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    yesButton: {
        width: "48%",
        height: 38,
        borderRadius: 19,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    yesButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Medium",
    },

    noButton: {
        width: "48%",
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    noButtonText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // URGENT / LAST MINUTE
    timeOptions: {
        marginTop: 22,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    timeOptionButton: {
        flex: 1,
        height: 36,
        marginHorizontal: 3,
        borderRadius: 18,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    timeOptionText: {
        fontSize: 10,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    declineButton: {
        height: 38,
        marginTop: 10,
        borderRadius: 19,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    declineButtonText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },
});