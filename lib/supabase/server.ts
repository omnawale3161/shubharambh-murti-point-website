import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "./database.types";

export type SupabaseServerCredentials = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

export class MissingSupabaseConfigurationError extends Error {
  constructor(public readonly missingVariables: string[]) {
    super(`Missing required server environment variables: ${missingVariables.join(", ")}`);
    this.name = "MissingSupabaseConfigurationError";
  }
}

export function getSupabaseServerCredentials(): SupabaseServerCredentials {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const missingVariables = [
    !supabaseUrl ? "SUPABASE_URL" : "",
    !supabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : ""
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new MissingSupabaseConfigurationError(missingVariables);
  }

  return {
    supabaseUrl: supabaseUrl!.replace(/\/$/, ""),
    supabaseServiceRoleKey: supabaseServiceRoleKey!
  };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = getPublicSupabaseEnv();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Proxy refresh handles those sessions.
        }
      }
    }
  });
}

export async function supabaseServerRequest<T>(
  path: string,
  init?: RequestInit,
  credentials = getSupabaseServerCredentials()
) {
  const response = await fetch(`${credentials.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: credentials.supabaseServiceRoleKey,
      Authorization: `Bearer ${credentials.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Supabase server request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
