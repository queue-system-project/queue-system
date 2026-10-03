import React, {
    useState,
} from "react";
import {
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
import PopUpWindow from "../../components/popUpWindows/PopUpWindow";
import EmptyState from "../../components/EmptyState";
import ClinicCard from "../../components/home/ClinicCard";

import {
    useLanguage,
} from "../../context/LanguageContext";

import useHomeData from "../../hooks/home/useHomeData";
import useQueueAction from "../../hooks/home/useQueueAction";

import {
    categoryColors,
    categoryIcons,
} from "../../constants/home/homeConstants";
import {
    formatTimeLeft,
} from "../../utils/home/homePopupUtils";

import {
    homeStyles as styles,
} from "../../styles/home/homeStyles";

export default function HomeScreen({
                                       navigation,
                                   }) {
    const { t } =
        useLanguage();

    const [search] =
        useState("");

    const {
        categories,
        institutions,
        recentAppointments,
        nearbyInstitutions,
    } = useHomeData();

    const {
        queueAction,
        currentTime,
        confirmQueueAction,
        declineQueueAction,
        selectUrgentTime,
    } = useQueueAction();

    return (
        <View
            style={
                styles.container
            }
        >

            <ScrollView
                style={
                    styles.scrollView
                }
                contentContainerStyle={
                    styles.content
                }
                showsVerticalScrollIndicator={
                    false
                }
            >

                {/* HEADER */}
                <View
                    style={[
                        styles.header,
                        queueAction
                        && styles.headerExpanded,
                    ]}
                >
                    <View
                        style={
                            styles.logoContainer
                        }
                    >
                        <Text
                            style={
                                styles.logo
                            }
                        >
                            <Text
                                style={
                                    styles.logoGreen
                                }
                            >
                                Q
                            </Text>

                            <Text
                                style={
                                    styles.logoWhite
                                }
                            >
                                ast
                            </Text>
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.notificationButton
                            }
                            activeOpacity={
                                0.7
                            }
                            onPress={
                                () =>
                                    navigation.navigate(
                                        "Notifications"
                                    )
                            }
                        >
                            <Ionicons
                                name="notifications"
                                size={27}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* SEARCH */}
                <TouchableOpacity
                    style={
                        styles.searchWrapper
                    }
                    activeOpacity={1}
                    onPress={
                        () =>
                            navigation.navigate(
                                "Search",
                                {
                                    focusSearch:
                                        true,
                                }
                            )
                    }
                >
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#858585"
                        style={
                            styles.searchIcon
                        }
                    />

                    <TextInput
                        value={search}
                        placeholder={
                            t.searchPlaceholder
                        }
                        placeholderTextColor="#999999"
                        style={
                            styles.searchInput
                        }
                        editable={false}
                        pointerEvents="none"
                    />
                </TouchableOpacity>


                {/* QUEUE POPUP */}
                {queueAction && (
                    <PopUpWindow
                        type={
                            queueAction.type
                        }

                        appointment={
                            queueAction.appointment
                        }

                        timeLeft={
                            formatTimeLeft(
                                queueAction.expiresAt,
                                currentTime
                            )
                        }

                        availableOptions={
                            queueAction.options
                            ?? []
                        }

                        onConfirm={
                            confirmQueueAction
                        }

                        onDecline={
                            declineQueueAction
                        }

                        onSelectTime={
                            selectUrgentTime
                        }
                    />
                )}


                {/* CATEGORIES */}
                <View
                    style={{
                        height: 35,
                    }}
                />


                <View
                    style={
                        styles.sectionHeader
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        {t.categories}
                    </Text>


                    <TouchableOpacity
                        onPress={
                            () =>
                                navigation.navigate(
                                    "SeeAll",
                                    {
                                        type:
                                            "categories",
                                    }
                                )
                        }
                    >
                        <Text
                            style={
                                styles.seeAll
                            }
                        >
                            {t.seeAll}
                        </Text>
                    </TouchableOpacity>
                </View>


                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.categoriesList
                    }
                >
                    {categories.map(
                        (category) => (

                            <TouchableOpacity
                                key={
                                    category.id
                                }
                                style={
                                    styles.categoryCard
                                }
                                activeOpacity={
                                    0.8
                                }
                                onPress={
                                    () =>
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
                                            ]
                                        ||
                                        "shape-outline"
                                    }
                                    size={38}
                                    color={
                                        categoryColors[
                                            category.key
                                            ]
                                        ||
                                        "#858585"
                                    }
                                />

                                <Text
                                    style={
                                        styles.categoryTitle
                                    }
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>

                        )
                    )}
                </ScrollView>


                {/* RECOMMENDED */}
                <View
                    style={
                        styles.sectionHeader
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        {t.recommended}
                    </Text>


                    <TouchableOpacity
                        onPress={
                            () =>
                                navigation.navigate(
                                    "SeeAll",
                                    {
                                        type:
                                            "recommended",
                                    }
                                )
                        }
                    >
                        <Text
                            style={
                                styles.seeAll
                            }
                        >
                            {t.seeAll}
                        </Text>
                    </TouchableOpacity>
                </View>


                {institutions.length === 0 ? (

                    <EmptyState
                        description={
                            t.recommendedEmpty
                        }
                        style={
                            styles.emptyRecommended
                        }
                        descriptionStyle={
                            styles.emptyDescription
                        }
                    />

                ) : (

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={
                            false
                        }
                        contentContainerStyle={
                            styles.cardsList
                        }
                    >
                        {institutions.map(
                            (institution) => (

                                <ClinicCard
                                    key={
                                        institution.id
                                    }
                                    clinic={
                                        institution
                                    }
                                    onPress={
                                        () =>
                                            navigation.navigate(
                                                "InstitutionDetails",
                                                {
                                                    institution,
                                                }
                                            )
                                    }
                                />

                            )
                        )}
                    </ScrollView>

                )}


                {/* RECENT APPOINTMENTS */}
                <View
                    style={
                        styles.appointmentsSection
                    }
                >

                    <View
                        style={
                            styles.sectionHeader
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            {t.recentAppointments}
                        </Text>


                        <TouchableOpacity
                            onPress={
                                () =>
                                    navigation.navigate(
                                        "SeeAll",
                                        {
                                            type:
                                                "appointments",
                                        }
                                    )
                            }
                        >
                            <Text
                                style={
                                    styles.seeAll
                                }
                            >
                                {t.seeAll}
                            </Text>
                        </TouchableOpacity>
                    </View>


                    {recentAppointments.length === 0 ? (

                        <EmptyState
                            description={
                                t.recentAppointmentsEmpty
                            }
                            style={
                                styles.emptyRecentAppointments
                            }
                            descriptionStyle={
                                styles.emptyDescription
                            }
                        />

                    ) : (

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.cardsList
                            }
                        >
                            {recentAppointments.map(
                                (appointment) => {

                                    const institution =
                                        appointment.institution
                                        ?? {};


                                    const service =
                                        appointment.service
                                        ?? {};


                                    const employee =
                                        appointment.employee
                                        ?? null;


                                    const client =
                                        appointment.client
                                        ?? null;


                                    const category =
                                        institution.category
                                        ?? null;


                                    const clinic = {
                                        id:
                                        institution.id,

                                        name:
                                        institution.name,

                                        address:
                                        institution.address,

                                        photo_url:
                                        institution.photo_url,

                                        rating:
                                        institution.rating,

                                        category:
                                            category?.name
                                            ?? null,

                                        category_name:
                                            category?.name
                                            ?? null,
                                    };


                                    const appointmentTime =
                                        appointment.actual_start
                                        ?? appointment.actual_end
                                        ?? null;


                                    const formattedAppointment = {
                                        ...appointment,


                                        // IDs

                                        id:
                                        appointment.queue_entry_id,

                                        visitId:
                                        appointment.id,

                                        queueEntryId:
                                        appointment.queue_entry_id,

                                        serviceId:
                                            appointment.service_id
                                            ?? service.id
                                            ?? null,

                                        institutionId:
                                            institution.id
                                            ?? null,

                                        employeeId:
                                            appointment.employee_id
                                            ?? employee?.id
                                            ?? null,

                                        clientId:
                                            client?.id
                                            ?? null,


                                        // SERVICE

                                        service:
                                            service.name
                                            ?? "-",

                                        serviceData:
                                        service,

                                        serviceDescription:
                                            service.description
                                            ?? null,

                                        duration:
                                            appointment.actual_duration
                                            != null
                                                ? `${appointment.actual_duration} min`

                                                : appointment.standard_duration
                                                != null
                                                    ? `${appointment.standard_duration} min`
                                                    : "",


                                        // DATE / TIME

                                        date:
                                            appointmentTime
                                                ? new Date(
                                                    appointmentTime
                                                ).toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                        day:
                                                            "2-digit",

                                                        month:
                                                            "short",

                                                        year:
                                                            "numeric",
                                                    }
                                                )
                                                : "",


                                        time:
                                            appointmentTime
                                                ? new Date(
                                                    appointmentTime
                                                ).toLocaleTimeString(
                                                    "en-GB",
                                                    {
                                                        hour:
                                                            "2-digit",

                                                        minute:
                                                            "2-digit",

                                                        hour12:
                                                            false,
                                                    }
                                                )
                                                : "",


                                        // CLIENT

                                        client,

                                        clientName:
                                            client
                                                ? [
                                                    client.first_name,
                                                    client.last_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")
                                                : "",

                                        clientPhone:
                                            client?.phone
                                            ?? null,

                                        clientEmail:
                                            client?.email
                                            ?? null,

                                        clientNote:
                                            typeof appointment.client_note
                                            === "string"

                                            && appointment.client_note.trim()

                                                ? appointment.client_note.trim()

                                                : null,


                                        // EMPLOYEE

                                        employee,

                                        doctor:
                                            employee
                                                ? [
                                                    employee.first_name,
                                                    employee.last_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")
                                                : "Not assigned",

                                        room:
                                            employee?.room
                                            ?? "—",

                                        image:
                                            employee?.profile_image
                                            ?? null,


                                        // INSTITUTION

                                        institution,

                                        institutionName:
                                            institution.name
                                            ?? null,

                                        institutionAddress:
                                            institution.address
                                            ?? null,

                                        institutionRating:
                                            institution.rating
                                            ?? null,

                                        institutionPhoto:
                                            institution.photo_url
                                            ?? null,

                                        institutionCategory:
                                        category,
                                    };


                                    return (
                                        <ClinicCard
                                            key={
                                                appointment.queue_entry_id
                                                ?? appointment.id
                                            }
                                            clinic={
                                                clinic
                                            }
                                            appointment={
                                                formattedAppointment
                                            }
                                            onPress={
                                                () =>
                                                    navigation.navigate(
                                                        "AppointmentDetails",
                                                        {
                                                            appointment:
                                                            formattedAppointment,
                                                        }
                                                    )
                                            }
                                        />
                                    );
                                }
                            )}
                        </ScrollView>

                    )}
                </View>


                {/* CLINICS NEAR YOU */}
                <View
                    style={
                        styles.nearbySection
                    }
                >

                    <View
                        style={
                            styles.sectionHeader
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            {t.clinicsNearYou}
                        </Text>


                        <TouchableOpacity
                            onPress={
                                () =>
                                    navigation.navigate(
                                        "SeeAll",
                                        {
                                            type:
                                                "nearby",
                                        }
                                    )
                            }
                        >
                            <Text
                                style={
                                    styles.seeAll
                                }
                            >
                                {t.seeAll}
                            </Text>
                        </TouchableOpacity>
                    </View>


                    {nearbyInstitutions.length === 0 ? (

                        <EmptyState
                            description={
                                t.nearbyClinicsEmpty
                            }
                            style={
                                styles.emptyNearby
                            }
                            descriptionStyle={
                                styles.emptyDescription
                            }
                        />

                    ) : (

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.cardsList
                            }
                        >
                            {nearbyInstitutions.map(
                                (institution) => (

                                    <ClinicCard
                                        key={
                                            institution.id
                                        }
                                        clinic={
                                            institution
                                        }
                                        onPress={
                                            () =>
                                                navigation.navigate(
                                                    "InstitutionDetails",
                                                    {
                                                        institution,
                                                    }
                                                )
                                        }
                                    />

                                )
                            )}
                        </ScrollView>

                    )}
                </View>


                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>


            {/* BOTTOM NAVIGATION */}
            <BottomNavigation
                navigation={
                    navigation
                }
                active="home"
            />

        </View>
    );
}
