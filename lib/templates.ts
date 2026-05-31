import type { Caso } from "@/types";

const baseDetails = (caso: Caso) => `
Perfil denunciado: @${caso.username}
URL do perfil: ${caso.profileUrl}
Data de identificação: ${caso.dateFound}
Gravidade: ${caso.severity}/5
Posts relacionados:
${caso.postUrls.map((url) => `- ${url}`).join("\n")}

Descrição objetiva:
${caso.shortDescription || "Sem descrição adicional."}
`;

const templates = {
  nudez_nao_consensual: (caso: Caso) => `Assunto: Denúncia por nudez não consensual

Solicito análise urgente deste caso por possível exposição íntima sem consentimento.
${baseDetails(caso)}
Esse conteúdo pode causar dano severo à vítima. Peço remoção imediata e revisão do perfil.`,

  conteudo_menor: (caso: Caso) => `Assunto: Denúncia prioritária por conteúdo envolvendo menor

Solicito prioridade máxima para este material por envolver potencial risco a menor de idade.
${baseDetails(caso)}
Peço bloqueio/remoção do conteúdo e aplicação das medidas de segurança cabíveis.`,

  assedio_ameaca: (caso: Caso) => `Assunto: Denúncia por assédio, ameaça ou chantagem

Estou reportando condutas de assédio/ameaça que podem colocar pessoa em risco.
${baseDetails(caso)}
Solicito investigação do conteúdo e medidas para impedir continuidade da conduta.`,

  suplantacao: (caso: Caso) => `Assunto: Denúncia por suplantação de identidade

Este perfil aparenta se passar por outra pessoa indevidamente.
${baseDetails(caso)}
Peço validação da identidade, remoção de conteúdo enganoso e providências contra perfil falso.`,

  outro: (caso: Caso) => `Assunto: Denúncia de violação das diretrizes

Solicito revisão deste conteúdo/perfil por possível violação das diretrizes da plataforma.
${baseDetails(caso)}
Aguardo análise e aplicação das medidas previstas.`,
};

export function gerarTextoDenuncia(caso: Caso) {
  return templates[caso.violationType](caso);
}
