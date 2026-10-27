import { StyleSheet } from "react-native";

export const adminScreensStyles = StyleSheet.create({
    // =========================
    // Base
    // =========================

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    content: {
        paddingHorizontal: 23,
        paddingBottom: 130,
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 110,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 12,
    },

    headerTitle: {
        fontSize: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    notificationButton: {
        position: "absolute",
        right: 34,
        bottom: 12,
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
    },

    // =========================
    // Search
    // =========================

    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        paddingHorizontal: 18,

        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 26,
    },

    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
        outlineStyle: "none",
    },

    // =========================
    // Institution card
    // =========================

    institutionCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 28,
        paddingVertical: 20,
        paddingHorizontal: 18,

        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 24,
    },

    institutionPhoto: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#EEEEF9",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    institutionPhotoImage: {
        width: "100%",
        height: "100%",
    },

    institutionInfo: {
        flex: 1,
        marginLeft: 14,
    },

    badges: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    categoryBadge: {
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 14,
        marginRight: 6,
    },

    categoryText: {
        fontSize: 9,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF7D7",
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 14,
    },

    ratingText: {
        marginLeft: 3,
        fontSize: 9,
        color: "#DCA900",
        fontFamily: "Montserrat-Medium",
    },

    institutionName: {
        fontSize: 17,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    institutionAddress: {
        marginTop: 5,
        fontSize: 10,
        color: "#333333",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Section header
    // =========================

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 19,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    createButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 18,
        backgroundColor: "#5657C4",
        borderRadius: 22,
    },

    createButtonText: {
        fontSize: 13,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Cards
    // =========================

    card: {
        marginTop: 20,
        paddingVertical: 22,
        paddingHorizontal: 16,

        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 24,
    },

    serviceName: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
        marginBottom: 6,
    },

    duration: {
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Medium",
    },

    serviceDescription: {
        marginTop: 18,
        fontSize: 12,
        lineHeight: 18,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    emptyText: {
        marginTop: 30,
        textAlign: "center",
        fontSize: 12,
        color: "#777777",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Service stats chips
    // =========================

    serviceStats: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        marginTop: 18,
    },

    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: "#F5F5F5",
    },

    chipYellow: {
        backgroundColor: "#FFF0A6",
    },

    chipGreen: {
        backgroundColor: "#D5F5D8",
    },

    chipRed: {
        backgroundColor: "#FADBDB",
    },

    chipText: {
        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Employee row
    // =========================

    divider: {
        height: 1,
        marginTop: 22,
        marginBottom: 20,
        backgroundColor: "#EEEEEE",
    },

    employeeRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    employeeAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#EEEEF9",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    employeeAvatarImage: {
        width: "100%",
        height: "100%",
    },

    employeeInitials: {
        fontSize: 18,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    employeeName: {
        flex: 1,
        marginLeft: 14,
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    roomContainer: {
        alignItems: "center",
    },

    roomBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#F5F5F5",
        borderRadius: 16,
    },

    roomBadgeText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    roomLabel: {
        marginTop: 8,
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    moreButton: {
        height: 34,
        marginTop: 22,
        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 17,
    },

    moreButtonText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Employees
    // =========================

    filtersList: {
        gap: 10,
        paddingHorizontal: 23,
        marginTop: 22,
    },

    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 20,
    },

    filterChipAll: {
        backgroundColor: "#FFFFFF",
        borderColor: "#DDDDDD",
    },

    filterChipSelected: {
        borderColor: "#5657C4",
    },

    filterChipText: {
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 30,
    },

    resultsBadge: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: "#F5F5F5",
        borderRadius: 16,
    },

    resultsText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    employeeCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        paddingVertical: 22,
        paddingHorizontal: 18,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 24,
    },

    employeeInfo: {
        flex: 1,
        marginLeft: 14,
        alignItems: "flex-start",
    },

    employeeCardName: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    statusBadge: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    statusText: {
        fontSize: 10,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Settings (nadpisuje style profilu)
    // =========================

    settingsHeader: {
        height: 200,
    },

    settingsCard: {
        marginTop: -80,
        paddingTop: 34,
        paddingBottom: 34,
        marginBottom: 16,
    },

    // =========================
    // Detail screens
    // =========================

    backHeader: {
        height: 100,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 14,
        paddingHorizontal: 60,
    },

    backHeaderTitle: {
        fontSize: 22,
        color: "#111111",
        textAlign: "center",
        fontFamily: "Montserrat-SemiBold",
    },

    backButton: {
        position: "absolute",
        left: 15,
        bottom: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
    },

    headerAction: {
        position: "absolute",
        right: 22,
        bottom: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-end",
    },

    queueDuration: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 14,
        color: "#777777",
        fontFamily: "Montserrat-Medium",
    },

    queueDescription: {
        marginTop: 18,
        textAlign: "center",
        fontSize: 12,
        lineHeight: 18,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    detailsSectionTitle: {
        marginTop: 40,
        marginBottom: 18,
        fontSize: 19,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    statsRow: {
        flexDirection: "row",
        gap: 14,
    },

    statsRowSpaced: {
        marginTop: 14,
    },

    liveCard: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 22,
        borderRadius: 24,
        backgroundColor: "#5657C4",
    },

    liveCardLight: {
        backgroundColor: "#E3E3F7",
    },

    liveCardLabel: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Regular",
    },

    liveCardValue: {
        marginTop: 10,
        fontSize: 21,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    liveCardTextDark: {
        color: "#111111",
    },

    breakdownCard: {
        marginTop: 14,
        paddingVertical: 22,
        paddingHorizontal: 22,
        borderRadius: 24,
        backgroundColor: "#5657C4",
    },

    breakdownLabel: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Regular",
    },

    breakdownRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
    },

    breakdownTrack: {
        marginRight: 12,
    },

    breakdownBar: {
        height: 12,
        borderRadius: 6,
    },

    breakdownValue: {
        minWidth: 18,
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    outlineButton: {
        height: 46,
        marginTop: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 23,
    },

    outlineButtonText: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Employee details
    // =========================

    profileHeader: {
        alignItems: "center",
        marginTop: 24,
    },

    profileStatusBadge: {
        marginTop: -14,
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 14,
    },

    profileName: {
        marginTop: 16,
        fontSize: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    contactRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 22,
    },

    contactText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    primaryButton: {
        height: 46,
        marginTop: 22,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#5657C4",
        borderRadius: 23,
    },

    primaryButtonText: {
        fontSize: 15,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    subsectionTitle: {
        marginTop: 40,
        marginBottom: 6,
        fontSize: 17,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    roomRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },

    roomRowText: {
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    smallCard: {
        marginTop: 14,
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 18,
    },

    hoursTable: {
        marginTop: 12,
    },

    dangerButton: {
        height: 46,
        marginTop: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 23,
    },

    dangerButtonText: {
        fontSize: 15,
        color: "#C0392B",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Simple menu list
    // =========================

    listItem: {
        minHeight: 64,
        paddingHorizontal: 23,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    listItemText: {
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Forms
    // =========================

    formContent: {
        flexGrow: 1,
        paddingHorizontal: 23,
        paddingBottom: 40,
    },

    fieldLabel: {
        marginTop: 24,
        marginBottom: 10,
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    field: {
        height: 50,
        paddingHorizontal: 22,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 25,
    },

    fieldText: {
        flex: 1,
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
        outlineStyle: "none",
    },

    fieldPlaceholder: {
        color: "#858585",
    },

    selectOptions: {
        maxHeight: 220,
        marginTop: 6,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 18,
        overflow: "hidden",
    },

    selectOption: {
        paddingVertical: 12,
        paddingHorizontal: 22,
    },

    selectOptionSelected: {
        backgroundColor: "#EEEEF9",
    },

    selectOptionText: {
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    formSpacer: {
        flex: 1,
        minHeight: 40,
    },

    // =========================
    // Service details
    // =========================

    liveCardGrey: {
        backgroundColor: "#F5F5F5",
    },

    infoRow: {
        flexDirection: "row",
        marginTop: 14,
    },

    infoLabel: {
        width: 100,
        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    infoValue: {
        flex: 1,
        fontSize: 11,
        lineHeight: 16,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    smallButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: "#5657C4",
        borderRadius: 18,
    },

    smallButtonText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Appointments
    // =========================

    appointmentTop: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    appointmentService: {
        flex: 1,
        marginRight: 8,
    },

    appointmentBadges: {
        flexDirection: "row",
        gap: 6,
    },

    dateBadge: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
    },

    timeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#E3E3F7",
        borderRadius: 14,
    },

    badgeText: {
        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    clientAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        justifyContent: "center",
        alignItems: "center",
    },

    // =========================
    // Employee statistic
    // =========================

    outlineStatCard: {
        flex: 1,
        minHeight: 84,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 22,
    },

    outlineStatLabel: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    outlineStatValue: {
        marginTop: 10,
        fontSize: 20,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    periodHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
    },

    periodRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 14,
    },

    periodPill: {
        flexShrink: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#5657C4",
        borderRadius: 24,
    },

    periodPillText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontFamily: "Montserrat-Medium",
    },

    periodArrows: {
        flexDirection: "row",
        gap: 14,
        marginLeft: 12,
    },

    arrowButton: {
        width: 46,
        height: 46,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 12,
    },

    dayTitle: {
        marginTop: 26,
        fontSize: 15,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    dayBarLabel: {
        marginTop: 14,
        fontSize: 13,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    dayBarRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    dayBar: {
        height: 10,
        marginRight: 10,
        borderRadius: 5,
    },

    dayBarValue: {
        fontSize: 11,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },
});
