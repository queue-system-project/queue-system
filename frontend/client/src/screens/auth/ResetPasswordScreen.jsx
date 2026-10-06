import React, { useRef, useState } from "react";
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image,} from "react-native";

import { resetPasswordUser } from "../../api/auth/authApi";
import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { authStyles as styles } from "../../styles/auth/authStyles";

export default function ResetPasswordScreen({ navigation, route }) {
    const login = route?.params?.login || "";
    const verificationCode = route?.params?.verificationCode || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hidePassword, setHidePassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            showMessage(t.enterNewPassword, "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(t.passwordsDoNotMatchMessage, "error");
            return;
        }

        if (!login || !verificationCode) {
            showMessage(t.passwordResetSessionInvalid, "error");
            return;
        }

        try {
            setLoading(true);

            await resetPasswordUser({
                login,
                verification_code: verificationCode,
                new_password: newPassword,
            });

            showMessage(t.resetPasswordSuccess, "success");

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                });
            }, 1200);

        } catch (error) {
            console.error("RESET PASSWORD ERROR:", error);
            showMessage(t.resetPasswordError, "error");
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
                <Image source={require("../../../assets/down-arrow.png")} style={styles.languageArrow}
                />
            </TouchableOpacity>

            <Text style={[styles.logo, styles.logoMargin]}>
                <Text style={styles.logoGreen}>Q</Text>
                <Text style={styles.logoBlue}>ast</Text>
            </Text>

            <Text style={[styles.title, styles.titleForgot]}>
                {t.resetPasswordTitle}
            </Text>

            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputWrapper}
                onPress={() => passwordInputRef.current?.focus()}
            >
                <Image
                    source={require("../../../assets/padlock.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder={t.newPassword}
                    placeholderTextColor="#9E9E9E"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={hidePassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                    <Image
                        source={hidePassword ? require("../../../assets/hiddedpass.png") : require("../../../assets/seepass.png")}
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputWrapper}
                onPress={() => confirmPasswordInputRef.current?.focus()}
            >
                <Image source={require("../../../assets/padlock.png")} style={styles.inputIcon}/>

                <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.input}
                    placeholder={t.confirmPassword}
                    placeholderTextColor="#9E9E9E"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={hideConfirmPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                >
                    <Image
                        source={hideConfirmPassword ? require("../../../assets/hiddedpass.png") : require("../../../assets/seepass.png")}
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.resetPasswordSpacer}/>

            <TouchableOpacity
                style={styles.mainButton}
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#FFFFFF"/>
                    : <Text style={styles.mainButtonText}>{t.confirmButton}</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.secondaryButtonText}>{t.back}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}