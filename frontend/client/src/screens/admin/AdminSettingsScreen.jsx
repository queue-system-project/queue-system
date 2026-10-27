import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { logoutUser } from "../../api/profile/profileApi";
import { profileStyles as styles } from "../../styles/profile/profileStyle";
import { adminScreensStyles } from "../../styles/admin/adminScreensStyle";

// Pozycje bez screen nie mają jeszcze ekranów.
const menuItems = [
    { titleKey: "settingsOffers", screen: "AdminOffers" },
    { titleKey: "settingsCreateService", screen: null },
    { titleKey: "settingsCreateUser", screen: null },
    { titleKey: "settingsAddHoliday", screen: "AdminHoliday" },
    { titleKey: "changePassword", screen: "ChangePassword" },
    { titleKey: "language", screen: "ChangeLanguage" },
];

export default function AdminSettingsScreen({ navigation }) {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();

    const fullName = user
        ? [user.first_name, user.last_name].filter(Boolean).join(" ")
        : "";

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            await signOut();

            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={[styles.header, adminScreensStyles.settingsHeader]}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoGreen}>Q</Text>
                            <Text style={styles.logoWhite}>ast</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Ionicons name="notifications" size={27} color="#FFFFFF"/>
                    </TouchableOpacity>
                </View>

                {/* USER CARD */}
                <View style={[styles.profileCard, adminScreensStyles.settingsCard]}>
                    <Text style={styles.userName}>{fullName || "-"}</Text>
                    <Text style={styles.userEmail}>{user?.email || user?.phone || "-"}</Text>
                </View>

                {/* MENU */}
                <View style={styles.menu}>
                    {menuItems.map(item => (
                        <TouchableOpacity
                            key={item.titleKey}
                            style={styles.menuItem}
                            activeOpacity={0.8}
                            disabled={!item.screen}
                            onPress={() => navigation.navigate(item.screen)}
                        >
                            <Text style={styles.menuText}>{t[item.titleKey]}</Text>
                            <Ionicons name="chevron-forward" size={27} color="#111111"/>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.menuItem}
                        activeOpacity={0.8}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>{t.logout}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="settings"/>
        </View>
    );
}
