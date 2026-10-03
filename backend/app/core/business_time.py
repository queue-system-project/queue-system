"""Dzień i grafik instytucji w Warszawie; znaczniki bazy pozostają w UTC."""
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

ZONE_NAME = "Europe/Warsaw"
ZONE = ZoneInfo(ZONE_NAME)


def business_date(value=None):
    value = value or datetime.utcnow()
    aware = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value
    return aware.astimezone(ZONE).date()


def local_boundary(day, clock=time.min, *, closing=False):
    local = datetime.combine(day, clock)
    # Nieistniejącą godzinę wiosną przytnij do końca luki. Jesienią obejmij
    # oba wystąpienia godziny: wcześniejsze otwarcie, późniejsze zamknięcie.
    for _ in range(181):
        candidates = []
        for fold in (0, 1):
            utc = local.replace(tzinfo=ZONE, fold=fold).astimezone(timezone.utc)
            if utc.astimezone(ZONE).replace(tzinfo=None) == local:
                candidates.append(utc.replace(tzinfo=None))
        if candidates:
            return max(candidates) if closing else min(candidates)
        local = local.replace(second=0, microsecond=0) + timedelta(minutes=1)
    raise ValueError("Invalid local time boundary")


def day_bounds(day):
    return local_boundary(day), local_boundary(day + timedelta(days=1))
