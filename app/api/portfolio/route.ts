import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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
  return {
    categories: [
      "Baby Shoot",
      "Engagement",
      "Maternity Shoot",
      "Modeling",
      "Pre-Wedding",
      "Sreemantham",
      "Wedding Shooting"
    ],
    works: []
  };
}

function savePortfolioData(data: PortfolioData) {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const data = getPortfolioData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const data = getPortfolioData();

    if (action === "add_category") {
      const { name } = body;
      const trimmed = (name || "").trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
      if (!data.categories.includes(trimmed)) {
        data.categories.push(trimmed);
        data.categories.sort((a: string, b: string) => a.localeCompare(b));
        savePortfolioData(data);
      }
      return NextResponse.json({ success: true, categories: data.categories });
    }

    if (action === "rename_category") {
      const { oldName, newName } = body;
      const trimmedNew = (newName || "").trim();
      if (!trimmedNew || !oldName) {
        return NextResponse.json({ error: "Both oldName and newName are required" }, { status: 400 });
      }
      // Rename in categories list
      data.categories = data.categories.map((c: string) => (c === oldName ? trimmedNew : c));
      data.categories.sort((a: string, b: string) => a.localeCompare(b));
      // Rename in all works that use the old category name
      data.works = data.works.map((w: WorkItem) =>
        w.cat === oldName ? { ...w, cat: trimmedNew } : w
      );
      savePortfolioData(data);
      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_category") {
      const { name } = body;
      data.categories = data.categories.filter((c: string) => c !== name);
      // Optional: keep or filter works
      // data.works = data.works.filter((w: any) => w.cat !== name);
      savePortfolioData(data);
      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_work") {
      const { id, src } = body;
      data.works = data.works.filter((w: WorkItem) => w.id !== id && w.src !== src);

      // 1. If Supabase storage file, delete from Supabase Storage
      if (src && src.includes("/storage/v1/object/public/gallery/")) {
        try {
          const parts = src.split("/storage/v1/object/public/gallery/");
          if (parts[1]) {
            const storagePath = decodeURIComponent(parts[1]);
            const { data: delData, error: delErr } = await supabase.storage
              .from("gallery")
              .remove([storagePath]);
            if (delErr) {
              console.error("Supabase Storage remove error:", delErr.message);
            } else {
              console.log("Successfully deleted from Supabase Storage:", storagePath, delData);
            }

            // Also clean up local file if present in public/uploads/
            const filename = path.basename(storagePath);
            const localUploadPath = path.join(process.cwd(), "public", "uploads", filename);
            if (fs.existsSync(localUploadPath)) {
              fs.unlinkSync(localUploadPath);
            }
          }
        } catch (e) {
          console.error("Failed to delete from Supabase storage:", e);
        }
      } else if (src && src.startsWith("/uploads/")) {
        // If local uploaded file, attempt to delete from disk
        try {
          const filePath = path.join(process.cwd(), "public", src);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.error("Failed to delete file from disk:", e);
        }
      }

      // 2. Also delete from Supabase Database table 'portfolio_works' if table exists
      try {
        if (id) {
          await supabase.from("portfolio_works").delete().eq("id", id);
        }
      } catch (dbErr) {
        // Ignored if table does not exist
      }

      savePortfolioData(data);
      return NextResponse.json({ success: true, works: data.works });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
