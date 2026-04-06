import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'out');
const META_NAME = 'impact-site-verification';

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_next') continue;
      files.push(...(await listHtmlFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

function patchImpactMeta(html) {
  const metaTagRegex = /<meta\b[^>]*\bname=["']impact-site-verification["'][^>]*>/gi;

  let verificationId;

  // Remove all existing tags and capture the ID (from `value` or `content`).
  const stripped = html.replace(metaTagRegex, (tag) => {
    if (!verificationId) {
      const match =
        tag.match(/\bvalue=["']([^"']+)["']/i) ?? tag.match(/\bcontent=["']([^"']+)["']/i) ?? null;
      if (match?.[1]) verificationId = match[1];
    }
    return '';
  });

  if (!verificationId) return html;

  // Keep both `value` (Impact UI) and `content` (common verification meta format) for maximum compatibility.
  // Place it as the very first <meta> in <head>.
  const canonicalTag = `<meta name='impact-site-verification' value='${verificationId}' content='${verificationId}'>`;

  // Insert right after the opening <head> tag so it's guaranteed to be the first <meta>.
  return stripped.replace(/<head\b[^>]*>/i, (headOpen) => `${headOpen}${canonicalTag}`);
}

async function main() {
  const exists = await stat(OUT_DIR).then(() => true, () => false);
  if (!exists) {
    throw new Error(`Missing export folder: ${OUT_DIR}`);
  }

  const htmlFiles = await listHtmlFiles(OUT_DIR);
  let patchedFiles = 0;

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, 'utf8');
    if (!html.includes(META_NAME)) continue;

    const patched = patchImpactMeta(html);
    if (patched === html) continue;

    await writeFile(filePath, patched, 'utf8');
    patchedFiles += 1;
  }

  if (patchedFiles > 0) {
    console.log(`Added value= for ${META_NAME} in ${patchedFiles} HTML file(s).`);
  }
}

await main();
