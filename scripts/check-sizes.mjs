import fs from "fs";
import path from "path";

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(fullPath));
    } else {
      const stats = fs.statSync(fullPath);
      files.push({ path: fullPath, sizeMb: (stats.size / (1024 * 1024)).toFixed(2), sizeBytes: stats.size });
    }
  }
  return files;
}

const uploads = scanDir("public/uploads");
const assets = scanDir("public/assets");
const all = [...uploads, ...assets];
all.sort((a, b) => b.sizeBytes - a.sizeBytes);

console.log("Top 15 largest files:");
all.slice(0, 15).forEach(f => console.log(`${f.sizeMb} MB - ${f.path}`));
