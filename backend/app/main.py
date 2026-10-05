# from fastapi import FastAPI
# from app.routes.users import router as test_router

# app = FastAPI()

# @app.get("/")
# async def root():
#     return {"message": "Backend is work"}

# app.include_router(test_router)

from fastapi import FastAPI
from app.routes.users import router as auth_router, users_router
from app.routes.catalog import router as catalog_router
from app.routes.queue import router as queue_router
from app.routes.visit import router as visit_router
from app.routes.employees import router as employees_router
from app.routes.slots import router as slots_router
from app.routes.extras import router as extras_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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