import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { registerUser } from "../../api/auth/authApi";
import { authStyles as styles } from "../../styles/auth/authStyles";

export default function RegisterScreen({ navigation }) {
    const [method, setMethod] = useState("email");
    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [hidePassword, setHidePassword] = useState(true);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const handleRegister = async () => {
        if (!loginValue.trim() || !password) {
            showMessage(t.missingInfoMessage, "error");
            return;
        }

        if (!acceptTerms) {
            showMessage(t.termsNotAcceptedMessage, "error");
            return;
        }

        const body = {
            password,
            accept_terms: acceptTerms,
        };

        if (method === "email") {
            body.email = loginValue.trim();
        } else {
            const phone = loginValue.trim().replace(/\s/g, "");

            body.phone = phone.startsWith("+")
                ? phone
                : `+48${phone}`;
        }

        try {
            setLoading(true);

            await registerUser(body);

            const login = method === "email"
                ? body.email
                : body.phone;

            navigation.navigate("Code", {
                login,
                flow: "register",
            });
        } catch (error) {
            showMessage(error.message, "error");
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

            <Text style={[styles.title, styles.titleRegister]}>
                {t.registrationTitle}
            </Text>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, method === "email" && styles.activeTab]}
                    onPress={() => setMethod("email")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            method === "email" && styles.activeTabText,
                        ]}
                    >
                        {t.emailTab}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, method === "phone" && styles.activeTab]}
                    onPress={() => setMethod("phone")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            method === "phone" && styles.activeTabText,
                        ]}
                    >
                        {t.phoneTab}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
                <Image source={require("../../../assets/email.png")} style={styles.inputIcon}/>

                <TextInput
                    style={styles.input}
                    placeholder={method === "email" ? t.email : t.phoneNumber}
                    placeholderTextColor="#9E9E9E"
                    value={loginValue}
                    onChangeText={setLoginValue}
                    autoCapitalize="none"
                    keyboardType={method === "email" ? "email-address" : "phone-pad"}
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

            {/*alert requirements pass*/}
            {/*<Text style={styles.passwordRequirements}>*/}
            {/*    {t.passwordRequirements}*/}
            {/*</Text>*/}

            <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
            >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]}>
                    {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>

                <Text style={styles.termsText}>
                    {t.termsTextStart}{" "}
                    <Text style={styles.semiBold}>{t.termsConditions}</Text>{" "}
                    {t.and} <Text style={styles.semiBold}>{t.privacyPolicy}</Text>{" "}
                    {t.termsTextEnd} <Text style={styles.required}>*</Text>
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.mainButton}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.mainButtonText}>{t.registerButton}</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.bottomRow}
                activeOpacity={1}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={styles.bottomText}>{t.haveAccount} </Text>
                <Text style={styles.linkText}>{t.loginLink}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}