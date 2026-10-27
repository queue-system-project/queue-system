import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminHeader({ title, navigation }) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>

            <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Notifications")}
            >
                <Ionicons name="notifications" size={27} color="#111111"/>
            </TouchableOpacity>
        </View>
    );
}
