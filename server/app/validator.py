"""validator.py – Owns the answer key and provides helpers.

This module intentionally centralizes access to the true solution grid so that
solver components don't touch the answer directly. Use it for correctness
checks and to build givens mappings for the solver.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

Color = str
Coord = Tuple[int, int]


@dataclass
class Validator:
    colors: List[List[Color]]
    clues: List[List[Optional[int]]]

    @property
    def R(self) -> int:
        return len(self.colors)

    @property
    def C(self) -> int:
        return len(self.colors[0]) if self.colors else 0

    def color_at(self, r: int, c: int) -> Color:
        return self.colors[r][c]

    def givens_from(self, initial: Iterable[Coord]) -> Dict[Coord, Color]:
        return {(r, c): self.colors[r][c] for (r, c) in initial}

    def verify_assignment(self, assignment: List[List[Color]]) -> bool:
        if len(assignment) != self.R or any(len(row) != self.C for row in assignment):
            return False
        for r in range(self.R):
            for c in range(self.C):
                if assignment[r][c] != self.colors[r][c]:
                    return False
        return True

    def verify_cell(self, r: int, c: int, color: Color) -> bool:
        return self.colors[r][c] == color


def from_board(colors: List[List[Color]], clues: List[List[Optional[int]]]) -> Validator:
    return Validator(colors=colors, clues=clues)

