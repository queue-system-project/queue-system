import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";

import { homeStyles as styles } from "../../styles/home/homeStyles";
import EmptyState from "../../components/EmptyState";
import { useLanguage } from "../../context/LanguageContext";

import { getCategories } from "../../api/categories/categoriesApi";
import { getInstitutions } from "../../api/institutions/institutionsApi";
import { getRecentAppointments } from "../../api/appointments/appointmentsApi";
import {getCurrentLocation, sortInstitutionsByDistance,} from "../../utils/locationUtils";


const categoryIcons = {
    healthcare: "hospital-building",
    banking_finance: "bank",
    government_services: "office-building",
    beauty_wellness: "spa",
    education: "school",
    transport: "bus",
    insurance: "shield-check",
    legal_services: "scale-balance",
};


const categoryColors = {
    healthcare: "#1DB5D8",
    banking_finance: "#67C96B",
    government_services: "#5A96E8",
    beauty_wellness: "#F18AB3",
    education: "#F2B84B",
    transport: "#8B7BE8",
    insurance: "#4DB6AC",
    legal_services: "#E27A5F",
};


function ClinicCard({
                        clinic,
                        appointment = null,
                        onPress,
                    }) {
    const image =
        clinic.photo_url || clinic.image;

    const category =
        clinic.category_name || clinic.category;

    const hasRealImage =
        image &&
        !image.includes("example.com");

    return (
        <TouchableOpacity
            style={[
                styles.clinicCard,
                appointment
                    ? styles.seeAllAppointmentCard
                    : styles.seeAllClinicCard,
            ]}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <View style={styles.clinicTop}>

                {hasRealImage ? (
                    <Image
                        source={{ uri: image }}
                        style={styles.clinicImage}
                    />
                ) : (
                    <View
                        style={
                            styles.clinicImagePlaceholder
                        }
                    >
                        <MaterialCommunityIcons
                            name="office-building"
                            size={30}
                            color="#5657C4"
                        />
                    </View>
                )}

                <View style={styles.clinicInfo}>

                    <View style={styles.tagsRow}>

                        <View style={styles.categoryTag}>
                            <Text
                                style={
                                    styles.categoryTagText
                                }
                            >
                                {category || "Institution"}
                            </Text>
                        </View>

                        {clinic.rating != null && (
                            <View style={styles.ratingTag}>

                                <Text style={styles.star}>
                                    ★
                                </Text>

                                <Text
                                    style={
                                        styles.ratingText
                                    }
                                >
                                    {Number(
                                        clinic.rating
                                    ).toFixed(1)}
                                </Text>

                            </View>
                        )}

                    </View>

                    <Text
                        style={styles.clinicName}
                        numberOfLines={1}
                    >
                        {clinic.name}
                    </Text>

                    <Text
                        style={styles.clinicAddress}
                        numberOfLines={1}
                    >
                        {clinic.address}
                    </Text>

                </View>
            </View>


            {appointment && (
                <View style={styles.appointmentInfo}>

                    <View>
                        <Text
                            style={
                                styles.appointmentTitle
                            }
                            numberOfLines={2}
                        >
                            {appointment.service}
                        </Text>

                        <Text
                            style={
                                styles.appointmentDuration
                            }
                        >
                            {appointment.duration}
                        </Text>
                    </View>

                    <View style={styles.dateTag}>
                        <Text style={styles.dateText}>
                            {appointment.date}{" "}
                            {appointment.time}
                        </Text>
                    </View>

                </View>
            )}

        </TouchableOpacity>
    );
}


