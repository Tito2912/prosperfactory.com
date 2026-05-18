import re
from pathlib import Path

out = Path('C:/Users/Caron/afiliation/MetaStacking/prosperfactory.com/out')
html_files = list(out.rglob('*.html'))

missing_alt_pages = []
title_too_long = []
meta_desc_too_long = []
meta_desc_too_short = []
meta_desc_missing = []
x_default_missing = []
nofollow_ext = []
low_word_count = []
payment_pages = []

TITLE_MAX = 60
DESC_MAX = 160
DESC_MIN = 70
WORD_MIN = 300

for f in html_files:
    rel = str(f.relative_to(out))
    if '404' in rel or '_not-found' in rel:
        continue
    url_path = '/' + rel.replace('\\', '/').replace('index.html', '').rstrip('/')
    if url_path == '/':
        url_path = '/'

    try:
        content = f.read_text(encoding='utf-8', errors='replace')
    except Exception as e:
        continue

    # Missing alt text - check for img without non-empty alt
    imgs = re.findall(r'<img(?:[^>]*)>', content, re.I)
    page_has_missing_alt = False
    for img in imgs:
        alt_m = re.search(r'\balt\s*=\s*["\']([^"\']*)["\']', img)
        if not alt_m or not alt_m.group(1).strip():
            page_has_missing_alt = True
            break
    if page_has_missing_alt:
        missing_alt_pages.append(url_path)

    # Title length
    title_m = re.search(r'<title[^>]*>(.*?)</title>', content, re.I | re.S)
    title = title_m.group(1).strip() if title_m else ''
    if len(title) > TITLE_MAX:
        title_too_long.append((url_path, len(title), title[:100]))

    # Meta description
    desc_m = re.search(
        r'<meta\b[^>]+\bname=["\']description["\'][^>]+\bcontent=["\']([^"\']*)["\']'
        r'|<meta\b[^>]+\bcontent=["\']([^"\']*)["\'][^>]+\bname=["\']description["\']',
        content, re.I
    )
    if desc_m:
        desc = (desc_m.group(1) or desc_m.group(2) or '').strip()
        if len(desc) > DESC_MAX:
            meta_desc_too_long.append((url_path, len(desc)))
        elif 0 < len(desc) < DESC_MIN:
            meta_desc_too_short.append((url_path, len(desc)))
        elif len(desc) == 0:
            meta_desc_missing.append(url_path)
    else:
        meta_desc_missing.append(url_path)

    # x-default hreflang
    hreflang_tags = re.findall(r'hreflang=["\']([^"\']*)["\']', content, re.I)
    if hreflang_tags and 'x-default' not in [h.lower() for h in hreflang_tags]:
        x_default_missing.append(url_path)

    # nofollow external links
    ext_links = re.findall(r'<a\b[^>]+\bhref=["\']https?://(?!prosperfactory\.com)[^"\']+["\'][^>]*>', content, re.I)
    for a in ext_links:
        if 'nofollow' in a.lower():
            nofollow_ext.append(url_path)
            break

    # Word count (strip tags)
    text = re.sub(r'<[^>]+>', ' ', content)
    text = re.sub(r'\s+', ' ', text)
    words = len(text.split())
    if words < WORD_MIN:
        low_word_count.append((url_path, words))

    # Payment page redirect markers
    if 'buy.stripe.com' in content or '/payment' in content:
        payment_pages.append(url_path)

print(f"Total HTML files analyzed: {len([f for f in html_files if '404' not in str(f) and '_not-found' not in str(f)])}")
print()
print(f"missing_alt_text: {len(missing_alt_pages)} pages  (agent says 93)")
print(f"title_too_long (>{TITLE_MAX}): {len(title_too_long)} pages  (agent says 15)")
print(f"meta_desc_too_long (>{DESC_MAX}): {len(meta_desc_too_long)} pages  (agent says 24)")
print(f"meta_desc_too_short (<{DESC_MIN}): {len(meta_desc_too_short)} pages  (agent says 6)")
print(f"meta_desc_missing: {len(meta_desc_missing)} pages")
print(f"x_default_hreflang_missing: {len(x_default_missing)} pages  (agent says 93)")
print(f"nofollow_external_links: {len(nofollow_ext)} pages  (agent says 33)")
print(f"low_word_count (<{WORD_MIN}): {len(low_word_count)} pages  (agent says 13)")
print()
print("=== TITLE TOO LONG ===")
for url, l, t in sorted(title_too_long, key=lambda x: -x[1]):
    print(f"  {url} ({l} chars)")
print()
print("=== META DESC TOO LONG ===")
for url, l in sorted(meta_desc_too_long, key=lambda x: -x[1]):
    print(f"  {url} ({l} chars)")
print()
print("=== META DESC TOO SHORT ===")
for url, l in sorted(meta_desc_too_short):
    print(f"  {url} ({l} chars)")
print()
print("=== LOW WORD COUNT ===")
for url, w in sorted(low_word_count, key=lambda x: x[1]):
    print(f"  {url} ({w} words)")
