import React from "react";
import { Text, View } from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function RoomBadge({ room }) {
    const { t } = useLanguage();

    return (
        <View style={styles.roomContainer}>
            <View style={styles.roomBadge}>
                <Text style={styles.roomBadgeText}>{room}</Text>
            </View>
            <Text style={styles.roomLabel}>{t.adminRoom}</Text>
        </View>
    );
}
