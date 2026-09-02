import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

async function run() {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=Yi_Hwang&prop=images&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MindDialogue/1.0' } });
  const data = await res.json();
  console.log("English Wiki Yi Hwang Images:", JSON.stringify(data, null, 2));
}

run();
