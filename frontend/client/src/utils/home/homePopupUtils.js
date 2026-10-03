export function formatPopupDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(
        `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

export function formatPopupTime(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(
        "en-GB",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }
    );
}

export function createPopupAppointment(
    appointment
) {
    if (!appointment) {
        return null;
    }

    const service =
        appointment.service
        ?? {};

    const institution =
        appointment.institution
        ?? {};

    const appointmentTime =
        appointment.estimated_start_at
        ?? appointment.scheduled_at
        ?? null;

    return {
        id:
            appointment.queue_entry_id
            ?? appointment.id,

        visitId:
            appointment.id
            ?? null,

        queueEntryId:
            appointment.queue_entry_id
            ?? appointment.id
            ?? null,

        service:
            service.name
            ?? "",

        duration:
            service.standard_duration != null
                ? `${service.standard_duration} min`
                : appointment.standard_duration != null
                    ? `${appointment.standard_duration} min`
                    : "",

        date:
            formatPopupDate(
                appointment.queue_date
            ),

        time:
            formatPopupTime(
                appointmentTime
            ),

        institution: {
            id:
                institution.id
                ?? null,

            name:
                institution.name
                ?? "",

            address:
                institution.address
                ?? "",

            category:
                institution.category?.name
                ?? null,

            rating:
                institution.rating
                ?? null,

            image:
                institution.photo_url
                ?? null,

            photo_url:
                institution.photo_url
                ?? null,
        },
    };
}

export function formatTimeLeft(
    expiresAt,
    now
) {
    if (!expiresAt) {
        return null;
    }

    const expires =
        new Date(
            expiresAt
        ).getTime();

    if (Number.isNaN(expires)) {
        return null;
    }

    const seconds =
        Math.max(
            0,
            Math.ceil(
                (expires - now)
                / 1000
            )
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;

    return (
        `${minutes}:`
        + String(
            remainingSeconds
        ).padStart(2, "0")
    );
}