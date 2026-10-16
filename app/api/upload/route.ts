import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { generateAiTitle } from "@/lib/aiTitle";
import { supabase } from "@/lib/supabase";

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

function getPortfolioData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading portfolio data:", error);
  }
  return { categories: [], works: [] };
}

function savePortfolioData(data: PortfolioData) {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
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

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const data = getPortfolioData();
    if (!data.categories.includes(category)) {
      data.categories.push(category);
      data.categories.sort((a: string, b: string) => a.localeCompare(b));
    }

    const uploadedWorks = [];

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
      const filePath = path.join(uploadsDir, filename);

      // Optimize with sharp: normalize colorspace to sRGB, orient, resize, and compress
      let uploadBuffer = buffer;
      let isTall = i % 2 === 0;
      let contentType = file.type || "image/jpeg";

      try {
        const pipeline = sharp(buffer).rotate();
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
        console.warn("Sharp optimization failed, using original buffer:", sharpErr);
      }

      fs.writeFileSync(filePath, uploadBuffer);

      // Upload to Supabase Storage ('gallery' bucket)
      let src = `/uploads/${filename}`;
      try {
        const safeCatFolder = category.replace(/[^a-zA-Z0-9_-]/g, "_");
        const storagePath = `${safeCatFolder}/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(storagePath, uploadBuffer, {
            contentType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("gallery")
            .getPublicUrl(storagePath);
          if (publicData?.publicUrl) {
            src = publicData.publicUrl;
          }
        } else {
          console.warn("Supabase storage upload failed, using local file:", uploadError.message);
        }
      } catch (sbErr) {
        console.warn("Supabase upload exception, using local file:", sbErr);
      }

      // AI title according to image & category
      const title =
        customTitle && files.length === 1 && customTitle.trim()
          ? customTitle.trim()
          : generateAiTitle(category, file.name, isTall);

      const newWork = {
        id: `up-${Date.now()}-${i}`,
        src,
        title: title || `${category} #${data.works.length + 1}`,
        year: year,
        cat: category,
        tall: isTall,
      };

      uploadedWorks.push(newWork);
      data.works.unshift(newWork); // Add to beginning so newly uploaded appears first!
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
