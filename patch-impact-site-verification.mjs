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

  return html.replace(metaTagRegex, (tag) => {
    if (/\bvalue=/.test(tag)) return tag;

    const contentMatch = tag.match(/\bcontent=["']([^"']+)["']/i);
    if (!contentMatch) return tag;

    const contentValue = contentMatch[1];
    return tag.replace(/\bname=(["'])impact-site-verification\1/i, (match) => `${match} value="${contentValue}"`);
  });
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
