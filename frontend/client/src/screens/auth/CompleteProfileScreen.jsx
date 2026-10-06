import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { completeProfileStyles as styles } from "../../styles/auth/completeProfileStyles";
import { completeProfile } from "../../api/user/userApi";
import { getUserId } from "../../api/auth/tokenStorage";

export default function CompleteProfileScreen({ navigation }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);

    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const handleContinue = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            showMessage(t.completeProfileRequired, "error");
            return;
        }

        try {
            setLoading(true);

            const userId = await getUserId();

            await completeProfile({
                user_id: userId,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
            });

            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
            });

        } catch (error) {
            console.error("COMPLETE PROFILE ERROR:", error);
            showMessage(t.completeProfileError, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.header}>
                <Text style={styles.logo}>
                    <Text style={styles.logoGreen}>Q</Text>
                    <Text style={styles.logoBlue}>ast</Text>
                </Text>

                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={() => navigation.navigate("Language")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.languageText}>{t.languageName}</Text>
                    <Ionicons name="chevron-down" size={20} color="#111111"/>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>{t.completeProfileTitle}</Text>

            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={62} color="#111111"/>

                    <TouchableOpacity style={styles.changePhotoButton} activeOpacity={0.8}>
                        <Ionicons name="person-add" size={15} color="#111111"/>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.form}>
                <View style={styles.field}>
                    <Text style={styles.label}>
                        {t.firstName} <Text style={styles.required}>*</Text>
                    </Text>

                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        style={styles.input}
                        placeholderTextColor="#999999"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>
                        {t.lastName} <Text style={styles.required}>*</Text>
                    </Text>

                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        style={styles.input}
                        placeholderTextColor="#999999"
                    />
                </View>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <Text style={styles.continueButtonText}>{t.continue}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}