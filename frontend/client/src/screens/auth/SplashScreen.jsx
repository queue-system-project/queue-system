import React, { useEffect } from "react";
import { Text, View } from "react-native";

import { authStyles as styles } from "../../styles/auth/authStyles";

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("RoleSelection");
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.splashContainer}>
            <Text style={styles.splashLogo}>
                <Text style={styles.logoGreen}>Q</Text>
                <Text style={styles.logoWhite}>ast</Text>
            </Text>
        </View>
    );
}