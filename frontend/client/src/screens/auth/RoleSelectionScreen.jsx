import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
} from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { authStyles as styles } from "../../styles/auth/authStyles";

export default function RoleSelectionScreen({ navigation }) {
    const { t } = useLanguage();

    const handleContinue = (role) => {
        navigation.navigate("Login", {
            selectedRole: role,
        });
    };

    return (
        <ImageBackground
            source={require("../../../assets/choose-role-bg.jpg")}
            style={styles.roleBackground}
            resizeMode="cover"
        >
            <View style={styles.roleOverlay} />

            <View style={styles.roleContent}>
                <Text style={styles.roleLogo}>
                    <Text style={styles.logoGreen}>Q</Text>
                    <Text style={styles.logoWhite}>ast</Text>
                </Text>

                <Text style={styles.roleTitle}>
                    {t.roleSelectionTitle}
                </Text>
            </View>

            <View style={styles.roleButtons}>
                <TouchableOpacity
                    style={styles.roleClientButton}
                    onPress={() => handleContinue("client")}
                >
                    <Text style={styles.roleClientButtonText}>
                        {t.continueAsClient}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.roleEmployeeButton}
                    onPress={() => handleContinue("employee")}
                >
                    <Text style={styles.roleEmployeeButtonText}>
                        {t.continueAsEmployee}
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}