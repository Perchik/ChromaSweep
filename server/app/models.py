from pydantic import BaseModel
from typing import List, Literal, Optional, Tuple

ColorKey = Literal['a','b','c','d']
RuleName = Literal['neighbor','knight']

class RuleCell(BaseModel):
    r: int
    c: int
    rule: RuleName

class Meta(BaseModel):
    rows: int
    cols: int
    palette: List[ColorKey]
    rules: List[str]
    difficulty: str
    smooth: Optional[float] = None
    seed: Optional[int] = None
    generator: Optional[str] = None
    generated_utc: Optional[str] = None
    initial_count: Optional[int] = None
    colors_sha1_12: Optional[str] = None

class BoardFile(BaseModel):
    meta: Meta
    colors: List[List[ColorKey]]
    clueCells: Optional[List[RuleCell]] = None
    initial: List[Tuple[int,int]]
