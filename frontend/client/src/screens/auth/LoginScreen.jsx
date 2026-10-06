import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image,} from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { loginUser } from "../../api/auth/authApi";
import { useAuth } from "../../context/AuthContext";
import { saveAuthData } from "../../api/auth/tokenStorage";
import { authStyles as styles } from "../../styles/auth/authStyles";
import { getUser } from "../../api/user/userApi";

export default function LoginScreen({ navigation }) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [hidePassword, setHidePassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const { t } = useLanguage();
    const { showMessage } = useMessage();
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!login.trim() || !password) {
            showMessage(t.missingInfoMessage, "error");
            return;
        }

        let normalizedLogin = login.trim();

        if (!normalizedLogin.includes("@")) {
            normalizedLogin = normalizedLogin.replace(/\s/g, "");

            if (!normalizedLogin.startsWith("+")) {
                normalizedLogin = `+48${normalizedLogin}`;
            }
        }

        try {
            setLoading(true);

            const data = await loginUser({
                login: normalizedLogin,
                password,
            });

            await saveAuthData(data);

            const user = await getUser(data.user_id);
            signIn(user);

            navigation.reset({
                index: 0,
                routes: [{
                    name:
                        !user.first_name || !user.last_name
                            ? "CompleteProfile"
                            : "Home",
                }],
            });

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            showMessage(t.loginError, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <TouchableOpacity
                style={styles.languageButton}
                onPress={() => navigation.navigate("Language")}
            >
                <Text style={styles.languageText}>{t.languageName}</Text>
                <Image
                    source={require("../../../assets/down-arrow.png")}
                    style={styles.languageArrow}
                />
            </TouchableOpacity>

            <Text style={[styles.logo, styles.logoMargin]}>
                <Text style={styles.logoGreen}>Q</Text>
                <Text style={styles.logoBlue}>ast</Text>
            </Text>

            <Text style={[styles.title, styles.titleDefault]}>
                {t.loginTitle}
            </Text>

            <View style={styles.inputWrapper}>
                <Image
                    source={require("../../../assets/email.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    style={styles.input}
                    placeholder={t.emailOrPhone}
                    placeholderTextColor="#9E9E9E"
                    value={login}
                    onChangeText={setLogin}
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputWrapper}>
                <Image
                    source={require("../../../assets/padlock.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    style={styles.input}
                    placeholder={t.password}
                    placeholderTextColor="#9E9E9E"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={hidePassword}
                />

                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                    <Image
                        source={
                            hidePassword
                                ? require("../../../assets/hiddedpass.png")
                                : require("../../../assets/seepass.png")
                        }
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => navigation.navigate("ForgotPassword")}
            >
                <Text style={styles.forgotText}>{t.forgotPassword}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.mainButton}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#FFFFFF"/>
                    : <Text style={styles.mainButtonText}>{t.loginButton}</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.bottomRow}
                activeOpacity={1}
                onPress={() => navigation.navigate("Register")}
            >
                <Text style={styles.bottomText}>{t.noAccount}{" "}</Text>
                <Text style={styles.linkText}>{t.registerLink}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}