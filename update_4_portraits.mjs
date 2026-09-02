import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MindDialogueApp/1.0 (contact@minddialogue.edu)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

// 🏛️ 얼굴 중심 선명한 고화질 영정/초상화 URL 후보
const customUrls = {
  // 공자: 얼굴 클로즈업 영정
  confucius: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Confucius_tang.jpg/500px-Confucius_tang.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Confucius_Tang_Dynasty.jpg/500px-Confucius_Tang_Dynasty.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Confucius_-_Project_Gutenberg_eText_15250.jpg/450px-Confucius_-_Project_Gutenberg_eText_15250.jpg"
  ],
  // 이황: 퇴계 이황 표준영정 (1,000원권 초상화)
  yihwang: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Yi_Hwang_Portrait.jpg/500px-Yi_Hwang_Portrait.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Yi_Hwang.jpg/450px-Yi_Hwang.jpg"
  ],
  // 원효: 원효대사 얼굴 중심 표준영정
  wonhyo: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Wonhyo.jpg/500px-Wonhyo.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Wonhyo_daesa.jpg/450px-Wonhyo_daesa.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/%EC%9B%90%ED%9A%A8%EB%8C%80%EC%82%AC_%EC%98%81%EC%A0%95.JPG/500px-%EC%9B%90%ED%9A%A8%EB%8C%80%EC%82%AC_%EC%98%81%EC%A0%95.JPG"
  ],
  // 장자: 장자 얼굴 중심 초상화
  zhuangzi: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zhuangzi.jpg/500px-Zhuangzi.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Zhuangzi.jpg/450px-Zhuangzi.jpg"
  ]
};

async function run() {
  for (const [id, urls] of Object.entries(customUrls)) {
    const dest = path.join(dir, `${id}.jpg`);
    let success = false;
    for (const url of urls) {
      try {
        await sleep(1000);
        await download(url, dest);
        console.log(`[UPDATED] ${id}.jpg saved (${fs.statSync(dest).size} bytes) from ${url}`);
        success = true;
        break;
      } catch (e) {
        console.warn(`[Retry] ${id} with ${url} failed:`, e.message);
      }
    }
    if (!success) {
      console.error(`[FAIL] ${id}`);
    }
  }
}

run();
