import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AppointmentCard from "../../components/admin/AppointmentCard";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { buildEmployeeProfile, isShiftActive } from "../../constants/employee/employeePanelMock";
import { useEmployeeQueue } from "../../constants/employee/employeeQueueStore";
import { adminScreensStyles as adminStyles } from "../../styles/admin/adminScreensStyle";
import { employeePanelStyles as styles } from "../../styles/employee/employeePanelStyle";

export default function EmployeeAppointmentScreen({ navigation }) {
    const { t } = useLanguage();
    const { user } = useAuth();

    // TODO: podmienić na dane pracownika z API.
    const employee = buildEmployeeProfile(user);
    const shiftActive = isShiftActive(employee);
    const { current } = useEmployeeQueue();

    return (
        <View style={adminStyles.container}>
            <View style={adminStyles.header}>
                <Text style={adminStyles.headerTitle}>{t.employeeAppointmentTitle}</Text>

                <TouchableOpacity
                    style={adminStyles.notificationButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Notifications")}
                >
                    <Ionicons name="notifications" size={25} color="#111111"/>
                </TouchableOpacity>
            </View>

            {/* TODO: widok obsługi bieżącej wizyty (czeka na projekt z Figmy); na razie sama karta. */}
            {shiftActive && current ? (
                <View style={{ paddingHorizontal: 23 }}>
                    <AppointmentCard appointment={current}/>
                </View>
            ) : (
                <View style={[styles.emptyBox, styles.emptyBoxCentered, { paddingBottom: 130 }]}>
                    <Text style={styles.emptyTitle}>
                        {shiftActive ? t.noCurrentAppointment : t.shiftEnded}
                    </Text>
                    <Text style={styles.emptyText}>
                        {shiftActive ? t.noCurrentAppointmentText : t.shiftEndedText}
                    </Text>

                    {!shiftActive && (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate("AdminEmployeeStatistic", { employee })}
                        >
                            <Text style={styles.primaryButtonText}>{t.viewStatistic}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <BottomNavigation navigation={navigation} active="appointment"/>
        </View>
    );
}
