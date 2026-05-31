export type ViolacaoTipo =
  | "nudez_nao_consensual"
  | "conteudo_menor"
  | "assedio_ameaca"
  | "suplantacao"
  | "outro";

export type StatusCaso = "pendente" | "enviado" | "resolvido";

export interface EvidenciaImagem {
  name: string;
  dataUrl: string;
}

export interface Caso {
  id?: number;
  username: string;
  profileUrl: string;
  postUrls: string[];
  violationType: ViolacaoTipo;
  severity: 1 | 2 | 3 | 4 | 5;
  dateFound: string;
  shortDescription?: string;
  status: StatusCaso;
  evidenceImages: EvidenciaImagem[];
  internalNotes?: string;
  sentAt?: string;
  sentObservations?: string;
  createdAt: string;
  updatedAt: string;
}

export const VIOLATION_LABELS: Record<ViolacaoTipo, string> = {
  nudez_nao_consensual: "Nudez não consensual",
  conteudo_menor: "Conteúdo envolvendo menor",
  assedio_ameaca: "Assédio/ameaça",
  suplantacao: "Suplantação",
  outro: "Outro",
};

export const STATUS_LABELS: Record<StatusCaso, string> = {
  pendente: "Pendente",
  enviado: "Enviado",
  resolvido: "Resolvido",
};
