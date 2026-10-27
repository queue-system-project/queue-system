import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { bottomNavigationStyles as styles } from "../styles/bottomNavigationStyle";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const clientTabs = [
    { key: "home", route: "Home", label: "homeTitle", Icon: Ionicons, icon: "home-outline", activeIcon: "home" },
    { key: "search", route: "Search", label: "searchTitle", Icon: Ionicons, icon: "search-outline", activeIcon: "search" },
    { key: "appointments", route: "Appointments", label: "appointmentsTitle", Icon: MaterialCommunityIcons, icon: "calendar-month-outline", activeIcon: "calendar-month" },
    { key: "profile", route: "Profile", label: "profileTitle", Icon: Ionicons, icon: "person-outline", activeIcon: "person" },
];

const adminTabs = [
    { key: "home", route: "Home", label: "homeTitle", Icon: Ionicons, icon: "home-outline", activeIcon: "home" },
    { key: "institution", route: "AdminInstitution", label: "navInstitution", Icon: Ionicons, icon: "business-outline", activeIcon: "business" },
    { key: "queues", route: "AdminQueues", label: "navQueues", Icon: MaterialCommunityIcons, icon: "chevron-triple-right", activeIcon: "chevron-triple-right" },
    { key: "employees", route: "AdminEmployees", label: "navEmployees", Icon: Ionicons, icon: "people-outline", activeIcon: "people" },
    { key: "settings", route: "AdminSettings", label: "navSettings", Icon: Ionicons, icon: "settings-outline", activeIcon: "settings" },
];

export default function BottomNavigation({ navigation, active }) {
    const { t } = useLanguage();
    const { user } = useAuth();

    const isAdmin = user?.role === "admin";
    const tabs = isAdmin ? adminTabs : clientTabs;

    return (
        <View style={styles.bottomNavigation}>
            {tabs.map(({ key, route, label, Icon, icon, activeIcon }) => {
                const isActive = active === key;

                return (
                    <TouchableOpacity
                        key={key}
                        style={[styles.navItem, isAdmin && styles.navItemAdmin]}
                        disabled={!route}
                        onPress={() => navigation.navigate(route)}
                    >
                        <Icon
                            name={isActive ? activeIcon : icon}
                            size={24}
                            color={isActive ? "#5657C4" : "#111111"}
                        />

                        <Text
                            style={[
                                styles.navText,
                                isActive && styles.activeText,
                            ]}
                        >
                            {t[label]}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
