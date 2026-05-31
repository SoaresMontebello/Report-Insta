import { getEnv } from "@/app/lib/env";
import { logError } from "@/app/lib/logger";
import { supabaseAdmin } from "@/app/lib/supabase-server";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function createSignedStorageUrl(caminho: string) {
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

export async function createSignedStorageUrls(caminhos: string[]) {
  return Promise.all(caminhos.map(async (caminho) => createSignedStorageUrl(caminho)));
}

export async function withSignedAttachmentUrls<T extends { caminho: string }>(anexos: T[]) {
  const signedUrls = await createSignedStorageUrls(anexos.map((anexo) => anexo.caminho));

  return anexos.map((anexo, index) => ({
    ...anexo,
    signedUrl: signedUrls[index] ?? null,
  }));
}
