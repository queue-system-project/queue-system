import React, { createContext, useContext, useEffect, useState } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { authTranslations } from "../translations/authTranslations";
import { commonTranslations } from "../translations/commonTranslations";
import { homeTranslations } from "../translations/homeTranslations";
import { searchTranslations } from "../translations/searchTranslations";
import { appointmentsTranslations } from "../translations/appointmentsTranslations";
import { queueTranslations } from "../translations/queueTranslations";
import { institutionTranslations } from "../translations/institutionTranslations";
import { employeeTranslations } from "../translations/employeeTranslations";
import { notificationsTranslations } from "../translations/notificationsTranslations";
import { profileTranslations } from "../translations/profileTranslations";
import { languageTranslations } from "../translations/languageTranslations";
import { changePasswordTranslations } from "../translations/changePasswordTranslations";
import { helpTranslations } from "../translations/helpTranslations";
import { legalTranslations } from "../translations/legalTranslations";

const LanguageContext = createContext();

const LANGUAGE_STORAGE_KEY = "app_language";

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState("en");
    const [isLanguageReady, setIsLanguageReady] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem(
                LANGUAGE_STORAGE_KEY
            );

            if (savedLanguage) {
                setLanguageState(savedLanguage);
                return;
            }

            const deviceLanguage =
                Localization.getLocales()[0]?.languageCode;

            const defaultLanguage =
                deviceLanguage === "pl" ? "pl" : "en";

            setLanguageState(defaultLanguage);
        } catch (error) {
            setLanguageState("en");
        } finally {
            setIsLanguageReady(true);
        }
    };

    const changeLanguage = async (newLanguage) => {
        setLanguageState(newLanguage);
        await AsyncStorage.setItem(
            LANGUAGE_STORAGE_KEY,
            newLanguage
        );
    };

    const t = {
        ...commonTranslations[language],
        ...authTranslations[language],
        ...homeTranslations[language],
        ...searchTranslations[language],
        ...appointmentsTranslations[language],
        ...queueTranslations[language],
        ...institutionTranslations[language],
        ...employeeTranslations[language],
        ...notificationsTranslations[language],
        ...profileTranslations[language],
        ...languageTranslations[language],
        ...changePasswordTranslations[language],
        ...helpTranslations[language],
        ...legalTranslations[language],
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage: changeLanguage,
                t,
                isLanguageReady,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}