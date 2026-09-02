import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const sources = {
  socrates: [
    "https://upload.wikimedia.org/wikipedia/commons/b/bc/Socrate_du_Louvre.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a4/Socrates_Louvre.jpg"
  ],
  confucius: [
    "https://upload.wikimedia.org/wikipedia/commons/9/9b/Confucius_-_Project_Gutenberg_eText_15250.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/8/87/Confucius_Tang_Dynasty.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/4f/Confucius_Statue_at_Confucius_Temple.jpg"
  ],
  epicurus: [
    "https://upload.wikimedia.org/wikipedia/commons/2/29/Epicurus_-_Museo_Capitolino_-_MC1075.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/a/ad/Epicurus_bust2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/06/Epicurus_-_British_Museum.jpg"
  ],
  kant: [
    "https://upload.wikimedia.org/wikipedia/commons/4/43/Immanuel_Kant_%28painted_portrait%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f2/Kant_gemaelde_3.jpg"
  ],
  bentham: [
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Jeremy_Bentham_by_Henry_William_Pickersgill_detail.jpg"
  ],
  rawls: [
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/John_Rawls_%281971%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/e/eb/John_Rawls_1971.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/07/John_Rawls_%281971%29.jpg"
  ],
  yihwang: [
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Yi_Hwang_Portrait.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/4e/Yi_Hwang.jpg"
  ],
  wonhyo: [
    "https://upload.wikimedia.org/wikipedia/commons/a/ab/Wonhyo.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Wonhyo_daesa.jpg"
  ],
  zhuangzi: [
    "https://upload.wikimedia.org/wikipedia/commons/4/45/Zhuangzi_-_Project_Gutenberg_eText_15250.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Zhuangzi.jpg"
  ],
  spinoza: [
    "https://upload.wikimedia.org/wikipedia/commons/e/ea/Spinoza.jpg"
  ],
  sartre: [
    "https://upload.wikimedia.org/wikipedia/commons/e/ef/Sartre_1967_crop.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/Jean-Paul_Sartre_1967.jpg"
  ],
  nietzsche: [
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nietzsche187a.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f6/Friedrich_Nietzsche_%281882%29.jpg"
  ]
};

async function downloadSingle(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MindDialogueEducationalApp/1.0 (contact@minddialogue.edu)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function run() {
  for (const [id, urls] of Object.entries(sources)) {
    const dest = path.join(dir, `${id}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[Skip] ${id}.jpg already exists (${fs.statSync(dest).size} bytes)`);
      continue;
    }

    let success = false;
    for (const u of urls) {
      try {
        await sleep(1500); // polite delay
        const buffer = await downloadSingle(u);
        fs.writeFileSync(dest, buffer);
        console.log(`[Success] ${id}.jpg saved (${buffer.length} bytes) from ${u}`);
        success = true;
        break;
      } catch (err) {
        console.warn(`[Retry] ${id} with ${u} failed:`, err.message);
      }
    }

    if (!success) {
      console.error(`[FAILED ALL] ${id}`);
    }
  }
}

run();
