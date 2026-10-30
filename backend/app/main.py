from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import complaints, ai, hotspots, analytics, admin, datasets

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CivicAI – AI-powered civic complaint management and action platform for Bengaluru.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all; in production, use settings.ALLOWED_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health checks
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "CivicAI Backend", "version": settings.VERSION}

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
