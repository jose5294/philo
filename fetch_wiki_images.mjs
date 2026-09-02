import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const wikiFiles = {
  socrates: "File:Socrate_du_Louvre.jpg",
  confucius: "File:Confucius_Tang_Dynasty.jpg",
  epicurus: "File:Epicurus_bust.jpg",
  kant: "File:Immanuel_Kant_(painted_portrait).jpg",
  bentham: "File:Jeremy_Bentham_by_Henry_William_Pickersgill_detail.jpg",
  rawls: "File:John_Rawls_(1971).jpg",
  yihwang: "File:Yi_Hwang_Portrait.jpg",
  wonhyo: "File:Wonhyo.jpg",
  zhuangzi: "File:Zhuangzi.jpg",
  spinoza: "File:Spinoza.jpg",
  sartre: "File:Sartre_1967_crop.jpg",
  nietzsche: "File:Nietzsche187a.jpg"
};

async function getImageUrlFromWiki(fileTitle) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&iiurlwidth=480&format=json`;
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
  throw new Error("No image URL found in wiki API response");
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

async function run() {
  for (const [id, fileTitle] of Object.entries(wikiFiles)) {
    const dest = path.join(dir, `${id}.jpg`);
    try {
      await sleep(1000);
      const imgUrl = await getImageUrlFromWiki(fileTitle);
      console.log(`[API Found] ${id} -> ${imgUrl}`);
      await sleep(1000);
      await downloadImage(imgUrl, dest);
      console.log(`[SAVED] ${id}.jpg (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`[FAILED] ${id} (${fileTitle}):`, e.message);
    }
  }
}

run();
