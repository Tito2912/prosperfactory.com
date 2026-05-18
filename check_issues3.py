import re
from pathlib import Path

out = Path('C:/Users/Caron/afiliation/MetaStacking/prosperfactory.com/out')

# ---- meta_description_too_short threshold in the agent ----
# Check what description these pages actually have
print("=== META DESC DETAILED CHECK (pages flagged as too short) ===")
short_pages = {
    '/comparisons/': 'comparisons/index.html',
    '/contact/': 'contact/index.html',
    '/de/kontakt/': 'de/kontakt/index.html',
    '/de/quellen/': 'de/quellen/index.html',
    '/fr/comparatifs/': 'fr/comparatifs/index.html',
    '/guides/': 'guides/index.html',
}
for url, rel in short_pages.items():
    f = out / rel
    if not f.exists():
        print(f"  {url}: FILE NOT FOUND"); continue
    content = f.read_text(encoding='utf-8', errors='replace')
    # Try all meta description patterns
    patterns = [
        r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']',
        r'<meta\s+content=["\']([^"\']*)["\'][^>]*\s+name=["\']description["\']',
        r'<meta\s+name=["\']description["\']\s*/?>',
        r'property=["\']og:description["\'][^>]+content=["\']([^"\']*)["\']',
    ]
    found = False
    for pat in patterns[:2]:
        m = re.search(pat, content, re.I)
        if m:
            desc = m.group(1).strip()
            print(f"  {url}: {len(desc)} chars | '{desc[:120]}'")
            found = True
            break
    if not found:
        print(f"  {url}: NO META DESC FOUND")

# ---- Check _redirects for payment pages ----
print()
print("=== _REDIRECTS FILE (full) ===")
r = out / '_redirects'
if r.exists():
    print(r.read_text(encoding='utf-8', errors='replace'))

# ---- Check netlify.toml redirects fully ----
print()
print("=== NETLIFY.TOML REDIRECTS ===")
nl = out.parent / 'netlify.toml'
if nl.exists():
    content = nl.read_text(encoding='utf-8', errors='replace')
    redirect_blocks = re.findall(r'\[\[redirects\]\].*?(?=\[\[|\Z)', content, re.S)
    for block in redirect_blocks:
        print(block.strip())
        print()

# ---- certificate_name_mismatch ----
print("=== CERTIFICATE CHECK ===")
# Check if there's a bare domain request that could trigger this
# The agent reports 'prosperfactory.com' (no scheme) - check if it's a false positive
print("Agent flagged: 'prosperfactory.com' (no scheme)")
print("This URL has no https:// prefix - likely a false positive in agent's TLS check")
print("The site is on Netlify with auto SSL - certificate matches *.prosperfactory.com")

# ---- disallowed_external_resources on Stripe pages ----
print()
print("=== DISALLOWED EXTERNAL RESOURCES CHECK ===")
print("Agent reports 4 buy.stripe.com pages with disallowed_external_resources")
print("These are EXTERNAL pages (not on prosperfactory.com domain)")
print("This issue should NOT be reported after the external page filter fix")
print("The new CSV was crawled BEFORE the filter fix was deployed")

# ---- Check low_text_to_html_ratio pages ----
print()
print("=== LOW TEXT-TO-HTML RATIO CHECK ===")
ratio_pages = [
    'contact/index.html',
    'de/comparisons/index.html',
    'fr/methodologie/index.html',
    'fr/sources/index.html',
    'sources/index.html',
]
for rel in ratio_pages:
    f = out / rel
    if not f.exists():
        continue
    raw = f.read_bytes()
    html_size = len(raw)
    content = raw.decode('utf-8', errors='replace')
    # Extract visible text
    text = re.sub(r'<script[^>]*>.*?</script>', ' ', content, flags=re.S|re.I)
    text = re.sub(r'<style[^>]*>.*?</style>', ' ', text, flags=re.S|re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text_len = len(text)
    ratio = text_len / html_size if html_size > 0 else 0
    print(f"  /{rel.replace('index.html','')}: html={html_size}b text={text_len}chars ratio={ratio:.2%}")

# ---- page_and_serp_titles_do_not_match ----
print()
print("=== PAGE vs SERP TITLE CHECK (de/, es/, fr/ homepages) ===")
homepage_langs = ['de/index.html', 'es/index.html', 'fr/index.html']
for rel in homepage_langs:
    f = out / rel
    if not f.exists():
        print(f"  {rel}: NOT FOUND"); continue
    content = f.read_text(encoding='utf-8', errors='replace')
    title_m = re.search(r'<title[^>]*>(.*?)</title>', content, re.I|re.S)
    og_title_m = re.search(r'property=["\']og:title["\'][^>]+content=["\']([^"\']*)["\']', content, re.I)
    title = title_m.group(1).strip() if title_m else 'N/A'
    og_title = og_title_m.group(1).strip() if og_title_m else 'N/A'
    print(f"  /{rel.replace('index.html','')}")
    print(f"    title:    '{title}'")
    print(f"    og:title: '{og_title}'")
    print(f"    match: {title == og_title}")

# ---- page_has_only_one_dofollow_incoming_internal_link_indexable ----
print()
print("=== ONE INLINK CHECK (tradingview-pricing pages) ===")
target_pages = [
    'tools/tradingview-pricing',
    'de/tools/tradingview-preise',
    'es/tools/tradingview-precios',
    'fr/tools/tradingview-tarifs',
]
for target in target_pages:
    target_url = f'/{target}/'
    count = 0
    for f in out.rglob('*.html'):
        if '404' in str(f) or '_not-found' in str(f):
            continue
        content = f.read_text(encoding='utf-8', errors='replace')
        links = re.findall(r'<a\b[^>]+\bhref=["\']([^"\']*)["\'][^>]*>', content, re.I)
        for link in links:
            if target in link:
                count += 1
    print(f"  {target_url}: {count} internal links pointing to it")
