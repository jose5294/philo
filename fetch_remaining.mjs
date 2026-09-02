import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchFromWikiPage(lang, title) {
  const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=500&format=json`;
  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const p of Object.values(pages)) {
    if (p.thumbnail?.source) {
      return p.thumbnail.source;
    }
  }
  throw new Error(`No thumbnail for ${lang}:${title}`);
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

const list = [
  { id: "rawls", lang: "en", title: "John Rawls" },
  { id: "yihwang", lang: "ko", title: "이황" },
  { id: "wonhyo", lang: "ko", title: "원효" }
];

async function run() {
  for (const item of list) {
    const dest = path.join(dir, `${item.id}.jpg`);
    try {
      await sleep(1000);
      const url = await fetchFromWikiPage(item.lang, item.title);
      console.log(`[Found] ${item.id} -> ${url}`);
      await sleep(1000);
      await downloadImage(url, dest);
      console.log(`[SAVED] ${item.id}.jpg (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`[FAIL] ${item.id}:`, e.message);
    }
  }
}

run();
