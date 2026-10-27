import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavigation from "../../components/BottomNavigation";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import ServiceStats from "../../components/admin/ServiceStats";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";
import RoomBadge from "../../components/admin/RoomBadge";

import { useLanguage } from "../../context/LanguageContext";
import { adminQueuesMock } from "../../constants/admin/adminQueuesMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminQueuesScreen({ navigation }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");

    // TODO: podmienić na aktywne kolejki z API.
    const queues = adminQueuesMock;

    const query = search.trim().toLowerCase();
    const filteredQueues = queues.filter(item =>
        item.service.name.toLowerCase().includes(query) ||
        getEmployeeName(item.employee).toLowerCase().includes(query) ||
        (item.employee.room ?? "").toLowerCase().includes(query)
    );

    return (
        <View style={styles.container}>
            <AdminHeader title={t.navQueues} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <AdminSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.searchForAppointment}
                    style={{ marginTop: 28 }}
                />

                {filteredQueues.length === 0 ? (
                    <Text style={styles.emptyText}>{t.adminNoQueues}</Text>
                ) : (
                    filteredQueues.map(item => (
                        <View key={item.id} style={[styles.card, { marginTop: 24 }]}>
                            <Text style={styles.serviceName}>{item.service.name}</Text>
                            <Text style={styles.duration}>
                                {item.service.standard_duration} {t.min}
                            </Text>

                            <ServiceStats
                                spots={item.spots}
                                queue={item.queue}
                                delay={item.delay}
                            />

                            {!!item.service.description && (
                                <Text style={styles.serviceDescription}>
                                    {item.service.description}
                                </Text>
                            )}

                            <View style={styles.divider}/>

                            <View style={styles.employeeRow}>
                                <EmployeeAvatar employee={item.employee}/>

                                <Text style={styles.employeeName} numberOfLines={2}>
                                    {getEmployeeName(item.employee)}
                                </Text>

                                <RoomBadge room={item.employee.room}/>
                            </View>

                            <TouchableOpacity
                                style={styles.moreButton}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate("AdminQueueDetails", { queue: item })}
                            >
                                <Text style={styles.moreButtonText}>{t.adminMore}</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="queues"/>
        </View>
    );
}
