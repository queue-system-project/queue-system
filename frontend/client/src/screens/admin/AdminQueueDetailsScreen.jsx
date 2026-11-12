import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import BottomNavigation from "../../components/BottomNavigation";
import AdminBackHeader from "../../components/admin/AdminBackHeader";
import EmployeeAvatar, { getEmployeeName } from "../../components/admin/EmployeeAvatar";
import RoomBadge from "../../components/admin/RoomBadge";
import QueueBreakdownCard from "../../components/admin/QueueBreakdownCard";

import { useLanguage } from "../../context/LanguageContext";
import { adminQueuesMock } from "../../constants/admin/adminQueuesMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

function LiveCard({ label, value, light }) {
    return (
        <View style={[styles.liveCard, light && styles.liveCardLight]}>
            <Text style={[styles.liveCardLabel, light && styles.liveCardTextDark]}>{label}</Text>
            <Text style={[styles.liveCardValue, light && styles.liveCardTextDark]}>{value}</Text>
        </View>
    );
}

export default function AdminQueueDetailsScreen({ navigation, route }) {
    const { t } = useLanguage();

    const queue = route?.params?.queue ?? adminQueuesMock[0];
    const { service, employee, stats } = queue;

    return (
        <View style={styles.container}>
            <AdminBackHeader title={service.name} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.queueDuration}>
                    {service.standard_duration} {t.min}
                </Text>

                {!!service.description && (
                    <Text style={styles.queueDescription}>{service.description}</Text>
                )}

                {/* EMPLOYEE */}
                <View style={[styles.employeeCard, { marginTop: 26 }]}>
                    <EmployeeAvatar employee={employee}/>

                    <Text style={styles.employeeName} numberOfLines={2}>
                        {getEmployeeName(employee)}
                    </Text>

                    <RoomBadge room={employee.room}/>
                </View>

                {/* LIVE STATISTIC */}
                <Text style={styles.detailsSectionTitle}>{t.liveStatistic}</Text>

                <View style={styles.statsRow}>
                    <LiveCard label={t.queueLoad} value={queue.queue}/>
                    <LiveCard label={t.delayTime} value={`+ ${Number(queue.delay) || 0} ${t.min}`}/>
                </View>

                <QueueBreakdownCard stats={stats}/>

                <View style={[styles.statsRow, styles.statsRowSpaced]}>
                    <LiveCard label={t.maxQueueLength} value={stats.maxQueueLength} light/>
                    <LiveCard label={t.remainingSpots} value={queue.spots} light/>
                </View>

                <TouchableOpacity
                    style={styles.outlineButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("AdminAppointments", { queueId: queue.id })}
                >
                    <Text style={styles.outlineButtonText}>{t.viewAllAppointments}</Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="queues"/>
        </View>
    );
}
