export function formatPopupDate(value, locale = "en-GB") {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatPopupTime(value, locale = "en-GB") {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function createPopupAppointment(
    appointment,
    locale = "en-GB",
    minLabel = "min"
) {
    if (!appointment) return null;

    const service = appointment.service ?? {};
    const institution = appointment.institution ?? {};

    const appointmentTime =
        appointment.estimated_start_at ??
        appointment.scheduled_at ??
        null;

    const durationValue =
        service.standard_duration ??
        appointment.standard_duration ??
        null;

    return {
        id: appointment.queue_entry_id ?? appointment.id,

        visitId: appointment.id ?? null,

        queueEntryId:
            appointment.queue_entry_id ??
            appointment.id ??
            null,

        service: service.name ?? "",

        duration:
            durationValue != null
                ? `${durationValue} ${minLabel}`
                : "",

        date: formatPopupDate(
            appointment.queue_date,
            locale
        ),

        time: formatPopupTime(
            appointmentTime,
            locale
        ),

        institution: {
            id: institution.id ?? null,
            name: institution.name ?? "",
            address: institution.address ?? "",

            category:
                institution.category?.key ??
                institution.category?.name ??
                institution.category_name ??
                null,

            rating: institution.rating ?? null,

            image:
                institution.photo_url ??
                null,

            photo_url:
                institution.photo_url ??
                null,
        },
    };
}

export function formatTimeLeft(expiresAt, now) {
    if (!expiresAt) return null;

    const expires = new Date(expiresAt).getTime();
    if (Number.isNaN(expires)) return null;

    const seconds = Math.max(
        0,
        Math.ceil((expires - now) / 1000)
    );

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}