import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { bottomNavigationStyles as styles } from "../styles/bottomNavigationStyle";
import { useLanguage } from "../context/LanguageContext";

export default function BottomNavigation({ navigation, active }) {
    const { t } = useLanguage();

    const getColor = (tab) =>
        active === tab ? "#5657C4" : "#111111";

    return (
        <View style={styles.bottomNavigation}>

            {/* HOME */}
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate("Home")}
            >
                <Ionicons
                    name={
                        active === "home"
                            ? "home"
                            : "home-outline"
                    }
                    size={24}
                    color={getColor("home")}
                />

                <Text
                    style={[
                        styles.navText,
                        active === "home" && styles.activeText,
                    ]}
                >
                    {t.homeTitle}
                </Text>
            </TouchableOpacity>

            {/* SEARCH */}
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate("Search")}
            >
                <Ionicons
                    name={
                        active === "search"
                            ? "search"
                            : "search-outline"
                    }
                    size={24}
                    color={getColor("search")}
                />

                <Text
                    style={[
                        styles.navText,
                        active === "search" && styles.activeText,
                    ]}
                >
                    {t.searchTitle}
                </Text>
            </TouchableOpacity>

            {/* APPOINTMENTS */}
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate("Appointments")}
            >
                <MaterialCommunityIcons
                    name={
                        active === "appointments"
                            ? "calendar-month"
                            : "calendar-month-outline"
                    }
                    size={24}
                    color={getColor("appointments")}
                />

                <Text
                    style={[
                        styles.navText,
                        active === "appointments" && styles.activeText,
                    ]}
                >
                    {t.appointmentsTitle}
                </Text>
            </TouchableOpacity>

            {/* PROFILE */}
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate("Profile")}
            >
                <Ionicons
                    name={
                        active === "profile"
                            ? "person"
                            : "person-outline"
                    }
                    size={24}
                    color={getColor("profile")}
                />

                <Text
                    style={[
                        styles.navText,
                        active === "profile" && styles.activeText,
                    ]}
                >
                    {t.profileTitle}
                </Text>
            </TouchableOpacity>

        </View>
    );
}