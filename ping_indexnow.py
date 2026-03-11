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
ROOT_DIR = Path(__file__).resolve().parent
KEY_FILE = ROOT_DIR / "public" / "89ec8c9a460d489e9f48ce70be1d24be.txt"
KEY_LOCATION_DEFAULT = f"https://prosperfactory.com/{KEY_FILE.name}"
PAGES = [
    "https://prosperfactory.com/",
    "https://prosperfactory.com/fr/",
    "https://prosperfactory.com/es/",
    "https://prosperfactory.com/de/",
    "https://prosperfactory.com/about/",
    "https://prosperfactory.com/contact/",
    "https://prosperfactory.com/fr/a-propos/",
    "https://prosperfactory.com/fr/contact/",
    "https://prosperfactory.com/es/sobre/",
    "https://prosperfactory.com/es/contacto/",
    "https://prosperfactory.com/de/uber-uns/",
    "https://prosperfactory.com/de/kontakt/",
    "https://prosperfactory.com/legal-notice/",
    "https://prosperfactory.com/privacy-policy/",
    "https://prosperfactory.com/disclaimer/",
    "https://prosperfactory.com/affiliate-disclosure/",
    "https://prosperfactory.com/fr/mentions-legales/",
    "https://prosperfactory.com/fr/politique-de-confidentialite/",
    "https://prosperfactory.com/fr/disclaimer/",
    "https://prosperfactory.com/fr/affiliate-disclosure/",
    "https://prosperfactory.com/es/mentions-legales/",
    "https://prosperfactory.com/es/politica-de-confidencialidad/",
    "https://prosperfactory.com/es/disclaimer/",
    "https://prosperfactory.com/es/affiliate-disclosure/",
    "https://prosperfactory.com/de/mentions-legales/",
    "https://prosperfactory.com/de/datenschutzerklaerung/",
    "https://prosperfactory.com/de/disclaimer/",
    "https://prosperfactory.com/de/affiliate-disclosure/",
    "https://prosperfactory.com/tools/tradingview/",
    "https://prosperfactory.com/fr/tools/tradingview/",
    "https://prosperfactory.com/es/tools/tradingview/",
    "https://prosperfactory.com/de/tools/tradingview/",
    "https://prosperfactory.com/crypto/bitpanda/",
    "https://prosperfactory.com/fr/crypto/bitpanda/",
    "https://prosperfactory.com/es/crypto/bitpanda/",
    "https://prosperfactory.com/de/crypto/bitpanda/",
    "https://prosperfactory.com/brokers/etoro/",
    "https://prosperfactory.com/fr/brokers/etoro/",
    "https://prosperfactory.com/es/brokers/etoro/",
    "https://prosperfactory.com/de/brokers/etoro/",
    "https://prosperfactory.com/guides/",
    "https://prosperfactory.com/guides/start-investing/",
    "https://prosperfactory.com/guides/how-to-choose-a-platform/",
    "https://prosperfactory.com/guides/how-to-read-a-chart/",
    "https://prosperfactory.com/guides/best-technical-analysis-tools/",
    "https://prosperfactory.com/guides/crypto-dca/",
    "https://prosperfactory.com/fr/guides/",
    "https://prosperfactory.com/fr/guides/debuter-investissement/",
    "https://prosperfactory.com/fr/guides/comment-choisir-une-plateforme/",
    "https://prosperfactory.com/fr/guides/comment-lire-un-graphique/",
    "https://prosperfactory.com/fr/guides/meilleurs-outils-analyse-technique/",
    "https://prosperfactory.com/fr/guides/dca-crypto/",
    "https://prosperfactory.com/es/guides/",
    "https://prosperfactory.com/es/guides/empezar-a-invertir/",
    "https://prosperfactory.com/es/guides/como-elegir-una-plataforma/",
    "https://prosperfactory.com/es/guides/como-leer-un-grafico/",
    "https://prosperfactory.com/es/guides/mejores-herramientas-analisis-tecnico/",
    "https://prosperfactory.com/es/guides/dca-cripto/",
    "https://prosperfactory.com/de/guides/",
    "https://prosperfactory.com/de/guides/investieren-fuer-anfaenger/",
    "https://prosperfactory.com/de/guides/plattform-waehlen-checkliste/",
    "https://prosperfactory.com/de/guides/chart-lesen-grundlagen/",
    "https://prosperfactory.com/de/guides/beste-tools-technische-analyse/",
    "https://prosperfactory.com/de/guides/krypto-dca/",
    "https://prosperfactory.com/comparisons/",
    "https://prosperfactory.com/comparisons/etoro-vs-bitpanda/",
    "https://prosperfactory.com/comparisons/tradingview-vs-metatrader/",
    "https://prosperfactory.com/fr/comparatifs/",
    "https://prosperfactory.com/fr/comparatifs/etoro-vs-bitpanda/",
    "https://prosperfactory.com/fr/comparatifs/tradingview-vs-metatrader/",
    "https://prosperfactory.com/es/comparisons/",
    "https://prosperfactory.com/es/comparisons/etoro-vs-bitpanda/",
    "https://prosperfactory.com/es/comparisons/tradingview-vs-metatrader/",
    "https://prosperfactory.com/de/comparisons/",
    "https://prosperfactory.com/de/comparisons/etoro-vs-bitpanda/",
    "https://prosperfactory.com/de/comparisons/tradingview-vs-metatrader/",
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
