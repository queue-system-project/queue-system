import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { editProfileStyles as styles } from "../../styles/profile/editProfileStyle";
import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";

import { clearAuthData, getUserId } from "../../api/auth/tokenStorage";
import { authorizedRequest } from "../../api/authorizedRequest";
import { getProfile } from "../../api/profile/profileApi";

export default function EditProfileScreen({ navigation }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);

                const userId = await getUserId();

                if (!userId) {
                    await clearAuthData();

                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    });

                    return;
                }

                const user = await getProfile(userId);
                if (!mounted) return;

                setFirstName(user?.first_name || "");
                setLastName(user?.last_name || "");
                setProfileImage(user?.profile_image || null);

            } catch (error) {
                console.error("LOAD PROFILE ERROR:", error);

                if (mounted) {
                    showMessage(t.couldNotLoadProfile, "error");
                }

            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [navigation]);

    const handleSave = async () => {
        if (saving || loading) return;

        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();

        if (!normalizedFirstName || !normalizedLastName) {
            showMessage(t.firstAndLastNameRequired, "error");
            return;
        }

        try {
            setSaving(true);

            const userId = await getUserId();

            if (!userId) {
                showMessage(t.sessionExpired, "error");

                await clearAuthData();

                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                });

                return;
            }

            await authorizedRequest(
                "/api/users/complete-profile",
                "PUT",
                {
                    user_id: userId,
                    first_name: normalizedFirstName,
                    last_name: normalizedLastName,
                }
            );

            showMessage(t.profileUpdatedSuccessfully, "success");
            navigation.goBack();

        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error);
            showMessage(t.couldNotUpdateProfile, "error");

        } finally {
            setSaving(false);
        }
    };

    const handleChangePhoto = () => {
        showMessage(t.photoEditingUnavailable, "error");
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                        disabled={saving}
                    >
                        <Ionicons name="chevron-back" size={28} color="#5657C4"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (saving || loading) && { opacity: 0.5 },
                        ]}
                        activeOpacity={0.8}
                        onPress={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#5657C4"/>
                        ) : (
                            <Ionicons name="checkmark" size={30} color="#5657C4"/>
                        )}
                    </TouchableOpacity>
                </View>

                {/* AVATAR */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#5657C4"/>
                        ) : profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 999,
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="person-outline" size={62} color="#111111"/>
                        )}

                        <TouchableOpacity
                            style={styles.changePhotoButton}
                            activeOpacity={0.8}
                            onPress={handleChangePhoto}
                            disabled={loading || saving}
                        >
                            <Ionicons name="person-add" size={15} color="#111111"/>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FORM */}
                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>{t.firstName}</Text>

                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            style={styles.input}
                            placeholderTextColor="#999999"
                            editable={!loading && !saving}
                            autoCapitalize="words"
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>{t.lastName}</Text>

                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            style={styles.input}
                            placeholderTextColor="#999999"
                            editable={!loading && !saving}
                            autoCapitalize="words"
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}