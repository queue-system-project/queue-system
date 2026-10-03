import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    employeeDetailsStyles as styles,
} from "../../styles/employee/employeeDetailsStyle";

import {
    useLanguage,
} from "../../context/LanguageContext";

import {
    authorizedRequest,
} from "../../api/authorizedRequest";


const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];


export default function EmployeeDetailsScreen({
                                                  navigation,
                                                  route,
                                              }) {
    const { t } = useLanguage();


    const employeeId =
        route?.params?.employeeId
        ?? route?.params?.employee?.id
        ?? null;


    const [
        details,
        setDetails,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);


    /* =========================
       LOAD EMPLOYEE
    ========================= */

    useEffect(() => {
        const loadEmployee =
            async () => {

                if (!employeeId) {
                    setLoading(false);
                    return;
                }

                try {
                    setLoading(true);

                    const data =
                        await authorizedRequest(
                            `/api/employees/${employeeId}/details`,
                            "GET"
                        );

                    console.log(
                        "EMPLOYEE DETAILS:",
                        data
                    );

                    setDetails(data);

                } catch (error) {

                    console.error(
                        "EMPLOYEE DETAILS ERROR:",
                        error
                    );

                    setDetails(null);

                } finally {

                    setLoading(false);
                }
            };


        loadEmployee();

    }, [employeeId]);


    const employee =
        details?.employee ?? null;

    const institution =
        details?.institution ?? null;

    const services =
        Array.isArray(
            details?.services
        )
            ? details.services
            : [];

    const rawWorkingHours =
        Array.isArray(
            details?.working_hours
        )
            ? details.working_hours
            : [];


    /* =========================
       EMPLOYEE NAME
    ========================= */

    const employeeName = [
        employee?.first_name,
        employee?.last_name,
    ]
        .filter(Boolean)
        .join(" ");


    /* =========================
       WORKING HOURS
    ========================= */

    const workingHours =
        useMemo(
            () => {
                return DAYS.flatMap(
                    (
                        day,
                        dayIndex
                    ) => {

                        const intervals =
                            rawWorkingHours.filter(
                                (item) =>
                                    Number(
                                        item.day_of_week
                                    )
                                    === dayIndex
                            );


                        if (
                            intervals.length
                            === 0
                        ) {
                            return [
                                {
                                    key:
                                        `${dayIndex}-off`,

                                    day,

                                    dayOff:
                                        true,
                                },
                            ];
                        }


                        return intervals.map(
                            (
                                interval,
                                index
                            ) => ({
                                key:
                                    `${
                                        dayIndex
                                    }-${
                                        interval.id
                                        ?? index
                                    }`,

                                day,

                                from:
                                interval
                                    .start_time,

                                to:
                                interval
                                    .end_time,

                                dayOff:
                                    false,
                            })
                        );
                    }
                );
            },
            [
                rawWorkingHours,
            ]
        );


    /* =========================
       INSTITUTION
    ========================= */

    const institutionPhoto =
        institution?.photo_url
        ?? null;

    const category =
        institution?.category
        ?? null;

    const rating =
        institution?.rating
        ?? null;


    const openInstitution = () => {
        if (!institution) {
            return;
        }

        navigation.navigate(
            "InstitutionDetails",
            {
                institution: {
                    ...institution,

                    category:
                        category?.name
                        ?? null,

                    categoryData:
                    category,

                    image:
                    institutionPhoto,
                },
            }
        );
    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <View
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.header
                    }
                >
                    <TouchableOpacity
                        style={
                            styles.backButton
                        }
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Ionicons
                            name="chevron-back"
                            size={27}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        flex: 1,
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                    }}
                >
                    <ActivityIndicator
                        size="small"
                    />
                </View>
            </View>
        );
    }


    if (!employee) {
        return (
            <View
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.header
                    }
                >
                    <TouchableOpacity
                        style={
                            styles.backButton
                        }
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Ionicons
                            name="chevron-back"
                            size={27}
                            color="#5657C4"
                        />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        flex: 1,
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                    }}
                >
                    <Text>
                        Employee not found
                    </Text>
                </View>
            </View>
        );
    }


    return (
        <View
            style={
                styles.container
            }
        >

            {/* HEADER */}
            <View
                style={
                    styles.header
                }
            >

                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Ionicons
                        name="chevron-back"
                        size={27}
                        color="#5657C4"
                    />
                </TouchableOpacity>

            </View>


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

                {/* ================= */}
                {/* EMPLOYEE */}
                {/* ================= */}

                <View
                    style={
                        styles.employeeHeader
                    }
                >

                    <View style={styles.employeeAvatar}>
                        {employee.profile_image ? (
                            <Image
                                source={{
                                    uri: employee.profile_image,
                                }}
                                style={styles.employeeImage}
                            />
                        ) : (
                            <View style={styles.employeeAvatarIcon}>
                                <Ionicons
                                    name="person-outline"
                                    size={38}
                                    color="#111111"
                                />
                            </View>
                        )}
                    </View>


                    {employee.room && (
                        <>
                            <View
                                style={
                                    styles.roomBadge
                                }
                            >
                                <Text
                                    style={
                                        styles.roomNumber
                                    }
                                >
                                    {
                                        employee.room
                                    }
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.roomLabel
                                }
                            >
                                {t.roomLabel}
                            </Text>
                        </>
                    )}


                    <Text
                        style={
                            styles.employeeName
                        }
                    >
                        {
                            employeeName
                            || "-"
                        }
                    </Text>

                </View>


                {/* ================= */}
                {/* CONTACT */}
                {/* ================= */}

                {(
                    employee.phone
                    ||
                    employee.email
                ) && (
                    <View
                        style={
                            styles.contacts
                        }
                    >

                        {employee.phone && (
                            <View
                                style={
                                    styles.contactRow
                                }
                            >
                                <Ionicons
                                    name="call"
                                    size={16}
                                    color="#111111"
                                />

                                <Text
                                    style={
                                        styles.contactText
                                    }
                                >
                                    {
                                        employee.phone
                                    }
                                </Text>
                            </View>
                        )}


                        {employee.email && (
                            <View
                                style={
                                    styles.contactRow
                                }
                            >
                                <Ionicons
                                    name="mail"
                                    size={16}
                                    color="#111111"
                                />

                                <Text
                                    style={
                                        styles.contactText
                                    }
                                >
                                    {
                                        employee.email
                                    }
                                </Text>
                            </View>
                        )}

                    </View>
                )}


                {/* ================= */}
                {/* WORKING HOURS */}
                {/* ================= */}

                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    {t.workingHours}
                </Text>


                <View
                    style={
                        styles.workingHours
                    }
                >

                    {workingHours.map(
                        (item) => (
                            <View
                                key={
                                    item.key
                                }
                                style={
                                    styles.workingRow
                                }
                            >

                                <Text
                                    style={
                                        styles.day
                                    }
                                >
                                    {item.day}
                                </Text>


                                {item.dayOff ? (
                                    <>
                                        <View style={styles.timeGroup}>
                                            <Text style={styles.dayOff}>
                                                {t.dayOff}
                                            </Text>
                                        </View>

                                        <View style={styles.timeGroup}>
                                            <Text style={styles.dayOff}>
                                                {t.dayOff}
                                            </Text>
                                        </View>
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
                                                {
                                                    t.fromText
                                                }
                                            </Text>

                                            <Text
                                                style={
                                                    styles.time
                                                }
                                            >
                                                {
                                                    item.from
                                                }
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
                                                {
                                                    t.toText
                                                }
                                            </Text>

                                            <Text
                                                style={
                                                    styles.time
                                                }
                                            >
                                                {
                                                    item.to
                                                }
                                            </Text>
                                        </View>
                                    </>
                                )}

                            </View>
                        )
                    )}

                </View>


                {/* ================= */}
                {/* INSTITUTION */}
                {/* ================= */}

                {institution && (
                    <>
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            {
                                t.institutionTitle
                            }
                        </Text>


                        <TouchableOpacity
                            style={
                                styles.institutionCard
                            }
                            activeOpacity={
                                0.85
                            }
                            onPress={
                                openInstitution
                            }
                        >

                            {institutionPhoto ? (
                                <Image
                                    source={{
                                        uri:
                                        institutionPhoto,
                                    }}
                                    style={
                                        styles
                                            .institutionImage
                                    }
                                />
                            ) : (
                                <View
                                    style={[
                                        styles
                                            .institutionImage,
                                        {
                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            "business-outline"
                                        }
                                        size={30}
                                        color={
                                            "#777777"
                                        }
                                    />
                                </View>
                            )}


                            <View
                                style={
                                    styles
                                        .institutionInfo
                                }
                            >

                                {(category?.name
                                    || rating != null) && (
                                    <View
                                        style={
                                            styles.tagsRow
                                        }
                                    >

                                        {category?.name && (
                                            <View
                                                style={
                                                    styles
                                                        .categoryTag
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles
                                                            .categoryText
                                                    }
                                                >
                                                    {
                                                        category
                                                            .name
                                                    }
                                                </Text>
                                            </View>
                                        )}


                                        {rating != null && (
                                            <View
                                                style={
                                                    styles
                                                        .ratingTag
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.star
                                                    }
                                                >
                                                    ★
                                                </Text>

                                                <Text
                                                    style={
                                                        styles
                                                            .ratingText
                                                    }
                                                >
                                                    {
                                                        rating
                                                    }
                                                </Text>
                                            </View>
                                        )}

                                    </View>
                                )}


                                <Text
                                    style={
                                        styles
                                            .institutionName
                                    }
                                >
                                    {
                                        institution.name
                                    }
                                </Text>


                                {institution.address && (
                                    <Text
                                        style={
                                            styles
                                                .institutionAddress
                                        }
                                    >
                                        {
                                            institution.address
                                        }
                                    </Text>
                                )}

                            </View>

                        </TouchableOpacity>
                    </>
                )}


                {/* ================= */}
                {/* SERVICES */}
                {/* ================= */}

                {services.length > 0 && (
                    <>
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            {t.services}
                        </Text>


                        {services.map(
                            (service) => (
                                <View
                                    key={
                                        service.id
                                    }
                                    style={
                                        styles.serviceCard
                                    }
                                >

                                    <Text
                                        style={
                                            styles.serviceName
                                        }
                                    >
                                        {
                                            service.name
                                        }
                                    </Text>


                                    <Text
                                        style={
                                            styles
                                                .serviceDuration
                                        }
                                    >
                                        {
                                            service
                                                .standard_duration
                                        } min
                                    </Text>


                                    {service.description && (
                                        <Text
                                            style={
                                                styles
                                                    .serviceDescription
                                            }
                                        >
                                            {
                                                service
                                                    .description
                                            }
                                        </Text>
                                    )}

                                </View>
                            )
                        )}
                    </>
                )}


                <View
                    style={
                        styles.bottomSpace
                    }
                />

            </ScrollView>

        </View>
    );
}