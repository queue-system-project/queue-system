import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";

import BottomNavigation from "../../components/BottomNavigation";
import { institutionDetailsStyles as styles } from "../../styles/institution/institutionDetailsStyle";
import { useLanguage } from "../../context/LanguageContext";
import InstitutionMap from "../../components/InstitutionMap/InstitutionMap";

import {
    getInstitutionServices,
    getInstitutionWorkingHours,
} from "../../api/institutions/institutionsApi";


const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];


function buildWorkingHours(workingHours) {
    const hoursByDay = new Map(
        workingHours.map((item) => [
            item.day_of_week,
            item,
        ])
    );

    return DAYS.map((day, index) => {
        const workingHour = hoursByDay.get(index);

        if (!workingHour) {
            return {
                day,
                closed: true,
            };
        }

        return {
            day,
            from: workingHour.start_time,
            to: workingHour.end_time,
            closed: false,
        };
    });
}


export default function InstitutionDetailsScreen({
                                                     navigation,
                                                     route,
                                                 }) {
    const { t } = useLanguage();

    const [activeTab, setActiveTab] =
        useState("info");

    const [search, setSearch] =
        useState("");

    const [services, setServices] =
        useState([]);

    const [workingHours, setWorkingHours] =
        useState([]);

    const [loadingServices, setLoadingServices] =
        useState(true);

    const [loadingWorkingHours, setLoadingWorkingHours] =
        useState(true);

    const selectedInstitution =
        route.params?.institution;

    useEffect(() => {
        if (!selectedInstitution?.id) {
            return;
        }

        let isMounted = true;

        async function loadInstitutionData() {
            setLoadingServices(true);
            setLoadingWorkingHours(true);

            try {
                const [
                    servicesData,
                    workingHoursData,
                ] = await Promise.all([
                    getInstitutionServices(
                        selectedInstitution.id
                    ),
                    getInstitutionWorkingHours(
                        selectedInstitution.id
                    ),
                ]);

                if (!isMounted) {
                    return;
                }

                setServices(
                    servicesData.filter(
                        (service) =>
                            service.is_active !== false
                    )
                );

                setWorkingHours(
                    buildWorkingHours(
                        workingHoursData
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load institution details:",
                    error
                );

                if (isMounted) {
                    setServices([]);
                    setWorkingHours([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingServices(false);
                    setLoadingWorkingHours(false);
                }
            }
        }

        loadInstitutionData();

        return () => {
            isMounted = false;
        };
    }, [selectedInstitution?.id]);


    const filteredServices = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        if (!normalizedSearch) {
            return services;
        }

        return services.filter((service) =>
            service.name
                .toLowerCase()
                .includes(normalizedSearch)
        );
    }, [services, search]);


    if (!selectedInstitution) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            navigation.goBack()
                        }
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContent}>
                    <Text style={styles.noServices}>
                        Institution not found
                    </Text>
                </View>

                <BottomNavigation
                    navigation={navigation}
                />
            </View>
        );
    }


    const hasRealImage =
        selectedInstitution.photo_url &&
        !selectedInstitution.photo_url.includes(
            "example.com"
        );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() =>
                            navigation.goBack()
                        }
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>


                {/* INSTITUTION */}
                <View style={styles.institution}>
                    {hasRealImage ? (
                        <Image
                            source={{
                                uri:
                                selectedInstitution.photo_url,
                            }}
                            style={
                                styles.institutionImage
                            }
                        />
                    ) : (
                        <View
                            style={[
                                styles.institutionImage,
                                {
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor:
                                        "#F0F0FA",
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="office-building"
                                size={34}
                                color="#5657C4"
                            />
                        </View>
                    )}

                    <View
                        style={styles.institutionInfo}
                    >
                        <View style={styles.badges}>
                            {selectedInstitution.category_name && (
                                <View
                                    style={
                                        styles.categoryBadge
                                    }
                                >
                                    <Text
                                        style={
                                            styles.categoryText
                                        }
                                    >
                                        {
                                            selectedInstitution.category_name
                                        }
                                    </Text>
                                </View>
                            )}

                            {selectedInstitution.rating != null && (
                                <View
                                    style={
                                        styles.ratingBadge
                                    }
                                >
                                    <Ionicons
                                        name="star"
                                        size={12}
                                        color="#FFC21A"
                                    />

                                    <Text
                                        style={
                                            styles.ratingText
                                        }
                                    >
                                        {Number(
                                            selectedInstitution.rating
                                        ).toFixed(1)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text
                            style={
                                styles.institutionName
                            }
                            numberOfLines={2}
                        >
                            {selectedInstitution.name}
                        </Text>

                        <Text
                            style={styles.address}
                            numberOfLines={2}
                        >
                            {selectedInstitution.address}
                        </Text>
                    </View>
                </View>


                {/* TABS */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "info" &&
                            styles.activeTab,
                        ]}
                        onPress={() =>
                            setActiveTab("info")
                        }
                        activeOpacity={1}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "info" &&
                                styles.activeTabText,
                            ]}
                        >
                            {t.info}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "services" &&
                            styles.activeTab,
                        ]}
                        onPress={() =>
                            setActiveTab("services")
                        }
                        activeOpacity={1}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "services" &&
                                styles.activeTabText,
                            ]}
                        >
                            {t.services}
                        </Text>
                    </TouchableOpacity>
                </View>


                {/* TAB CONTENT */}
                {activeTab === "info" ? (
                    <Info
                        institution={
                            selectedInstitution
                        }
                        workingHours={
                            workingHours
                        }
                        loading={
                            loadingWorkingHours
                        }
                        t={t}
                    />
                ) : (
                    <Services
                        services={
                            filteredServices
                        }
                        search={search}
                        setSearch={setSearch}
                        institution={
                            selectedInstitution
                        }
                        navigation={
                            navigation
                        }
                        loading={
                            loadingServices
                        }
                        t={t}
                    />
                )}

                <View
                    style={styles.bottomSpace}
                />
            </ScrollView>

            <BottomNavigation
                navigation={navigation}
            />
        </View>
    );
}


