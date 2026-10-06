import { useCallback, useEffect, useRef, useState } from "react";

import { authorizedRequest } from "../../api/authorizedRequest";
import { getUserId } from "../../api/auth/tokenStorage";
import { createPopupAppointment } from "../../utils/home/homePopupUtils";

import {useLanguage} from "../../context/LanguageContext";

export default function useQueueAction() {
    const { t } = useLanguage();

    const [queueAction, setQueueAction] = useState(null);
    const [currentTime, setCurrentTime] = useState(Date.now());

    const dismissedLastMinuteIds = useRef(new Set());
    const loadingQueueAction = useRef(false);

    const loadQueueAction = useCallback(async () => {
        if (loadingQueueAction.current) return;

        loadingQueueAction.current = true;

        try {
            const userId = await getUserId();

            if (!userId) {
                setQueueAction(null);
                return;
            }

            const [appointmentsData, queueData, offersData] = await Promise.all([
                authorizedRequest("/api/visit/appointments", "GET"),
                authorizedRequest(`/api/queue/status/${userId}`, "GET"),
                authorizedRequest("/api/offers", "GET"),
            ]);

            const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
            const queueEntries = Array.isArray(queueData) ? queueData : [];
            const urgentOffers = Array.isArray(offersData?.urgent) ? offersData.urgent : [];
            const lastMinuteOffers = Array.isArray(offersData?.last_minute)
                ? offersData.last_minute
                : [];

            const now = Date.now();

            // URGENT
            const urgentOffer = urgentOffers
                .filter(offer => {
                    const expiresAt = new Date(offer.expires_at).getTime();

                    return !Number.isNaN(expiresAt) && expiresAt > now;
                })
                .sort(
                    (a, b) =>
                        new Date(a.expires_at).getTime() -
                        new Date(b.expires_at).getTime()
                )[0];

            if (urgentOffer) {
                const appointment = appointments.find(
                    item =>
                        String(item.queue_entry_id ?? item.id) ===
                        String(urgentOffer.queue_entry_id)
                );

                console.log("URGENT MATCHED APPOINTMENT:", appointment);

                if (appointment) {
                    setQueueAction({
                        type: "urgent",
                        offerId: urgentOffer.id,
                        windowId: urgentOffer.window_id,
                        queueEntryId: urgentOffer.queue_entry_id,
                        serviceId: urgentOffer.service_id,
                        options: Array.isArray(urgentOffer.options)
                            ? urgentOffer.options
                            : [],
                        expiresAt: urgentOffer.expires_at,
                        appointment: createPopupAppointment(appointment, t.locale, t.min),
                    });

                    return;
                }
            }

            // CONFIRMATION
            const confirmation = queueEntries
                .filter(entry => {
                    const expiresAt = entry.confirmation_expires_at
                        ? new Date(entry.confirmation_expires_at).getTime()
                        : NaN;

                    return (
                        entry.status === "waiting" &&
                        entry.confirmation_sent_at &&
                        entry.confirmation_expires_at &&
                        !Number.isNaN(expiresAt) &&
                        expiresAt > now
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(a.confirmation_expires_at).getTime() -
                        new Date(b.confirmation_expires_at).getTime()
                )[0];

            if (confirmation) {
                const appointment = appointments.find(
                    item =>
                        String(item.queue_entry_id ?? item.id) ===
                        String(confirmation.id)
                );

                if (appointment) {
                    setQueueAction({
                        type: "confirmation",
                        userId,
                        queueEntryId: confirmation.id,
                        expiresAt: confirmation.confirmation_expires_at,
                        appointment: createPopupAppointment(appointment),
                    });

                    return;
                }
            }

            // LAST MINUTE
            const lastMinute = lastMinuteOffers
                .filter(offer => {
                    const expiresAt = new Date(offer.expires_at).getTime();

                    return (
                        !Number.isNaN(expiresAt) &&
                        expiresAt > now &&
                        !dismissedLastMinuteIds.current.has(String(offer.id))
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(a.expires_at).getTime() -
                        new Date(b.expires_at).getTime()
                )[0];

            if (lastMinute) {
                const appointment = appointments.find(
                    item =>
                        String(item.service_id) === String(lastMinute.service_id) &&
                        item.status === "waiting"
                );

                if (appointment) {
                    setQueueAction({
                        type: "lastMinute",
                        windowId: lastMinute.id,
                        serviceId: lastMinute.service_id,
                        queueEntryId: appointment.queue_entry_id ?? appointment.id,
                        expiresAt: lastMinute.expires_at,
                        appointment: createPopupAppointment(appointment),
                    });

                    return;
                }
            }

            setQueueAction(null);

        } catch (error) {
            console.error("QUEUE ACTION ERROR:", error);

        } finally {
            loadingQueueAction.current = false;
        }
    }, []);

    useEffect(() => {
        loadQueueAction();

        const interval = setInterval(loadQueueAction, 3000);
        return () => clearInterval(interval);
    }, [loadQueueAction]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!queueAction?.expiresAt) return;

        const expiresAt = new Date(queueAction.expiresAt).getTime();

        if (!Number.isNaN(expiresAt) && expiresAt <= currentTime) {
            setQueueAction(null);
            loadQueueAction();
        }
    }, [currentTime, queueAction?.expiresAt, loadQueueAction]);

    const confirmQueueAction = async () => {
        if (!queueAction) return;

        try {
            if (queueAction.type === "confirmation") {
                const userId = queueAction.userId ?? await getUserId();
                if (!userId) return;

                await authorizedRequest("/api/queue/confirm", "POST", {
                    user_id: userId,
                    queue_entry_id: queueAction.queueEntryId,
                });
            }

            if (queueAction.type === "lastMinute") {
                await authorizedRequest(
                    `/api/offers/last-minute/${queueAction.windowId}/accept`,
                    "POST"
                );
            }

            setQueueAction(null);
            await loadQueueAction();

        } catch (error) {
            console.error("CONFIRM QUEUE ACTION ERROR:", error);
            await loadQueueAction();
        }
    };

    const declineQueueAction = async () => {
        if (!queueAction) return;

        try {
            if (queueAction.type === "confirmation") {
                const userId = queueAction.userId ?? await getUserId();
                if (!userId) return;

                await authorizedRequest("/api/queue/cancel", "POST", {
                    user_id: userId,
                    queue_entry_id: queueAction.queueEntryId,
                });
            }

            if (queueAction.type === "urgent") {
                await authorizedRequest(
                    `/api/offers/urgent/${queueAction.offerId}/respond`,
                    "POST",
                    {
                        accept: false,
                        minutes: 0,
                    }
                );
            }

            if (queueAction.type === "lastMinute") {
                dismissedLastMinuteIds.current.add(
                    String(queueAction.windowId)
                );
            }

            setQueueAction(null);
            await loadQueueAction();

        } catch (error) {
            console.error("DECLINE QUEUE ACTION ERROR:", error);
            await loadQueueAction();
        }
    };

    const selectUrgentTime = async minutes => {
        if (
            !queueAction ||
            queueAction.type !== "urgent" ||
            !queueAction.options?.includes(minutes)
        ) {
            return;
        }

        try {
            await authorizedRequest(
                `/api/offers/urgent/${queueAction.offerId}/respond`,
                "POST",
                {
                    accept: true,
                    minutes,
                }
            );

            setQueueAction(null);
            await loadQueueAction();

        } catch (error) {
            console.error("URGENT OFFER ERROR:", error);
            await loadQueueAction();
        }
    };

    return {
        queueAction,
        currentTime,
        confirmQueueAction,
        declineQueueAction,
        selectUrgentTime,
        reloadQueueAction: loadQueueAction,
    };
}