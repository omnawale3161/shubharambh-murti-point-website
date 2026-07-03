import "server-only";

export class EnvironmentConfigurationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing required environment variables: ${missing.join(", ")}`);
    this.name = "EnvironmentConfigurationError";
  }
}

function requireValues(names: string[]) {
  const missing = names.filter((name) => !process.env[name]?.trim());
  if (missing.length) throw new EnvironmentConfigurationError(missing);
}

export function getPublicSupabaseEnv() {
  requireValues(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}

export function getAdminSupabaseEnv() {
  requireValues(["SUPABASE_SERVICE_ROLE_KEY"]);
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  };
}

