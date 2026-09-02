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
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buf));
}

// 🏛️ 검증된 고화질 표준 인물화 직접 링크 (얼굴이 명확한 버전)
const fixedSources = {
  // 퇴계 이황 공식 표준영정 (얼굴/흉상 선명한 버전)
  yihwang: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Yi_Hwang_Portrait.jpg/500px-Yi_Hwang_Portrait.jpg",
    "https://pimg.mk.co.kr/meet/neds/2018/04/image_readmed_2018_242201_15238630923278682.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Yi_Hwang_Portrait.jpg"
  ],
  // 장자 선인 전통 초상화 (얼굴 선명한 버전)
  zhuangzi: [
    "https://cdn.ibulgyo.com/news/photo/202106/212408_226187_374.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zhuangzi.jpg/500px-Zhuangzi.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Zhuangzi.jpg"
  ],
  // 공자 표준 영정
  confucius: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Confucius_Tang_Dynasty.jpg/500px-Confucius_Tang_Dynasty.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/9/9f/Confucius_Tang_Dynasty.jpg"
  ],
  // 원효대사 표준 영정
  wonhyo: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Wonhyo.jpg/500px-Wonhyo.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/ab/Wonhyo.jpg"
  ]
};

async function run() {
  for (const [id, urls] of Object.entries(fixedSources)) {
    const dest = path.join(dir, `${id}.jpg`);
    let ok = false;
    for (const u of urls) {
      try {
        await sleep(500);
        await download(u, dest);
        console.log(`[SUCCESS] ${id}.jpg saved (${fs.statSync(dest).size} bytes) from ${u}`);
        ok = true;
        break;
      } catch (e) {
        console.warn(`[Retry] ${id} with ${u} failed:`, e.message);
      }
    }
    if (!ok) {
      console.error(`[FAIL] ${id}`);
    }
  }
}

run();
