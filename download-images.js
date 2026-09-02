import fs from 'fs';
import path from 'path';
import https from 'https';

const IMAGES = {
  'socrates.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Socrate_du_Louvre.jpg/480px-Socrate_du_Louvre.jpg',
  'confucius.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Confucius_Tang_Dynasty.jpg/480px-Confucius_Tang_Dynasty.jpg',
  'kant.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Immanuel_Kant_%28painted_portrait%29.jpg/480px-Immanuel_Kant_%28painted_portrait%29.jpg',
  'bentham.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Jeremy_Bentham_by_Henry_William_Pickersgill_detail.jpg/480px-Jeremy_Bentham_by_Henry_William_Pickersgill_detail.jpg',
  'yihwang.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Yi_Hwang_Portrait.jpg/480px-Yi_Hwang_Portrait.jpg',
  'wonhyo.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Wonhyo.jpg/480px-Wonhyo.jpg',
  'zhuangzi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zhuangzi.jpg/480px-Zhuangzi.jpg',
  'spinoza.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Spinoza.jpg/480px-Spinoza.jpg',
  'sartre.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Sartre_1967_crop.jpg/480px-Sartre_1967_crop.jpg',
  'nietzsche.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/480px-Nietzsche187a.jpg',
};

const dir = path.resolve('public/images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function download(url, filename) {
  return new Promise((resolve) => {
    const dest = path.join(dir, filename);
    const file = fs.createWriteStream(dest);

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://en.wikipedia.org/',
        },
      },
      (res) => {
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              console.log(`[Downloaded] ${filename} (${fs.statSync(dest).size} bytes)`);
              resolve(true);
            });
          });
        } else if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location, filename).then(resolve);
        } else {
          console.error(`[Failed] ${filename} - HTTP ${res.statusCode}`);
          resolve(false);
        }
      }
    );

    req.on('error', (err) => {
      console.error(`[Error] ${filename} - ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  for (const [filename, url] of Object.entries(IMAGES)) {
    await download(url, filename);
  }
  console.log('Done downloading images.');
}

run();
