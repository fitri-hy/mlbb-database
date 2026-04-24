const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const scriptDir = path.join(__dirname, 'console');
const logFile = path.join(__dirname, 'last-updated.txt');

const scripts = [
  'hero-tier.js',
  'hero-list.js',
  'hero-statistics.js',
  'hero-detail.js',
  'hero-counter.js',
  'item-list.js',
  'emblem-list.js',
  'ability-list.js',
  'tournament-list.js',
  'tournament-stats.js',
  'tournament-summary.js',
  'item-build.js',
];

function runScript(file) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(scriptDir, file);

    console.log(`\n▶ Running: ${file}`);

    const child = spawn('node', [fullPath], {
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`${file} exited with code ${code}`);
        return reject(new Error(`Exit code ${code}`));
      }

      console.log(`Done: ${file}`);
      resolve();
    });

    child.on('error', (err) => {
      console.error(`${file} error:`, err.message);
      reject(err);
    });
  });
}

async function writeLog() {
  const now = new Date();

  const formatted = now.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const content = `Last generated: ${formatted}`;

  await fs.writeFile(logFile, content, 'utf8');

  console.log(`Log saved: ${logFile}`);
}

async function runAll() {
  console.log('Start running all scripts...\n');

  for (const script of scripts) {
    try {
      await runScript(script);
    } catch (err) {
      console.error(`Stopped at ${script}`);
      return;
    }
  }

  await writeLog();

  console.log('All processes are complete!');
}

runAll();