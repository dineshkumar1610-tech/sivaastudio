import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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

async function checkTable() {
  const { data, error } = await supabase.from("portfolio_works").select("*").limit(1);
  if (error) {
    console.log("Table check error:", error.message);
  } else {
    console.log("Table exists! Records count:", data.length);
  }
}

checkTable();
