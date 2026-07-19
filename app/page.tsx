"use client";

import { useState } from "react";

// ============================================================
// CONSTANTES EDITÁVEIS
// ============================================================

const TITULO = "Painel Delphi — Validação de Conteúdo";
const SUBTITULO = "AVN-P e Economia Anti-Assimétrica · PPGE/UFPA";

const APRESENTACAO = `Este instrumento valida o conteúdo de um modelo analítico interdisciplinar desenvolvido em tese de doutorado em Economia (PPGE/UFPA, orientador: Prof. Dr. Hilder André Bezerra Farias). Não é necessário ter lido a tese para responder — basta avaliar cada item com base em sua experiência profissional.

O modelo propõe cinco dimensões (vetores) que descrevem como pacientes processam informação e tomam decisões em saúde, três perfis decisórios típicos, e quatro dispositivos de comunicação clínica correspondentes. Você avalia se cada item é relevante e reconhecível. Não há respostas certas ou erradas.

Tempo estimado: 5 a 7 minutos. Respostas anônimas, tratadas apenas de forma agregada.`;

const NOTA_IVC = "Apenas notas 3 ou 4 contam como concordância para o IVC (limiar ≥ 0,78 — Lynn, 1986).";

const BOTAO_INICIAR = "Iniciar avaliação";

const ESCALA = [
  { valor: 1, rotulo: "Discordo totalmente" },
  { valor: 2, rotulo: "Discordo" },
  { valor: 3, rotulo: "Concordo" },
  { valor: 4, rotulo: "Concordo totalmente" },
];

const AREAS_ATUACAO = ["Medicina", "Enfermagem", "Economia", "Gestão em saúde", "Psicologia", "Outra"];
const EXPERIENCIA = ["< 5 anos", "5–10 anos", "> 10 anos"];
const VINCULO = ["SUS", "Privado", "Ambos", "Ensino/Pesquisa", "Gestão", "Economia"];

// Blocos de itens — texto extraído fielmente do instrumento compacto validado
const BLOCOS = [
  {
    id: "A",
    titulo: "Bloco A — Vetores neuroeconômicos (relevância)",
    instrucao: "Avalie se cada dimensão abaixo é relevante para descrever a situação decisória de um paciente em saúde.",
    itens: [
      { id: "A1", texto: "VTCI — Capacidade do paciente de compreender informações técnicas sobre sua condição, distinguir evidência de crença e tomar decisões baseadas em conhecimento objetivo." },
      { id: "A2", texto: "VSC — Qualidade dos vínculos sociais e familiares do paciente, sua capacidade de cooperação e confiança interpessoal, que influenciam adesão e enfrentamento da doença." },
      { id: "A3", texto: "VFE — Capacidade do paciente de avaliar custos e benefícios de diferentes condutas e equilibrar gastos presentes com benefícios futuros (ex.: exame caro vs. conduta conservadora)." },
      { id: "A4", texto: "VEXO — Confiança (ou desconfiança) do paciente em relação a instituições de saúde (SUS, planos, protocolos), que influencia acesso e navegação no sistema." },
      { id: "A5", texto: "VRES — Fatores contingenciais não controláveis que afetam a trajetória do paciente: instabilidade de renda, jornadas extensas, responsabilidades familiares ou eventos fortuitos." },
    ],
    comentario: "Os cinco vetores cobrem as dimensões mais relevantes? O que falta ou sobra?",
  },
  {
    id: "B",
    titulo: "Bloco B — Perfis decisórios (reconhecibilidade e utilidade)",
    instrucao: "Avalie se cada perfil é reconhecível na prática e útil para orientar a comunicação ou o manejo clínico.",
    itens: [
      { id: "B1", texto: "Perfil A — Paciente com baixo domínio técnico (VTCI fragilizado) e desconfiança institucional (VEXO fragilizado): busca ajuda tardiamente, omite informações, rejeita condutas que não compreende." },
      { id: "B2", texto: "Perfil B — Paciente com boa capacidade financeira (VFE ativado) que supervaloriza tecnologia e exames de alta complexidade sem indicação formal, associando \"mais caro\" a \"melhor\" (risco moral)." },
      { id: "B3", texto: "Perfil C — Paciente que compreende e aceita a conduta inicialmente, mas abandona o tratamento antes da conclusão quando os benefícios são difusos ou só aparecem no futuro (desconto hiperbólico)." },
    ],
    comentario: "Algum perfil ausente, sobreposto ou mal descrito?",
  },
  {
    id: "C",
    titulo: "Bloco C — Correspondência perfil → dispositivo de comunicação",
    instrucao: "A tese propõe que cada perfil se beneficia de um dispositivo específico: PTC (Pedagogia Técnica Compactada) → Perfil A; PCEC (Peça Clínico-Econômica) → Perfil B; PPE (Peça Psicoeconômica) → Perfis A e B; FRI (Ferramenta de Redirecionamento Intertemporal) → Perfil C.",
    itens: [
      { id: "C1", texto: "A correspondência Perfil A → PTC + PPE parece clinicamente razoável." },
      { id: "C2", texto: "A correspondência Perfil B → PCEC + PPE parece clinicamente razoável." },
      { id: "C3", texto: "A correspondência Perfil C → FRI parece clinicamente razoável." },
      { id: "C4", texto: "Os quatro dispositivos, em conjunto, cobrem os principais mecanismos de assimetria informacional descritos nos perfis." },
    ],
    comentario: "Comentário sobre a correspondência (opcional):",
  },
  {
    id: "D",
    titulo: "Bloco D — Avaliação global",
    instrucao: "",
    itens: [
      { id: "D1", texto: "O modelo é internamente coerente: vetores, perfis e dispositivos formam um conjunto logicamente articulado." },
      { id: "D2", texto: "O modelo é útil como ferramenta analítica para compreender diferenças entre pacientes em contextos de decisão clínica ou de gestão em saúde." },
      { id: "D3", texto: "O modelo apresenta contribuição original em relação a instrumentos de triagem já existentes (ex.: instrumentos de determinantes sociais da saúde como PRAPARE)." },
    ],
    comentario: "Ponto mais forte do modelo / ponto que mais precisa de revisão (opcional):",
  },
];