function Info({
                  institution,
                  workingHours,
                  loading,
                  t,
              }) {
    return (
        <View style={styles.tabContent}>
            {!!institution.description && (
                <Text
                    style={styles.description}
                >
                    {institution.description}
                </Text>
            )}


            {/* CONTACTS */}
            {!!institution.phone && (
                <View
                    style={styles.contactRow}
                >
                    <Ionicons
                        name="call"
                        size={18}
                        color="#111111"
                    />

                    <Text
                        style={
                            styles.contactText
                        }
                    >
                        {institution.phone}
                    </Text>
                </View>
            )}

            {!!institution.email && (
                <View
                    style={styles.contactRow}
                >
                    <Ionicons
                        name="mail"
                        size={18}
                        color="#111111"
                    />

                    <Text
                        style={
                            styles.contactText
                        }
                    >
                        {institution.email}
                    </Text>
                </View>
            )}


            {/* OPENING HOURS */}
            <Text style={styles.sectionTitle}>
                {t.openingHours}
            </Text>

            {loading ? (
                <Text style={styles.noServices}>
                    Loading...
                </Text>
            ) : (
                <View
                    style={styles.workingHours}
                >
                    {workingHours.map(
                        (item) => (
                            <View
                                key={item.day}
                                style={
                                    styles.workingRow
                                }
                            >
                                <Text
                                    style={
                                        styles.day
                                    }
                                >
                                    {t[
                                            item.day.toLowerCase()
                                            ] ||
                                        item.day}
                                </Text>

                                {item.closed ? (
                                    <>
                                        <Text
                                            style={
                                                styles.closed
                                            }
                                        >
                                            {t.closed}
                                        </Text>

                                        <Text
                                            style={
                                                styles.closed
                                            }
                                        >
                                            {t.closed}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <View
                                            style={
                                                styles.timeGroup
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.timeLabel
                                                }
                                            >
                                                {t.from}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.time
                                                }
                                            >
                                                {item.from}
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.timeGroup
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.timeLabel
                                                }
                                            >
                                                {t.to}
                                            </Text>

                                            <Text
                                                style={
                                                    styles.time
                                                }
                                            >
                                                {item.to}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )
                    )}
                </View>
            )}

            {/* MAP */}
            <InstitutionMap
                institution={institution}
                styles={styles}
            />
        </View>
    );
}


function Services({
                      services,
                      search,
                      setSearch,
                      institution,
                      navigation,
                      loading,
                      t,
                  }) {
    return (
        <View style={styles.servicesContent}>
            {/* SEARCH */}
            <View style={styles.search}>
                <Ionicons
                    name="search-outline"
                    size={20}
                    color="#8E8E8E"
                />

                <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t.searchServices}
                    placeholderTextColor="#999999"
                />
            </View>

            {/* SERVICES */}
            {loading ? (
                <Text style={styles.noServices}>
                    Loading...
                </Text>
            ) : (
                <>
                    {services.map((service) => (
                        <View
                            key={service.id}
                            style={styles.serviceCard}
                        >
                            <Text style={styles.serviceName}>
                                {service.name}
                            </Text>

                            <Text style={styles.duration}>
                                {service.standard_duration} min
                            </Text>

                            {!!service.description && (
                                <Text
                                    style={
                                        styles.serviceDescription
                                    }
                                >
                                    {service.description}
                                </Text>
                            )}

                            {/* QUEUE INFO */}
                            <View style={styles.serviceStats}>
                                <View style={styles.spotsBadge}>
                                    <Text
                                        style={
                                            styles.serviceStatText
                                        }
                                    >
                                        {service.spots}{" "}
                                        {t.spotsRemaining ||
                                            "Spots Remaining"}
                                    </Text>
                                </View>

                                <View style={styles.queueBadge}>
                                    <MaterialCommunityIcons
                                        name="account-group-outline"
                                        size={15}
                                        color="#111111"
                                    />

                                    <Text
                                        style={
                                            styles.serviceStatText
                                        }
                                    >
                                        {service.queue}{" "}
                                        {t.queue || "Queue"}
                                    </Text>
                                </View>

                                {Number(service.delay) > 0 && (
                                    <View style={styles.waitingBadge}>
                                        <MaterialCommunityIcons
                                            name="timer-outline"
                                            size={15}
                                            color="#555555"
                                        />

                                        <Text style={styles.waitingText}>
                                            + {service.delay} {t.min}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={styles.joinButton}
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation.navigate(
                                        "SelectDate",
                                        {
                                            service,
                                            institution,
                                        }
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.joinButtonText
                                    }
                                >
                                    {t.joinQueue}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {services.length === 0 && (
                        <Text style={styles.noServices}>
                            {t.noServicesFound}
                        </Text>
                    )}
                </>
            )}
        </View>
    );
}