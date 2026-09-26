const { execSync } = require('child_process');
const fs = require('fs');

console.log('[JobLens] Installing frontend dependencies...');
execSync('npm install', { cwd: 'joblens-frontend', stdio: 'inherit', env: { ...process.env, CI: 'false' } });

// Explicitly ensure ThreeUI is patched if postinstall was skipped
try {
  require('./joblens-frontend/scripts/patch-threeui.js');
} catch (e) {
  console.log('[JobLens] Note on patch-threeui:', e.message);
}

console.log('[JobLens] Building frontend production bundle...');
execSync('npm run build', { cwd: 'joblens-frontend', stdio: 'inherit', env: { ...process.env, CI: 'false' } });

if (fs.existsSync('joblens-frontend/build')) {
  fs.cpSync('joblens-frontend/build', 'build', { recursive: true });
  console.log('[JobLens] Synced build artifacts to root output directory.');
}
console.log('[JobLens] Build ready for deployment.');
