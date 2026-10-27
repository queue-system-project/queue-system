import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AppointmentsLineChart from "../../components/admin/AppointmentsLineChart";
import EmployeeLoadChart from "../../components/admin/EmployeeLoadChart";

import { useLanguage } from "../../context/LanguageContext";
import { adminDashboardMock } from "../../constants/admin/adminDashboardMock";
import { adminHomeStyles as styles } from "../../styles/admin/adminHomeStyle";

const GREEN = "#3BDB3D";
const PURPLE = "#5657C4";
const GREY = "#858585";
const RED = "#C0392B";

function StatCard({ label, value, color }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, color && { color }]}>{value}</Text>
        </View>
    );
}

export default function AdminHomeScreen({ navigation }) {
    const { t } = useLanguage();

    // TODO: podmienić na dane z API, gdy backend udostępni dashboard.
    const dashboard = adminDashboardMock;
    const { institution, clients, employees, appointments, services } = dashboard;

    const formattedDate = (dashboard.date ? new Date(dashboard.date) : new Date())
        .toLocaleDateString(t.locale || "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>
                            <Text style={styles.logoGreen}>Q</Text>
                            <Text style={styles.logoWhite}>ast</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.notificationButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Ionicons name="notifications" size={27} color="#FFFFFF"/>
                    </TouchableOpacity>
                </View>

                {/* INSTITUTION */}
                <View style={styles.institutionCard}>
                    <View style={styles.institutionPhoto}>
                        {institution.photo_url ? (
                            <Image
                                source={{ uri: institution.photo_url }}
                                style={styles.institutionPhotoImage}
                            />
                        ) : (
                            <Ionicons name="business-outline" size={32} color={PURPLE}/>
                        )}
                    </View>

                    <View style={styles.institutionInfo}>
                        <Text style={styles.institutionName} numberOfLines={2}>
                            {institution.name}
                        </Text>
                        <Text style={styles.institutionAddress} numberOfLines={1}>
                            {institution.address}
                        </Text>
                    </View>

                    <View style={styles.dateContainer}>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>{formattedDate}</Text>
                        </View>
                        <Text style={styles.todayText}>{t.adminToday}</Text>
                    </View>
                </View>

                {/* LIVE STATISTIC */}
                <Text style={styles.sectionTitle}>{t.liveStatistic}</Text>

                <Text style={styles.groupLabel}>{t.adminClients}</Text>
                <View style={styles.statsRow}>
                    <StatCard label={t.statTotal} value={clients.total}/>
                    <StatCard label={t.statWaiting} value={clients.waiting}/>
                </View>

                <Text style={styles.groupLabel}>{t.adminEmployee}</Text>
                <View style={styles.statsRow}>
                    <StatCard label={t.statTotal} value={employees.total}/>
                    <StatCard label={t.statActive} value={employees.active} color={GREEN}/>
                    <StatCard label={t.statIdle} value={employees.idle} color={PURPLE}/>
                </View>

                <Text style={styles.groupLabel}>{t.adminAppointments}</Text>
                <View style={styles.statsRow}>
                    <StatCard label={t.statCompleted} value={appointments.completed}/>
                    <StatCard
                        label={t.statAvgDelay}
                        value={`+ ${appointments.avgDelayMinutes} ${t.min}`}
                    />
                </View>
                <View style={[styles.statsRow, styles.statsRowSpaced]}>
                    <StatCard label={t.statInProgress} value={appointments.inProgress} color={GREEN}/>
                    <StatCard label={t.statMissed} value={appointments.missed} color={GREY}/>
                    <StatCard label={t.statCancelled} value={appointments.cancelled} color={RED}/>
                </View>

                <Text style={styles.groupLabel}>{t.adminServices}</Text>
                <View style={styles.statsRow}>
                    <StatCard label={t.statTotal} value={services.total}/>
                    <StatCard
                        label={t.statAvgServiceTime}
                        value={`${services.avgServiceMinutes} ${t.min}`}
                    />
                </View>

                {/* APPOINTMENTS OVER TIME */}
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{t.appointmentsOverTime}</Text>
                    <Text style={styles.chartFilter}>{t.allServices}</Text>
                </View>
                <AppointmentsLineChart data={dashboard.appointmentsOverTime}/>

                {/* EMPLOYEE LOAD */}
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{t.employeeLoadRanking}</Text>
                    <Text style={styles.chartFilter}>{t.top10}</Text>
                </View>
                <EmployeeLoadChart data={dashboard.employeeLoad.slice(0, 10)}/>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="home"/>
        </View>
    );
}
