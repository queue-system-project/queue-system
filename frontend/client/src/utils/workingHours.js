const DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
];

export function buildWorkingHours(workingHours) {
    const hoursByDay = new Map(
        workingHours.map(item => [item.day_of_week, item])
    );

    return DAYS.map((day, index) => {
        const workingHour = hoursByDay.get(index);

        if (!workingHour) {
            return { day, closed: true };
        }

        return {
            day,
            from: workingHour.start_time,
            to: workingHour.end_time,
            closed: false,
        };
    });
}
