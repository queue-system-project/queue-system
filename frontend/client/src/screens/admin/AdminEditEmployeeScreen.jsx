import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AdminBackHeader from "../../components/admin/AdminBackHeader";
import AdminSelect from "../../components/admin/AdminSelect";
import EmployeeAvatar from "../../components/admin/EmployeeAvatar";

import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import { adminInstitutionMock, adminServicesMock } from "../../constants/admin/adminInstitutionMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Specjalne wartości w polach godzin; ustawienie jednej ustawia oba pola dnia.
const HOLIDAY = "holiday";
const DAY_OFF = "dayOff";

// Godziny co 30 min od 06:00 do 22:00.
const TIMES = Array.from({ length: 33 }, (_, index) => {
    const minutes = 6 * 60 + index * 30;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    return `${hh}:${mm}`;
});

const buildDays = employee => {
    const holidays = employee.holidays ?? [];
    const hoursByDay = new Map(
        (employee.working_hours ?? []).map(item => [item.day_of_week, item])
    );

    return DAYS.map((_, index) => {
        if (holidays.includes(index)) return { from: HOLIDAY, to: HOLIDAY };

        const hours = hoursByDay.get(index);
        if (!hours) return { from: DAY_OFF, to: DAY_OFF };

        return { from: hours.start_time, to: hours.end_time };
    });
};

const isSpecial = value => value === HOLIDAY || value === DAY_OFF;

export default function AdminEditEmployeeScreen({ navigation, route }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    // TODO: podmienić na dane pracownika z API.
    const employee = route?.params?.employee ?? adminEmployeesMock[0];

    const [firstName, setFirstName] = useState(employee.first_name ?? "");
    const [lastName, setLastName] = useState(employee.last_name ?? "");
    const [institutionId, setInstitutionId] = useState(adminInstitutionMock.id);
    const [room, setRoom] = useState(employee.room ?? null);
    const [serviceIds, setServiceIds] = useState(employee.service_ids ?? []);
    const [days, setDays] = useState(() => buildDays(employee));

    // TODO: lista instytucji i gabinetów z API.
    const institutionOptions = [{
        value: adminInstitutionMock.id,
        label: `${adminInstitutionMock.name}, ${adminInstitutionMock.address}`,
    }];

    const roomOptions = [...new Set(adminEmployeesMock.map(item => item.room).filter(Boolean))]
        .sort()
        .map(value => ({ value, label: value }));

    const serviceOptions = adminServicesMock
        .filter(service => !serviceIds.includes(service.id))
        .map(service => ({ value: service.id, label: service.name }));

    const selectedServices = adminServicesMock.filter(service => serviceIds.includes(service.id));

    const timeOptions = [
        ...TIMES.map(value => ({ value, label: value })),
        { value: HOLIDAY, label: t.holiday },
        { value: DAY_OFF, label: t.dayOff },
    ];

    const updateDay = (index, field, value) => {
        setDays(current => current.map((day, dayIndex) => {
            if (dayIndex !== index) return day;

            if (isSpecial(value)) return { from: value, to: value };

            // Wyjście z urlopu/wolnego: drugie pole dostaje domyślną godzinę.
            if (isSpecial(day.from) || isSpecial(day.to)) {
                return { from: "10:00", to: "17:00", [field]: value };
            }

            return { ...day, [field]: value };
        }));
    };

    const handleSave = () => {
        if (!firstName.trim() || !lastName.trim()) {
            showMessage(t.editEmployeeMissingName, "error");
            return;
        }

        const invalidDay = days.findIndex(day => !isSpecial(day.from) && day.from >= day.to);
        if (invalidDay !== -1) {
            showMessage(`${t[DAYS[invalidDay]]}: ${t.editEmployeeInvalidHours}`, "error");
            return;
        }

        const updated = {
            ...employee,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            institution_id: institutionId,
            room,
            service_ids: serviceIds,
            working_hours: days
                .map((day, index) => ({ day_of_week: index, start_time: day.from, end_time: day.to }))
                .filter(day => !isSpecial(day.start_time)),
            holidays: days
                .map((day, index) => (day.from === HOLIDAY ? index : null))
                .filter(index => index !== null),
        };

        // TODO: zapisać przez API (dane pracownika, usługi, godziny pracy).
        showMessage(t.editEmployeeSaved, "success");
        navigation.popTo("AdminEmployeeDetails", { employee: updated });
    };

    return (
        <View style={styles.container}>
            <AdminBackHeader
                title={t.editEmployeeTitle}
                navigation={navigation}
                actionIcon="checkmark"
                onAction={handleSave}
            />

            <ScrollView
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* AVATAR */}
                <View style={styles.editAvatarWrapper}>
                    <EmployeeAvatar employee={employee} size={120}/>

                    {/* TODO: zmiana zdjęcia (wymaga expo-image-picker) */}
                    <View style={styles.editAvatarBadge}>
                        <Ionicons name="person" size={11} color="#111111"/>
                    </View>
                </View>

                <Text style={styles.fieldLabel}>{t.firstName}</Text>
                <View style={styles.field}>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholderTextColor="#858585"
                        style={styles.fieldText}
                    />
                </View>

                <Text style={styles.fieldLabel}>{t.lastName}</Text>
                <View style={styles.field}>
                    <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholderTextColor="#858585"
                        style={styles.fieldText}
                    />
                </View>

                <Text style={styles.fieldLabel}>{t.editEmployeeInstitution}</Text>
                <AdminSelect
                    value={institutionId}
                    options={institutionOptions}
                    onChange={setInstitutionId}
                />

                <Text style={styles.fieldLabel}>{t.adminRoom}</Text>
                <AdminSelect
                    value={room}
                    options={roomOptions}
                    placeholder={t.chooseRoom}
                    onChange={setRoom}
                />

                {/* SERVICES */}
                <Text style={styles.fieldLabel}>{t.employeeServices}</Text>
                <AdminSelect
                    value={null}
                    options={serviceOptions}
                    placeholder={t.chooseServices}
                    disabled={serviceOptions.length === 0}
                    onChange={id => setServiceIds(current => [...current, id])}
                />

                {selectedServices.map(service => (
                    <View key={service.id} style={styles.editServiceCard}>
                        <View style={styles.editServiceTop}>
                            <Text style={styles.serviceName}>{service.name}</Text>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                hitSlop={10}
                                onPress={() => setServiceIds(current => current.filter(id => id !== service.id))}
                            >
                                <Ionicons name="close" size={22} color="#111111"/>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.duration}>{service.standard_duration} {t.min}</Text>

                        {!!service.description && (
                            <Text style={styles.serviceDescription}>{service.description}</Text>
                        )}
                    </View>
                ))}

                {/* WORKING HOURS */}
                <Text style={[styles.fieldLabel, styles.editHoursTitle]}>{t.workingHoursTitle}</Text>

                {days.map((day, index) => (
                    <View key={DAYS[index]}>
                        <Text style={styles.editDayLabel}>{t[DAYS[index]]}</Text>

                        <View style={styles.editHoursRow}>
                            <View style={styles.editHoursCell}>
                                <AdminSelect
                                    value={day.from}
                                    options={timeOptions}
                                    onChange={value => updateDay(index, "from", value)}
                                />
                            </View>

                            <View style={styles.editHoursCell}>
                                <AdminSelect
                                    value={day.to}
                                    options={timeOptions}
                                    onChange={value => updateDay(index, "to", value)}
                                />
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
