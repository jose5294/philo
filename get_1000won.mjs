import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

async function getWikiFileDirectUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MindDialogue/1.0' } });
  const data = await res.json();
  for (const p of Object.values(data.query?.pages || {})) {
    if (p.imageinfo?.[0]) {
      return p.imageinfo[0].thumburl || p.imageinfo[0].url;
    }
  }
  return null;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'MindDialogue/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

async function run() {
  const imgUrl = await getWikiFileDirectUrl("File:1000 won serieIII obverse.jpeg");
  if (imgUrl) {
    console.log("Found 1000 won:", imgUrl);
    await download(imgUrl, path.join(dir, "yihwang.jpg"));
    console.log("Downloaded yihwang.jpg (1000 won)");
  }
}

run();
