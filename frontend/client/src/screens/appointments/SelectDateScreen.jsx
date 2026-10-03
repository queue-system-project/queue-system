import React, { useEffect, useMemo, useRef, useState } from "react";
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

import { selectDateStyles as styles } from "../../styles/appointments/selectDateStyle";
import { useLanguage } from "../../context/LanguageContext";
import { useMessage } from "../../context/MessageContext";
import { authorizedRequest } from "../../api/authorizedRequest";
import { getUserId } from "../../api/auth/tokenStorage";


const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];


function toDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(
        2,
        "0"
    )}-${String(day).padStart(2, "0")}`;
}


function isSameDay(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}


function formatEstimatedTime(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}


export default function SelectDateScreen({
                                             navigation,
                                             route,
                                         }) {
    const { t } = useLanguage();
    const { showMessage } = useMessage();

    const { service, institution } = route.params;
    const scrollViewRef = useRef(null);


    /* =========================
       EMPLOYEES
    ========================= */

    const [employees, setEmployees] = useState([
        {
            id: "no-preference",
            name: null,
            image: null,
        },
    ]);

    const [selectedEmployee, setSelectedEmployee] =
        useState("no-preference");


    /* =========================
       CALENDAR
    ========================= */

    const today = new Date();

    const [currentMonth, setCurrentMonth] = useState(
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        )
    );

    const [selectedDate, setSelectedDate] = useState(null);
    const [workingHours, setWorkingHours] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [monthAvailability, setMonthAvailability,] = useState([]);
    const [calendarEnabled, setCalendarEnabled] = useState(false);


    const [note, setNote] = useState("");
    const [joiningQueue, setJoiningQueue] = useState(false);

    /* =========================
   WEEK DAYS
========================= */

    const weekDays = [
        t.monShort,
        t.tueShort,
        t.wedShort,
        t.thuShort,
        t.friShort,
        t.satShort,
        t.sunShort,
    ];


    /* =========================
       LOAD EMPLOYEES
    ========================= */

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await authorizedRequest(
                    `/api/institutions/${institution.id}/employees`,
                    "GET"
                );

                const serviceEmployees = Array.isArray(data)
                    ? data.filter(
                        (employee) =>
                            employee.employee_status ===
                            "active" &&
                            employee.service_ids?.some(
                                (serviceId) =>
                                    String(serviceId) ===
                                    String(service.id)
                            )
                    )
                    : [];

                const formattedEmployees =
                    serviceEmployees.map((employee) => ({
                        id: employee.id,

                        name: [
                            employee.first_name,
                            employee.last_name,
                        ]
                            .filter(Boolean)
                            .join(" "),

                        image: null,
                    }));

                setEmployees([
                    {
                        id: "no-preference",
                        name: null,
                        image: null,
                    },
                    ...formattedEmployees,
                ]);
            } catch (error) {
                console.error(
                    "EMPLOYEES ERROR:",
                    error
                );

                setEmployees([
                    {
                        id: "no-preference",
                        name: null,
                        image: null,
                    },
                ]);
            }
        };

        loadEmployees();
    }, [institution.id, service.id]);


    /* =========================
       LOAD WORKING HOURS
    ========================= */

    useEffect(() => {
        const loadWorkingHours = async () => {
            try {
                const data = await authorizedRequest(
                    `/api/institutions/${institution.id}/working-hours`,
                    "GET"
                );

                console.log(
                    "WORKING HOURS DATA:",
                    data
                );

                // Backend може повернути:
                // 1. масив working hours
                // 2. calendar object з intervals

                if (Array.isArray(data)) {
                    setWorkingHours(data);
                    setHolidays([]);
                    setCalendarEnabled(true);
                    return;
                }

                setWorkingHours(
                    Array.isArray(data?.intervals)
                        ? data.intervals
                        : []
                );

                setHolidays(
                    Array.isArray(data?.holidays)
                        ? data.holidays
                        : []
                );

                setCalendarEnabled(
                    data?.enabled === true
                );
            } catch (error) {
                console.error(
                    "WORKING HOURS ERROR:",
                    error
                );

                setWorkingHours([]);
                setHolidays([]);
                setCalendarEnabled(false);
            }
        };

        loadWorkingHours();
    }, [institution.id]);


    /* =========================
       EMPLOYEE
    ========================= */

    const selectedEmployeeData = employees.find(
        (employee) =>
            employee.id === selectedEmployee
    );


    /* =========================
       CALENDAR DATA
    ========================= */

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    useEffect(() => {
        const loadMonthAvailability =
            async () => {
                try {
                    const employeeParam =
                        selectedEmployee !== "no-preference"
                            ? `&employee_id=${selectedEmployee}`
                            : "";

                    const data = await authorizedRequest(
                        `/api/services/${service.id}/month-availability?year=${year}&month=${month + 1}${employeeParam}`,
                        "GET"
                    );

                    console.log(
                        "MONTH AVAILABILITY:",
                        data
                    );

                    setMonthAvailability(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "MONTH AVAILABILITY ERROR:",
                        error
                    );

                    setMonthAvailability([]);
                }
            };

        loadMonthAvailability();
    }, [
        service.id,
        year,
        month,
        selectedEmployee,
    ]);

    const numberOfDays = new Date(
        year,
        month + 1,
        0
    ).getDate();


    /*
        JS:
        Sunday = 0
        Monday = 1

        Our calendar:
        Monday = first column
    */

    const firstDayJS = new Date(
        year,
        month,
        1
    ).getDay();

    const emptyDays =
        firstDayJS === 0
            ? 6
            : firstDayJS - 1;


    const holidayDates = useMemo(
        () =>
            new Set(
                holidays.map(
                    (holiday) =>
                        holiday.holiday_date
                )
            ),
        [holidays]
    );




    const days = useMemo(() => {
        return Array.from(
            { length: numberOfDays },
            (_, index) => {
                const day = index + 1;

                const date = new Date(
                    year,
                    month,
                    day
                );

                // JS:
                // Sunday = 0
                // Monday = 1
                //
                // Backend:
                // Monday = 0
                // Sunday = 6

                const jsDay = date.getDay();

                const isWeekend =
                    jsDay === 0 || jsDay === 6;

                const backendDay =
                    jsDay === 0
                        ? 6
                        : jsDay - 1;

                const hasWorkingHours = workingHours.some(
                    (workingHour) =>
                        Number(workingHour.day_of_week) === backendDay
                );

                const dateKey = toDateKey(
                    year,
                    month,
                    day
                );

                const todayStart = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                );

                const isPast =
                    date < todayStart;

                const isHoliday =
                    holidayDates.has(dateKey);

                const availability =
                    monthAvailability.find(
                        (item) =>
                            item.date === dateKey
                    );

                const queue =
                    availability?.queue ?? 0;

                const spots =
                    availability?.spots ??
                    service.max_queue_length ??
                    0;

                const status =
                    availability?.status ?? "green";

                const isFull =
                    availability?.is_full === true;


                const disabled =
                    isPast ||
                    isHoliday ||
                    !hasWorkingHours ||
                    isFull;

                return {
                    day,
                    date,
                    dateKey,
                    disabled,
                    isWeekend,
                    isHoliday,
                    hasWorkingHours,
                    queue,
                    spots,
                    status,
                    isFull,
                    isToday: isSameDay(
                        date,
                        today
                    ),
                };
            }
        );
    }, [
        year,
        month,
        numberOfDays,
        workingHours,
        holidayDates,
        monthAvailability,
        service.max_queue_length,
    ]);


    /* =========================
       MONTH NAVIGATION
    ========================= */

    const goPreviousMonth = () => {
        const previous = new Date(
            year,
            month - 1,
            1
        );

        const currentMonthStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        if (previous < currentMonthStart) {
            return;
        }

        setCurrentMonth(previous);
        setSelectedDate(null);
    };


    const goNextMonth = () => {
        setCurrentMonth(
            new Date(
                year,
                month + 1,
                1
            )
        );

        setSelectedDate(null);
    };


    /* =========================
       DISPLAY MONTH
    ========================= */

    const monthLabel =
        `${MONTHS[month]} ${year}`;


    /* =========================
       SELECTED DATE LABEL
    ========================= */

    const selectedDateLabel = selectedDate
        ? `${selectedDate.getDate()} ${
            MONTHS[selectedDate.getMonth()]
        } ${selectedDate.getFullYear()}`
        : "";

    const selectedDateKey = selectedDate
        ? toDateKey(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
        )
        : null;

    const selectedAvailability = selectedDateKey
        ? monthAvailability.find(
            (item) => item.date === selectedDateKey
        )
        : null;

    const selectedEstimatedTime = formatEstimatedTime(
        selectedAvailability?.estimated_start_at
    );

    const getDayStatusStyle = (status) => {
        if (status === "yellow") {
            return styles.yellowStatus;
        }

        if (status === "red") {
            return styles.redStatus;
        }

        return styles.greenStatus;
    };


    /* =========================
       JOIN QUEUE
    ========================= */

    const handleJoinQueue = async () => {
        if (!selectedDate || joiningQueue) {
            return;
        }

        try {
            setJoiningQueue(true);

            const userId = await getUserId();

            if (!userId) {
                throw new Error("User is not logged in");
            }

            const queueDate = toDateKey(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
            );

            const queueEntry = await authorizedRequest(
                "/api/queue/join",
                "POST",
                {
                    user_id: userId,

                    service_id: service.id,

                    employee_id:
                        selectedEmployee === "no-preference"
                            ? null
                            : selectedEmployee,

                    queue_date: queueDate,

                    client_note:
                        note.trim()
                            ? note.trim()
                            : null,
                }
            );

            navigation.navigate("QueueSuccess", {
                queueEntry,
                service,
                institution,
            });
        } catch (error) {
            console.error(
                "JOIN QUEUE ERROR:",
                error
            );

            showMessage(
                error?.message ||
                "Could not join the queue",
                "error"
            );
        } finally {
            setJoiningQueue(false);
        }
    };

    return (
        <View style={styles.container}>
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

                <Text style={styles.headerTitle}>
                    {t.selectDateTitle}
                </Text>
            </View>


            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
            >
                {/* EMPLOYEES */}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.employees
                    }
                >
                    {employees.map(
                        (employee) => {
                            const selected =
                                selectedEmployee ===
                                employee.id;

                            return (
                                <TouchableOpacity
                                    key={
                                        employee.id
                                    }
                                    style={
                                        styles.employee
                                    }
                                    activeOpacity={
                                        0.8
                                    }
                                    onPress={() =>
                                        setSelectedEmployee(
                                            employee.id
                                        )
                                    }
                                >
                                    <View
                                        style={[
                                            styles.employeeAvatar,

                                            selected &&
                                            styles.employeeAvatarSelected,
                                        ]}
                                    >
                                        {employee.image ? (
                                            <Image
                                                source={{
                                                    uri: employee.image,
                                                }}
                                                style={
                                                    styles.employeeImage
                                                }
                                            />
                                        ) : (
                                            <Ionicons
                                                name="person-outline"
                                                size={
                                                    27
                                                }
                                                color="#111111"
                                            />
                                        )}

                                        {selected && (
                                            <View
                                                style={
                                                    styles.selectedEmployeeBadge
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark"
                                                    size={
                                                        10
                                                    }
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                        )}
                                    </View>

                                    <Text
                                        style={
                                            styles.employeeName
                                        }
                                        numberOfLines={
                                            1
                                        }
                                    >
                                        {employee.id ===
                                        "no-preference"
                                            ? t.noPreference
                                            : employee.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }
                    )}
                </ScrollView>


                {/* CALENDAR HEADER */}

                <View
                    style={
                        styles.calendarHeader
                    }
                >
                    <Text
                        style={styles.month}
                    >
                        {monthLabel}
                    </Text>

                    <View
                        style={
                            styles.monthButtons
                        }
                    >
                        <TouchableOpacity
                            style={
                                styles.monthButton
                            }
                            activeOpacity={0.8}
                            onPress={
                                goPreviousMonth
                            }
                        >
                            <Ionicons
                                name="chevron-back"
                                size={22}
                                color="#111111"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={
                                styles.monthButton
                            }
                            activeOpacity={0.8}
                            onPress={
                                goNextMonth
                            }
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={22}
                                color="#111111"
                            />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* WEEK DAYS */}

                <View style={styles.weekRow}>
                    {weekDays.map((day) => (
                        <Text
                            key={day}
                            style={
                                styles.weekDay
                            }
                        >
                            {day}
                        </Text>
                    ))}
                </View>


                {/* CALENDAR */}

                <View
                    style={styles.calendar}
                >
                    {Array.from({
                        length: emptyDays,
                    }).map((_, index) => (
                        <View
                            key={`empty-${index}`}
                            style={
                                styles.dayContainer
                            }
                        />
                    ))}


                    {days.map((item) => {
                        const selected =
                            selectedDate &&
                            isSameDay(
                                selectedDate,
                                item.date
                            );

                        return (
                            <View
                                key={item.dateKey}
                                style={styles.dayContainer}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.dayButton,

                                        item.disabled &&
                                        !item.isWeekend
                                            ? styles.disabledDayButton
                                            : null,

                                        item.disabled &&
                                        item.isWeekend
                                            ? styles.weekendDayButton
                                            : null,

                                        !item.disabled &&
                                        !selected
                                            ? styles.availableDayButton
                                            : null,

                                        selected &&
                                        styles.selectedDayButton,
                                    ]}
                                    disabled={item.disabled}
                                    activeOpacity={0.8}
                                    onPress={() =>
                                        setSelectedDate(
                                            item.date
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.dayText,

                                            item.disabled &&
                                            !item.isWeekend &&
                                            styles.disabledDayText,

                                            item.disabled &&
                                            item.isWeekend &&
                                            styles.weekendDayText,

                                            selected &&
                                            styles.selectedDayText,
                                        ]}
                                    >
                                        {item.day}
                                    </Text>

                                    {!item.disabled && !selected && (
                                        <View
                                            style={[
                                                styles.statusLine,
                                                getDayStatusStyle(
                                                    item.status
                                                )
                                            ]}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>



                {/* SERVICE */}

                <View
                    style={
                        styles.serviceCard
                    }
                >
                    <Text
                        style={
                            styles.serviceName
                        }
                    >
                        {service.name}
                    </Text>


                    <View
                        style={
                            styles.serviceMeta
                        }
                    >
                        <Text
                            style={
                                styles.duration
                            }
                        >
                            {service.duration}
                        </Text>

                        <Text
                            style={styles.date}
                        >
                            {selectedDate
                                ? selectedDateLabel
                                : "Select date"}
                        </Text>
                    </View>


                    <View
                        style={
                            styles.serviceBadges
                        }
                    >
                        {selectedEstimatedTime && (
                            <View
                                style={
                                    styles.queueBadge
                                }
                            >
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={14}
                                    color="#555555"
                                />

                                <Text
                                    style={
                                        styles.queueText
                                    }
                                >
                                    {selectedEstimatedTime}{" "}
                                    {t.estimatedTime}
                                </Text>
                            </View>
                        )}

                        <View
                            style={
                                styles.spotsBadge
                            }
                        >
                            <Text
                                style={
                                    styles.spotsText
                                }
                            >
                                {service.spots}{" "}
                                {t.spotsRemaining}
                            </Text>
                        </View>


                        <View
                            style={
                                styles.queueBadge
                            }
                        >
                            <MaterialCommunityIcons
                                name="account-group-outline"
                                size={14}
                                color="#555555"
                            />

                            <Text
                                style={
                                    styles.queueText
                                }
                            >
                                {service.queue}{" "}
                                {t.queue}
                            </Text>
                        </View>


                        {Number(service.delay) >
                            0 && (
                                <View
                                    style={
                                        styles.queueBadge
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="timer-outline"
                                        size={14}
                                        color="#555555"
                                    />

                                    <Text
                                        style={
                                            styles.queueText
                                        }
                                    >
                                        +{" "}
                                        {
                                            service.delay
                                        }{" "}
                                        {t.min}
                                    </Text>
                                </View>
                            )}
                    </View>


                    <View
                        style={styles.divider}
                    />


                    <View
                        style={
                            styles.selectedEmployee
                        }
                    >
                        <View
                            style={
                                styles.selectedEmployeeLeft
                            }
                        >
                            <View
                                style={
                                    styles.smallAvatar
                                }
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={21}
                                    color="#111111"
                                />
                            </View>

                            <Text
                                style={
                                    styles.selectedEmployeeName
                                }
                            >
                                {selectedEmployee ===
                                "no-preference"
                                    ? t.noPreference
                                    : selectedEmployeeData?.name}
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                scrollViewRef.current?.scrollTo({
                                    y: 0,
                                    animated: true,
                                });
                            }}
                        >
                            <Text style={styles.changeText}>
                                {t.change}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/* NOTES */}

                <Text
                    style={
                        styles.notesTitle
                    }
                >
                    {t.visitNotesQuestion}
                </Text>

                <TextInput
                    style={
                        styles.notesInput
                    }
                    value={note}
                    onChangeText={setNote}
                    placeholder={
                        t.yourNote
                    }
                    placeholderTextColor="#999999"
                    multiline
                    textAlignVertical="top"
                />


                {/* CONTINUE */}

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!selectedDate || joiningQueue) && {
                            opacity: 0.5,
                        },
                    ]}
                    disabled={!selectedDate || joiningQueue}
                    activeOpacity={0.85}
                    onPress={handleJoinQueue}
                >
                    <Text
                        style={
                            styles.continueButtonText
                        }
                    >
                        {t.continue}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
