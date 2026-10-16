import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

// Read portfolio from Supabase Storage first, fallback to local bundled file
async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const { data: fileData, error } = await supabase.storage
      .from("Sivaa gallery")
      .download("metadata/portfolio.json");

    if (!error && fileData) {
      const text = await fileData.text();
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn("Could not fetch portfolio from Supabase storage, using fallback:", err);
  }

  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error reading local portfolio data:", error);
  }

  return {
    categories: [
      "Baby Shoot",
      "Engagement",
      "Maternity Shoot",
      "Modeling",
      "Pre-Wedding",
      "Sreemantham",
      "Wedding Shooting",
    ],
    works: [],
  };
}

// Save portfolio to Supabase Storage, and safely attempt local disk write if writable
async function savePortfolioData(data: PortfolioData): Promise<void> {
  try {
    const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2), "utf8");
    await supabase.storage
      .from("Sivaa gallery")
      .upload("metadata/portfolio.json", jsonBuffer, {
        contentType: "application/json",
        upsert: true,
      });
  } catch (sbErr) {
    console.warn("Could not persist portfolio to Supabase storage:", sbErr);
  }

  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Read-only filesystem on Vercel — safe to ignore
  }
}

export async function GET() {
  const data = await getPortfolioData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const data = await getPortfolioData();

    if (action === "add_works") {
      const { works: newWorks, category } = body;
      if (!Array.isArray(newWorks) || newWorks.length === 0) {
        return NextResponse.json({ error: "No works provided" }, { status: 400 });
      }
      // Add category if not present
      const cat = (category || "").trim();
      if (cat && !data.categories.includes(cat)) {
        data.categories.push(cat);
        data.categories.sort((a: string, b: string) => a.localeCompare(b));
      }
      // Prepend new works
      data.works = [...newWorks, ...data.works];
      await savePortfolioData(data);
      return NextResponse.json({ success: true, works: data.works, categories: data.categories });
    }

    if (action === "add_category") {
      const { name } = body;
      const trimmed = (name || "").trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
      if (!data.categories.includes(trimmed)) {
        data.categories.push(trimmed);
        data.categories.sort((a: string, b: string) => a.localeCompare(b));
        await savePortfolioData(data);
      }
      return NextResponse.json({ success: true, categories: data.categories });
    }

    if (action === "rename_category") {
      const { oldName, newName } = body;
      const trimmedNew = (newName || "").trim();
      if (!trimmedNew || !oldName) {
        return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
      }
      data.categories = data.categories.map((c: string) => (c === oldName ? trimmedNew : c));
      data.categories.sort((a: string, b: string) => a.localeCompare(b));
      data.works = data.works.map((w: WorkItem) =>
        w.cat === oldName ? { ...w, cat: trimmedNew } : w
      );
      await savePortfolioData(data);
      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_category") {
      const { name } = body;
      data.categories = data.categories.filter((c: string) => c !== name);
      await savePortfolioData(data);
      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_work") {
      const { id, src } = body;
      data.works = data.works.filter((w: WorkItem) => w.id !== id && w.src !== src);

      // If Supabase storage file, delete from Supabase Storage
      if (src && src.includes("/storage/v1/object/public/Sivaa gallery/")) {
        try {
          const parts = src.split("/storage/v1/object/public/Sivaa gallery/");
          if (parts[1]) {
            const storagePath = decodeURIComponent(parts[1]);
            await supabase.storage.from("Sivaa gallery").remove([storagePath]);
          }
        } catch (e) {
          console.error("Failed to delete from Supabase storage:", e);
        }
      }

      await savePortfolioData(data);
      return NextResponse.json({ success: true, works: data.works });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
