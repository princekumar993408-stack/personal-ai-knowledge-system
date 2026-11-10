"""
FastAPI Application Entrypoint for CortexPKM
Author: Prince Kumar (B.Tech CSE IoT, Jain University)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.db import init_db
from app.routers import knowledge

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Local-first Personal AI Knowledge Management Platform with semantic vector search, dynamic knowledge graph extraction, and cited conversational Q&A.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Router
app.include_router(knowledge.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Personal AI Knowledge Management Platform",
        "version": settings.VERSION,
        "database": "sqlite_connected"
    }

@app.get("/")
def root():
    return {
        "message": "Personal AI Knowledge Management System (CortexPKM) API",
        "author": "Prince Kumar (princekumar993408-stack)",
        "affiliation": "B.Tech CSE (IoT), Jain University",
        "docs": "/docs",
        "health": "/health"
    }
