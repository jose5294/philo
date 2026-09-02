import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function searchWikiImage(query) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=480&format=json`;
  const res = await fetch(apiUrl, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const p of Object.values(pages)) {
    const info = p.imageinfo?.[0];
    if (info?.thumburl || info?.url) {
      return info.thumburl || info.url;
    }
  }
  throw new Error("No image found for " + query);
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

const targets = {
  rawls: "John Rawls portrait",
  yihwang: "Yi Hwang",
  wonhyo: "Wonhyo",
  zhuangzi: "Zhuangzi portrait",
  sartre: "Jean-Paul Sartre 1967",
  nietzsche: "Friedrich Nietzsche 1882"
};

async function run() {
  for (const [id, q] of Object.entries(targets)) {
    const dest = path.join(dir, `${id}.jpg`);
    try {
      await sleep(1000);
      const url = await searchWikiImage(q);
      console.log(`[Found] ${id} -> ${url}`);
      await sleep(1000);
      await downloadImage(url, dest);
      console.log(`[SAVED] ${id}.jpg (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`[FAIL] ${id}:`, e.message);
    }
  }
}

run();
