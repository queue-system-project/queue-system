import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
    // =========================
    // Base
    // =========================

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 28,
        justifyContent: "center",
    },

    // =========================
    // Language
    // =========================

    languageButton: {
        position: "absolute",
        top: 55,
        right: 24,
        height: 34,
        width: 100,
        paddingHorizontal: 14,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },

    languageText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Medium",
    },

    languageArrow: {
        width: 16,
        height: 16,
        resizeMode: "contain",
    },

    languageModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        paddingTop: 90,
        paddingRight: 24,
    },

    languageModal: {
        width: 150,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
    },

    languageOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    languageOptionText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    languageOptionActive: {
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Logo
    // =========================

    logo: {
        textAlign: "center",
        fontSize: 55,
        fontFamily: "Nunito-ExtraBold",
    },

    logoMargin: {
        marginTop: 80,
    },

    logoGreen: {
        color: "#3BDB3D",
    },

    logoBlue: {
        color: "#5657C4",
    },

    roleLogo: {
        fontSize: 55,
        fontFamily: "Nunito-ExtraBold",
        marginBottom: 100,
    },

    logoWhite: {
        color: "#FFFFFF",
    },

    // =========================
    // Titles
    // =========================

    title: {
        fontSize: 25,
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
        color: "#111111",
    },

    titleDefault: {
        marginTop: 120,
        marginBottom: 99,
    },

    titleRegister: {
        marginTop: 120,
        marginBottom: 30,
    },

    titleForgot: {
        marginTop: 120,
        marginBottom: 99,
    },

    titleCode: {
        marginTop: 120,
        marginBottom: 27,
    },

    // =========================
    // Inputs
    // =========================

    inputWrapper: {
        height: 44,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 10,
    },

    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        color: "#5954D6",
    },

    input: {
        flex: 1,
        fontSize: 14,
        color: "#808080",
        fontFamily: "Montserrat-Regular",
    },

    eyeIcon: {
        width: 16,
        height: 16,
    },

    hiddenInput: {
        position: "absolute",
        opacity: 0,
        height: 1,
        width: 1,
    },

    // =========================
    // Buttons
    // =========================

    mainButton: {
        height: 40,
        borderRadius: 50,
        backgroundColor: "#5657C4",
        justifyContent: "center",
        alignItems: "center",
    },

    mainButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Bottom text / links
    // =========================

    bottomRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
    },

    bottomText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    linkText: {
        fontSize: 14,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Login
    // =========================

    forgotButton: {
        alignSelf: "flex-end",
        marginTop: 2,
        marginBottom: 130,
    },

    forgotText: {
        fontSize: 14,
        color: "#5657C4",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Register tabs
    // =========================

    tabs: {
        height: 40,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        flexDirection: "row",
        overflow: "hidden",
        marginBottom: 30,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    activeTab: {
        backgroundColor: "#5657C4",
    },

    tabText: {
        fontSize: 12,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    activeTabText: {
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Terms
    // =========================

    termsRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 2,
        marginBottom: 120,
    },

    checkbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    checkboxActive: {
        backgroundColor: "#5657C4",
        borderColor: "#5657C4",
    },

    checkmark: {
        color: "#FFFFFF",
        fontSize: 10,
        fontFamily: "Montserrat-SemiBold",
    },

    termsText: {
        flex: 1,
        fontSize: 12,
        color: "#111111",
        lineHeight: 15,
        fontFamily: "Montserrat-Regular",
    },

    required: {
        color: "red",
    },

    semiBold: {
        fontFamily: "Montserrat-SemiBold",
        color: "#5657C4",
    },

    // =========================
    // Forgot password
    // =========================

    forgotPasswordSpacer: {
        height: 200,
    },

    // =========================
    // Code screen
    // =========================

    subtitle: {
        textAlign: "center",
        fontSize: 14,
        color: "#111111",
        lineHeight: 20,
        marginBottom: 52,
        paddingHorizontal: 18,
        fontFamily: "Montserrat-Regular",
    },

    codeCenterBlock: {
        alignItems: "center",
    },

    codeRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
        marginBottom: 18,
    },

    codeBox: {
        width: 58,
        height: 58,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },

    codeText: {
        fontSize: 22,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    resendText: {
        width: 58 * 4 + 15 * 3,
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
        marginBottom: 0,
        textAlign: "left",
    },

    codeButtonSpacer: {
        height: 150,
    },

    secondaryButton: {
        height: 40,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },

    secondaryButtonText: {
        color: "#111111",
        fontSize: 16,
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Reset screen
    // =========================

    resetPasswordSpacer: {
        height: 156,
    },

    // =========================
    // Language screen
    // =========================

    languageScreenContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: 52,
    },

    languageScreenHeader: {
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 28,
    },

    languageBackButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },

    languageBackIcon: {
        width: 16,
        height: 16,
    },

    languageScreenTitle: {
        fontSize: 18,
        color: "#111111",
        fontFamily: "Montserrat-SemiBold",
    },

    languageHeaderSpacer: {
        width: 40,
    },

    languageList: {
        marginTop: 20,
        paddingHorizontal: 36,
    },

    languageListItem: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F2",
    },

    languageCheckContainer: {
        width: 40,
        alignItems: "flex-start",
    },

    languageCheck: {
        fontSize: 18,
        color: "#5657C4",
        fontFamily: "Montserrat-Medium",
    },

    languageListText: {
        fontSize: 14,
        color: "#111111",
        fontFamily: "Montserrat-Regular",
    },

    languageListTextActive: {
        color: "#5657C4",
        fontFamily: "Montserrat-Regular",
    },

    // =========================
    // Role selection screen
    // =========================

    roleBackground: {
        flex: 1,
        width: "100%",
        height: "100%",
    },

    roleOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(43, 42, 117, 0.70)",
        opacity: 0.7,
    },

    roleContent: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 28,
        paddingTop: 145,
    },

    roleTitle: {
        width: "100%",
        fontSize: 30,
        lineHeight: 40,
        color: "#FFFFFF",
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
        marginTop: 80,
    },

    roleButtons: {
        paddingHorizontal: 28,
        paddingBottom: 48,
    },

    roleClientButton: {
        height: 40,
        borderRadius: 50,
        backgroundColor: "#5657C4",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    roleClientButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Montserrat-SemiBold",
    },

    roleEmployeeButton: {
        height: 40,
        borderRadius: 50,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    roleEmployeeButtonText: {
        color: "#111111",
        fontSize: 16,
        fontFamily: "Montserrat-SemiBold",
    },

    // =========================
    // Splash screen
    // =========================

    splashContainer: {
        flex: 1,
        backgroundColor: "#5657C4",
        justifyContent: "center",
        alignItems: "center",
    },

    splashLogo: {
        fontSize: 55,
        fontFamily: "Nunito-ExtraBold",
        textAlign: "center",
    },

});