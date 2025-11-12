from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import json
from .models import BoardFile, HintRequest, HintResponse

app = FastAPI(title="Color Mines API")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

DATA = Path(__file__).parent / "data" / "boards" / "board_001.json"

@app.get("/api/board", response_model=BoardFile)
async def get_board():
    with DATA.open("r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload

@app.post("/api/hint", response_model=HintResponse)
async def hint(req: HintRequest):
    # TODO: call Python solver (Normal/Hard/Expert). For now, echo state.
    return HintResponse(changed=False, state=req.state)

@app.get("/healthz")
async def healthz():
    return {"ok": True}
