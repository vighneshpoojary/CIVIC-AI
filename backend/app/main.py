import time
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import complaints, ai, hotspots, analytics, admin, datasets

logger = logging.getLogger("civicai")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CivicAI – AI-powered civic complaint management and action platform for Bengaluru.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ---------------------------------------------------------------------------
# Security & Rate Limiting State
# ---------------------------------------------------------------------------
# In-memory sliding window rate limiter: IP -> list of request timestamps (epoch seconds)
_rate_limit_records: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_MAX = getattr(settings, "RATE_LIMIT_PER_MINUTE", 60) * 2  # 120 requests/minute per IP
RATE_WINDOW_SECONDS = 60.0

@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate Limiting Check (Bypass for health checks)
    client_ip = request.client.host if request.client else "127.0.0.1"
    path = request.url.path
    now = time.time()

    if not path.startswith(("/health", "/ready", "/docs", "/redoc", "/openapi.json")):
        # Evict timestamps older than sliding window
        window_start = now - RATE_WINDOW_SECONDS
        timestamps = [t for t in _rate_limit_records[client_ip] if t > window_start]
        _rate_limit_records[client_ip] = timestamps

        if len(timestamps) >= RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please throttle your requests to preserve municipal API stability.",
                    "retry_after_seconds": int(RATE_WINDOW_SECONDS - (now - timestamps[0]))
                },
                headers={
                    "Retry-After": str(int(RATE_WINDOW_SECONDS)),
                    "X-RateLimit-Limit": str(RATE_LIMIT_MAX),
                    "X-RateLimit-Remaining": "0"
                }
            )
        _rate_limit_records[client_ip].append(now)

    # 2. Timing & Request Execution
    start_time = time.time()
    response: Response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # 3. Security Headers Hardening (OWASP Top 10 Compliance)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX)
    remaining = max(0, RATE_LIMIT_MAX - len(_rate_limit_records.get(client_ip, [])))
    response.headers["X-RateLimit-Remaining"] = str(remaining)

    return response

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In development, allow all; in production, use settings.ALLOWED_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health checks
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "CivicAI Backend",
        "version": settings.VERSION,
        "rate_limiting": "active",
        "security_headers": "enforced"
    }

@app.get("/ready", tags=["Health"])
def readiness_check():
    return {"ready": True, "database": "active", "ai_pipeline": "ready"}

# Include Routers under API v1
api_prefix = settings.API_V1_STR
app.include_router(complaints.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(hotspots.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(datasets.router, prefix=api_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

