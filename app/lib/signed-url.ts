import { getEnv } from "@/app/lib/env";
import { logError } from "@/app/lib/logger";
import { supabaseAdmin } from "@/app/lib/supabase-server";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function createSignedAttachmentUrl(caminho: string) {
  const bucket = getEnv("SUPABASE_STORAGE_BUCKET");
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(caminho, SIGNED_URL_TTL_SECONDS);

  if (error) {
    logError("signed_url_generation_failed", error, { caminho });
    return null;
  }

  return data.signedUrl;
}

export async function withSignedAttachmentUrls<T extends { caminho: string }>(anexos: T[]) {
  return Promise.all(
    anexos.map(async (anexo) => ({
      ...anexo,
      signedUrl: await createSignedAttachmentUrl(anexo.caminho),
    })),
  );
}
