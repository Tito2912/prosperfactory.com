#!/usr/bin/env node
// Aligne <html lang> sur la langue que la page declare elle-meme, apres la generation.
//
// Genere par SEO Agent (https://noyaru.com) pour une anomalie mesuree : sur un site genere
// statiquement, le gabarit racine ne connait pas la route, donc il ecrit une langue unique pour
// tout le site et le HTML LIVRE est faux — meme si du JavaScript le corrige ensuite dans le
// navigateur. Ce script corrige le HTML livre, sans rien deviner : chaque page porte deja son
// canonical et ses alternates hreflang, et l'alternate qui pointe sur son propre canonical DIT
// sa langue. Aucune convention d'URL n'est supposee.
//
// Une page sans canonical, sans alternates, ou dont aucun alternate ne pointe sur elle-meme,
// est laissee STRICTEMENT intacte.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CANDIDATE_DIRS = ['out', 'dist', 'build', '.output/public', 'public', '_site'];
const norm = (u) => String(u || '').trim().replace(/#.*$/, '').replace(/\/+$/, '').toLowerCase();

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

function selfLang(html) {
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!canonical) return null;
  const href = canonical[0].match(/href=["']([^"']+)["']/i);
  if (!href) return null;
  const self = norm(href[1]);
  const tags = html.match(/<link[^>]+rel=["']alternate["'][^>]*>/gi) || [];
  for (const tag of tags) {
    const code = tag.match(/hreflang=["']([^"']+)["']/i);
    const target = tag.match(/href=["']([^"']+)["']/i);
    if (!code || !target) continue;
    const value = code[1].trim().toLowerCase();
    if (value === 'x-default') continue;
    if (norm(target[1]) === self) return value;
  }
  return null;
}

const root = CANDIDATE_DIRS.find((d) => existsSync(d));
if (!root) {
  console.log('[fix-html-lang] aucun dossier de sortie trouve, rien a faire');
  process.exit(0);
}

let changed = 0;
let seen = 0;
for await (const file of htmlFiles(root)) {
  seen += 1;
  const html = await readFile(file, 'utf8');
  const lang = selfLang(html);
  if (!lang) continue;
  const openTag = html.match(/<html\b[^>]*>/i);
  if (!openTag) continue;
  const current = openTag[0].match(/\blang=["']([^"']+)["']/i);
  if (current && current[1].trim().toLowerCase().split('-')[0] === lang.split('-')[0]) continue;
  const fixed = current
    ? openTag[0].replace(/\blang=["'][^"']*["']/i, `lang="${lang}"`)
    : openTag[0].replace(/^<html\b/i, `<html lang="${lang}"`);
  await writeFile(file, html.replace(openTag[0], fixed), 'utf8');
  changed += 1;
}
console.log(`[fix-html-lang] ${changed} page(s) corrigee(s) sur ${seen} dans ${root}/`);
