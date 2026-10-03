import React from "react";

import {
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
    popUpWindowStyles as styles,
} from "../../styles/popUpWindows/popUpWindowStyle";

import {
    useLanguage,
} from "../../context/LanguageContext";


export default function PopUpWindow({
                                        type,
                                        appointment,
                                        timeLeft = null,
                                        availableOptions = [],
                                        onConfirm,
                                        onDecline,
                                        onSelectTime,
                                    }) {
    const { t } = useLanguage();

    if (
        !type
        || !appointment
    ) {
        return null;
    }

    const isConfirmation =
        type === "confirmation";

    const isUrgent =
        type === "urgent";

    const isLastMinute =
        type === "lastMinute";

    if (
        !isConfirmation
        && !isUrgent
        && !isLastMinute
    ) {
        return null;
    }


    const service =
        appointment.service
        ?? "-";

    const duration =
        appointment.duration
        ?? "";

    const date =
        appointment.date
        ?? "";

    const time =
        appointment.time
        ?? "";

    const institution =
        appointment.institution
        ?? null;

    const institutionImage =
        institution?.image
        ?? institution?.photo_url
        ?? null;

    const institutionCategory =
        typeof institution?.category
        === "object"
            ? institution?.category?.name
            : institution?.category
            ?? institution?.category_name
            ?? null;

    const institutionRating =
        institution?.rating != null
        && !Number.isNaN(
            Number(
                institution.rating
            )
        )
            ? Number(
                institution.rating
            ).toFixed(1)
            : null;


    const timeOptions = [
        {
            value: 0,
            label: t.now,
        },
        {
            value: 5,
            label: `+5 ${t.min}`,
        },
        {
            value: 10,
            label: `+10 ${t.min}`,
        },
        {
            value: 15,
            label: `+15 ${t.min}`,
        },
    ].filter(
        (option) =>
            !isUrgent
            || availableOptions.includes(
                option.value
            )
    );


    const popupTitle =
        isConfirmation
            ? t.confirmationPopupTitle
            : isUrgent
                ? t.urgentPopupTitle
                : t.lastMinutePopupTitle;


    const popupDescription =
        isConfirmation
            ? t.confirmationPopupDescription
            : isUrgent
                ? t.urgentPopupDescription
                : t.lastMinutePopupDescription;


    return (
        <View
            style={[
                styles.container,
                isConfirmation
                && styles.confirmationContainer,
                isUrgent
                && styles.urgentContainer,
                isLastMinute
                && styles.lastMinuteContainer,
            ]}
        >

            {timeLeft && (
                <View style={styles.timer}>
                    <Ionicons
                        name="timer-outline"
                        size={16}
                        color="#111111"
                    />

                    <Text
                        style={styles.timerText}
                    >
                        {timeLeft}
                    </Text>
                </View>
            )}


            <Text style={styles.title}>
                {popupTitle}
            </Text>


            <Text
                style={styles.description}
            >
                {popupDescription}
            </Text>


            {!isConfirmation
                && institution
                && (
                    <View
                        style={
                            styles.institutionCard
                        }
                    >
                        {institutionImage ? (
                            <Image
                                source={{
                                    uri:
                                    institutionImage,
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
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="business-outline"
                                    size={28}
                                    color="#777777"
                                />
                            </View>
                        )}


                        <View
                            style={
                                styles.institutionInfo
                            }
                        >
                            {(
                                institutionCategory
                                || institutionRating
                            ) && (
                                <View
                                    style={
                                        styles.tagsRow
                                    }
                                >
                                    {institutionCategory && (
                                        <View
                                            style={
                                                styles.categoryTag
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.categoryText
                                                }
                                                numberOfLines={1}
                                            >
                                                {
                                                    institutionCategory
                                                }
                                            </Text>
                                        </View>
                                    )}


                                    {institutionRating && (
                                        <View
                                            style={
                                                styles.ratingTag
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
                                                    styles.ratingText
                                                }
                                            >
                                                {
                                                    institutionRating
                                                }
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}


                            <Text
                                style={
                                    styles.institutionName
                                }
                                numberOfLines={1}
                            >
                                {
                                    institution.name
                                    ?? "-"
                                }
                            </Text>


                            {institution.address && (
                                <Text
                                    style={styles.address}
                                    numberOfLines={1}
                                >
                                    {
                                        institution.address
                                    }
                                </Text>
                            )}
                        </View>
                    </View>
                )}


            <View
                style={
                    styles.appointmentCard
                }
            >
                <View
                    style={{
                        flex: 1,
                        minWidth: 0,
                        paddingRight: 10,
                    }}
                >
                    <Text
                        style={styles.serviceName}
                        numberOfLines={2}
                    >
                        {service}
                    </Text>

                    {duration ? (
                        <Text
                            style={styles.duration}
                        >
                            {duration}
                        </Text>
                    ) : null}
                </View>


                <View
                    style={
                        styles.appointmentRight
                    }
                >
                    {date ? (
                        <View
                            style={styles.dateBadge}
                        >
                            <Text
                                style={styles.dateText}
                                numberOfLines={1}
                            >
                                {date}
                            </Text>
                        </View>
                    ) : null}


                    {time ? (
                        <View
                            style={styles.timeBadge}
                        >
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color="#333333"
                            />

                            <Text
                                style={styles.timeText}
                                numberOfLines={1}
                            >
                                {time}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>


            {isConfirmation && (
                <View
                    style={
                        styles.confirmationButtons
                    }
                >
                    <TouchableOpacity
                        style={styles.yesButton}
                        activeOpacity={0.85}
                        onPress={onConfirm}
                    >
                        <Text
                            style={
                                styles.yesButtonText
                            }
                        >
                            {t.yes}
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.noButton}
                        activeOpacity={0.85}
                        onPress={onDecline}
                    >
                        <Text
                            style={
                                styles.noButtonText
                            }
                        >
                            {t.no}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}


            {isUrgent && (
                <>
                    <View
                        style={styles.timeOptions}
                    >
                        {timeOptions.map(
                            (option) => (
                                <TouchableOpacity
                                    key={
                                        option.value
                                    }
                                    style={
                                        styles.timeOptionButton
                                    }
                                    activeOpacity={0.85}
                                    onPress={() =>
                                        onSelectTime?.(
                                            option.value
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.timeOptionText
                                        }
                                    >
                                        {
                                            option.label
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>


                    <TouchableOpacity
                        style={
                            styles.declineButton
                        }
                        activeOpacity={0.85}
                        onPress={onDecline}
                    >
                        <Text
                            style={
                                styles.declineButtonText
                            }
                        >
                            {t.decline}
                        </Text>
                    </TouchableOpacity>
                </>
            )}


            {isLastMinute && (
                <View
                    style={
                        styles.confirmationButtons
                    }
                >
                    <TouchableOpacity
                        style={styles.yesButton}
                        activeOpacity={0.85}
                        onPress={onConfirm}
                    >
                        <Text
                            style={
                                styles.yesButtonText
                            }
                        >
                            {
                                t.accept
                                ?? t.yes
                            }
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.noButton}
                        activeOpacity={0.85}
                        onPress={onDecline}
                    >
                        <Text
                            style={
                                styles.noButtonText
                            }
                        >
                            {t.decline}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}
