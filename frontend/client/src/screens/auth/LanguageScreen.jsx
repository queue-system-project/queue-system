import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { authStyles as styles } from "../../styles/auth/authStyles";

export default function LanguageScreen({ navigation }) {
    const { language, setLanguage } = useLanguage();

    const handleSelectLanguage = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        navigation.goBack();
    };

    return (
        <View style={styles.languageScreenContainer}>
            <View style={styles.languageScreenHeader}>
                <TouchableOpacity
                    style={styles.languageBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={require("../../../assets/back.png")}
                        style={styles.languageBackIcon}
                    />
                </TouchableOpacity>

                <Text style={styles.languageScreenTitle}>Language</Text>

                <View style={styles.languageHeaderSpacer} />
            </View>

            <View style={styles.languageList}>
                <TouchableOpacity
                    style={styles.languageListItem}
                    onPress={() => handleSelectLanguage("en")}
                >
                    <View style={styles.languageCheckContainer}>
                        {language === "en" && (
                            <Text style={styles.languageCheck}>✓</Text>
                        )}
                    </View>

                    <Text
                        style={[
                            styles.languageListText,
                            language === "en" && styles.languageListTextActive,
                        ]}
                    >
                        English
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.languageListItem}
                    onPress={() => handleSelectLanguage("pl")}
                >
                    <View style={styles.languageCheckContainer}>
                        {language === "pl" && (
                            <Text style={styles.languageCheck}>✓</Text>
                        )}
                    </View>

                    <Text
                        style={[
                            styles.languageListText,
                            language === "pl" && styles.languageListTextActive,
                        ]}
                    >
                        Polish
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}