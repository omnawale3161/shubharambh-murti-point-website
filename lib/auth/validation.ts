const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s-]{10,18}$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

export function parseCredentials(value: Partial<Record<"email" | "password", unknown>>) {
  const email = clean(value.email, 254).toLowerCase();
  const password = typeof value.password === "string" ? value.password : "";

  return emailPattern.test(email) && password.length >= 8 && password.length <= 128
    ? { email, password }
    : null;
}

export function parseRegistration(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const credentials = parseCredentials(record);
  const name = clean(record.name, 80);
  const phone = clean(record.phone, 20);

  return credentials && name.length >= 2 && phonePattern.test(phone)
    ? { ...credentials, name, phone }
    : null;
}
