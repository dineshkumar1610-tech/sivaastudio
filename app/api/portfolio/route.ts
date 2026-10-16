import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getServiceSupabase, supabaseBucket, isSupabaseConfigured } from "@/lib/supabase";

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

// Save portfolio to local file
function savePortfolioData(data: PortfolioData): void {
  if (process.env.VERCEL) return;
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

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getServiceSupabase();
      if (supabase) {
        const [catRes, worksRes] = await Promise.all([
          supabase.from("categories").select("name").order("name"),
          supabase.from("portfolio_works").select("*").order("created_at", { ascending: false }),
        ]);

        if (!catRes.error && !worksRes.error && worksRes.data && worksRes.data.length > 0) {
          const categories = (catRes.data || []).map((c: { name: string }) => c.name);
          const works: WorkItem[] = worksRes.data.map((w: { id: string; src: string; title: string; year: string; category: string; tall: boolean }) => ({
            id: w.id,
            src: w.src,
            title: w.title,
            year: w.year,
            cat: w.category,
            tall: Boolean(w.tall),
          }));
          return NextResponse.json({ categories, works });
        }
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local file:", e);
    }
  }

  const data = getPortfolioData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    const data = getPortfolioData();
    const supabase = isSupabaseConfigured() ? getServiceSupabase() : null;

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
        if (supabase) {
          try {
            await supabase.from("categories").upsert({ name: cat }, { onConflict: "name" });
          } catch (e) {
            console.warn("Supabase add category warning:", e);
          }
        }
      }
      // Prepend new works
      data.works = [...newWorks, ...data.works];
      savePortfolioData(data);

      if (supabase) {
        const rows = newWorks.map((w: WorkItem) => ({
          id: w.id,
          src: w.src,
          title: w.title,
          category: w.cat,
          year: w.year,
          tall: Boolean(w.tall),
        }));
        try {
          await supabase.from("portfolio_works").upsert(rows, { onConflict: "id" });
        } catch (e) {
          console.warn("Supabase add works warning:", e);
        }
      }

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
        savePortfolioData(data);
        if (supabase) {
          try {
            await supabase.from("categories").upsert({ name: trimmed }, { onConflict: "name" });
          } catch (e) {
            console.warn("Supabase add category warning:", e);
          }
        }
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
      savePortfolioData(data);

      if (supabase) {
        try {
          await Promise.all([
            supabase.from("categories").update({ name: trimmedNew }).eq("name", oldName),
            supabase.from("portfolio_works").update({ category: trimmedNew }).eq("category", oldName),
          ]);
        } catch (e) {
          console.warn("Supabase rename category warning:", e);
        }
      }

      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_category") {
      const { name } = body;
      data.categories = data.categories.filter((c: string) => c !== name);
      savePortfolioData(data);
      if (supabase) {
        try {
          await supabase.from("categories").delete().eq("name", name);
        } catch (e) {
          console.warn("Supabase delete category warning:", e);
        }
      }
      return NextResponse.json({ success: true, categories: data.categories, works: data.works });
    }

    if (action === "delete_work") {
      const { id, src } = body;
      data.works = data.works.filter((w: WorkItem) => w.id !== id && w.src !== src);

      // If it's a local file in public/uploads, delete it from disk
      if (src && src.startsWith("/uploads/")) {
        try {
          const localFilePath = path.join(process.cwd(), "public", src);
          if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
          }
        } catch (e) {
          console.warn("Could not delete local file:", e);
        }
      }

      // If it's hosted in Supabase Storage, delete from bucket & table
      if (supabase) {
        if (id) {
          try {
            await supabase.from("portfolio_works").delete().eq("id", id);
          } catch (e) {
            console.warn("Supabase delete work table warning:", e);
          }
        }
        if (src && src.includes(".supabase.co/storage/v1/object/public/")) {
          try {
            const parts = src.split("/storage/v1/object/public/")[1]?.split("/");
            if (parts && parts.length >= 2) {
              const bucketName = parts[0];
              const filePath = decodeURIComponent(parts.slice(1).join("/"));
              await supabase.storage.from(bucketName).remove([filePath]);
            }
          } catch (supDelErr) {
            console.warn("Could not delete from Supabase storage:", supDelErr);
          }
        }
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
