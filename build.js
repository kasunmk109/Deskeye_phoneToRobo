const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

const filesToCopy = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'sw.js',
  'LICENSE'
];

const directoriesToCopy = ['icons'];

function removeDir(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyFile(sourcePath, targetPath) {
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
}

function copyDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      copyFile(sourcePath, targetPath);
    }
  }
}

removeDir(distDir);
ensureDir(distDir);

for (const fileName of filesToCopy) {
  const sourcePath = path.join(rootDir, fileName);
  if (fs.existsSync(sourcePath)) {
    copyFile(sourcePath, path.join(distDir, fileName));
  }
}

for (const directoryName of directoriesToCopy) {
  const sourceDir = path.join(rootDir, directoryName);
  if (fs.existsSync(sourceDir)) {
    copyDirectory(sourceDir, path.join(distDir, directoryName));
  }
}

console.log(`Built static site into ${distDir}`);