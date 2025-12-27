#!/usr/bin/env python3
"""
Trigger IndexNow pings for the Prosper Factory landing pages.

This script is executed during the Netlify build (see netlify.toml).
It only pushes notifications when the CONTEXT environment variable
equals "production" so deploy previews are ignored.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request


INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
KEY_FILE = Path(__file__).with_name("89ec8c9a460d489e9f48ce70be1d24be.txt")
KEY_LOCATION_DEFAULT = f"https://prosperfactory.com/{KEY_FILE.name}"
PAGES = [
    "https://prosperfactory.com/",
    "https://prosperfactory.com/fr/",
    "https://prosperfactory.com/es/",
    "https://prosperfactory.com/de/",
    "https://prosperfactory.com/legal-notice",
    "https://prosperfactory.com/privacy-policy",
    "https://prosperfactory.com/fr/mentions-legales",
    "https://prosperfactory.com/fr/politique-de-confidentialite",
    "https://prosperfactory.com/es/mentions-legales",
    "https://prosperfactory.com/es/politica-de-confidencialidad",
    "https://prosperfactory.com/de/mentions-legales",
    "https://prosperfactory.com/de/datenschutzerklaerung",
]


def load_indexnow_key() -> str:
    """Return the IndexNow key from env or key file."""
    env_key = os.getenv("INDEXNOW_KEY", "").strip()
    if env_key:
        return env_key

    try:
        key = KEY_FILE.read_text(encoding="utf-8").strip()
    except FileNotFoundError as exc:
        raise SystemExit(
            f"[IndexNow] Missing key file at {KEY_FILE}. "
            "Ensure the Bing verification file is present."
        ) from exc

    if not key:
        raise SystemExit(
            f"[IndexNow] Key file {KEY_FILE} is empty. Populate it with the API key."
        )
    return key


def ping(url: str, key: str, key_location: str) -> None:
    query = urllib.parse.urlencode(
        {"url": url, "key": key, "keyLocation": key_location}
    )
    request_url = f"{INDEXNOW_ENDPOINT}?{query}"
    try:
        with urllib.request.urlopen(request_url, timeout=10) as response:
            status = response.status
    except urllib.error.URLError as exc:
        print(f"[IndexNow] Failed to notify {url}: {exc}", file=sys.stderr)
        return

    if status == 200:
        print(f"[IndexNow] Successfully notified {url}")
    else:
        print(f"[IndexNow] {url} responded with status {status}", file=sys.stderr)


def main() -> int:
    context = os.getenv("CONTEXT", "").lower()
    if context != "production":
        print("[IndexNow] Skipping ping because CONTEXT is not 'production'.")
        return 0

    key = load_indexnow_key()
    key_location = os.getenv("INDEXNOW_KEY_LOCATION", KEY_LOCATION_DEFAULT)

    print("[IndexNow] Notifying URLs to Bing/Yandex via IndexNow...")
    for page in PAGES:
        ping(page, key, key_location)
    print("[IndexNow] Ping sequence completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
