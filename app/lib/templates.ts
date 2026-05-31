import { TipoViolacao } from "@prisma/client";

type TemplateData = {
  username: string;
  urlPerfil: string;
  urlsPosts: string[];
  descricao?: string | null;
  dataEncontro: string;
};

const baseTemplate = (intro: string, data: TemplateData) => `${intro}

Perfil: @${data.username}
URL do perfil: ${data.urlPerfil}
Data do encontro: ${data.dataEncontro}

Publicações relacionadas:
${data.urlsPosts.map((url) => `- ${url}`).join("\n")}

Descrição adicional:
${data.descricao?.trim() || "Sem descrição adicional."}

Peço análise e remoção do conteúdo conforme as diretrizes da plataforma.`;

export function generateReportTemplate(tipo: TipoViolacao, data: TemplateData) {
  switch (tipo) {
    case TipoViolacao.NUDEZ_NAO_CONSENSUAL:
      return baseTemplate("Denúncia de nudez não consensual.", data);
    case TipoViolacao.CONTEUDO_MENOR:
      return baseTemplate("Denúncia de conteúdo envolvendo menor de idade.", data);
    case TipoViolacao.ASSEDIO_AMEACA_CHANTAGEM:
      return baseTemplate("Denúncia de assédio, ameaça ou chantagem.", data);
    case TipoViolacao.SUPLANTACAO_IDENTIDADE:
      return baseTemplate("Denúncia de suplantação de identidade.", data);
    case TipoViolacao.OUTRO:
    default:
      return baseTemplate("Denúncia de violação das políticas da plataforma.", data);
  }
}
