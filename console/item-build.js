const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BASE = 'https://mlbb.io/api';

const ROOT = path.join(__dirname, '../storage');
const BUILD_DIR = path.join(ROOT, 'build');
const HERO_LIST = path.join(ROOT, 'hero-list.json');

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  try {
    console.log('Loading hero list...');

    const raw = await fs.readJson(HERO_LIST);

    if (!raw || !Array.isArray(raw.data)) {
      throw new Error('Invalid hero list: missing data array');
    }

    const heroes = raw.data;

    await fs.ensureDir(BUILD_DIR);

    for (const hero of heroes) {
      const { id, hero_name: name } = hero;

      if (!id || !name) {
        console.warn('Skipping invalid hero:', hero);
        continue;
      }

      try {
        const { data } = await axios.get(
          `${BASE}/item/item-build/hero/${encodeURIComponent(name)}`
        );

        const file = path.join(BUILD_DIR, `${id}.json`);
        await fs.writeJson(file, data, { spaces: 2 });

        console.log(`Saved build ${id} - ${name}`);

        await delay(200);
      } catch (err) {
        console.error(`Hero ${id} (${name}):`, err.message);
      }
    }

    console.log('Done item build');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();