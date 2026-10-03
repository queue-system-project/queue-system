import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { privacyPolicyStyles as styles } from "../../styles/profile/privacyPolicyStyle";
import { useLanguage } from "../../context/LanguageContext";

export default function PrivacyPolicyScreen({ navigation }) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            {/* HEADER */}
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
                    {t.privacyPolicyTitle}
                </Text>
            </View>

            {/* CONTENT */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>
                    {t.privacyIntroductionTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyIntroductionText1}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyIntroductionText2}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacyInformationTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyInformationText}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacyUseTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyUseText}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacyProtectionTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyProtectionText1}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyProtectionText2}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacySharingTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacySharingText}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacyRightsTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyRightsText}
                </Text>

                <Text style={styles.sectionTitle}>
                    {t.privacyChangesTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.privacyChangesText}
                </Text>
            </ScrollView>
        </View>
    );
}