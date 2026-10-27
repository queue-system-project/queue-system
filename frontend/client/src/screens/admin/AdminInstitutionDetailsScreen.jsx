import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import AdminBackHeader from "../../components/admin/AdminBackHeader";
import InstitutionMap from "../../components/InstitutionMap/InstitutionMap";

import { useLanguage } from "../../context/LanguageContext";
import { adminInstitutionMock } from "../../constants/admin/adminInstitutionMock";
import { buildWorkingHours } from "../../utils/workingHours";
import { institutionDetailsStyles as styles } from "../../styles/institution/institutionDetailsStyle";

export default function AdminInstitutionDetailsScreen({ navigation }) {
    const { t } = useLanguage();

    // TODO: podmienić na dane instytucji z API.
    const institution = adminInstitutionMock;
    const workingHours = buildWorkingHours(institution.working_hours ?? []);

    return (
        <View style={styles.container}>
            <AdminBackHeader
                title={t.institutionDetailsTitle}
                navigation={navigation}
                actionIcon="pencil"
                // TODO: ekran edycji instytucji
                onAction={() => {}}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* INSTITUTION */}
                <View style={[styles.institution, { marginTop: 30, marginBottom: 10 }]}>
                    {institution.photo_url ? (
                        <Image source={{ uri: institution.photo_url }} style={styles.institutionImage}/>
                    ) : (
                        <View
                            style={[
                                styles.institutionImage,
                                { alignItems: "center", justifyContent: "center", backgroundColor: "#F0F0FA" },
                            ]}
                        >
                            <MaterialCommunityIcons name="office-building" size={34} color="#5657C4"/>
                        </View>
                    )}

                    <View style={styles.institutionInfo}>
                        <View style={styles.badges}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{institution.category}</Text>
                            </View>

                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#FFC21A"/>
                                <Text style={styles.ratingText}>
                                    {Number(institution.rating).toFixed(1)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.institutionName} numberOfLines={2}>
                            {institution.name}
                        </Text>
                        <Text style={styles.address}>{institution.address}</Text>
                    </View>
                </View>

                <View style={styles.tabContent}>
                    {!!institution.description && (
                        <Text style={styles.description}>{institution.description}</Text>
                    )}

                    {/* CONTACTS */}
                    {!!institution.phone && (
                        <View style={styles.contactRow}>
                            <Ionicons name="call" size={18} color="#111111"/>
                            <Text style={styles.contactText}>{institution.phone}</Text>
                        </View>
                    )}

                    {!!institution.email && (
                        <View style={styles.contactRow}>
                            <Ionicons name="mail" size={18} color="#111111"/>
                            <Text style={styles.contactText}>{institution.email}</Text>
                        </View>
                    )}

                    {/* OPENING HOURS */}
                    <Text style={styles.sectionTitle}>{t.openingHours}</Text>

                    <View style={styles.workingHours}>
                        {workingHours.map(item => (
                            <View key={item.day} style={styles.workingRow}>
                                <Text style={styles.day}>
                                    {t[item.day.toLowerCase()] || item.day}
                                </Text>

                                {item.closed ? (
                                    <>
                                        <Text style={styles.closed}>{t.closed}</Text>
                                        <Text style={styles.closed}>{t.closed}</Text>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.timeGroup}>
                                            <Text style={styles.timeLabel}>{t.from}</Text>
                                            <Text style={styles.time}>{item.from}</Text>
                                        </View>

                                        <View style={styles.timeGroup}>
                                            <Text style={styles.timeLabel}>{t.to}</Text>
                                            <Text style={styles.time}>{item.to}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>

                    <InstitutionMap institution={institution} styles={styles}/>
                </View>
            </ScrollView>
        </View>
    );
}
