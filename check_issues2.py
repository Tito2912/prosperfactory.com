import re
from pathlib import Path

out = Path('C:/Users/Caron/afiliation/MetaStacking/prosperfactory.com/out')

# ---- Check specific pages for meta_desc_too_short ----
short_pages = [
    'comparisons/index.html',
    'contact/index.html',
    'de/kontakt/index.html',
    'de/quellen/index.html',
    'fr/comparatifs/index.html',
    'guides/index.html',
]
print("=== META DESCRIPTION CHECK ===")
for rel in short_pages:
    f = out / rel
    if not f.exists():
        print(f"  {rel}: FILE NOT FOUND")
        continue
    content = f.read_text(encoding='utf-8', errors='replace')
    desc_m = re.search(
        r'<meta\b[^>]+\bname=["\']description["\'][^>]+\bcontent=["\']([^"\']*)["\']'
        r'|<meta\b[^>]+\bcontent=["\']([^"\']*)["\'][^>]+\bname=["\']description["\']',
        content, re.I
    )
    if desc_m:
        desc = (desc_m.group(1) or desc_m.group(2) or '').strip()
        print(f"  /{rel.replace('index.html','')}: {len(desc)} chars | '{desc[:100]}'")
    else:
        print(f"  /{rel.replace('index.html','')}: NO META DESCRIPTION")

# ---- Check low_word_count pages ----
print()
print("=== WORD COUNT CHECK (agent low_word_count pages) ===")
low_wc_pages = [
    'contact/index.html',
    'de/affiliate-disclosure/index.html',
    'de/kontakt/index.html',
    'de/methodik/index.html',
    'de/quellen/index.html',
    'de/uber-uns/index.html',
    'es/affiliate-disclosure/index.html',
    'es/contacto/index.html',
    'es/fuentes/index.html',
    'es/metodologia/index.html',
    'fr/contact/index.html',
    'fr/sources/index.html',
    'sources/index.html',
]
for rel in low_wc_pages:
    f = out / rel
    if not f.exists():
        print(f"  {rel}: FILE NOT FOUND")
        continue
    content = f.read_text(encoding='utf-8', errors='replace')
    # Remove scripts, styles, nav, header, footer
    clean = re.sub(r'<script[^>]*>.*?</script>', ' ', content, flags=re.S|re.I)
    clean = re.sub(r'<style[^>]*>.*?</style>', ' ', clean, flags=re.S|re.I)
    clean = re.sub(r'<nav[^>]*>.*?</nav>', ' ', clean, flags=re.S|re.I)
    clean = re.sub(r'<header[^>]*>.*?</header>', ' ', clean, flags=re.S|re.I)
    clean = re.sub(r'<footer[^>]*>.*?</footer>', ' ', clean, flags=re.S|re.I)
    clean = re.sub(r'<[^>]+>', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean)
    words = len(clean.split())
    print(f"  /{rel.replace('index.html','')}: {words} words")

# ---- Check title lengths more precisely ----
print()
print("=== TITLE LENGTH CHECK (all pages, agent threshold ~70) ===")
all_titles = []
for f in out.rglob('*.html'):
    rel = str(f.relative_to(out))
    if '404' in rel or '_not-found' in rel:
        continue
    try:
        content = f.read_text(encoding='utf-8', errors='replace')
    except:
        continue
    title_m = re.search(r'<title[^>]*>(.*?)</title>', content, re.I | re.S)
    if title_m:
        title = title_m.group(1).strip()
        # Decode HTML entities
        title = title.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&#x27;', "'").replace('&quot;', '"')
        url = '/' + rel.replace('\\', '/').replace('index.html', '').rstrip('/')
        all_titles.append((url, len(title), title))

all_titles.sort(key=lambda x: -x[1])
print(f"Pages with title >70: {len([x for x in all_titles if x[1]>70])}")
print(f"Pages with title >60: {len([x for x in all_titles if x[1]>60])}")
for url, l, t in all_titles:
    if l > 60:
        print(f"  {url}: {l} chars | '{t[:80]}'")

# ---- Check certificate_name_mismatch ----
print()
print("=== CERTIFICATE / HTTPS CHECK ===")
# Check if site has proper HTTPS configuration
netlify_cfg = out.parent / 'netlify.toml'
if netlify_cfg.exists():
    print("netlify.toml found:")
    print(netlify_cfg.read_text(encoding='utf-8', errors='replace')[:500])

# Check _redirects
redirects = out / '_redirects'
if redirects.exists():
    print()
    print("_redirects:")
    print(redirects.read_text(encoding='utf-8', errors='replace')[:500])

# Check payment page
print()
print("=== PAYMENT PAGE CHECK ===")
payment_files = [
    'payment/index.html',
    'fr/paiement/index.html',
    'de/zahlung/index.html',
    'es/pago/index.html',
]
for rel in payment_files:
    f = out / rel
    if f.exists():
        content = f.read_text(encoding='utf-8', errors='replace')
        # Look for redirect or stripe
        meta_refresh = re.search(r'<meta[^>]+http-equiv=["\']refresh["\'][^>]*>', content, re.I)
        stripe = 'buy.stripe.com' in content
        print(f"  {rel}: exists=True meta_refresh={bool(meta_refresh)} stripe_link={stripe}")
    else:
        print(f"  {rel}: NOT FOUND")
