const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const URL =
  'https://mlbb.io/api/hero/filtered-statistics?rankId=1&timeframeId=1';

const ROOT = path.join(__dirname, '../storage');
const OUTPUT = path.join(ROOT, 'hero-statistics.json');

async function run() {
  try {
    console.log('Fetching hero statistics...');

    const { data } = await axios.get(URL);
    if (!data) throw new Error('Empty response');

    await fs.ensureDir(ROOT);
    await fs.writeJson(OUTPUT, data, { spaces: 2 });

    console.log('Saved: hero-statistics.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();