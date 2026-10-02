"""Przynależność do instytucji musi być jawna; sama rola admin nie daje globalnego dostępu."""
from fastapi import HTTPException
from sqlalchemy import select

from app.models.employees import Employee


def require_self(user, user_id):
    if user.id != user_id:
        raise HTTPException(403, "You cannot act as another user")


async def require_institution(db, user, institution_id):
    if user.role not in ("employee", "admin"):
        raise HTTPException(403, "Staff access required")
    membership = await db.scalar(select(Employee.id).where(
        Employee.user_id == user.id,
        Employee.institution_id == institution_id,
        Employee.employee_status == "active",
    ).limit(1))
    if membership is None:
        raise HTTPException(403, "No active membership in this institution")


async def require_employee(db, user, employee_id):
    employee = await db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(404, "Employee not found")
    if user.role not in ("employee", "admin") or employee.user_id != user.id:
        raise HTTPException(403, "You cannot act as another employee")
    if employee.employee_status != "active":
        raise HTTPException(403, "Employee is inactive")
    return employee


async def require_admin(db, user, institution_id):
    # Administrator zarządza wyłącznie instytucją, do której aktywnie należy.
    if user.role != "admin":
        raise HTTPException(403, "Institution administrator required")
    await require_institution(db, user, institution_id)
