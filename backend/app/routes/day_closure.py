from uuid import UUID
from fastapi import APIRouter, Depends
from app.routes.users import get_db
from app.security import get_current_user
from app.access import require_institution
from app.day_closure import close_day

router = APIRouter(prefix="/api/institutions", tags=["Day closure"])


@router.post("/{institution_id}/close-day")
async def close_institution_day(institution_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        await require_institution(db, user, institution_id)
        row = await close_day(db, institution_id, user.id)
        return {"institution_id": row.institution_id, "day": row.day,
                "closed_at": row.closed_at.isoformat() + "Z", "closed_by": row.closed_by,
                "cancelled_count": row.cancelled_count}
