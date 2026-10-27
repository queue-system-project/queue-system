import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AdminBackHeader from "../../components/admin/AdminBackHeader";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";

import { useLanguage } from "../../context/LanguageContext";
import { adminEmployeesMock } from "../../constants/admin/adminEmployeesMock";
import {
    adminEmployeeLiveStatsMock,
    getEmployeeDailyStats,
} from "../../constants/admin/adminEmployeeStatsMock";
import {
    addDays,
    aggregateStats,
    daysBetween,
    formatDuration,
    startOfWeek,
} from "../../utils/admin/statsUtils";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

const GREEN = "#3BDB3D";
const PURPLE = "#5657C4";

const DAY_BARS = [
    { key: "confirmed", label: "statConfirmed", color: "#C8F0C8" },
    { key: "avgServiceMinutes", label: "statAvgTimeService", color: "#FFF0A6" },
    { key: "workMinutes", label: "statWorkTime", color: "#8DB8EE" },
    { key: "idleMinutes", label: "statIdleTime", color: "#A9ACEF" },
];

function StatCard({ label, value, color }) {
    return (
        <View style={styles.outlineStatCard}>
            <Text style={styles.outlineStatLabel}>{label}</Text>
            <Text style={[styles.outlineStatValue, color && { color }]}>{value}</Text>
        </View>
    );
}

function StatGrid({ stats, idleLabel, t }) {
    return (
        <>
            <View style={styles.statsRow}>
                <StatCard label={t.statConfirmed} value={stats.confirmed} color={GREEN}/>
                <StatCard label={t.statAvgTimeService} value={`${stats.avgServiceMinutes} ${t.min}`}/>
            </View>
            <View style={[styles.statsRow, styles.statsRowSpaced]}>
                <StatCard label={t.statWorkTime} value={formatDuration(stats.workMinutes)}/>
                <StatCard label={idleLabel} value={formatDuration(stats.idleMinutes)} color={PURPLE}/>
            </View>
        </>
    );
}

function PeriodHeader({ title, label, onPrev, onNext, nextDisabled }) {
    return (
        <>
            <View style={styles.periodHeader}>
                <Text style={[styles.sectionTitle, { fontSize: 17 }]}>{title}</Text>

                {/* TODO: eksport statystyk */}
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="download-outline" size={22} color={PURPLE}/>
                </TouchableOpacity>
            </View>

            <View style={styles.periodRow}>
                <View style={styles.periodPill}>
                    <Text style={styles.periodPillText}>{label}</Text>
                </View>

                <View style={styles.periodArrows}>
                    <TouchableOpacity style={styles.arrowButton} activeOpacity={0.7} onPress={onPrev}>
                        <Ionicons name="chevron-back" size={22} color="#111111"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.arrowButton, nextDisabled && { opacity: 0.35 }]}
                        activeOpacity={0.7}
                        disabled={nextDisabled}
                        onPress={onNext}
                    >
                        <Ionicons name="chevron-forward" size={22} color="#111111"/>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

export default function AdminEmployeeStatisticScreen({ navigation, route }) {
    const { t } = useLanguage();
    const locale = t.locale || "en-GB";

    // TODO: podmienić na statystyki z API.
    const employee = route?.params?.employee ?? adminEmployeesMock[0];
    const live = adminEmployeeLiveStatsMock[employee.id] ?? adminEmployeeLiveStatsMock.default;

    const today = new Date();
    const currentWeek = startOfWeek(today);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [weekStart, setWeekStart] = useState(currentWeek);
    const [monthStart, setMonthStart] = useState(currentMonth);

    // WEEK
    const weekDays = daysBetween(weekStart, addDays(weekStart, 7));
    const weekDaily = weekDays.map(day => getEmployeeDailyStats(employee, day));
    const week = aggregateStats(weekDaily);

    const formatDate = date =>
        date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

    // Szczegóły dnia: dzisiaj w bieżącym tygodniu, w pozostałych poniedziałek.
    const dayIndex = weekStart.getTime() === currentWeek.getTime() ? (today.getDay() + 6) % 7 : 0;
    const selectedDay = weekDays[dayIndex];
    const selectedStats = weekDaily[dayIndex] ?? { confirmed: 0, avgServiceMinutes: 0, workMinutes: 0, idleMinutes: 0 };

    // Słupki skalowane do najwyższej wartości danej metryki w tygodniu.
    const weekMax = key => Math.max(...weekDaily.map(day => day?.[key] ?? 0), 1);
    const formatBarValue = (key, value) =>
        key === "confirmed" ? value : key === "avgServiceMinutes" ? `${value} ${t.min}` : formatDuration(value);

    // MONTH
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const month = aggregateStats(
        daysBetween(monthStart, nextMonth).map(day => getEmployeeDailyStats(employee, day))
    );

    return (
        <View style={styles.container}>
            <AdminBackHeader title={t.statisticTitle} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: 60 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* EMPLOYEE */}
                <View style={[styles.employeeCard, { marginTop: 24 }]}>
                    <EmployeeAvatar employee={employee}/>
                    <Text style={styles.employeeName}>{getEmployeeName(employee)}</Text>
                </View>

                {/* LIVE */}
                <Text style={[styles.sectionTitle, { fontSize: 17, marginTop: 40, marginBottom: 16 }]}>
                    {t.liveStatistic}
                </Text>
                <StatGrid stats={live} idleLabel={t.statIdleTime} t={t}/>

                {/* WEEK */}
                <PeriodHeader
                    title={t.statWeek}
                    label={`${formatDate(weekStart)} - ${formatDate(addDays(weekStart, 6))}`}
                    onPrev={() => setWeekStart(addDays(weekStart, -7))}
                    onNext={() => setWeekStart(addDays(weekStart, 7))}
                    nextDisabled={weekStart >= currentWeek}
                />
                <StatGrid stats={{ ...week, idleMinutes: week.avgIdleMinutes }} idleLabel={t.statAvgIdleTime} t={t}/>

                <Text style={styles.dayTitle}>
                    {selectedDay.toLocaleDateString(locale, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </Text>

                {DAY_BARS.map(bar => {
                    const value = selectedStats[bar.key];
                    const percent = (value / weekMax(bar.key)) * 75;

                    return (
                        <View key={bar.key}>
                            <Text style={styles.dayBarLabel}>{t[bar.label]}</Text>
                            <View style={styles.dayBarRow}>
                                <View style={[styles.dayBar, { width: `${Math.max(percent, 2)}%`, backgroundColor: bar.color }]}/>
                                <Text style={styles.dayBarValue}>{formatBarValue(bar.key, value)}</Text>
                            </View>
                        </View>
                    );
                })}

                {/* MONTH */}
                <PeriodHeader
                    title={t.statMonth}
                    label={monthStart.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                    onPrev={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
                    onNext={() => setMonthStart(nextMonth)}
                    nextDisabled={monthStart >= currentMonth}
                />
                <StatGrid stats={{ ...month, idleMinutes: month.avgIdleMinutes }} idleLabel={t.statAvgIdleTime} t={t}/>
            </ScrollView>
        </View>
    );
}
