from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple

_ROOT = Path(__file__).resolve().parents[2]
_SHARED_RULES = _ROOT / 'shared' / 'rules.json'


def _load_rule_names() -> Tuple[str, ...]:
  data = json.loads(_SHARED_RULES.read_text(encoding='utf-8'))
  return tuple(item['name'] for item in data)


RULE_LIST: Tuple[str, ...] = _load_rule_names()

__all__ = ['RULE_LIST']
