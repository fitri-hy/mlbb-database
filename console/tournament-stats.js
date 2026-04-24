const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const id = new Date().getFullYear().toString().slice(-2);

const URL = `https://mlbb.io/api/tournament/${id}/stats`;

const ROOT = path.join(__dirname, '../storage');
const DIR = path.join(ROOT, 'tournament');
const OUTPUT = path.join(DIR, 'tournament-stats.json');

async function run() {
  try {
    console.log('Fetching tournament stats...');

    const { data } = await axios.get(URL);
    if (!data) throw new Error('Empty response');

    await fs.ensureDir(DIR);
    await fs.writeJson(OUTPUT, data, { spaces: 2 });

    console.log('Saved: tournament-stats.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();