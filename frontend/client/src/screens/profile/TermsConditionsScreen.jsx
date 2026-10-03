import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { termsStyles as styles } from "../../styles/profile/termsConditionsStyle";
import { useLanguage } from "../../context/LanguageContext";

export default function TermsConditionsScreen({ navigation }) {
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
                    {t.termsConditionsTitle}
                </Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. INTRODUCTION */}
                <Text style={styles.sectionTitle}>
                    {t.termsIntroductionTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsIntroductionText1}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsIntroductionText2}
                </Text>

                {/* 2. PURPOSE */}
                <Text style={styles.sectionTitle}>
                    {t.termsPurposeTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsPurposeText}
                </Text>

                {/* 3. USER ACCOUNTS */}
                <Text style={styles.sectionTitle}>
                    {t.termsAccountsTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsAccountsText1}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsAccountsText2}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsAccountsText3}
                </Text>

                {/* 4. USER ROLES */}
                <Text style={styles.sectionTitle}>
                    {t.termsRolesTitle}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsRolesText1}
                </Text>

                <Text style={styles.paragraph}>
                    {t.termsRolesText2}
                </Text>
            </ScrollView>
        </View>
    );
}