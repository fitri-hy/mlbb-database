const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const URL = 'https://mlbb.io/api/hero/all-heroes';

const ROOT = path.join(__dirname, '../storage');
const OUTPUT = path.join(ROOT, 'hero-list.json');

async function run() {
  try {
    console.log('Fetching hero list...');

    const { data } = await axios.get(URL);
    if (!data) throw new Error('Empty response');

    await fs.ensureDir(ROOT);
    await fs.writeJson(OUTPUT, data, { spaces: 2 });

    console.log('Saved: hero-list.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();