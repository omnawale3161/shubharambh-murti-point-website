import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseEnv } from "@/lib/env";
import type { Database } from "./database.types";

export function createSupabaseAdminClient() {
  const env = getAdminSupabaseEnv();
  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

