const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function generateHash() {
  const files = getAllFiles('./src');
  const hash = crypto.createHash('sha256');

  files.forEach((file) => {
    const fileContent = fs.readFileSync(file, 'utf8');
    hash.update(fileContent);
  });

  return hash.digest('hex');
}

console.log('Gerando novo hash para versionamento...');

const hash = generateHash();

// Grava apenas o version.json em assets
const versionJsonPath = path.join(__dirname, 'src', 'assets', 'version.json');
fs.writeFileSync(versionJsonPath, JSON.stringify({ version: hash }));
console.log(`Novo version.json criado: ${versionJsonPath}`);
console.log(`Hash: ${hash}`);
