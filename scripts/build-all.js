const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[JobLens Build] Installing frontend dependencies...');
execSync('npm install --legacy-peer-deps', {
  cwd: path.join(__dirname, '..', 'joblens-frontend'),
  stdio: 'inherit'
});

console.log('[JobLens Build] Building frontend bundle...');
execSync('npm run build', {
  cwd: path.join(__dirname, '..', 'joblens-frontend'),
  env: { ...process.env, CI: 'false' },
  stdio: 'inherit'
});

console.log('[JobLens Build] Copying build artifacts to root build directory...');
const src = path.join(__dirname, '..', 'joblens-frontend', 'build');
const dest = path.join(__dirname, '..', 'build');
fs.cpSync(src, dest, { recursive: true });

console.log('[JobLens Build] Build and deployment preparation complete!');
