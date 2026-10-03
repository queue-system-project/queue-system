import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    Ionicons,
} from "@expo/vector-icons";

import {
    notificationDetailsStyles as styles,
} from "../../styles/notifications/notificationDetailsStyle";

import {
    useLanguage,
} from "../../context/LanguageContext";


function DetailRow({
                       label,
                       value,
                   }) {
    if (
        value === null
        ||
        value === undefined
        ||
        value === ""
    ) {
        return null;
    }

    return (
        <View
            style={
                styles.detailRow
            }
        >
            <Text
                style={
                    styles.detailLabel
                }
            >
                {label}
            </Text>

            <Text
                style={
                    styles.detailValue
                }
            >
                {value}
            </Text>
        </View>
    );
}


export default function NotificationDetailsScreen({
                                                      navigation,
                                                      route,
                                                  }) {
    const { t } =
        useLanguage();

    const notification =
        route?.params?.notification
        ?? null;


    if (!notification) {
        return null;
    }


    const getStatusText =
        () => {
            switch (
                notification.type
                ) {
                case "waiting":
                    return (
                        t.waiting
                        ?? "Waiting"
                    );

                case "confirmed":
                    return (
                        t.confirmed
                        ?? "Confirmed"
                    );

                case "turn":
                    return (
                        t.ready
                        ?? "In service"
                    );

                case "confirm":
                    return (
                        t.confirmationRequired
                        ?? "Confirmation required"
                    );

                case "available":
                    return (
                        t.spotAvailable
                        ?? "Spot available"
                    );

                case "lastChance":
                    return (
                        t.lastChance
                        ?? "Last chance"
                    );

                case "completed":
                    return (
                        t.completed
                        ?? "Completed"
                    );

                case "cancelled":
                    return (
                        t.cancelled
                        ?? "Cancelled"
                    );

                case "skipped":
                    return (
                        t.skipped
                        ?? "Skipped"
                    );

                case "missed":
                    return (
                        t.missed
                        ?? "Missed"
                    );

                default:
                    return null;
            }
        };


    const statusText =
        getStatusText();


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
                    onPress={
                        () =>
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

                <Text
                    style={
                        styles.headerTitle
                    }
                >
                    {
                        t.notificationDetailsTitle
                    }
                </Text>
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
                <View
                    style={
                        styles.titleRow
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        {
                            (
                                notification.title
                                ?? ""
                            )
                                .replace(
                                    "🔥",
                                    ""
                                )
                                .trim()
                        }
                    </Text>

                    {
                        notification.time
                        &&
                        (
                            <Text
                                style={
                                    styles.time
                                }
                            >
                                {
                                    notification.time
                                }
                            </Text>
                        )
                    }
                </View>


                {
                    (
                        notification.details
                        ??
                        notification.message
                    )
                    &&
                    (
                        <Text
                            style={
                                styles.description
                            }
                        >
                            {
                                notification.details
                                ??
                                notification.message
                            }
                        </Text>
                    )
                }


                <View
                    style={
                        styles.detailsSection
                    }
                >
                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        {t.details}
                    </Text>


                    <DetailRow
                        label={
                            t.status
                        }
                        value={
                            statusText
                        }
                    />


                    <DetailRow
                        label={
                            t.date
                            ?? "Date"
                        }
                        value={
                            notification.date
                        }
                    />


                    <DetailRow
                        label={
                            t.updatedAt
                            ?? "Time"
                        }
                        value={
                            notification.time
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
}