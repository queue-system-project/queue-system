import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";
import QueueLoadChart from "../../components/employee/QueueLoadChart";
import AppointmentCard from "../../components/admin/AppointmentCard";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
    buildEmployeeProfile,
    employeeLiveStatsMock,
    employeeQueueLoadMock,
    isShiftActive,
} from "../../constants/employee/employeePanelMock";
import { useEmployeeQueue } from "../../constants/employee/employeeQueueStore";
import { formatDuration } from "../../utils/admin/statsUtils";
import { adminHomeStyles as homeStyles } from "../../styles/admin/adminHomeStyle";
import { employeePanelStyles as styles } from "../../styles/employee/employeePanelStyle";

const GREEN = "#3BDB3D";
const PURPLE = "#5657C4";

function StatCard({ label, value, color }) {
    return (
        <View style={homeStyles.statCard}>
            <Text style={homeStyles.statLabel}>{label}</Text>
            <Text style={[homeStyles.statValue, color && { color }]}>{value}</Text>
        </View>
    );
}

export default function EmployeeHomeScreen({ navigation }) {
    const { t } = useLanguage();
    const { user } = useAuth();

    // TODO: podmienić na dane pracownika z API.
    const employee = buildEmployeeProfile(user);
    const shiftActive = isShiftActive(employee);
    const live = employeeLiveStatsMock;
    const { current } = useEmployeeQueue();

    // Po zakończeniu zmiany statystyki "na żywo" nie są liczone.
    const show = value => (shiftActive ? value : "-");

    const formattedDate = new Date().toLocaleDateString(t.locale || "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const openStatistic = () => navigation.navigate("AdminEmployeeStatistic", { employee });

    return (
        <View style={homeStyles.container}>
            <ScrollView
                contentContainerStyle={homeStyles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={homeStyles.header}>
                    <View style={homeStyles.logoContainer}>
                        <Text style={homeStyles.logo}>
                            <Text style={homeStyles.logoGreen}>Q</Text>
                            <Text style={homeStyles.logoWhite}>ast</Text>
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={homeStyles.notificationButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("Notifications")}
                    >
                        <Ionicons name="notifications" size={27} color="#FFFFFF"/>
                    </TouchableOpacity>
                </View>

                {/* PROFILE */}
                <View style={homeStyles.institutionCard}>
                    <EmployeeAvatar employee={employee} size={62}/>

                    <Text style={styles.profileName} numberOfLines={2}>
                        {getEmployeeName(employee)}
                    </Text>

                    <View style={homeStyles.dateContainer}>
                        <View style={homeStyles.dateBadge}>
                            <Text style={homeStyles.dateBadgeText}>{formattedDate}</Text>
                        </View>
                        <Text style={homeStyles.todayText}>{t.adminToday}</Text>
                    </View>
                </View>

                {/* DAILY STATISTIC */}
                {!shiftActive && (
                    <View style={styles.statisticBanner}>
                        <Text style={styles.statisticBannerTitle}>
                            📊 {t.dailyStatisticAddedTitle}
                        </Text>

                        <Text style={styles.statisticBannerText}>
                            {t.dailyStatisticAddedText}
                        </Text>

                        <TouchableOpacity
                            style={styles.statisticBannerButton}
                            activeOpacity={0.85}
                            onPress={openStatistic}
                        >
                            <Text style={styles.statisticBannerButtonText}>{t.viewStatistic}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* CURRENT APPOINTMENT */}
                <Text style={styles.homeSectionTitle}>{t.currentAppointment}</Text>

                {shiftActive && current ? (
                    <View style={{ paddingHorizontal: 23 }}>
                        <AppointmentCard
                            appointment={current}
                            onPress={() => navigation.navigate("EmployeeAppointment")}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyBox}>
                        <Text style={styles.emptyTitle}>
                            {shiftActive ? t.noCurrentAppointment : t.shiftEnded}
                        </Text>
                        <Text style={styles.emptyText}>
                            {shiftActive ? t.noCurrentAppointmentText : t.shiftEndedHomeText}
                        </Text>
                    </View>
                )}

                {/* QUEUE LOAD */}
                <Text style={[styles.homeSectionTitle, { marginTop: 10 }]}>{t.employeeQueueLoad}</Text>
                <QueueLoadChart data={employeeQueueLoadMock}/>

                {/* LIVE STATISTIC */}
                <Text style={styles.homeSectionTitle}>{t.liveStatistic}</Text>

                <View style={[homeStyles.statsRow, { marginTop: 22 }]}>
                    <StatCard label={t.statConfirmed} value={show(live.confirmed)} color={GREEN}/>
                    <StatCard label={t.statAvgTimeService} value={show(`${live.avgServiceMinutes} ${t.min}`)}/>
                </View>
                <View style={[homeStyles.statsRow, homeStyles.statsRowSpaced]}>
                    <StatCard label={t.statWorkTime} value={show(formatDuration(live.workMinutes))}/>
                    <StatCard label={t.statIdleTime} value={show(formatDuration(live.idleMinutes))} color={PURPLE}/>
                </View>

                <TouchableOpacity style={styles.outlineButton} activeOpacity={0.7} onPress={openStatistic}>
                    <Text style={styles.outlineButtonText}>{t.allStatistic}</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="home"/>
        </View>
    );
}
