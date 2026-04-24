const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const URL = 'https://mlbb.io/api/hero/counter-pick-suggestions';

const ROOT = path.join(__dirname, '../storage');
const HERO_LIST = path.join(ROOT, 'hero-list.json');
const OUTPUT_DIR = path.join(ROOT, 'counter');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  try {
    console.log('Loading heroes...');

    if (!(await fs.pathExists(HERO_LIST))) {
      throw new Error('hero-list.json not found');
    }

    const { data: heroes } = await fs.readJson(HERO_LIST);
    if (!Array.isArray(heroes)) throw new Error('Invalid hero list');

    await fs.ensureDir(OUTPUT_DIR);

    console.log(`Processing ${heroes.length} heroes...`);

    for (const hero of heroes) {
      const id = hero.id;

      try {
        const { data } = await axios.post(URL, {
          enemyHeroes: [id],
        });

        const file = path.join(OUTPUT_DIR, `${id}.json`);
        await fs.writeJson(file, data, { spaces: 2 });

        console.log(`Saved counter: ${id}`);
        await delay(300);
      } catch (err) {
        console.error(`Hero ${id}:`, err.message);
      }
    }

    console.log('Done counter data');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();