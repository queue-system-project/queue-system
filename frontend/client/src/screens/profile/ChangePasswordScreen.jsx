import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";

import { changePasswordStyles as styles } from "../../styles/profile/changePasswordStyle";
import { useLanguage } from "../../context/LanguageContext";
import {changePassword} from "../../api/profile/profileApi";
import {useMessage} from "../../context/MessageContext";

export default function ChangePasswordScreen({ navigation }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

    const [loading, setLoading] = useState(false);

    const currentPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleChangePassword = async () => {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            showMessage(
                t.fillAllFields,
                "error"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage(
                t.passwordsDoNotMatch,
                "error"
            );
            return;
        }

        if (currentPassword === newPassword) {
            showMessage(
                t.newPasswordMustBeDifferent,
                "error"
            );
            return;
        }

        try {
            setLoading(true);

            await changePassword(
                currentPassword,
                newPassword
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            showMessage(
                t.changePasswordSuccess,
                "success"
            );

            navigation.goBack();
        } catch (error) {
            const message =
                error?.message ===
                "Current password is incorrect"
                    ? t.currentPasswordIncorrect
                    : t.changePasswordError;

            showMessage(
                message,
                "error"
            );

            console.error(
                "Change password error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* LOGO */}
            <Text style={styles.logo}>
                <Text style={styles.logoGreen}>Q</Text>
                <Text style={styles.logoBlue}>ast</Text>
            </Text>

            {/* TITLE */}
            <Text style={styles.title}>
                {t.changePasswordTitle}
            </Text>

            {/* CURRENT PASSWORD */}
            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputWrapper}
                onPress={() => currentPasswordRef.current?.focus()}
            >
                <Image
                    source={require("../../../assets/padlock.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    ref={currentPasswordRef}
                    style={styles.input}
                    placeholder={t.currentPassword}
                    placeholderTextColor="#9E9E9E"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={hideCurrentPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={() =>
                        setHideCurrentPassword(!hideCurrentPassword)
                    }
                >
                    <Image
                        source={
                            hideCurrentPassword
                                ? require("../../../assets/hiddedpass.png")
                                : require("../../../assets/seepass.png")
                        }
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* NEW PASSWORD */}
            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputWrapper}
                onPress={() => newPasswordRef.current?.focus()}
            >
                <Image
                    source={require("../../../assets/padlock.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    ref={newPasswordRef}
                    style={styles.input}
                    placeholder={t.newPassword}
                    placeholderTextColor="#9E9E9E"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={hideNewPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={() =>
                        setHideNewPassword(!hideNewPassword)
                    }
                >
                    <Image
                        source={
                            hideNewPassword
                                ? require("../../../assets/hiddedpass.png")
                                : require("../../../assets/seepass.png")
                        }
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* CONFIRM PASSWORD */}
            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputWrapper}
                onPress={() => confirmPasswordRef.current?.focus()}
            >
                <Image
                    source={require("../../../assets/padlock.png")}
                    style={styles.inputIcon}
                />

                <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder={t.confirmNewPassword}
                    placeholderTextColor="#9E9E9E"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={hideConfirmPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={() =>
                        setHideConfirmPassword(!hideConfirmPassword)
                    }
                >
                    <Image
                        source={
                            hideConfirmPassword
                                ? require("../../../assets/hiddedpass.png")
                                : require("../../../assets/seepass.png")
                        }
                        style={styles.eyeIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* CONFIRM */}
            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleChangePassword}
                disabled={loading}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.confirmButtonText}>
                        {t.confirm}
                    </Text>
                )}
            </TouchableOpacity>

            {/* BACK */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
            >
                <Text style={styles.backButtonText}>
                    {t.back}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}