export default function SeeAllScreen({route, navigation,}) {
    const { t } = useLanguage();
    const { type } = route.params;

    const [categories, setCategories] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [recentAppointments, setRecentAppointments,] = useState([]);
    const [nearbyInstitutions, setNearbyInstitutions] = useState([]);


    useEffect(() => {
        const loadData = async () => {
            try {
                if (type === "categories") {
                    const data =
                        await getCategories();

                    setCategories(data);
                    return;
                }

                if (type === "recommended") {
                    const data =
                        await getInstitutions();

                    setInstitutions(data);
                    return;
                }

                if (type === "appointments") {
                    const data =
                        await getRecentAppointments();

                    setRecentAppointments(data);
                    return;
                }

                if (type === "nearby") {
                    const data =
                        await getInstitutions();

                    try {
                        const userLocation =
                            await getCurrentLocation();

                        if (!userLocation) {
                            setNearbyInstitutions([]);
                            return;
                        }

                        const nearby =
                            sortInstitutionsByDistance(
                                data,
                                userLocation
                            );

                        setNearbyInstitutions(nearby);
                    } catch (locationError) {
                        console.log(
                            "LOCATION ERROR:",
                            locationError
                        );

                        setNearbyInstitutions([]);
                    }
                }
            } catch (error) {
                console.log(
                    "SEE ALL DATA ERROR:",
                    error
                );
            }
        };

        loadData();
    }, [type]);


    const titles = {
        categories: t.categories,
        recommended: t.recommended,
        appointments: t.recentAppointments,
        nearby: t.clinicsNearYou,
    };


    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.seeAllHeader}>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Ionicons
                        name="chevron-back"
                        size={28}
                        color="#5657C4"
                    />
                </TouchableOpacity>

                <Text style={styles.seeAllTitle}>
                    {titles[type]}
                </Text>

            </View>


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.seeAllContent
                }
            >

                {/* CATEGORIES */}
                {type === "categories" && (
                    <View
                        style={
                            styles.categoriesGrid
                        }
                    >
                        {categories.map(
                            (category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={
                                        styles.categoryCardLarge
                                    }
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        navigation.navigate(
                                            "Search",
                                            {
                                                category:
                                                category.name,
                                            }
                                        )
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name={
                                            categoryIcons[
                                                category.key
                                                ] ||
                                            "shape-outline"
                                        }
                                        size={42}
                                        color={
                                            categoryColors[
                                                category.key
                                                ] ||
                                            "#858585"
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.categoryCardLargeTitle
                                        }
                                        numberOfLines={2}
                                    >
                                        {category.name}
                                    </Text>

                                </TouchableOpacity>
                            )
                        )}
                    </View>
                )}


                {/* RECOMMENDED */}
                {type === "recommended" && (
                    <View
                        style={
                            styles.verticalCards
                        }
                    >
                        {institutions.length === 0 ? (
                            <EmptyState
                                title={
                                    t.noRecommendations
                                }
                                description={
                                    t.recommendedEmpty
                                }
                                style={
                                    styles.emptyState
                                }
                                titleStyle={
                                    styles.emptyTitle
                                }
                                descriptionStyle={
                                    styles.emptyDescription
                                }
                            />
                        ) : (
                            institutions.map(
                                (institution) => (
                                    <ClinicCard
                                        key={
                                            institution.id
                                        }
                                        clinic={
                                            institution
                                        }
                                        onPress={() =>
                                            navigation.navigate(
                                                "InstitutionDetails",
                                                {
                                                    institution,
                                                }
                                            )
                                        }
                                    />
                                )
                            )
                        )}
                    </View>
                )}


                {/* APPOINTMENTS */}
                {type === "appointments" && (
                    <View
                        style={
                            styles.verticalCards
                        }
                    >
                        {recentAppointments.length ===
                        0 ? (
                            <EmptyState
                                title={
                                    t.noRecentAppointments
                                }
                                description={
                                    t.recentAppointmentsEmpty
                                }
                                style={
                                    styles.emptyState
                                }
                                titleStyle={
                                    styles.emptyTitle
                                }
                                descriptionStyle={
                                    styles.emptyDescription
                                }
                            />
                        ) : (
                            recentAppointments.map(
                                (appointment) => {
                                    const clinic = {
                                        id:
                                        appointment
                                            .institution
                                            .id,

                                        name:
                                        appointment
                                            .institution
                                            .name,

                                        address:
                                        appointment
                                            .institution
                                            .address,

                                        photo_url:
                                        appointment
                                            .institution
                                            .photo_url,
                                    };


                                    const formattedAppointment = {
                                        ...appointment,

                                        service:
                                        appointment
                                            .service_name,

                                        duration:
                                            appointment
                                                .actual_duration !=
                                            null
                                                ? `${appointment.actual_duration} min`
                                                : "",

                                        date:
                                            appointment
                                                .actual_end
                                                ? new Date(
                                                    appointment.actual_end
                                                ).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day: "2-digit",
                                                        month: "long",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "",

                                        time:
                                            appointment
                                                .actual_end
                                                ? new Date(
                                                    appointment.actual_end
                                                ).toLocaleTimeString(
                                                    "en-GB",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )
                                                : "",
                                    };


                                    return (
                                        <ClinicCard
                                            key={
                                                appointment.id
                                            }
                                            clinic={
                                                clinic
                                            }
                                            appointment={
                                                formattedAppointment
                                            }
                                            onPress={() =>
                                                navigation.navigate(
                                                    "AppointmentDetails",
                                                    {
                                                        appointment:
                                                            {
                                                                ...formattedAppointment,
                                                                clinic,
                                                            },
                                                    }
                                                )
                                            }
                                        />
                                    );
                                }
                            )
                        )}
                    </View>
                )}


                {/* NEARBY */}
                {type === "nearby" && (
                    <View
                        style={
                            styles.verticalCards
                        }
                    >
                        {nearbyInstitutions.length === 0 ? (
                            <EmptyState
                                title={
                                    t.noNearbyClinics
                                }
                                description={
                                    t.nearbyClinicsEmpty
                                }
                                style={
                                    styles.emptyState
                                }
                                titleStyle={
                                    styles.emptyTitle
                                }
                                descriptionStyle={
                                    styles.emptyDescription
                                }
                            />
                        ) : (
                            nearbyInstitutions.map(
                                (institution) => (
                                    <ClinicCard
                                        key={
                                            institution.id
                                        }
                                        clinic={
                                            institution
                                        }
                                        onPress={() =>
                                            navigation.navigate(
                                                "InstitutionDetails",
                                                {
                                                    institution,
                                                }
                                            )
                                        }
                                    />
                                )
                            )
                        )}
                    </View>
                )}

            </ScrollView>

        </View>
    );
}