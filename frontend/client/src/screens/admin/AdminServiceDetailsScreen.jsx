import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AdminBackHeader from "../../components/admin/AdminBackHeader";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";

import { useLanguage } from "../../context/LanguageContext";
import { adminServicesMock } from "../../constants/admin/adminInstitutionMock";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminServiceDetailsScreen({ navigation, route }) {
    const { t } = useLanguage();

    // TODO: podmienić na dane usługi i przypisanych pracowników z API.
    const service = route?.params?.service ?? adminServicesMock[0];
    const employees = adminEmployeesMock.filter(employee =>
        (employee.service_ids ?? []).includes(service.id)
    );

    return (
        <View style={styles.container}>
            <AdminBackHeader
                title={t.serviceDetailsTitle}
                navigation={navigation}
                actionIcon="pencil"
                // TODO: ekran edycji usługi
                onAction={() => {}}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.statsRow, { marginTop: 24 }]}>
                    <View style={[styles.liveCard, styles.liveCardGrey]}>
                        <Text style={[styles.liveCardLabel, styles.liveCardTextDark]}>{t.maxQueueLength}</Text>
                        <Text style={[styles.liveCardValue, styles.liveCardTextDark]}>{service.max_queue_length}</Text>
                    </View>

                    <View style={[styles.liveCard, styles.liveCardGrey]}>
                        <Text style={[styles.liveCardLabel, styles.liveCardTextDark]}>{t.durationLabel}</Text>
                        <Text style={[styles.liveCardValue, styles.liveCardTextDark]}>
                            {service.standard_duration} {t.min}
                        </Text>
                    </View>
                </View>

                {/* SERVICE */}
                <Text style={styles.subsectionTitle}>{t.serviceSection}</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.serviceNameLabel}</Text>
                    <Text style={styles.infoValue}>{service.name}</Text>
                </View>

                {!!service.description && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.serviceDescriptionLabel}</Text>
                        <Text style={styles.infoValue}>{service.description}</Text>
                    </View>
                )}

                {/* EMPLOYEES */}
                <View style={[styles.sectionHeader, { marginBottom: 4 }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 17 }]}>{t.navEmployees}</Text>

                    {/* TODO: przypisanie pracownika do usługi */}
                    <TouchableOpacity style={styles.smallButton} activeOpacity={0.85}>
                        <Ionicons name="add" size={16} color="#FFFFFF"/>
                        <Text style={styles.smallButtonText}>{t.adminAdd}</Text>
                    </TouchableOpacity>
                </View>

                {employees.length === 0 ? (
                    <Text style={styles.emptyText}>{t.adminNoEmployees}</Text>
                ) : (
                    employees.map(employee => (
                        <TouchableOpacity
                            key={employee.id}
                            style={styles.employeeCard}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("AdminEmployeeDetails", { employee })}
                        >
                            <EmployeeAvatar employee={employee}/>
                            <Text style={styles.employeeName}>{getEmployeeName(employee)}</Text>
                        </TouchableOpacity>
                    ))
                )}

                {/* TODO: potwierdzenie i usunięcie usługi przez API */}
                <TouchableOpacity style={[styles.dangerButton, { marginTop: 60 }]} activeOpacity={0.7}>
                    <Text style={styles.dangerButtonText}>{t.deleteService}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
