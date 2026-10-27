import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";
import RoomBadge from "../../components/admin/RoomBadge";

import { useLanguage } from "../../context/LanguageContext";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import { EMPLOYEE_STATUSES as STATUSES } from "../../constants/admin/employeeStatuses";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminEmployeesScreen({ navigation }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    // TODO: podmienić na pracowników z API.
    const employees = adminEmployeesMock;

    const query = search.trim().toLowerCase();
    const filteredEmployees = employees.filter(employee =>
        (filter === "all" || employee.status === filter) &&
        (getEmployeeName(employee).toLowerCase().includes(query) ||
            (employee.room ?? "").toLowerCase().includes(query))
    );

    const filterTitle = filter === "all" ? t.filterAll : t[STATUSES[filter].label];

    return (
        <View style={styles.container}>
            <AdminHeader title={t.navEmployees} navigation={navigation}/>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 130 }}
            >
                <View style={{ paddingHorizontal: 23 }}>
                    <AdminSearchBar
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t.searchForEmployees}
                        style={{ marginTop: 28 }}
                    />
                </View>

                {/* FILTERS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersList}
                >
                    {/* TODO: ekran tworzenia pracownika */}
                    <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
                        <Ionicons name="add" size={18} color="#FFFFFF"/>
                        <Text style={styles.createButtonText}>{t.adminCreate}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            styles.filterChipAll,
                            filter === "all" && styles.filterChipSelected,
                        ]}
                        onPress={() => setFilter("all")}
                    >
                        <Text style={styles.filterChipText}>{t.filterAll}</Text>
                    </TouchableOpacity>

                    {Object.entries(STATUSES).map(([key, status]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.filterChip,
                                { backgroundColor: status.color },
                                filter === key && styles.filterChipSelected,
                            ]}
                            onPress={() => setFilter(key)}
                        >
                            <Text style={styles.filterChipText}>{t[status.label]}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{ paddingHorizontal: 23 }}>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.sectionTitle}>{filterTitle}</Text>

                        <View style={styles.resultsBadge}>
                            <Text style={styles.resultsText}>
                                {filteredEmployees.length} {t.adminResults}
                            </Text>
                        </View>
                    </View>

                    {filteredEmployees.length === 0 ? (
                        <Text style={styles.emptyText}>{t.adminNoEmployees}</Text>
                    ) : (
                        filteredEmployees.map(employee => {
                            const status = STATUSES[employee.status] ?? STATUSES.offline;

                            return (
                                <TouchableOpacity
                                    key={employee.id}
                                    style={styles.employeeCard}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("AdminEmployeeDetails", { employee })}
                                >
                                    <EmployeeAvatar employee={employee}/>

                                    <View style={styles.employeeInfo}>
                                        <Text style={styles.employeeCardName} numberOfLines={2}>
                                            {getEmployeeName(employee)}
                                        </Text>

                                        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                                            <Text style={styles.statusText}>{t[status.label]}</Text>
                                        </View>
                                    </View>

                                    <RoomBadge room={employee.room}/>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="employees"/>
        </View>
    );
}
