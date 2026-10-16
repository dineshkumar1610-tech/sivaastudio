import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "gallery";

/**
 * Returns true if real Supabase credentials have been provided.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("your-project-id") &&
    supabaseUrl.startsWith("https://")
  );
}

let clientInstance: SupabaseClient | null = null;
let serviceInstance: SupabaseClient | null = null;

/**
 * Public client for client-side and read queries.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

/**
 * Server/Service client for backend routes (uploads, admin tasks).
 * Bypasses RLS using the service role key if available.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!serviceInstance) {
    serviceInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serviceInstance;
}
