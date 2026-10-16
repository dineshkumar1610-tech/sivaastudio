import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateAiTitle } from "@/lib/aiTitle";
import { supabase } from "@/lib/supabase";

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

// Read portfolio from Supabase Storage first, fallback to local file
async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const { data: fileData, error } = await supabase.storage
      .from("gallery")
      .download("metadata/portfolio.json");

    if (!error && fileData) {
      const text = await fileData.text();
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn("Could not fetch portfolio from Supabase storage, using fallback:", err);
  }

  // Local fallback
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

// Save portfolio to Supabase Storage, and safely attempt local disk write if writable
async function savePortfolioData(data: PortfolioData): Promise<void> {
  // 1. Persist to Supabase Storage (always works in serverless/Vercel)
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), "utf8");
    await supabase.storage
      .from("gallery")
      .upload("metadata/portfolio.json", jsonBuffer, {
        contentType: "application/json",
        upsert: true,
      });
  } catch (sbErr) {
    console.warn("Could not persist portfolio to Supabase storage:", sbErr);
  }

  // 2. Best-effort local file write (works in local dev, gracefully ignored on Vercel)
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Read-only filesystem on Vercel serverless — safe to ignore
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

    const data = await getPortfolioData();
    if (!data.categories.includes(category)) {
      data.categories.push(category);
      data.categories.sort((a: string, b: string) => a.localeCompare(b));
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

      // Best-effort local file write (works locally, ignored on Vercel)
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, filename), uploadBuffer);
      } catch {
        // Read-only filesystem on Vercel
      }

      // Upload directly to Supabase Storage ('gallery' bucket)
      let src = `/uploads/${filename}`;
      const safeCatFolder = category.replace(/[^a-zA-Z0-9_-]/g, "_");
      const storagePath = `${safeCatFolder}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(storagePath, uploadBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        throw new Error(
          `Supabase upload failed: ${uploadError.message}. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel Environment Variables.`
        );
      }

      const { data: publicData } = supabase.storage
        .from("gallery")
        .getPublicUrl(storagePath);

      if (publicData?.publicUrl) {
        src = publicData.publicUrl;
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

    await savePortfolioData(data);

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
