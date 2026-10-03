import { StyleSheet } from "react-native";

export const selectDateStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    // HEADER
    header: {
        height: 105,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
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
        marginTop: 35,
        fontSize: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    content: {
        paddingBottom: 35,
    },

    // EMPLOYEES
    employees: {
        paddingHorizontal: 23,
        paddingTop: 5,
        paddingBottom: 22,
    },

    employee: {
        width: 68,
        marginRight: 12,
        alignItems: "center",
    },

    employeeAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 1,
        borderColor: "#DADADA",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    employeeAvatarSelected: {
        borderWidth: 2,
        borderColor: "#5657C4",
    },

    employeeImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },

    selectedEmployeeBadge: {
        position: "absolute",
        right: -3,
        top: -3,
        width: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    employeeName: {
        width: 68,
        marginTop: 6,
        fontSize: 10,
        lineHeight: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },

    // CALENDAR HEADER
    calendarHeader: {
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
        paddingHorizontal: 23,
        paddingTop: 23,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    month: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    monthButtons: {
        flexDirection: "row",
    },

    monthButton: {
        width: 40,
        height: 40,
        marginLeft: 10,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    // WEEK
    weekRow: {
        flexDirection: "row",
        paddingHorizontal: 23,
        marginBottom: 8,
    },

    weekDay: {
        width: "14.2857%",
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },

    calendar: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 23,
        paddingBottom: 20,
    },

    dayContainer: {
        width: "14.2857%",
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },

    dayButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
    },

    disabledDayButton: {
        borderWidth: 1,
        borderColor: "#E1E1E1",
        backgroundColor: "#FFFFFF",
    },

    availableDayButton: {
        backgroundColor: "#F5F5F5",
    },

    weekendDayButton: {
        borderWidth: 0,
        backgroundColor: "transparent",
    },

    dayText: {
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    disabledDayText: {
        color: "#BDBDBD",
        textDecorationLine: "line-through",
    },

    weekendDayText: {
        color: "#BDBDBD",
        textDecorationLine: "none",
    },

    selectedDayButton: {
        backgroundColor: "#6665D8",
        borderWidth: 2,
        borderColor: "#5657C4",
    },

    selectedDayText: {
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
        textDecorationLine: "none",
    },

    statusLine: {
        position: "absolute",
        bottom: 9,
        width: 18,
        height: 3,
        borderRadius: 2,
    },

    greenStatus: {
        backgroundColor: "#67C96B",
    },

    yellowStatus: {
        backgroundColor: "#F5C542",
    },

    redStatus: {
        backgroundColor: "#F04444",
    },

    // SERVICE CARD
    serviceCard: {
        marginHorizontal: 23,
        marginTop: 17,
        padding: 17,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
    },

    serviceHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    serviceInfo: {
        flex: 1,
        paddingRight: 10,
    },

    serviceName: {
        fontSize: 15,
        lineHeight: 18,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    serviceMeta: {
        marginTop: 5,
        flexDirection: "row",
        alignItems: "center",
    },

    duration: {
        marginRight: 20,
        fontSize: 12,
        color: "#555555",
        fontFamily: "Montserrat-Regular",
    },

    date: {
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
        transform: [{ translateX: -20 }],
    },

    serviceBadges: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        marginTop: 12,
    },

    spotsBadge: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 15,
        backgroundColor: "#F5F5F5",
        marginRight: 7,
        marginBottom: 7,
    },

    spotsText: {
        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },

    queueBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 9,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: "#F5F5F5",
        marginRight: 7,
        marginBottom: 7,
    },

    queueText: {
        marginLeft: 4,
        fontSize: 12,
        color: "#444444",
        fontFamily: "Montserrat-Regular",
    },

    // QUEUE
    queueInfo: {
        marginTop: 17,
        flexDirection: "row",
        alignItems: "center",
    },

    divider: {
        height: 1,
        marginTop: 21,
        marginBottom: 14,
        backgroundColor: "#E7E7E7",
    },

    // SELECTED EMPLOYEE
    selectedEmployee: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    selectedEmployeeLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    smallAvatar: {
        width: 38,
        height: 38,
        marginRight: 10,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    selectedEmployeeName: {
        flex: 1,
        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Regular",
    },

    changeText: {
        fontSize: 14,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    // NOTES
    notesTitle: {
        marginHorizontal: 23,
        marginTop: 35,
        marginBottom: 13,
        fontSize: 16,
        lineHeight: 19,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    notesInput: {
        height: 75,
        marginHorizontal: 23,
        paddingHorizontal: 15,
        paddingTop: 13,
        paddingBottom: 13,
        borderWidth: 1,
        borderColor: "#E1E1E1",
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    // CONTINUE
    continueButton: {
        height: 48,
        marginHorizontal: 23,
        marginTop: 38,
        borderRadius: 24,
        backgroundColor: "#5657C4",
        alignItems: "center",
        justifyContent: "center",
    },

    continueButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },
});