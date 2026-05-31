const requiredEnv = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
] as const;

export function getEnv(name: (typeof requiredEnv)[number]) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

type ValidateRequiredEnvOptions = {
  ignore?: Array<(typeof requiredEnv)[number]>;
};

export function validateRequiredEnv(options: ValidateRequiredEnvOptions = {}) {
  const ignored = new Set(options.ignore ?? []);
  requiredEnv.filter((name) => !ignored.has(name)).forEach((name) => getEnv(name));
}
