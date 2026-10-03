import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { authStyles as styles } from "../../styles/auth/authStyles";

import {
    verifyUser,
    resendVerificationUser,
    forgotPasswordUser,
} from "../../api/auth/authApi";

export default function CodeScreen({ navigation, route }) {
    const login = route?.params?.login || "";
    const flow = route?.params?.flow || "register";

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    const inputRef = useRef(null);

    const { t } = useLanguage();
    const { showMessage } = useMessage();

    useEffect(() => {
        if (resendTimer <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setResendTimer((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendTimer]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const handleCodeChange = (value) => {
        const onlyNumbers = value.replace(/[^0-9]/g, "").slice(0, 4);

        setCode(onlyNumbers);

        if (onlyNumbers.length === 4) {
            inputRef.current?.blur();
            Keyboard.dismiss();
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || resendLoading) {
            return;
        }

        try {
            setResendLoading(true);

            if (flow === "reset") {
                await forgotPasswordUser({
                    login,
                });
            } else {
                await resendVerificationUser({
                    login,
                });
            }

            setCode("");
            setResendTimer(60);
        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            setResendLoading(false);
        }
    };

    const handleVerify = async () => {
        if (code.length !== 4) {
            showMessage(t.codeError, "error");
            return;
        }

        try {
            setLoading(true);

            if (flow === "reset") {
                navigation.navigate("ResetPassword", {
                    login,
                    verificationCode: code,
                });

                return;
            }

            await verifyUser({
                login,
                code,
            });

            navigation.navigate("Login");
        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={() => navigation.navigate("Language")}
                >
                    <Text style={styles.languageText}>
                        {t.languageName}
                    </Text>

                    <Image
                        source={require("../../../assets/down-arrow.png")}
                        style={styles.languageArrow}
                    />
                </TouchableOpacity>

                <Text style={[styles.logo, styles.logoMargin]}>
                    <Text style={styles.logoGreen}>Q</Text>
                    <Text style={styles.logoBlue}>ast</Text>
                </Text>

                <Text style={[styles.title, styles.titleCode]}>
                    {t.codeTitle}
                </Text>

                <Text style={styles.subtitle}>
                    {t.codeSubtitle}
                </Text>

                <View style={styles.codeCenterBlock}>
                    <TouchableOpacity
                        style={styles.codeRow}
                        activeOpacity={1}
                        onPress={() => inputRef.current?.focus()}
                    >
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>
                                {code[0] || ""}
                            </Text>
                        </View>

                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>
                                {code[1] || ""}
                            </Text>
                        </View>

                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>
                                {code[2] || ""}
                            </Text>
                        </View>

                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>
                                {code[3] || ""}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.resendText}>
                        {t.noCode}{" "}

                        {resendTimer > 0 ? (
                            <Text>
                                {formatTime(resendTimer)}
                            </Text>
                        ) : (
                            <Text
                                style={styles.linkText}
                                onPress={handleResend}
                            >
                                {resendLoading ? "..." : t.resend}
                            </Text>
                        )}
                    </Text>
                </View>

                <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={handleCodeChange}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.hiddenInput}
                />

                <View style={styles.codeButtonSpacer} />

                <TouchableOpacity
                    style={styles.mainButton}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.mainButtonText}>
                            {t.confirmButton}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.secondaryButtonText}>
                        {t.back}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}