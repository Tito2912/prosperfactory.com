#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

import yaml


CONTENT_DIR = Path(__file__).parent / "content"


def slugify_heading(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = text.strip()
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text


def extract_headings_from_mdx_source(source: str) -> set[str]:
    ids: set[str] = set()
    for line in source.splitlines():
        m = re.match(r"^(#{2,4})\s+(.+?)\s*$", line)
        if not m:
            continue
        text = m.group(2).replace("`", "").strip()
        ids.add(slugify_heading(text))
    return ids


def load_frontmatter(source: str, file_path: Path) -> dict:
    if not source.startswith("---"):
        return {}
    parts = source.split("---", 2)
    if len(parts) < 3:
        print(f"[WARN] {file_path}: frontmatter delimiter not closed", file=sys.stderr)
        return {}
    try:
        data = yaml.safe_load(parts[1])
    except Exception as exc:  # noqa: BLE001 - best-effort lint
        print(f"[WARN] {file_path}: failed to parse frontmatter: {exc}", file=sys.stderr)
        return {}
    return data or {}


def main() -> int:
    if not CONTENT_DIR.exists():
        print(f"[ERROR] content dir not found: {CONTENT_DIR}", file=sys.stderr)
        return 2

    mdx_files = sorted(CONTENT_DIR.rglob("*.mdx"))
    errors: list[str] = []

    for file_path in mdx_files:
        raw = file_path.read_text("utf-8")
        frontmatter = load_frontmatter(raw, file_path)
        jump_links = frontmatter.get("jumpLinks") or []
        if not jump_links:
            continue

        heading_ids = extract_headings_from_mdx_source(raw)

        for item in jump_links:
            if not isinstance(item, dict):
                continue
            href = (item.get("href") or "").strip()
            if not href.startswith("#"):
                continue
            target = href[1:]
            if target not in heading_ids:
                label = item.get("label") or ""
                errors.append(f"{file_path}: missing heading id for jumpLink {href!r} ({label!r})")

    if errors:
        print("MDX jumpLinks validation failed:\n", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        print(f"\nTotal issues: {len(errors)}", file=sys.stderr)
        return 1

    print("All MDX jumpLinks look good.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

