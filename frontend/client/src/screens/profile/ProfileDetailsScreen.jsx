import React, {useCallback, useState,} from "react";
import {ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import {profileDetailsStyles as styles,} from "../../styles/profile/profileDetailsStyle";
import BottomNavigation from "../../components/BottomNavigation";
import {clearAuthData, getUserId,} from "../../api/auth/tokenStorage";
import {getProfile,} from "../../api/profile/profileApi";

export default function ProfileDetailsScreen({navigation,}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(
        async () => {
            try {
                setLoading(true);

                const userId = await getUserId();

                if (!userId) {
                    await clearAuthData();

                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: "Login",
                            },
                        ],
                    });

                    return;
                }

                const data = await getProfile(userId);

                setUser(data);
            } catch (error) {
                console.error("Failed to load profile details:", error);
            } finally {
                setLoading(false);
            }
        },
        [navigation]
    );


    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [loadProfile])
    );

    const fullName = user ? [user.first_name, user.last_name,].filter(Boolean).join(" ") : "";

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={32} color="#5657C4"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <Ionicons name="pencil" size={24} color="#5657C4"/>
                    </TouchableOpacity>
                </View>


                {loading ? (
                    <ActivityIndicator
                        size="large"
                    />
                ) : (
                    <>
                        {/* USER */}
                        <View style={styles.user}>
                            <View style={styles.avatar}>
                                {user?.profile_image ? (
                                    <Image source={{uri: user.profile_image,}} style={styles.avatarImage}/>
                                ) : (
                                    <Ionicons name="person-outline" size={62} color="#111111"/>
                                )}
                            </View>

                            <Text style={styles.name}>
                                {fullName || "-"}
                            </Text>
                        </View>


                        {/* CONTACTS */}
                        <View style={styles.contacts}>
                            {user?.phone ? (
                                <View style={styles.contactRow}>
                                    <Ionicons name="call" size={19} color="#111111"/>

                                    <Text style={styles.contactText}>
                                        {user.phone}
                                    </Text>
                                </View>
                            ) : null}

                            {user?.email ? (
                                <View style={styles.contactRow}>
                                    <Ionicons name="mail" size={19} color="#111111"/>

                                    <Text style={styles.contactText}>
                                        {user.email}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </>
                )}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="profile"/>
        </View>
    );
}