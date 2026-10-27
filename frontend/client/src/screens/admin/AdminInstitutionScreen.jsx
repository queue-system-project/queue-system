import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSearchBar from "../../components/admin/AdminSearchBar";
import ServiceStats from "../../components/admin/ServiceStats";

import { useLanguage } from "../../context/LanguageContext";
import { adminInstitutionMock, adminServicesMock } from "../../constants/admin/adminInstitutionMock";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export default function AdminInstitutionScreen({ navigation }) {
    const { t } = useLanguage();
    const [search, setSearch] = useState("");

    // TODO: podmienić na dane z API instytucji admina.
    const institution = adminInstitutionMock;
    const services = adminServicesMock;

    const query = search.trim().toLowerCase();
    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(query) ||
        (service.description ?? "").toLowerCase().includes(query)
    );

    return (
        <View style={styles.container}>
            <AdminHeader title={t.navInstitution} navigation={navigation}/>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* INSTITUTION */}
                <TouchableOpacity
                    style={styles.institutionCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("AdminInstitutionDetails")}
                >
                    <View style={styles.institutionPhoto}>
                        {institution.photo_url ? (
                            <Image
                                source={{ uri: institution.photo_url }}
                                style={styles.institutionPhotoImage}
                            />
                        ) : (
                            <Ionicons name="business-outline" size={30} color="#5657C4"/>
                        )}
                    </View>

                    <View style={styles.institutionInfo}>
                        <View style={styles.badges}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{institution.category}</Text>
                            </View>

                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={10} color="#FFC107"/>
                                <Text style={styles.ratingText}>{institution.rating}</Text>
                            </View>
                        </View>

                        <Text style={styles.institutionName}>{institution.name}</Text>
                        <Text style={styles.institutionAddress}>{institution.address}</Text>
                    </View>
                </TouchableOpacity>

                {/* SERVICES */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t.adminServicesTitle}</Text>

                    {/* TODO: ekran tworzenia usługi */}
                    <TouchableOpacity style={styles.createButton} activeOpacity={0.85}>
                        <Ionicons name="add" size={18} color="#FFFFFF"/>
                        <Text style={styles.createButtonText}>{t.adminCreate}</Text>
                    </TouchableOpacity>
                </View>

                <AdminSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.searchForServices}
                />

                {filteredServices.length === 0 ? (
                    <Text style={styles.emptyText}>{t.adminNoServices}</Text>
                ) : (
                    filteredServices.map(service => (
                        <TouchableOpacity
                            key={service.id}
                            style={styles.card}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("AdminServiceDetails", { service })}
                        >
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.duration}>
                                {service.standard_duration} {t.min}
                            </Text>

                            {!!service.description && (
                                <Text style={styles.serviceDescription}>
                                    {service.description}
                                </Text>
                            )}

                            <ServiceStats
                                spots={service.spots}
                                queue={service.queue}
                                delay={service.delay}
                            />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <BottomNavigation navigation={navigation} active="institution"/>
        </View>
    );
}
