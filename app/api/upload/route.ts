import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateAiTitle } from "@/lib/aiTitle";
import { getServiceSupabase, supabaseBucket, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface WorkItem {
  id?: string;
  src: string;
  title: string;
  year: string;
  cat: string;
  tall?: boolean;
}

interface PortfolioData {
  categories: string[];
  works: WorkItem[];
}

const dataFilePath = path.join(process.cwd(), "data", "portfolio.json");

// Read portfolio from local file
function getPortfolioData(): PortfolioData {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading local portfolio data:", error);
  }
  return { categories: [], works: [] };
}

// Save portfolio to local file
function savePortfolioData(data: PortfolioData): void {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write portfolio data to disk:", err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "General";
    const customTitle = formData.get("title") as string;
    const year = (formData.get("year") as string) || new Date().getFullYear().toString();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const data = getPortfolioData();
    if (!data.categories.includes(category)) {
      data.categories.push(category);
      data.categories.sort((a: string, b: string) => a.localeCompare(b));
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedWorks: WorkItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== "function") continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeBaseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${Date.now()}-${i}-${safeBaseName}${ext}`;

      // Optimize with sharp: normalize colorspace to sRGB, resize, and compress
      let uploadBuffer = buffer;
      let isTall = i % 2 === 0;
      let contentType = file.type || "image/jpeg";

      try {
        const sharpModule = (await import("sharp")).default;
        const pipeline = sharpModule(buffer).rotate();
        const meta = await pipeline.metadata();
        if (meta.width && meta.height) {
          isTall = meta.height > meta.width;
        }
        uploadBuffer = await pipeline
          .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
          .toColorspace("srgb")
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
        contentType = "image/jpeg";
      } catch (sharpErr) {
        console.warn("Sharp optimization skipped, using original buffer:", sharpErr);
      }

      // Save to local public/uploads as backup/cache
      const outputFilename = contentType === "image/jpeg" && !filename.endsWith(".jpg")
        ? filename.replace(/\.[^/.]+$/, ".jpg")
        : filename;

      try {
        fs.writeFileSync(path.join(uploadsDir, outputFilename), uploadBuffer);
      } catch (localErr) {
        console.warn("Could not save local file backup:", localErr);
      }

      let src = `/uploads/${outputFilename}`;

      // Upload to Supabase Storage if configured
      if (isSupabaseConfigured()) {
        const supabase = getServiceSupabase();
        if (supabase) {
          const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, "_");
          const storagePath = `${safeCategory}/${outputFilename}`;

          try {
            const { error: uploadError } = await supabase.storage
              .from(supabaseBucket)
              .upload(storagePath, uploadBuffer, {
                contentType,
                upsert: true,
              });

            if (uploadError) {
              console.error("Supabase storage upload error:", uploadError.message);
            } else {
              const { data: publicUrlData } = supabase.storage
                .from(supabaseBucket)
                .getPublicUrl(storagePath);

              if (publicUrlData && publicUrlData.publicUrl) {
                src = publicUrlData.publicUrl;
              }
            }
          } catch (supErr) {
            console.error("Failed to upload to Supabase, fell back to local file:", supErr);
          }
        }
      }

      // AI title according to image & category
      const title =
        customTitle && files.length === 1 && customTitle.trim()
          ? customTitle.trim()
          : generateAiTitle(category, file.name, isTall);

      const newWork: WorkItem = {
        id: `up-${Date.now()}-${i}`,
        src,
        title: title || `${category} #${data.works.length + 1}`,
        year: year,
        cat: category,
        tall: isTall,
      };

      uploadedWorks.push(newWork);
      data.works.unshift(newWork);
    }

    // Also persist works and category to Supabase database table
    if (isSupabaseConfigured() && uploadedWorks.length > 0) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const rows = uploadedWorks.map((w) => ({
          id: w.id,
          src: w.src,
          title: w.title,
          category: w.cat,
          year: w.year,
          tall: Boolean(w.tall),
        }));
        try {
          await supabase.from("portfolio_works").upsert(rows, { onConflict: "id" });
          await supabase.from("categories").upsert({ name: category }, { onConflict: "name" });
        } catch (e) {
          console.warn("Supabase upload db sync warning:", e);
        }
      }
    }

    savePortfolioData(data);

    return NextResponse.json({
      success: true,
      uploadedWorks,
      allWorks: data.works,
      categories: data.categories,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload images";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
