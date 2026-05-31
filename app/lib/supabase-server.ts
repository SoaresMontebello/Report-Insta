import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/app/lib/env";

export const supabaseAdmin = createClient(
  getEnv("SUPABASE_URL"),
  getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
