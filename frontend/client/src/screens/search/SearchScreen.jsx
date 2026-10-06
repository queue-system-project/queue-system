import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { searchStyles as styles } from "../../styles/search/searchStyle";
import BottomNavigation from "../../components/BottomNavigation";
import EmptyState from "../../components/EmptyState";
import { useLanguage } from "../../context/LanguageContext";

import { API_URL } from "../../api/auth/authApi";
import {getInstitutions, getInstitutionServices,} from "../../api/institutions/institutionsApi";

const CATEGORY_TRANSLATIONS = {
    Healthcare: "categoryHealthcare",
    "Banking & Finance": "categoryBankingFinance",
    "Government Services": "categoryGovernmentServices",
    "Beauty & Wellness": "categoryBeautyWellness",
    Education: "categoryEducation",
    Transport: "categoryTransport",
    Insurance: "categoryInsurance",
    "Legal Services": "categoryLegalServices",
};

function ClinicCard({clinic, showService = false, onPress, onJoinQueue, t}) {
    const hasRealImage = clinic.photo_url && !clinic.photo_url.includes("example.com");

    const categoryTranslationKey = CATEGORY_TRANSLATIONS[clinic.category_name];

    const categoryName = categoryTranslationKey && t[categoryTranslationKey] ? t[categoryTranslationKey] : clinic.category_name;

    return (
        <View
            style={[
                styles.clinicCard,
                showService && styles.clinicCardExpanded,
            ]}
        >
            {/* CLINIC */}
            <TouchableOpacity
                style={styles.clinicTop}
                activeOpacity={0.8}
                onPress={onPress}
            >
                {hasRealImage ? (
                    <Image
                        source={{ uri: clinic.photo_url }}
                        style={styles.clinicImage}
                    />
                ) : (
                    <View
                        style={[
                            styles.clinicImage,
                            {
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#F0F0FA",
                            },
                        ]}
                    >
                        <MaterialCommunityIcons name="office-building" size={30} color="#5657C4"/>
                    </View>
                )}

                <View style={styles.clinicInfo}>
                    <View style={styles.tagsRow}>
                        {!!clinic.category_name && (
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>
                                    {categoryName}
                                </Text>
                            </View>
                        )}

                        {clinic.rating != null && (
                            <View style={styles.ratingTag}>
                                <Text style={styles.star}>★</Text>

                                <Text style={styles.ratingText}>
                                    {Number(clinic.rating).toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.clinicName} numberOfLines={1}>
                        {clinic.name}
                    </Text>

                    <Text style={styles.clinicAddress} numberOfLines={1}>
                        {clinic.address}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* SERVICE */}
            {showService && clinic.service && (
                <View style={styles.serviceContainer}>
                    <Text style={styles.serviceName}>
                        {clinic.service.name}
                    </Text>

                    <Text style={styles.serviceDuration}>
                        {clinic.service.standard_duration} {t.min}
                    </Text>

                    {!!clinic.service.description && (
                        <Text style={styles.serviceDescription}>
                            {clinic.service.description}
                        </Text>
                    )}

                    {/* QUEUE INFORMATION */}
                    <View style={styles.queueInfo}>
                        <View style={styles.spotsBadge}>
                            <Text style={styles.spotsText}>
                                {clinic.service.spots} {t.spotsRemaining}
                            </Text>
                        </View>

                        <View style={styles.queueBadge}>
                            <MaterialCommunityIcons name="account-group-outline" size={15} color="#111111"/>

                            <Text style={styles.queueText}>
                                {clinic.service.queue} {t.queue}
                            </Text>
                        </View>

                        {Number(clinic.service.delay) > 0 && (
                            <View style={styles.waitingBadge}>
                                <MaterialCommunityIcons name="timer-outline" size={15} color="#555555"/>

                                <Text style={styles.waitingText}>
                                    + {clinic.service.delay} {t.min}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* JOIN QUEUE */}
                    <TouchableOpacity
                        style={styles.joinButton}
                        activeOpacity={0.85}
                        onPress={onJoinQueue}
                    >
                        <Text style={styles.joinButtonText}>
                            {t.joinQueue}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default function SearchScreen({ navigation, route }) {
    const { t } = useLanguage();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categoryPositions, setCategoryPositions] = useState({});
    const [categories, setCategories] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [institutionServices, setInstitutionServices] = useState({});
    const [loading, setLoading] = useState(true);

    const searchInputRef = useRef(null);
    const categoriesScrollRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            setLoading(true);

            try {
                const [institutionsData, categoriesResponse] = await Promise.all([
                    getInstitutions(),
                    fetch(`${API_URL}/api/categories`),
                ]);

                const categoriesData = await categoriesResponse.json();

                if (!categoriesResponse.ok) {
                    throw new Error("Failed to load categories");
                }

                if (!isMounted) return;

                setInstitutions(institutionsData || []);
                setCategories(categoriesData || []);

            } catch (error) {
                console.error("Failed to load search data:", error);

                if (isMounted) {
                    setInstitutions([]);
                    setCategories([]);
                }

            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (institutions.length === 0) return;

        let isMounted = true;

        async function loadServices() {
            try {
                const results = await Promise.all(
                    institutions.map(async institution => {
                        try {
                            const services = await getInstitutionServices(
                                institution.id
                            );

                            return [
                                institution.id,
                                (services || []).filter(
                                    service => service.is_active !== false
                                ),
                            ];

                        } catch (error) {
                            console.error(
                                `Failed to load services for ${institution.id}:`,
                                error
                            );

                            return [institution.id, []];
                        }
                    })
                );

                if (!isMounted) return;

                setInstitutionServices(
                    Object.fromEntries(results)
                );

            } catch (error) {
                console.error(
                    "Failed to load institution services:",
                    error
                );
            }
        }

        loadServices();

        return () => {
            isMounted = false;
        };
    }, [institutions]);

    useEffect(() => {
        const x = categoryPositions[selectedCategory];

        if (x !== undefined) {
            categoriesScrollRef.current?.scrollTo({
                x: Math.max(0, x - 25),
                animated: true,
            });
        }
    }, [selectedCategory, categoryPositions]);

    useEffect(() => {
        if (route.params?.focusSearch) {
            searchInputRef.current?.focus();

            navigation.setParams({
                focusSearch: false,
            });
        }

        if (route.params?.category) {
            setSelectedCategory(route.params.category);

            navigation.setParams({
                category: undefined,
            });
        }
    }, [
        route.params?.focusSearch,
        route.params?.category,
    ]);

    const displayCategories = useMemo(() => {
        return [
            {
                id: "all",
                name: "All",
                translationKey: "all",
            },
            ...categories.map(category => ({
                ...category,
                translationKey:
                    CATEGORY_TRANSLATIONS[category.name],
            })),
        ];
    }, [categories]);

    const filteredResults = useMemo(() => {
        const searchValue = search.trim().toLowerCase();
        const results = [];

        institutions.forEach(institution => {
            const matchesCategory =
                selectedCategory === "All" || institution.category_name === selectedCategory;

            if (!matchesCategory) return;

            const services = institutionServices[institution.id] || [];

            const institutionMatches = searchValue === "" ||
                institution.name?.toLowerCase().includes(searchValue) ||
                institution.address?.toLowerCase().includes(searchValue);

            if (searchValue === "") {
                results.push({
                    ...institution,
                    service: null,
                });

                return;
            }

            const matchingServices = services.filter(
                service =>
                    service.name
                        ?.toLowerCase()
                        .includes(searchValue)
            );

            if (matchingServices.length > 0) {
                matchingServices.forEach(service => {
                    results.push({
                        ...institution,
                        service,
                    });
                });

                return;
            }

            if (institutionMatches) {
                results.push({
                    ...institution,
                    service: services[0] || null,
                });
            }
        });

        return results;
    }, [
        institutions,
        institutionServices,
        selectedCategory,
        search,
    ]);

    const selectedCategoryData =
        displayCategories.find(
            category =>
                category.name === selectedCategory
        );

    function getCategoryLabel(category) {
        if (
            category.translationKey &&
            t[category.translationKey]
        ) {
            return t[category.translationKey];
        }

        return category.name;
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {t.searchTitle}
                </Text>

                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => navigation.navigate("Notifications")}
                >
                    <Ionicons name="notifications" size={27} color="#111111"/>
                </TouchableOpacity>
            </View>

            {/* SEARCH */}
            <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search-outline" size={20} color="#858585"/>

                    <TextInput
                        ref={searchInputRef}
                        value={search}
                        onChangeText={setSearch}
                        placeholder={t.searchPlaceholder}
                        placeholderTextColor="#999999"
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <ScrollView
                style={styles.results}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* CATEGORIES */}
                <ScrollView
                    ref={categoriesScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categories}
                >
                    {displayCategories.map(category => {
                        const active =
                            selectedCategory === category.name;

                        return (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryButton}
                                onLayout={event => {
                                    const { x } = event.nativeEvent.layout;

                                    setCategoryPositions(prev => ({
                                        ...prev,
                                        [category.name]: x,
                                    }));
                                }}
                                onPress={() => setSelectedCategory(category.name)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        active &&
                                        styles.categoryTextActive,
                                    ]}
                                >
                                    {getCategoryLabel(category)}
                                </Text>

                                {active && (
                                    <View
                                        style={
                                            styles.categoryUnderline
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* RESULTS HEADER */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>
                        {selectedCategoryData ? getCategoryLabel(selectedCategoryData) : selectedCategory}
                    </Text>

                    <Text style={styles.resultsCountText}>
                        {filteredResults.length} {t.results}
                    </Text>
                </View>

                {/* RESULTS */}
                <View style={styles.resultsContent}>
                    {loading ? (
                        <Text style={styles.resultsCountText}>
                            {t.loading}
                        </Text>
                    ) : filteredResults.length === 0 ? (
                        <EmptyState
                            title={t.noResults}
                            description={t.noResultsDescription}
                            style={styles.emptyState}
                            titleStyle={styles.emptyTitle}
                            descriptionStyle={styles.emptyDescription}
                        />
                    ) : (
                        filteredResults.map((clinic, index) => (
                            <ClinicCard
                                key={`${clinic.id}-${clinic.service?.id || "institution"}-${index}`}
                                clinic={clinic}
                                showService={search.trim().length > 0 && !!clinic.service}
                                t={t}
                                onPress={() => navigation.navigate("InstitutionDetails",
                                        {
                                            institution: clinic,
                                        }
                                    )
                                }
                                onJoinQueue={() => {
                                    if (!clinic.service) return;

                                    navigation.navigate("SelectDate",
                                        {
                                            service: clinic.service,
                                            institution: clinic,
                                        }
                                    );
                                }}
                            />
                        ))
                    )}
                </View>

                <View style={styles.bottomSpace}/>
            </ScrollView>

            <BottomNavigation navigation={navigation} active="search"
            />
        </View>
    );
}