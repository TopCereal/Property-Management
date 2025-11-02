from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from sqlalchemy import text
from .database import get_db
from sqlalchemy.orm import Session

# Import routers
from .routers import properties as properties_router
from .routers import tenants as tenants_router

app = FastAPI(title="Property Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers here
app.include_router(properties_router.router)
app.include_router(tenants_router.router)

@app.get("/")
async def root():
    return {"message": "Property Management API"}


@app.get('/debug/db')
def debug_db(db: Session = Depends(get_db)):
    try:
        res = db.execute(text("SELECT 1")).scalar()
        return {"ok": True, "result": res}
    except Exception:
        import traceback
        tb = traceback.format_exc()
        return {"ok": False, "error": tb}