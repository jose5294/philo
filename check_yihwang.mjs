import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images', 'philosophers');

async function run() {
  const url = `https://ko.wikipedia.org/w/api.php?action=query&titles=%EC%9D%B4%ED%99%A9&prop=images&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MindDialogue/1.0' } });
  const data = await res.json();
  console.log("Images in Yi Hwang page:", JSON.stringify(data, null, 2));
}

run();
