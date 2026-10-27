import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import AdminBackHeader from "../../components/admin/AdminBackHeader";
import AdminSelect from "../../components/admin/AdminSelect";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

// Ile lat do przodu można wybrać (licząc od bieżącego).
const YEARS_AHEAD = 2;

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

export default function AdminHolidayScreen({ navigation }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    const [day, setDay] = useState(null);
    const [description, setDescription] = useState("");

    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from({ length: YEARS_AHEAD + 1 }, (_, index) => ({
        value: currentYear + index,
        label: String(currentYear + index),
    }));

    const monthOptions = Array.from({ length: 12 }, (_, index) => ({
        value: index,
        label: new Date(2000, index, 1).toLocaleDateString(t.locale || "en-GB", { month: "long" }),
    }));

    const dayCount = year != null && month != null ? daysInMonth(year, month) : 31;
    const dayOptions = Array.from({ length: dayCount }, (_, index) => ({
        value: index + 1,
        label: String(index + 1),
    }));

    // Po zmianie roku lub miesiąca dzień może wypaść poza zakres (np. 31 lutego).
    const clampDay = (nextYear, nextMonth) => {
        if (day != null && nextYear != null && nextMonth != null && day > daysInMonth(nextYear, nextMonth)) {
            setDay(null);
        }
    };

    const handleAdd = () => {
        if (year == null || month == null || day == null) {
            showMessage(t.holidayMissingDate, "error");
            return;
        }

        // TODO: zapisać przez API (np. zamknięcie dnia instytucji) z datą i opisem.
        showMessage(t.holidayAdded, "success");
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <AdminBackHeader title={t.holidayTitle} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.fieldLabel}>{t.holidayYear}</Text>
                <AdminSelect
                    value={year}
                    options={yearOptions}
                    placeholder={t.chooseYear}
                    onChange={value => {
                        setYear(value);
                        clampDay(value, month);
                    }}
                />

                <Text style={styles.fieldLabel}>{t.holidayMonth}</Text>
                <AdminSelect
                    value={month}
                    options={monthOptions}
                    placeholder={t.chooseMonth}
                    onChange={value => {
                        setMonth(value);
                        clampDay(year, value);
                    }}
                />

                <Text style={styles.fieldLabel}>{t.holidayDay}</Text>
                <AdminSelect
                    value={day}
                    options={dayOptions}
                    placeholder={t.chooseDay}
                    onChange={setDay}
                />

                <Text style={styles.fieldLabel}>{t.holidayDescription}</Text>
                <View style={styles.field}>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t.holidayDescriptionPlaceholder}
                        placeholderTextColor="#858585"
                        style={styles.fieldText}
                    />
                </View>

                <View style={styles.formSpacer}/>

                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={handleAdd}>
                    <Text style={styles.primaryButtonText}>{t.holidayAdd}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
