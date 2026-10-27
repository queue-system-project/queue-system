import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminBackHeader from "../../components/admin/AdminBackHeader";
import EmployeeAvatar from "../../components/admin/EmployeeAvatar";

import { useLanguage } from "../../context/LanguageContext";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import { adminServicesMock } from "../../constants/admin/adminInstitutionMock";
import { EMPLOYEE_STATUSES } from "../../constants/admin/employeeStatuses";
import { buildWorkingHours } from "../../utils/workingHours";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";
import { institutionDetailsStyles as hoursStyles } from "../../styles/institution/institutionDetailsStyle";

export default function AdminEmployeeDetailsScreen({ navigation, route }) {
    const { t } = useLanguage();

    // TODO: podmienić na dane pracownika z API.
    const employee = route?.params?.employee ?? adminEmployeesMock[0];
    const status = EMPLOYEE_STATUSES[employee.status] ?? EMPLOYEE_STATUSES.offline;

    const services = adminServicesMock.filter(service =>
        (employee.service_ids ?? []).includes(service.id)
    );

    const holidays = employee.holidays ?? [];
    const workingHours = buildWorkingHours(employee.working_hours ?? []).map((item, index) => ({
        ...item,
        holiday: holidays.includes(index),
    }));

    return (
        <View style={styles.container}>
            <AdminBackHeader
                title={t.employeeDetailsTitle}
                navigation={navigation}
                actionIcon="pencil"
                // TODO: ekran edycji pracownika
                onAction={() => {}}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* PROFILE */}
                <View style={styles.profileHeader}>
                    <EmployeeAvatar employee={employee} size={150}/>

                    <View style={[styles.profileStatusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{t[status.label]}</Text>
                    </View>

                    <Text style={styles.profileName}>
                        {[employee.first_name, employee.last_name].filter(Boolean).join(" ")}
                    </Text>
                </View>

                {!!employee.email && (
                    <View style={styles.contactRow}>
                        <Ionicons name="mail" size={18} color="#111111"/>
                        <Text style={styles.contactText}>{employee.email}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.primaryButton}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("AdminEmployeeStatistic", { employee })}
                >
                    <Text style={styles.primaryButtonText}>{t.viewStatistic}</Text>
                </TouchableOpacity>

                {/* ROOM */}
                <Text style={styles.subsectionTitle}>{t.adminRoom}</Text>
                <View style={styles.roomRow}>
                    <Text style={styles.roomRowText}>{t.roomNumber}</Text>
                    <Text style={styles.roomRowText}>{employee.room}</Text>
                </View>

                {/* SERVICES */}
                <Text style={styles.subsectionTitle}>{t.employeeServices}</Text>
                {services.map(service => (
                    <View key={service.id} style={styles.smallCard}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.duration}>
                            {service.standard_duration} {t.min}
                        </Text>

                        {!!service.description && (
                            <Text style={[styles.serviceDescription, { marginTop: 12 }]}>
                                {service.description}
                            </Text>
                        )}
                    </View>
                ))}

                {/* WORKING HOURS */}
                <Text style={styles.subsectionTitle}>{t.workingHoursTitle}</Text>
                <View style={styles.hoursTable}>
                    {workingHours.map(item => (
                        <View key={item.day} style={hoursStyles.workingRow}>
                            <Text style={hoursStyles.day}>
                                {t[item.day.toLowerCase()] || item.day}
                            </Text>

                            {item.holiday || item.closed ? (
                                <>
                                    <Text style={item.holiday ? hoursStyles.holiday : hoursStyles.closed}>
                                        {item.holiday ? t.holiday : t.dayOff}
                                    </Text>
                                    <Text style={item.holiday ? hoursStyles.holiday : hoursStyles.closed}>
                                        {item.holiday ? t.holiday : t.dayOff}
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <View style={hoursStyles.timeGroup}>
                                        <Text style={hoursStyles.timeLabel}>{t.from}</Text>
                                        <Text style={hoursStyles.time}>{item.from}</Text>
                                    </View>

                                    <View style={hoursStyles.timeGroup}>
                                        <Text style={hoursStyles.timeLabel}>{t.to}</Text>
                                        <Text style={hoursStyles.time}>{item.to}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    ))}
                </View>

                {/* TODO: potwierdzenie i usunięcie pracownika przez API */}
                <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7}>
                    <Text style={styles.dangerButtonText}>{t.deleteEmployee}</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="employees"/>
        </View>
    );
}
