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

export default function QueueErrorScreen({ navigation }) {
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

                {/* ERROR ICON */}
                <View style={styles.resultIconWrapper}>
                    <View
                        style={[
                            styles.circleOuter,
                            styles.circleOuterError,
                        ]}
                    >
                        <View
                            style={[
                                styles.circleMiddle,
                                styles.circleMiddleError,
                            ]}
                        >
                            <View
                                style={[
                                    styles.circleInner,
                                    styles.circleInnerError,
                                ]}
                            >
                                <View style={styles.errorCircle}>
                                    <Ionicons
                                        name="close"
                                        size={30}
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
                        {t.queueErrorTitle}
                    </Text>

                    <Text style={styles.description}>
                        {t.queueErrorDescription}
                    </Text>
                </View>

                <View style={styles.bottomContent}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.primaryButtonText}>
                            {t.tryAgain}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.hint}>
                        {t.queueErrorHint}
                    </Text>
                </View>
            </ScrollView>

            <BottomNavigation
                navigation={navigation}
            />
        </View>
    );
}