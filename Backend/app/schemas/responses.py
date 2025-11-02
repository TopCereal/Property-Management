from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class HealthCheck(BaseModel):
    """Health check response model"""
    status: str
    version: str
    database: str
    timestamp: datetime

class APIError(BaseModel):
    """Standard error response model"""
    error: str
    detail: Optional[str] = None
    path: Optional[str] = None
    timestamp: datetime = datetime.now()

class Metrics(BaseModel):
    """API metrics response model"""
    uptime: float
    database_latency_ms: float
    active_connections: int
    requests_per_minute: float
    status: Dict[str, Any]