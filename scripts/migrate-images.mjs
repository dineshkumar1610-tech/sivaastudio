import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

async function migrateImages() {
  const dataPath = path.join(process.cwd(), "data", "portfolio.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  console.log(`Starting migration for ${data.works.length} works...`);

  let migratedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < data.works.length; i++) {
    const work = data.works[i];

    // If already hosted on Supabase, skip
    if (work.src.includes("supabase.co")) {
      skippedCount++;
      continue;
    }

    // Only migrate local files
    const localRelPath = work.src.startsWith("/") ? work.src.slice(1) : work.src;
    const localAbsPath = path.join(process.cwd(), "public", localRelPath);

    if (!fs.existsSync(localAbsPath)) {
      console.warn(`[WARN] File not found on disk: ${localAbsPath}`);
      failedCount++;
      continue;
    }

    const fileBuffer = fs.readFileSync(localAbsPath);
    const filename = path.basename(localAbsPath);
    const categoryFolder = (work.cat || "general").replace(/[^a-zA-Z0-9_-]/g, "_");
    const storagePath = `${categoryFolder}/${filename}`;

    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
    };
    const contentType = mimeTypes[ext] || "image/jpeg";

    console.log(`Uploading [${i + 1}/${data.works.length}]: ${work.title} (${storagePath})...`);

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload ${work.src}:`, uploadError.message);
      failedCount++;
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(storagePath);

    if (publicUrlData?.publicUrl) {
      work.src = publicUrlData.publicUrl;
      migratedCount++;
    }
  }

  // Save updated portfolio.json
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

  console.log("\n--- Migration Summary ---");
  console.log(`Successfully migrated: ${migratedCount}`);
  console.log(`Already migrated / skipped: ${skippedCount}`);
  console.log(`Failed / missing: ${failedCount}`);

  // Also check if portfolio_works table exists and insert
  const { error: tableError } = await supabase.from("portfolio_works").select("id").limit(1);
  if (!tableError) {
    console.log("\nSyncing all works to Supabase database table 'portfolio_works'...");
    for (const w of data.works) {
      await supabase.from("portfolio_works").upsert({
        id: w.id,
        title: w.title,
        cat: w.cat,
        year: w.year,
        src: w.src,
        tall: !!w.tall,
      });
    }
    console.log("Database table synchronized!");
  } else {
    console.log("\nNote: 'portfolio_works' table not yet created in Supabase database.");
  }
}

migrateImages().catch(console.error);
