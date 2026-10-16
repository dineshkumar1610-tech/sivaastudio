import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const envContent = fs.readFileSync(".env.local", "utf8");
let supabaseUrl = "";
let supabaseAnonKey = "";
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
    supabaseUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
  }
  if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
    supabaseAnonKey = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function optimizeAndUpload() {
  const dataPath = path.join(process.cwd(), "data", "portfolio.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  console.log(`Checking & optimizing ${data.works.length} works...`);

  for (let i = 0; i < data.works.length; i++) {
    const work = data.works[i];

    // Find local file corresponding to this work
    let localPath = "";
    if (work.src.includes("/storage/v1/object/public/gallery/")) {
      const parts = work.src.split("/storage/v1/object/public/gallery/");
      const storageKey = decodeURIComponent(parts[1]); // e.g. "Wedding/1790878530238-0-07_jpg.jpeg"
      const filename = path.basename(storageKey);

      // check public/uploads/
      const pUpload = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(pUpload)) {
        localPath = pUpload;
      } else {
        // check public/assets recursively
        const findInDir = (dir) => {
          for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, ent.name);
            if (ent.isDirectory()) {
              const res = findInDir(p);
              if (res) return res;
            } else if (ent.name === filename) {
              return p;
            }
          }
          return null;
        };
        localPath = findInDir(path.join(process.cwd(), "public", "assets"));
      }
    } else {
      // Local path with possible %20
      const cleanRel = decodeURIComponent(work.src.startsWith("/") ? work.src.slice(1) : work.src);
      localPath = path.join(process.cwd(), "public", cleanRel);
    }

    if (!localPath || !fs.existsSync(localPath)) {
      console.warn(`[WARN] Could not find local file for work #${i}: ${work.title}`);
      continue;
    }

    const fileStats = fs.statSync(localPath);
    const origSizeMb = (fileStats.size / (1024 * 1024)).toFixed(2);

    // If file is large (> 1.5MB) or wasn't uploaded yet, optimize it with sharp to sRGB and max 2560px
    const needsOptimization = fileStats.size > 1.5 * 1024 * 1024 || !work.src.includes("supabase.co");

    if (needsOptimization) {
      console.log(`Optimizing [${i + 1}/${data.works.length}] (${origSizeMb} MB): ${work.title}...`);
      try {
        const inputBuffer = fs.readFileSync(localPath);
        // Fix color space and resize large camera photos
        const optimizedBuffer = await sharp(inputBuffer, { failOnError: false })
          .rotate() // auto-orient based on EXIF
          .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
          .toColorspace("srgb") // FIXES GLib-GObject-CRITICAL space 32 error!
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();

        const newSizeMb = (optimizedBuffer.length / (1024 * 1024)).toFixed(2);
        console.log(`  -> Shrunk from ${origSizeMb} MB to ${newSizeMb} MB`);

        const filename = path.basename(localPath).replace(/\.[^/.]+$/, "") + ".jpeg";
        const categoryFolder = (work.cat || "general").replace(/[^a-zA-Z0-9_-]/g, "_");
        const storagePath = `${categoryFolder}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(storagePath, optimizedBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error(`  Upload error for ${storagePath}:`, uploadError.message);
        } else {
          const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(storagePath);
          if (urlData?.publicUrl) {
            work.src = urlData.publicUrl;
          }
        }
      } catch (err) {
        console.error(`  Optimization failed for ${localPath}:`, err.message);
      }
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
  console.log("\nAll images checked and optimized in portfolio.json and Supabase Storage!");
}

optimizeAndUpload().catch(console.error);
