# from fastapi import FastAPI
# from app.routes.users import router as test_router

# app = FastAPI()

# @app.get("/")
# async def root():
#     return {"message": "Backend is work"}

# app.include_router(test_router)

import asyncio
import os
from contextlib import asynccontextmanager, suppress
from fastapi import FastAPI
from app.routes.users import router as auth_router, users_router
from app.routes.catalog import router as catalog_router
from app.routes.queue import router as queue_router
from app.routes.visit import router as visit_router
from app.routes.employees import router as employees_router
from app.routes.slots import router as slots_router
from app.routes.extras import router as extras_router
from app.routes.notifications import router as notifications_router
from app.routes.realtime import router as realtime_router
from app.routes.push import router as push_router
from app.routes.offers import router as offers_router
from app.routes.day_closure import router as day_closure_router
from app.routes.calendar import router as calendar_router
from app.routes.administration import router as administration_router
# Cykl życia API uruchamia opcjonalne timery i anuluje je przy zamknięciu procesu.
@asynccontextmanager
async def lifespan(app):
    task = None
    if os.getenv("QUEUE_TIMERS_ENABLED") == "1":
        from app.timer_worker import run
        task = asyncio.create_task(run())
    try:
        yield
    finally:
        if task is not None:
            task.cancel()
            with suppress(asyncio.CancelledError):
                await task


app = FastAPI(lifespan=lifespan)



@app.get("/")
async def root():
    return {"message": "Backend is work"}


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(catalog_router)
app.include_router(queue_router)
app.include_router(visit_router)
app.include_router(employees_router)
app.include_router(slots_router)
app.include_router(extras_router)
# Wydzielone trasy zastępują obsługę powiadomień i WebSocket z extras.py.
app.include_router(push_router)
app.include_router(notifications_router)
app.include_router(realtime_router)
app.include_router(offers_router)
# Nowe trasy udostępniają zamknięcie dnia, grafik i administrację bez duplikowania istniejących tras.
app.include_router(day_closure_router)
app.include_router(calendar_router)
app.include_router(administration_router)
