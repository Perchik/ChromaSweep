from pydantic import BaseModel
from typing import List, Literal, Optional, Tuple

from .rules import RULE_LIST

ColorKey = Literal['a','b','c','d']
RuleName = Literal[tuple(RULE_LIST)]

class RuleOverride(BaseModel):
    r: int
    c: int
    rule: RuleName

class Meta(BaseModel):
    rows: int
    cols: int
    palette: List[ColorKey]
    rules: List[str]
    defaultRule: RuleName
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
    ruleOverrides: Optional[List[RuleOverride]] = None
    initial: List[Tuple[int,int]]
