const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images', 'philosophers');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Wikimedia 직접 원본 파일 링크
const sources = {
  socrates: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Socrate_du_Louvre.jpg",
  confucius: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Confucius_Tang_Dynasty.jpg",
  epicurus: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Epicurus_bust.jpg",
  kant: "https://upload.wikimedia.org/wikipedia/commons/4/43/Immanuel_Kant_%28painted_portrait%29.jpg",
  bentham: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Jeremy_Bentham_by_Henry_William_Pickersgill_detail.jpg",
  rawls: "https://upload.wikimedia.org/wikipedia/commons/0/07/John_Rawls_%281971%29.jpg",
  yihwang: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Yi_Hwang_Portrait.jpg",
  wonhyo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Wonhyo.jpg",
  zhuangzi: "https://upload.wikimedia.org/wikipedia/commons/0/05/Zhuangzi.jpg",
  spinoza: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Spinoza.jpg",
  sartre: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Sartre_1967_crop.jpg",
  nietzsche: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Nietzsche187a.jpg"
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = new URL(url);
    const reqOptions = {
      protocol: options.protocol,
      hostname: options.hostname,
      path: options.pathname + options.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(reqOptions, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Redirect
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [id, url] of Object.entries(sources)) {
    const dest = path.join(dir, `${id}.jpg`);
    try {
      await download(url, dest);
      console.log(`[Success] ${id}.jpg saved (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`[Error] ${id}:`, e.message);
    }
  }
}

run();
