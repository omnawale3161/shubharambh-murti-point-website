import "server-only";
import { redirect } from "next/navigation";
import { EnvironmentConfigurationError } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

export async function getAdminSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
    if (profileError) return null;
    return profile?.role === "admin" ? { user, profile, supabase } : null;
  } catch (error) {
    if (error instanceof EnvironmentConfigurationError) return null;
    throw error;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();
  return session ?? null;
}
