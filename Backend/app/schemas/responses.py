from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class HealthCheck(BaseModel):
    """Health check response model"""
    status: str
    version: str
    database: str
    timestamp: datetime

    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "database": "connected (latency: 5.2ms)",
                "timestamp": "2025-11-02T12:00:00Z"
            }
        }

class APIError(BaseModel):
    """Standard error response model"""
    error: str
    detail: Optional[str] = None
    path: Optional[str] = None
    timestamp: datetime = datetime.now()

    class Config:
        schema_extra = {
            "example": {
                "error": "Service unavailable",
                "detail": "Database connection error",
                "path": "/health",
                "timestamp": "2025-11-02T12:00:05Z"
            }
        }

class Metrics(BaseModel):
    """API metrics response model"""
    uptime: float
    database_latency_ms: float
    active_connections: int
    requests_per_minute: float
    status: Dict[str, Any]

    class Config:
        schema_extra = {
            "example": {
                "uptime": 3600.5,
                "database_latency_ms": 4.8,
                "active_connections": 3,
                "requests_per_minute": 12.5,
                "status": {
                    "process_id": 12345,
                    "thread_count": 8,
                    "pool_size": 5
                }
            }
        }