import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lpzxetdffcyckdshihgs.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwenhldGRmZmN5Y2tkc2hpaGdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjE1MzczNCwiZXhwIjoyMTA3NzI5NzM0fQ.zd0xFatpwgxcCzqK32dT_gXYQyt5CuwjG7pFu5mGSxE";
const bucketName = "gallery";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);

  // 1. Ensure bucket exists and is public
  const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
  if (bucketListError) {
    console.error("Error listing buckets:", bucketListError.message);
  } else {
    const existing = buckets.find((b) => b.name === bucketName);
    if (!existing) {
      console.log(`Creating bucket "${bucketName}"...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      if (createError) {
        console.error("Failed to create bucket:", createError.message);
      } else {
        console.log(`Bucket "${bucketName}" created successfully!`);
      }
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
      if (!existing.public) {
        console.log(`Updating "${bucketName}" to public...`);
        await supabase.storage.updateBucket(bucketName, { public: true });
      }
    }
  }

  // 2. Read local portfolio.json
  const portfolioPath = path.join(process.cwd(), "data", "portfolio.json");
  if (!fs.existsSync(portfolioPath)) {
    console.error("portfolio.json not found!");
    return;
  }

  const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));
  console.log(`Loaded ${portfolio.works?.length || 0} works across ${portfolio.categories?.length || 0} categories.`);

  // 3. Upload each image to Supabase Storage
  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < portfolio.works.length; i++) {
    const item = portfolio.works[i];
    let localFilePath = "";

    if (item.src.startsWith("/")) {
      localFilePath = path.join(process.cwd(), "public", decodeURIComponent(item.src));
    } else if (item.src.startsWith("http")) {
      // If it's already a URL from this new project, skip upload
      if (item.src.includes("lpzxetdffcyckdshihgs.supabase.co")) {
        skippedCount++;
        continue;
      }
      // If it's an old URL or external, check if filename exists in public/uploads or public/assets
      const filename = path.basename(decodeURIComponent(item.src.split("?")[0]));
      const possibleUpload = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(possibleUpload)) {
        localFilePath = possibleUpload;
      }
    }

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.warn(`[${i + 1}/${portfolio.works.length}] File not found locally for: ${item.title} (${item.src})`);
      errorCount++;
      continue;
    }

    const safeCategory = (item.cat || "general").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = path.basename(localFilePath);
    const storagePath = `${safeCategory}/${filename}`;

    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload error for ${storagePath}:`, uploadError.message);
        errorCount++;
      } else {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);

        const newSrc = urlData.publicUrl;
        item.src = newSrc;
        uploadedCount++;
        console.log(`[${i + 1}/${portfolio.works.length}] Uploaded: ${item.title} -> ${storagePath}`);
      }
    } catch (err) {
      console.error(`Exception uploading ${localFilePath}:`, err.message);
      errorCount++;
    }
  }

  // 4. Save updated portfolio.json with new Supabase URLs
  fs.writeFileSync(portfolioPath, JSON.stringify(portfolio, null, 2), "utf-8");
  console.log(`\nUpdated portfolio.json: ${uploadedCount} uploaded, ${skippedCount} already synced, ${errorCount} errors.`);

  // 5. Try syncing to PostgreSQL database tables if they exist
  try {
    console.log("\nAttempting to sync database tables (categories and portfolio_works)...");
    
    // Sync categories
    if (portfolio.categories && portfolio.categories.length > 0) {
      const catRows = portfolio.categories.map((c) => ({ name: c }));
      const { error: catError } = await supabase
        .from("categories")
        .upsert(catRows, { onConflict: "name" });

      if (catError) {
        console.log("Note for categories table:", catError.message);
      } else {
        console.log(`Successfully synced ${catRows.length} categories to 'categories' table!`);
      }
    }

    // Sync portfolio_works
    if (portfolio.works && portfolio.works.length > 0) {
      const workRows = portfolio.works.map((w) => ({
        id: w.id || `work-${Math.random().toString(36).substring(2, 9)}`,
        src: w.src,
        title: w.title,
        category: w.cat,
        year: w.year || new Date().getFullYear().toString(),
        tall: Boolean(w.tall),
      }));

      const { error: workError } = await supabase
        .from("portfolio_works")
        .upsert(workRows, { onConflict: "id" });

      if (workError) {
        console.log("Note for portfolio_works table:", workError.message);
      } else {
        console.log(`Successfully synced ${workRows.length} works to 'portfolio_works' table!`);
      }
    }
  } catch (dbErr) {
    console.log("Database table sync note:", dbErr.message);
  }

  console.log("\nAll Done!");
}

main().catch(console.error);
