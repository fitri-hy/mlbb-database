const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const URL = 'https://mlbb.io/api/tournament/all';

const ROOT = path.join(__dirname, '../storage');
const DIR = path.join(ROOT, 'tournament');
const OUTPUT = path.join(DIR, 'tournament-list.json');

async function run() {
  try {
    console.log('Fetching tournament list...');

    const { data } = await axios.get(URL);
    if (!data) throw new Error('Empty response');

    await fs.ensureDir(DIR);
    await fs.writeJson(OUTPUT, data, { spaces: 2 });

    console.log('Saved: tournament-list.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();