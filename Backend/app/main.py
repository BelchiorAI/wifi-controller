from fastapi import FastAPI
from .database import init_db
from .routers import venues, access_points, sessions, sync

# Initialize database tables
init_db()

from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Wi-Fi Controller API")

frontend_urls_env = os.getenv("FRONTEND_URLS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [url.strip() for url in frontend_urls_env.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(venues.router)
app.include_router(access_points.router)
app.include_router(sessions.router)
app.include_router(sync.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Wi-Fi Controller API. Use /docs to explore the endpoints."}