const MSG_OBRIGADO_TITULO = "Contribuição registrada. Obrigado!";
const MSG_OBRIGADO_TEXTO = "Sua avaliação foi enviada ao pesquisador responsável e será tratada de forma agregada e anônima junto às demais respostas do painel.";
const MSG_ERRO = "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";

// ============================================================
// COMPONENTE
// ============================================================

type Respostas = Record<string, number>;
type Comentarios = Record<string, string>;

const TOTAL_ETAPAS = BLOCOS.length + 2; // capa + blocos + perfil/envio

export default function DelphiApp() {
  const [etapa, setEtapa] = useState(0); // 0 = apresentação; 1..N = blocos; N+1 = perfil+envio; N+2 = obrigado
  const [respostas, setRespostas] = useState<Respostas>({});
  const [comentarios, setComentarios] = useState<Comentarios>({});
  const [perfil, setPerfil] = useState({ area: "", experiencia: "", vinculo: "", email: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const emBloco = etapa >= 1 && etapa <= BLOCOS.length;
  const blocoAtual = emBloco ? BLOCOS[etapa - 1] : null;
  const progresso = Math.min(100, Math.round((etapa / (TOTAL_ETAPAS - 1)) * 100));

  function responder(id: string, valor: number) {
    setRespostas((r) => ({ ...r, [id]: valor }));
  }

  function blocoCompleto(): boolean {
    if (!blocoAtual) return false;
    return blocoAtual.itens.every((it) => respostas[it.id] !== undefined);
  }

  async function enviar() {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas, comentarios, perfil }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEtapa(TOTAL_ETAPAS);
    } catch {
      setErro(MSG_ERRO);
    } finally {
      setEnviando(false);
    }
  }

  const totalItens = BLOCOS.reduce((acc, b) => acc + b.itens.length, 0);
  const respondidos = Object.keys(respostas).length;

  return (
    <main style={S.pagina}>
      <div style={S.cartao}>
        {etapa > 0 && etapa < TOTAL_ETAPAS && (
          <div style={S.progressoTrilha} aria-hidden>
            <div style={{ ...S.progressoBarra, width: `${progresso}%` }} />
          </div>
        )}

        {etapa === 0 && (
          <section>
            <h1 style={S.titulo}>{TITULO}</h1>
            <p style={S.subtitulo}>{SUBTITULO}</p>
            <p style={S.apresentacao}>{APRESENTACAO}</p>
            <p style={S.notaIvc}>{NOTA_IVC}</p>
            <button style={S.botaoPrimario} onClick={() => setEtapa(1)}>
              {BOTAO_INICIAR}
            </button>
          </section>
        )}

        {blocoAtual && (
          <section key={blocoAtual.id}>
            <p style={S.contador}>
              Bloco {blocoAtual.id} · {respondidos} de {totalItens} itens avaliados
            </p>
            <h2 style={S.blocoTitulo}>{blocoAtual.titulo}</h2>
            {blocoAtual.instrucao && <p style={S.blocoInstrucao}>{blocoAtual.instrucao}</p>}

            {blocoAtual.itens.map((item) => (
              <div key={item.id} style={S.blocoItem}>
                <p style={S.itemTexto}>
                  <strong>{item.id}.</strong> {item.texto}
                </p>
                <div style={S.escalaLinha} role="radiogroup" aria-label={item.texto}>
                  {ESCALA.map((e) => {
                    const ativo = respostas[item.id] === e.valor;
                    return (
                      <button
                        key={e.valor}
                        role="radio"
                        aria-checked={ativo}
                        onClick={() => responder(item.id, e.valor)}
                        style={{ ...S.escalaBotao, ...(ativo ? S.escalaBotaoAtivo : {}) }}
                      >
                        <span style={S.escalaValor}>{e.valor}</span>
                        <span style={S.escalaRotulo}>{e.rotulo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {blocoAtual.comentario && (
              <div style={S.comentarioBloco}>
                <label style={S.comentarioLabel}>{blocoAtual.comentario}</label>
                <textarea
                  style={S.comentarioInput}
                  rows={2}
                  value={comentarios[blocoAtual.id] || ""}
                  onChange={(e) => setComentarios((c) => ({ ...c, [blocoAtual.id]: e.target.value }))}
                />
              </div>
            )}

            <div style={S.navegacao}>
              <button style={S.botaoSecundario} onClick={() => setEtapa(etapa - 1)}>
                Voltar
              </button>
              <button
                style={{ ...S.botaoPrimario, ...(blocoCompleto() ? {} : S.botaoDesativado) }}
                disabled={!blocoCompleto()}
                onClick={() => setEtapa(etapa + 1)}
              >
                Continuar
              </button>
            </div>
          </section>
        )}

        {etapa === BLOCOS.length + 1 && (
          <section>
            <p style={S.contador}>Última etapa</p>
            <h2 style={S.blocoTitulo}>Perfil do respondente</h2>
            <p style={S.blocoInstrucao}>
              Estas informações caracterizam a composição do painel de forma agregada, sem identificação individual.
            </p>

            <div style={S.campoBloco}>
              <label style={S.comentarioLabel}>Área de atuação</label>
              <div style={S.opcoesLinha}>
                {AREAS_ATUACAO.map((op) => (
                  <button
                    key={op}
                    onClick={() => setPerfil((p) => ({ ...p, area: op }))}
                    style={{ ...S.opcaoBotao, ...(perfil.area === op ? S.escalaBotaoAtivo : {}) }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.campoBloco}>
              <label style={S.comentarioLabel}>Experiência</label>
              <div style={S.opcoesLinha}>
                {EXPERIENCIA.map((op) => (
                  <button
                    key={op}
                    onClick={() => setPerfil((p) => ({ ...p, experiencia: op }))}
                    style={{ ...S.opcaoBotao, ...(perfil.experiencia === op ? S.escalaBotaoAtivo : {}) }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.campoBloco}>
              <label style={S.comentarioLabel}>Vínculo predominante</label>
              <div style={S.opcoesLinha}>
                {VINCULO.map((op) => (
                  <button
                    key={op}
                    onClick={() => setPerfil((p) => ({ ...p, vinculo: op }))}
                    style={{ ...S.opcaoBotao, ...(perfil.vinculo === op ? S.escalaBotaoAtivo : {}) }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.campoBloco}>
              <label style={S.comentarioLabel}>
                E-mail (opcional — só se quiser receber uma confirmação e o resultado final do painel)
              </label>
              <input
                type="email"
                style={S.comentarioInput}
                placeholder="seu@email.com"
                value={perfil.email}
                onChange={(e) => setPerfil((p) => ({ ...p, email: e.target.value }))}
              />
            </div>

            {erro && <p style={S.erro}>{erro}</p>}

            <div style={S.navegacao}>
              <button style={S.botaoSecundario} onClick={() => setEtapa(etapa - 1)}>
                Voltar
              </button>
              <button
                style={{ ...S.botaoPrimario, ...(!enviando ? {} : S.botaoDesativado) }}
                disabled={enviando}
                onClick={enviar}
              >
                {enviando ? "Enviando…" : "Enviar avaliação"}
              </button>
            </div>
          </section>
        )}

        {etapa === TOTAL_ETAPAS && (
          <section style={{ textAlign: "center" as const }}>
            <div style={S.checkOk}>✓</div>
            <h2 style={S.blocoTitulo}>{MSG_OBRIGADO_TITULO}</h2>
            <p style={S.blocoInstrucao}>{MSG_OBRIGADO_TEXTO}</p>
            <p style={S.comprovante}>
              {respondidos} de {totalItens} itens registrados nesta submissão.
              {perfil.email && " Uma confirmação foi enviada ao e-mail informado."}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const S: Record<string, React.CSSProperties> = {
  pagina: { minHeight: "100dvh", background: "#14213D", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 12px 48px", fontFamily: "'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', sans-serif" },
  cartao: { width: "100%", maxWidth: 600, background: "#FBF9F4", borderRadius: 16, padding: "28px 22px 32px", boxShadow: "0 12px 40px rgba(0,0,0,0.35)" },
  progressoTrilha: { height: 6, background: "#E3DFD4", borderRadius: 3, marginBottom: 24, overflow: "hidden" },
  progressoBarra: { height: "100%", background: "#FCA311", borderRadius: 3, transition: "width 0.3s ease" },
  titulo: { fontSize: 24, lineHeight: 1.25, color: "#14213D", margin: "0 0 4px", fontWeight: 800 },
  subtitulo: { fontSize: 13, color: "#FCA311", fontWeight: 700, margin: "0 0 18px", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  apresentacao: { fontSize: 14, lineHeight: 1.6, color: "#3D4450", whiteSpace: "pre-line" as const, background: "#F0EDE4", borderRadius: 10, padding: "14px 16px", margin: "0 0 12px" },
  notaIvc: { fontSize: 12, color: "#8A927F", fontStyle: "italic" as const, margin: "0 0 22px" },
  contador: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase" as const, color: "#8A927F", fontWeight: 700, margin: "0 0 6px" },
  blocoTitulo: { fontSize: 19, color: "#14213D", margin: "0 0 8px", fontWeight: 800 },
  blocoInstrucao: { fontSize: 14, lineHeight: 1.55, color: "#4A5058", margin: "0 0 20px" },
  blocoItem: { marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #E8E4D8" },
  itemTexto: { fontSize: 14.5, lineHeight: 1.5, color: "#14213D", margin: "0 0 10px" },
  escalaLinha: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 },
  escalaBotao: { border: "1.5px solid #D8D3C6", background: "#FFFFFF", borderRadius: 10, padding: "8px 2px 6px", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, minHeight: 54 },
  escalaBotaoAtivo: { border: "1.5px solid #FCA311", background: "#FCA311", color: "#14213D" },
  escalaValor: { fontSize: 16, fontWeight: 800, lineHeight: 1 },
  escalaRotulo: { fontSize: 9.5, lineHeight: 1.1, textAlign: "center" as const },
  comentarioBloco: { marginTop: 8, marginBottom: 8 },
  comentarioLabel: { display: "block", fontSize: 13, fontWeight: 700, color: "#4A5058", margin: "0 0 6px" },
  comentarioInput: { width: "100%", border: "1.5px solid #D8D3C6", borderRadius: 10, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", resize: "vertical" as const, boxSizing: "border-box" as const },
  campoBloco: { marginBottom: 18 },
  opcoesLinha: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  opcaoBotao: { border: "1.5px solid #D8D3C6", background: "#FFFFFF", borderRadius: 999, padding: "9px 15px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: "#14213D" },
  navegacao: { display: "flex", gap: 10, marginTop: 8 },
  botaoPrimario: { flex: 1, background: "#FCA311", color: "#14213D", border: "none", borderRadius: 12, padding: "15px 18px", fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%" },
  botaoSecundario: { background: "transparent", color: "#4A5058", border: "1.5px solid #D8D3C6", borderRadius: 12, padding: "15px 18px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  botaoDesativado: { opacity: 0.45, cursor: "not-allowed" },
  erro: { color: "#9B2C2C", fontSize: 14, fontWeight: 600, margin: "0 0 12px" },
  checkOk: { width: 56, height: 56, borderRadius: "50%", background: "#1F6F54", color: "#fff", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  comprovante: { fontSize: 13, color: "#8A927F", marginTop: 12 },
};
