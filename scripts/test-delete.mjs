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

async function testDelete() {
  // 1. Upload a temporary test file
  const testPath = "test-folder/test-delete-check.txt";
  console.log("1. Uploading test file to 'gallery' bucket...");
  const { error: upErr } = await supabase.storage.from("gallery").upload(testPath, Buffer.from("test delete check"), { upsert: true });
  if (upErr) {
    console.error("Upload failed:", upErr.message);
    return;
  }
  console.log("Upload succeeded!");

  // 2. Test deleting the file
  console.log("2. Testing DELETE on 'gallery' bucket...");
  const { data, error: delErr } = await supabase.storage.from("gallery").remove([testPath]);
  if (delErr) {
    console.error("Delete failed! Error:", delErr.message);
  } else {
    console.log("Delete succeeded! Result:", data);
  }
}

testDelete();
