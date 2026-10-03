import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import { queueResultStyles as styles } from "../../styles/queue/queueResultStyle";
import { useLanguage } from "../../context/LanguageContext";

export default function QueueSuccessScreen({ navigation }) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoGreen}>Q</Text>
                            <Text style={styles.logoPurple}>ast</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.navigate("Notifications")
                        }
                    >
                        <Ionicons
                            name="notifications"
                            size={27}
                            color="#111111"
                        />
                    </TouchableOpacity>
                </View>

                {/* SUCCESS ICON */}
                <View style={styles.resultIconWrapper}>
                    <View style={styles.circleOuter}>
                        <View style={styles.circleMiddle}>
                            <View style={styles.circleInner}>
                                <View style={styles.successCircle}>
                                    <Ionicons
                                        name="checkmark"
                                        size={28}
                                        color="#FFFFFF"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* MESSAGE */}
                <View style={styles.message}>
                    <Text style={styles.title}>
                        {t.queueSuccessTitle}
                    </Text>

                    <Text style={styles.description}>
                        {t.queueSuccessDescription}
                    </Text>
                </View>

                <View style={styles.bottomContent}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.85}
                        onPress={() =>
                            navigation.navigate("Appointments")
                        }
                    >
                        <Text style={styles.primaryButtonText}>
                            {t.viewAppointments}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        {t.queueSuccessHint}
                    </Text>
                </View>
            </ScrollView>

            <BottomNavigation
                navigation={navigation}
                active="appointments"
            />
        </View>
    );
}