import asyncio
import os

from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.users import (
    router as auth_router,
    users_router,
)
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


@asynccontextmanager
async def lifespan(app: FastAPI):
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


app = FastAPI(
    lifespan=lifespan,
)

import traceback

from fastapi import Request
from fastapi.responses import JSONResponse


@app.middleware("http")
async def debug_exceptions(
    request: Request,
    call_next,
):
    try:
        return await call_next(request)

    except Exception as error:
        print("\n==============================")
        print("BACKEND ERROR")
        print("METHOD:", request.method)
        print("PATH:", request.url.path)
        print(
            "TYPE:",
            type(error).__name__,
        )
        print(
            "ERROR:",
            str(error),
        )

        traceback.print_exc()

        print("==============================\n")

        return JSONResponse(
            status_code=500,
            content={
                "detail": (
                    f"{type(error).__name__}: "
                    f"{str(error)}"
                )
            },
        )


app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Backend is work"
    }


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(catalog_router)
app.include_router(queue_router)
app.include_router(visit_router)
app.include_router(employees_router)
app.include_router(slots_router)
app.include_router(extras_router)

app.include_router(push_router)
app.include_router(notifications_router)
app.include_router(realtime_router)
app.include_router(offers_router)

app.include_router(day_closure_router)
app.include_router(calendar_router)
app.include_router(administration_router)