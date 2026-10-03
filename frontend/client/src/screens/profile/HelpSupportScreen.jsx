import React from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { helpSupportStyles as styles } from "../../styles/profile/helpSupportStyle";
import { useLanguage } from "../../context/LanguageContext";

export default function HelpSupportScreen({ navigation }) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color="#5657C4"
                    />
                </TouchableOpacity>

                <Text style={styles.title}>
                    {t.helpSupportTitle}
                </Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>
                    {t.contact}
                </Text>

                <View style={styles.emailRow}>
                    <Text style={styles.email}>
                        office@qast.com
                    </Text>

                    <TouchableOpacity activeOpacity={0.7}>
                        <Ionicons
                            name="copy-outline"
                            size={18}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}