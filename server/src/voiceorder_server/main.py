from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from voiceorder_server.config import settings
from voiceorder_server.routers import appointments, auth, businesses, faq, providers


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="VoiceOrder AI",
    description="AI-powered phone assistant for restaurants, cafes, and clinics",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(businesses.router)
app.include_router(appointments.router)
app.include_router(providers.router)
app.include_router(faq.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy"}
