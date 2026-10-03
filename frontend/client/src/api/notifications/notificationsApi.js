import {
    authorizedRequest,
} from "../authorizedRequest";


export async function getNotifications() {
    return await authorizedRequest(
        "/api/notifications",
        "GET"
    );
}


export async function markNotificationRead(
    notificationId
) {
    return await authorizedRequest(
        `/api/notifications/${notificationId}/read`,
        "PATCH"
    );
}


export function mapNotification(
    notification
) {
    let type = "generic";

    const eventKey =
        notification.event_key
        ?? "";

    if (
        eventKey.startsWith(
            "confirmation:"
        )
    ) {
        type = "confirm";
    }

    else if (
        eventKey.startsWith(
            "urgent:"
        )
    ) {
        type = "available";
    }

    else if (
        eventKey.startsWith(
            "last-minute:"
        )
        ||
        eventKey.startsWith(
            "last_minute:"
        )
    ) {
        type = "lastChance";
    }

    else if (
        eventKey.startsWith(
            "queue:"
        )
    ) {
        const status =
            eventKey
                .split(":")
                .at(-1);

        const typeMap = {
            waiting: "waiting",
            confirmed: "confirmed",
            in_service: "turn",
            done: "completed",
            cancelled: "cancelled",
            skipped: "skipped",
            missed: "missed",
        };

        type =
            typeMap[status]
            ?? "generic";
    }

    const createdAt =
        notification.created_at
            ? new Date(
                notification.created_at
            )
            : null;

    return {
        ...notification,

        type,

        read:
            Boolean(
                notification.is_read
            ),

        text:
            notification.message
            ?? "",

        details:
            notification.message
            ?? "",

        time:
            createdAt
                ? createdAt
                    .toLocaleTimeString(
                        [],
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )
                : "",

        date:
            createdAt
                ? createdAt
                    .toLocaleDateString()
                : "",

        createdDate:
        createdAt,
    };
}