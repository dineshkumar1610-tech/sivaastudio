import fs from "fs";
import path from "path";

const data = JSON.parse(fs.readFileSync("data/portfolio.json", "utf8"));
console.log("Total works in portfolio.json:", data.works.length);

let uploadsCount = 0;
let assetsCount = 0;
let missingCount = 0;

for (const work of data.works) {
  const localPath = path.join(process.cwd(), "public", work.src);
  const exists = fs.existsSync(localPath);
  if (work.src.startsWith("/uploads/")) uploadsCount++;
  else if (work.src.startsWith("/assets/")) assetsCount++;
  if (!exists) missingCount++;
}

console.log("Works in /uploads:", uploadsCount);
console.log("Works in /assets:", assetsCount);
console.log("Missing files:", missingCount);
