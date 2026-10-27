import React from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminSearchBar({ value, onChangeText, placeholder, style }) {
    return (
        <View style={[styles.searchWrapper, style]}>
            <Ionicons name="search-outline" size={22} color="#858585"/>

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#858585"
                style={styles.searchInput}
            />
        </View>
    );
}
