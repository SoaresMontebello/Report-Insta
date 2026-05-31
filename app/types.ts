import { StatusCaso, TipoViolacao } from "@prisma/client";

export const statusLabels: Record<StatusCaso, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  RESOLVIDO: "Resolvido",
};

export const violationLabels: Record<TipoViolacao, string> = {
  NUDEZ_NAO_CONSENSUAL: "Nudez não consensual",
  CONTEUDO_MENOR: "Conteúdo envolvendo menor",
  ASSEDIO_AMEACA_CHANTAGEM: "Assédio/ameaça/chantagem",
  SUPLANTACAO_IDENTIDADE: "Suplantação de identidade",
  OUTRO: "Outro",
};

export type CasoWithAnexos = {
  id: string;
  username: string;
  urlPerfil: string;
  urlsPosts: string[];
  tipoViolacao: TipoViolacao;
  gravidade: number;
  dataEncontro: string;
  descricao?: string | null;
  status: StatusCaso;
  dataEnvio?: string | null;
  observacoes?: string | null;
  anexos: Array<{
    id: string;
    nome: string;
    mimeType: string;
    tamanho: number;
    createdAt: string;
    signedUrl?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};
