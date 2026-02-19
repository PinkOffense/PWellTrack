import asyncio
import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, pets, feeding, water, vaccines, medications, events, symptoms, notifications, weight

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("pwelltrack")

limiter = Limiter(key_func=get_remote_address)


# --- Allowed origins for CORS ---
_ALLOWED_ORIGINS = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
_ALLOW_ALL = "*" in _ALLOWED_ORIGINS

if _ALLOW_ALL:
    logger.warning(
        "CORS_ORIGINS is set to '*'. This allows any website to make "
        "authenticated requests. Set explicit origins in production."
    )


def _get_cors_origin(request: Request) -> str | None:
    """Return the origin to reflect in CORS headers, or None if not allowed."""
    origin = request.headers.get("origin")
    if not origin:
        return None
    if _ALLOW_ALL:
        return origin  # reflect the actual origin (never send literal "*")
    if origin in _ALLOWED_ORIGINS:
        return origin
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PWellTrack API")
    # Create tables on startup (for local dev with SQLite)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Start background reminder loop
    task = asyncio.create_task(notifications.reminder_loop())
    logger.info("Background reminder loop started")
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    logger.info("PWellTrack API shutting down")


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# --- Request logging middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s %d (%.0fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


# --- Global exception handler ---
# NOTE: Do NOT add CORS headers here — CORSMiddleware handles them.
# Adding them here causes duplicate headers that browsers reject.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


class CORSSafetyMiddleware(BaseHTTPMiddleware):
    """Outermost middleware: catches any exception that escapes CORSMiddleware
    and ensures the response always carries CORS headers."""

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("Exception escaped middleware stack on %s %s", request.method, request.url.path)
            response = JSONResponse(status_code=500, content={"detail": "Internal server error"})

        # Ensure CORS headers exist — if CORSMiddleware didn't set them (e.g. on
        # uncaught exceptions), set them here.
        if "access-control-allow-origin" not in response.headers:
            origin = _get_cors_origin(request)
            if origin:
                response.headers["access-control-allow-origin"] = origin
                response.headers["access-control-allow-credentials"] = "true"
        return response


# Middleware order matters — outermost first:
# 1. CORSSafetyMiddleware (catches everything, ensures CORS on errors)
# 2. CORSMiddleware (standard CORS handling for normal requests)
# 3. log_requests (request logging)
# 4. FastAPI ExceptionMiddleware + route handlers
app.add_middleware(CORSSafetyMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(feeding.router)
app.include_router(water.router)
app.include_router(vaccines.router)
app.include_router(medications.router)
app.include_router(events.router)
app.include_router(symptoms.router)
app.include_router(notifications.router)
app.include_router(weight.router)


@app.get("/")
async def root():
    return {"message": "PWellTrack API is running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
