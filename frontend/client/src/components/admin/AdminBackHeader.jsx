import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminBackHeader({ title, navigation, actionIcon, onAction }) {
    return (
        <View style={styles.backHeader}>
            <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={28} color="#5657C4"/>
            </TouchableOpacity>

            <Text style={styles.backHeaderTitle} numberOfLines={2}>{title}</Text>

            {!!actionIcon && (
                <TouchableOpacity
                    style={styles.headerAction}
                    activeOpacity={0.8}
                    onPress={onAction}
                >
                    <Ionicons name={actionIcon} size={24} color="#5657C4"/>
                </TouchableOpacity>
            )}
        </View>
    );
}
