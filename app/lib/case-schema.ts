import { StatusCaso, TipoViolacao } from "@prisma/client";
import { z } from "zod";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];

export const caseInputSchema = z.object({
  username: z.string().trim().min(1),
  urlPerfil: z.string().url(),
  urlsPosts: z.array(z.string().url()).min(1),
  tipoViolacao: z.nativeEnum(TipoViolacao),
  gravidade: z.number().int().min(1).max(5),
  dataEncontro: z.coerce.date(),
  descricao: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.nativeEnum(StatusCaso),
  dataEnvio: z.coerce.date().optional().nullable(),
  observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CaseInput = z.infer<typeof caseInputSchema>;
