"""
solver.py – deterministic propagation solver for the color-Neighbors puzzle.
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Iterable, Sequence, Tuple, List, Set, Dict, Optional, Protocol
from copy import deepcopy
from pathlib import Path
import json
import time

Color = str
Coord = Tuple[int, int]


# ---------------------------
# Logging
# ---------------------------

@dataclass
class Snapshot:
    step: int
    phase: str
    message: str
    changed: List[Tuple[Coord, Dict[str, object]]
                  ] = field(default_factory=list)
    fixed_count: int = 0
    unresolved_count: int = 0
    timestamp: float = field(default_factory=time.time)
    board_text: Optional[str] = None
    board_domains: Optional[List[List[List[Color]]]] = None


class SolverLogger:
    """Collects snapshots and can write human-readable and JSON logs."""

    def __init__(self, keep_domains: bool = False):
        self.snapshots: List[Snapshot] = []
        self.keep_domains = keep_domains

    def snapshot(
        self,
        step: int,
        phase: str,
        message: str,
        state: SolverState,
        changed: List[Tuple[Coord, Dict[str, object]]] | None = None,
        include_board_text: bool = True,
    ):
        snap = Snapshot(
            step=step,
            phase=phase,
            message=message,
            changed=changed or [],
            fixed_count=state.fixed_count,
            unresolved_count=state.unresolved_count,
            board_text=pretty_board(state) if include_board_text else None,
            board_domains=deepcopy(
                state.domains_as_lists()) if self.keep_domains else None,
        )
        self.snapshots.append(snap)

    def write_text(self, path: str | Path):
        p = Path(path)
        lines = []
        for s in self.snapshots:
            lines.append(f"--- step {s.step} – {s.phase}")
            lines.append(f"{s.message}")
            lines.append(
                f"fixed={s.fixed_count}, unresolved={s.unresolved_count}, changed={len(s.changed)}")
            if s.changed:
                for (rc, delta) in s.changed:
                    lines.append(f"  changed {rc}: {delta}")
            if s.board_text:
                lines.append(s.board_text)
            lines.append("")
        p.write_text("\n".join(lines), encoding="utf-8")

    def write_json(self, path: str | Path):
        Path(path).write_text(json.dumps(
            [asdict(s) for s in self.snapshots], indent=2), encoding="utf-8")


# ---------------------------
# State
# ---------------------------

@dataclass
class SolverState:
    clues:  List[List[Optional[int]]]    # None or k
    palette: Tuple[Color, ...]
    givens: Dict[Coord, Color]

    R: int = field(init=False)
    C: int = field(init=False)
    domains: List[List[Set[Color]]] = field(init=False)
    fixed:   List[List[Optional[Color]]] = field(init=False)

    def __post_init__(self):
        self.R, self.C = len(self.clues), len(self.clues[0])
        self.domains = [[set(self.palette) for _ in range(self.C)]
                        for _ in range(self.R)]
        self.fixed = [[None for _ in range(self.C)] for _ in range(self.R)]
        for (r, c), col in self.givens.items():
            self.domains[r][c] = {col}
            self.fixed[r][c] = col

    @property
    def fixed_count(self) -> int:
        return sum(1 for r in range(self.R) for c in range(self.C) if self.fixed[r][c] is not None)

    @property
    def unresolved_count(self) -> int:
        return self.R * self.C - self.fixed_count

    def is_fixed(self, r: int, c: int) -> bool:
        return self.fixed[r][c] is not None

    def set_color(self, r: int, c: int, col: Color):
        if col not in self.domains[r][c]:
            raise ValueError(
                f"Contradiction: setting removed color at {(r, c)}")
        self.domains[r][c] = {col}
        self.fixed[r][c] = col

    def remove_color(self, r: int, c: int, col: Color) -> bool:
        if self.fixed[r][c] == col:
            raise ValueError(
                f"Contradiction: removing fixed color at {(r, c)}")
        if col in self.domains[r][c]:
            self.domains[r][c].remove(col)
            if not self.domains[r][c]:
                raise ValueError(f"Contradiction: empty domain at {(r, c)}")
            if len(self.domains[r][c]) == 1:
                (only,) = tuple(self.domains[r][c])
                self.fixed[r][c] = only
            return True
        return False

    def domains_as_lists(self) -> List[List[List[Color]]]:
        return [[sorted(list(s)) for s in row] for row in self.domains]


# ---------------------------
# Rule interface & 8-neighbor clue rule
# ---------------------------

class Rule(Protocol):
    name: str
    def propagate(self, state: SolverState, step: int,
                  logger: Optional[SolverLogger]) -> bool: ...


def neighbors8(r: int, c: int, R: int, C: int) -> Iterable[Coord]:
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            rr, cc = r + dr, c + dc
            if 0 <= rr < R and 0 <= cc < C:
                yield (rr, cc)


@dataclass
class NeighborClueRule:
    """Rule: if (r,c) has clue k and color col, exactly k neighbors share that color."""
    name: str = "8-NB-CLUE"

    def propagate(self, state: SolverState, step: int, logger: Optional[SolverLogger]) -> bool:
        made_change = False
        changes: List[Tuple[Coord, Dict[str, object]]] = []

        # singleton fixes
        for r in range(state.R):
            for c in range(state.C):
                if state.fixed[r][c] is None and len(state.domains[r][c]) == 1:
                    (only,) = tuple(state.domains[r][c])
                    state.fixed[r][c] = only
                    made_change = True
                    changes.append(((r, c), {"fix": only}))

        if logger and changes:
            logger.snapshot(step, self.name, "Singleton fixes", state, changes)

        # clue-driven propagation
        for r in range(state.R):
            for c in range(state.C):
                k = state.clues[r][c]
                col = state.fixed[r][c]
                if k is None or col is None:
                    continue

                neigh = list(neighbors8(r, c, state.R, state.C))
                solved_same = 0
                candidates: List[Coord] = []

                for rr, cc in neigh:
                    if state.fixed[rr][cc] == col:
                        solved_same += 1
                    elif col in state.domains[rr][cc]:
                        candidates.append((rr, cc))

                need = k - solved_same
                if need < 0:
                    raise ValueError(
                        f"Contradiction at {(r, c)}: too many same-color neighbors for {col}")

                if need == 0:
                    # remove color from remaining candidates
                    for rr, cc in candidates:
                        if state.remove_color(rr, cc, col):
                            made_change = True
                            if logger:
                                logger.snapshot(
                                    step, self.name,
                                    f"Quota reached at {(r, c)}; remove {col} from {(rr, cc)}",
                                    state, changed=[
                                        ((rr, cc), {"remove": col})],
                                    include_board_text=False,
                                )

                elif need == len(candidates):
                    # force all remaining candidates to this color
                    for rr, cc in candidates:
                        if state.fixed[rr][cc] != col:
                            state.set_color(rr, cc, col)
                            made_change = True
                            if logger:
                                logger.snapshot(
                                    step, self.name,
                                    f"Force {col} at {(rr, cc)}) (need==candidates from {(r, c)})",
                                    state, changed=[((rr, cc), {"fix": col})],
                                    include_board_text=False,
                                )

        return made_change


# ---------------------------
# Solver loop
# ---------------------------

@dataclass
class SolveResult:
    state: SolverState
    fully_solved: bool
    steps: int


def deterministic_solve(
    clues:  List[List[Optional[int]]],
    palette: Sequence[Color],
    givens: Dict[Coord, Color] | Iterable[Tuple[Coord, Color]] | None = None,
    rules: Optional[List[Rule]] = None,
    logger: Optional[SolverLogger] = None,
    max_iterations: int = 10_000,
) -> SolveResult:
    """Run deterministic propagation to a fixed point. Raises on contradiction.

    Parameters:
      - clues: 2D grid of neighbor counts or None.
      - palette: sequence of allowed colors.
      - givens: mapping or iterable of ((r,c), color) to seed fixed cells.
    """
    gi: Dict[Coord, Color] = dict(givens or {})
    state = SolverState(
        clues=deepcopy(clues),
        palette=tuple(palette),
        givens=gi,
    )

    active_rules: List[Rule] = rules or [NeighborClueRule()]
    step = 0
    something_changed = True
    if logger:
        logger.snapshot(step, "INIT", "Initialized solver state", state)

    while something_changed and step < max_iterations:
        step += 1
        something_changed = False
        for rule in active_rules:
            try:
                changed = rule.propagate(state, step, logger)
            except ValueError as e:
                if logger:
                    logger.snapshot(step, rule.name,
                                    f"Contradiction: {e}", state)
                raise
            if changed:
                something_changed = True
        if logger:
            logger.snapshot(step, "ROUND", "End of round", state)

    fully = state.unresolved_count == 0
    if logger:
        msg = "Fully solved" if fully else "Reached fixed point (not fully solved)"
        logger.snapshot(step, "DONE", msg, state)

    return SolveResult(state=state, fully_solved=fully, steps=step)


# ---------------------------
# Pretty print
# ---------------------------

def pretty_board(state: SolverState) -> str:
    """Compact text view: fixed color letters; else .N for domain size."""
    rows: List[str] = []
    for r in range(state.R):
        parts: List[str] = []
        for c in range(state.C):
            if state.fixed[r][c] is not None:
                parts.append(state.fixed[r][c])
            else:
                parts.append(f".{len(state.domains[r][c])}")
        rows.append(" ".join(parts))
    return "\n".join(rows)

