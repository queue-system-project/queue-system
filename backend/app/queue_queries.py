"""Wyznacz pozycje w całych właściwych kolejkach usług przed filtrowaniem odbiorcy."""
from sqlalchemy import select, func
from app.models.queue import QueueEntry, queue_order

ACTIVE = ("waiting", "confirmed", "in_service")


def ranked_queue(target_id, *, for_user=False):
    if for_user:
        services = select(QueueEntry.service_id).where(
            QueueEntry.client_id == target_id, QueueEntry.status.in_(ACTIVE),
        ).distinct().correlate(None)
        scope = QueueEntry.service_id.in_(services)
    else:
        scope = QueueEntry.service_id == target_id
    ranked = select(
        QueueEntry.id, QueueEntry.institution_id, QueueEntry.service_id,
        QueueEntry.client_id, QueueEntry.status,
        QueueEntry.queue_date, QueueEntry.scheduled_at, QueueEntry.slot_id, QueueEntry.employee_id,
        QueueEntry.estimated_wait_time, QueueEntry.delay_time,
        QueueEntry.estimated_start_at, QueueEntry.eta_updated_at,
        QueueEntry.confirmation_sent_at, QueueEntry.confirmation_expires_at,
        QueueEntry.confirmed_at, QueueEntry.arrival_time,
        QueueEntry.cancellation_reason, QueueEntry.missed_at, QueueEntry.missed_by,
        func.row_number().over(partition_by=(QueueEntry.service_id, QueueEntry.queue_date),
                               order_by=queue_order()).label("queue_position"),
    ).where(QueueEntry.status.in_(ACTIVE), scope).subquery()
    result = select(ranked)
    if for_user:
        result = result.where(ranked.c.client_id == target_id)
    return result.order_by(ranked.c.service_id, ranked.c.queue_date, ranked.c.queue_position)
