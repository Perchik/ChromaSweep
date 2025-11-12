# 🎨 Color Mines — Web Scaffold (Vue + FastAPI)

This repo contains:
- **frontend/**: Vue 3 + TypeScript (Vite). Renders board, palette, worker-based hints (scaffolded).
- **server/**: FastAPI endpoints. `/api/board` serves a static board; `/api/hint` echoes back (stub).

## Quick Start

### Backend
```bash
cd server
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm i
npm run dev
```

Optionally point the frontend at the backend:
Create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

The frontend falls back to `public/boards/board_001.json` if `VITE_API_URL` is not set.

## Structure
```
frontend/  # Vue app
server/    # FastAPI app
```

## Notes
- Boards use **symbolic colors** (`"a","b","c","d"`) and the UI maps them via `src/core/palettes.ts`.
- The browser solver is conservative (deterministic propagation only; scaffolded).
- Add deep hints in FastAPI later by implementing your Python solver.
