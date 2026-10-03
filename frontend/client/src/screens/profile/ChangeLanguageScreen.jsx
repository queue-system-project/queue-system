import React, { useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { changeLanguageStyles as styles } from "../../styles/profile/changeLanguageStyle";
import { useLanguage } from "../../context/LanguageContext";

const languages = [
    {
        id: "en",
        nameKey: "english",
        flag: "🇬🇧",
    },
    {
        id: "pl",
        nameKey: "polish",
        flag: "🇵🇱",
    },
];

export default function ChangeLanguageScreen({ navigation }) {
    const {
        language,
        setLanguage,
        t,
    } = useLanguage();

    const [selectedLanguage, setSelectedLanguage] =
        useState(language);

    const handleConfirm = async () => {
        await setLanguage(selectedLanguage);
        navigation.goBack();
    };

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
                    {t.languageTitle}
                </Text>
            </View>

            <View style={styles.content}>
                <View style={styles.languages}>
                    {languages.map((item) => {
                        const selected =
                            selectedLanguage === item.id;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.languageOption}
                                activeOpacity={0.8}
                                onPress={() =>
                                    setSelectedLanguage(item.id)
                                }
                            >
                                <View
                                    style={[
                                        styles.flagWrapper,
                                        selected &&
                                        styles.flagWrapperSelected,
                                    ]}
                                >
                                    <Text style={styles.flag}>
                                        {item.flag}
                                    </Text>
                                </View>

                                <Text
                                    style={[
                                        styles.languageName,
                                        selected &&
                                        styles.languageNameSelected,
                                    ]}
                                >
                                    {t[item.nameKey]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={styles.confirmButton}
                    activeOpacity={0.85}
                    onPress={handleConfirm}
                >
                    <Text style={styles.confirmText}>
                        {t.confirm}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}