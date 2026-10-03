import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
    // =========================
    // Base
    // =========================

    safeArea: {
        flex: 1,
        backgroundColor: "#F3F3F3",
    },

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    // =========================
    // Header
    // =========================

    header: {
        height: 140,
        backgroundColor: "#5657C4",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    headerExpanded: {
        height: 470,
        marginBottom: -330,
    },

    logoContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 45,
    },

    logo: {
        fontSize: 39,
        fontFamily: "Nunito-ExtraBold",
        textAlign: "center",
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
        justifyContent: "center",
        alignItems: "center",
    },

    // =========================
    // Search
    // =========================

    searchWrapper: {
        height: 64,

        marginHorizontal: 23,
        marginTop: -32,

        backgroundColor: "#FFFFFF",

        borderRadius: 27,

        borderWidth: 1,
        borderColor: "#E5E5E5",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 20,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.10,
        shadowRadius: 4,

        elevation: 4,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,

        height: "100%",

        fontSize: 14,
        color: "#111111",

        fontFamily: "Montserrat-Regular",

        paddingVertical: 0,
    },

    // =========================
    // Main content
    // =========================

    scrollView: {
        flex: 1,
    },

    // =========================
    // Section headers
    // =========================

    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 23,

        marginBottom: 28,
    },

    sectionTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    seeAll: {
        fontSize: 14,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Categories
    // =========================

    categoriesList: {
        paddingLeft: 23,
        paddingRight: 10,
        marginBottom: 48,
    },

    categoryCard: {
        width: (width - 46 - 24) / 3,
        height: 118,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 12,
    },

    categoryTitle: {
        marginTop: 8,

        textAlign: "center",

        fontSize: 12,
        lineHeight: 15,

        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Horizontal cards
    // =========================

    cardsList: {
        paddingLeft: 23,
        paddingRight: 10,

        marginBottom: 48,
    },

    // =========================
    // Clinic card
    // =========================

    clinicCard: {
        width: Math.min(width - 70, 300),

        minHeight: 105,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginRight: 13,
    },

    clinicTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    clinicImage: {
        width: 62,
        height: 62,

        borderRadius: 31,

        marginRight: 12,
    },

    clinicImagePlaceholder: {
        width: 62,
        height: 62,
        borderRadius: 31,
        marginRight: 12,

        backgroundColor: "#F0F0FA",

        alignItems: "center",
        justifyContent: "center",
    },

    clinicInfo: {
        flex: 1,

        minWidth: 0,
    },

    // =========================
    // Clinic tags
    // =========================

    tagsRow: {
        flexDirection: "row",
        alignItems: "center",

        marginBottom: 7,
    },

    categoryTag: {
        backgroundColor: "#F5F5F5",

        paddingHorizontal: 8,
        paddingVertical: 4,

        borderRadius: 10,

        marginRight: 5,
    },

    categoryTagText: {
        fontSize: 12,
        color: "#333333",
        fontFamily: "Montserrat-Medium",
    },

    ratingTag: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#FFF5D8",

        paddingHorizontal: 7,
        paddingVertical: 4,

        borderRadius: 10,
    },

    star: {
        color: "#FFBC18",

        fontSize: 12,

        marginRight: 3,
    },

    ratingText: {
        fontSize: 12,

        color: "#C58D00",

        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Clinic information
    // =========================

    clinicName: {
        fontSize: 15,

        color: "#111111",

        fontFamily: "Montserrat-SemiBold",

        marginBottom: 3,
    },

    clinicAddress: {
        fontSize: 12,

        color: "#555555",

        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Recent appointments
    // =========================

    appointmentsSection: {
        backgroundColor: "#F7F7F7",

        paddingTop: 31,
        paddingBottom: 1,
    },

    appointmentInfo: {
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",

        marginTop: 18,
        paddingTop: 18,
        paddingBottom: 5,

        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },


    appointmentTitle: {
        width: 120,

        fontSize: 15,
        lineHeight: 18,

        color: "#111111",
        fontFamily: "Montserrat-Medium",

        marginBottom: 4,
    },

    appointmentDuration: {
        fontSize: 12,

        color: "#777777",

        fontFamily: "Montserrat-Regular",
    },

    dateTag: {
        backgroundColor: "#F4F4F4",

        paddingHorizontal: 12,
        paddingVertical: 10,

        borderRadius: 15,
    },

    dateText: {
        fontSize: 12,
        color: "#222222",
        fontFamily: "Montserrat-Medium",
    },

    // =========================
    // Clinics near you
    // =========================

    nearbySection: {
        paddingTop: 32,
    },

    bottomSpace: {
        height: 105,
    },

    // =========================
    // Bottom navigation
    // =========================

    bottomNavigation: {
        position: "absolute",

        left: 0,
        right: 0,
        bottom: 0,

        height: 88,

        backgroundColor: "#FFFFFF",

        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",

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

    // =========================
    // See all screen
    // =========================

    seeAllHeader: {
        height: 110,

        flexDirection: "row",
        alignItems: "flex-end",

        paddingHorizontal: 23,
        paddingBottom: 10,

        backgroundColor: "#FFFFFF",
    },

    backButton: {
        width: 40,
        height: 40,

        justifyContent: "center",
        alignItems: "flex-start",

        marginRight: 10,
        paddingTop: 15,
    },

    seeAllTitle: {
        fontSize: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    seeAllContent: {
        paddingHorizontal: 23,
        paddingTop: 25,
        paddingBottom: 40,
    },

    categoriesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",

        justifyContent: "space-between",

        rowGap: 15,
    },

    categoryCardLarge: {
        width: "47.5%",
        height: 145,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 22,

        alignItems: "center",
        justifyContent: "center",
    },

    categoryCardLargeIcon: {
        fontSize: 42,
    },

    categoryCardLargeTitle: {
        marginTop: 12,

        width: "85%",

        fontSize: 14,
        lineHeight: 19,

        textAlign: "center",

        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    verticalCards: {
        width: "100%",
    },

    seeAllClinicCard: {
        width: "100%",
        minHeight: 105,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginBottom: 14,
    },

    seeAllAppointmentCard: {
        width: "100%",
        minHeight: 160,

        backgroundColor: "#FFFFFF",

        borderWidth: 1,
        borderColor: "#E1E1E1",

        borderRadius: 20,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginBottom: 14,
    },

    emptyRecentAppointments: {
        height: 170,
        paddingHorizontal: 23,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyState: {
        minHeight: 560,
        paddingHorizontal: 23,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyTitle: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
    },

    emptyDescription: {
        width: 270,
        marginBottom: 40,
        fontSize: 12,
        lineHeight: 15,
        color: "#444444",
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },

    emptyRecommended: {
        height: 110,
        paddingHorizontal: 23,
        alignItems: "center",
        justifyContent: "center",
    },

    emptyNearby: {
        height: 110,
        paddingHorizontal: 23,
        alignItems: "center",
        justifyContent: "center",
    },
});