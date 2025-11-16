#!/usr/bin/env python3
"""
generator.py — deterministic puzzle generator built on solver.py

Usage:
  python generator.py --rows 6 --cols 6 --palette R G B --smooth 0.45 --seed 123 --log

Output:
  - boards/board_001.json (contains colors, clues, initial, meta)
  - logs/board_001_solver.txt / .json
"""

from __future__ import annotations
import argparse
import json
import random
import sys
import hashlib
from pathlib import Path
from typing import List, Tuple, Iterable, Sequence, Optional
from datetime import datetime, timezone

from ..common.data import PROJECT_ROOT
from .solver import SolverLogger, SolveResult, deterministic_solve

Color = str
Coord = Tuple[int, int]

# ---------- helpers ----------


def ensure_dirs():
    (PROJECT_ROOT / "boards").mkdir(exist_ok=True)
    (PROJECT_ROOT / "logs").mkdir(exist_ok=True)


def neighbors8(r: int, c: int, R: int, C: int):
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            rr, cc = r + dr, c + dc
            if 0 <= rr < R and 0 <= cc < C:
                yield rr, cc


def compute_clues(colors: List[List[Color]]) -> List[List[int]]:
    R, C = len(colors), len(colors[0])
    clues = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            col = colors[r][c]
            clues[r][c] = sum(1 for rr, cc in neighbors8(
                r, c, R, C) if colors[rr][cc] == col)
    return clues


def gen_colors(R: int, C: int, palette: Sequence[Color], smooth: float, rng: random.Random) -> List[List[Color]]:
    """
    smooth in [0,1]: probability to copy color from a neighbor (gives nice clusters)
    """
    grid: List[List[Optional[Color]]] = [[None] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            candidates: List[Color] = []
            if r > 0 and rng.random() < smooth:
                candidates.append(grid[r - 1][c])
            if c > 0 and rng.random() < smooth:
                candidates.append(grid[r][c - 1])
            if r > 0 and c > 0 and rng.random() < smooth:
                candidates.append(grid[r - 1][c - 1])
            grid[r][c] = rng.choice(
                [c for c in candidates if c is not None]) if candidates else rng.choice(palette)
    return grid  # type: ignore


# ---------- generator core ----------

def pick_best_reveal(
    colors: List[List[Color]],
    clues: List[List[Optional[int]]],
    palette: Sequence[Color],
    initial: Iterable[Coord],
    unsolved: Iterable[Coord],
    rng: random.Random,
    sample_k: int = 12,
) -> Coord:
    """Try several reveals and pick the one yielding the most fixed cells."""
    init_set = set(initial)
    cand = [p for p in unsolved if p not in init_set]
    if not cand:
        raise RuntimeError("No candidates to reveal.")

    if len(cand) > sample_k:
        cand = rng.sample(cand, sample_k)

    best_cell, best_gain = cand[0], -1
    for (r, c) in cand:
        trial_init = init_set | {(r, c)}
        givens = {(rr, cc): colors[rr][cc] for (rr, cc) in trial_init}
        res: SolveResult = deterministic_solve(
            clues, palette, givens)
        gain = res.state.fixed_count
        if gain > best_gain:
            best_gain = gain
            best_cell = (r, c)
    return best_cell


def minimality_pass(
    colors: List[List[Color]],
    clues: List[List[Optional[int]]],
    palette: Sequence[Color],
    initial: Iterable[Coord],
) -> list[Coord]:
    """Remove unnecessary givens while keeping deterministic solvability."""
    initial_list = list(initial)
    kept: list[Coord] = []
    for cell in initial_list:
        trial = [x for x in initial_list if x != cell]
        try:
            givens = {p: colors[p[0]][p[1]] for p in trial}
            res = deterministic_solve(clues, palette, givens)
            if res.fully_solved:
                # redundant, skip
                continue
            else:
                kept.append(cell)
        except ValueError:
            kept.append(cell)
    return kept or initial_list


def generate(
    R: int,
    C: int,
    palette: Sequence[Color],
    smooth: float = 0.1,
    seed: Optional[int] = None,
    max_rounds: int = 200,
) -> dict:
    rng = random.Random(seed)

    # Step 1: generate full solution and clues
    colors = gen_colors(R, C, palette, smooth, rng)
    clues = compute_clues(colors)

    # Step 2: iterative reveal until deterministic solve completes
    initial: set[Coord] = set()
    for round_i in range(max_rounds):
        givens = {(r, c): colors[r][c] for (r, c) in initial}
        res = deterministic_solve(clues, palette, givens)
        if res.fully_solved:
            break
        unsolved = [(r, c) for r in range(R)
                    for c in range(C) if res.state.fixed[r][c] is None]
        if not unsolved:
            break
        pick = pick_best_reveal(
            colors, clues, palette, initial, unsolved, rng, sample_k=max(6, (R * C) // 4))
        initial.add(pick)

    # Step 3: minimality cleanup
    initial_min = minimality_pass(colors, clues, palette, initial)

    # Step 4: metadata
    colors_hash = hashlib.sha1(json.dumps(colors).encode()).hexdigest()[:12]
    meta = {
        "rows": R,
        "cols": C,
        "palette": list(palette),
        "smooth": smooth,
        "seed": seed,
        "generator": "deterministic-v1",
        "generated_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "initial_count": len(initial_min),
        "colors_sha1_12": colors_hash,
    }

    return {
        "meta": meta,
        "colors": colors,
        "clues": clues,
        "initial": [(r, c) for (r, c) in initial_min],
    }


# ---------- Output management ----------

def next_board_filename(base: str = "board", ext: str = ".json") -> Path:
    """Find next available boards/board_###.json."""
    ensure_dirs()
    i = 1
    while True:
        name = f"{base}_{i:03d}{ext}"
        path = PROJECT_ROOT / "boards" / name
        if not path.exists():
            return path
        i += 1


# ---------- CLI ----------

def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", type=int, default=6)
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--palette", nargs="+", default=["R", "G", "B"])
    ap.add_argument("--smooth", type=float, default=0.4,
                    help="0.0 iid; 1.0 strong clustering")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--max-rounds", type=int, default=200)
    ap.add_argument("--base", type=str, default="board",
                    help="base name for output files")
    args = ap.parse_args(argv)

    ensure_dirs()
    out_path = next_board_filename(args.base)

    print(f"Generating puzzle → {out_path.name}")

    data = generate(
        R=args.rows,
        C=args.cols,
        palette=tuple(args.palette),
        smooth=args.smooth,
        seed=args.seed,
        max_rounds=args.max_rounds,
    )

    # Write board JSON
    out_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    # Write logs
    log_base = out_path.stem
    log_txt = PROJECT_ROOT / "logs" / f"{log_base}_solver.txt"
    log_json = PROJECT_ROOT / "logs" / f"{log_base}_solver.json"

    summary = {
        **data.get("meta", {}),
        "output_file": str(out_path),
    }

    log_txt.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    log_json.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(f"✅ Wrote {out_path} with {len(data['initial'])} initial cells")
    print(f"🗂️  Logs saved under logs/{log_base}_solver.*")


if __name__ == "__main__":
    sys.exit(main())
