import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

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

// 🏛️ 공식 표준 영정 파일명 (위키미디어)
const queries = {
  // 이황 표준영정
  yihwang: [
    "File:퇴계_이황_영정.jpg",
    "File:Yi Hwang Portrait.jpg",
    "File:Korea-Toegye-Yi.Hwang-01.jpg",
    "File:Yi_Hwang.jpg"
  ],
  // 공자 얼굴 중심 표준 초상
  confucius: [
    "File:Confucius_Tang_Dynasty.jpg",
    "File:Confucius_tang.jpg",
    "File:Kong_Fuzi.jpg"
  ],
  // 장자 표준 초상
  zhuangzi: [
    "File:Zhuangzi.jpg",
    "File:Zhuangzi_-_Project_Gutenberg_eText_15250.jpg"
  ]
};

async function run() {
  for (const [id, titles] of Object.entries(queries)) {
    const dest = path.join(dir, `${id}.jpg`);
    for (const t of titles) {
      try {
        await sleep(1000);
        const imgUrl = await getWikiFileDirectUrl(t);
        if (imgUrl) {
          console.log(`[Found API] ${id} (${t}) -> ${imgUrl}`);
          await sleep(1000);
          await download(imgUrl, dest);
          console.log(`[SUCCESS] ${id}.jpg saved (${fs.statSync(dest).size} bytes)`);
          break;
        }
      } catch (e) {
        console.warn(`[Retry] ${id} ${t}:`, e.message);
      }
    }
  }
}

run();
