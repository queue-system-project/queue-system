import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { profileDetailsStyles as styles } from "../../styles/profile/profileDetailsStyle";
import BottomNavigation from "../../components/BottomNavigation";

export default function ProfileDetailsScreen({ navigation }) {
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
                        <Ionicons
                            name="chevron-back"
                            size={32}
                            color="#5657C4"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.editButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate("EditProfile")}
                    >
                        <Ionicons
                            name="pencil"
                            size={24}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>

                {/* USER */}
                <View style={styles.user}>
                    <View style={styles.avatar}>
                        <Ionicons
                            name="person-outline"
                            size={62}
                            color="#111111"
                        />
                    </View>

                    <Text style={styles.name}>
                        Devid Jonson
                    </Text>
                </View>

                {/* CONTACTS */}
                <View style={styles.contacts}>
                    <View style={styles.contactRow}>
                        <Ionicons
                            name="call"
                            size={19}
                            color="#111111"
                        />

                        <Text style={styles.contactText}>
                            + 48 123 456 789
                        </Text>
                    </View>

                    <View style={styles.contactRow}>
                        <Ionicons
                            name="mail"
                            size={19}
                            color="#111111"
                        />

                        <Text style={styles.contactText}>
                            username@gmail.com
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <BottomNavigation
                navigation={navigation}
                active="profile"
            />
        </View>
    );
}