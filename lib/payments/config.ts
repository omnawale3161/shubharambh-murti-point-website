type PaymentConfig = {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

export class PaymentConfigurationError extends Error {
  constructor(public readonly missingVariables: string[]) {
    super(`Missing required server environment variables: ${missingVariables.join(", ")}`);
    this.name = "PaymentConfigurationError";
  }
}

function requiredEnv(name: string, fallbackName?: string) {
  const value = process.env[name]?.trim() || (fallbackName ? process.env[fallbackName]?.trim() : "");
  if (!value) {
    throw new PaymentConfigurationError([name]);
  }
  return value;
}

export function getPaymentConfig(): PaymentConfig {
  return {
    razorpayKeyId: requiredEnv("RAZORPAY_KEY_ID"),
    razorpayKeySecret: requiredEnv("RAZORPAY_KEY_SECRET"),
    razorpayWebhookSecret: requiredEnv("RAZORPAY_WEBHOOK_SECRET"),
    supabaseUrl: requiredEnv("SUPABASE_URL").replace(/\/$/, ""),
    supabaseServiceRoleKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}

export function getCheckoutConfig() {
  return {
    razorpayKeyId: requiredEnv("RAZORPAY_KEY_ID", "NEXT_PUBLIC_RAZORPAY_KEY_ID"),
    razorpayKeySecret: requiredEnv("RAZORPAY_KEY_SECRET"),
    ...getOrderPersistenceConfig()
  };
}

export function getOrderPersistenceConfig() {
  return {
    supabaseUrl: requiredEnv("SUPABASE_URL").replace(/\/$/, ""),
    supabaseServiceRoleKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  };
}
