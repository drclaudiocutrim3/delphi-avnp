import { NextRequest, NextResponse } from "next/server";

// ============================================================
// CONSTANTES EDITÁVEIS
// ============================================================

const EMAIL_PESQUISADOR = process.env.EMAIL_PESQUISADOR || "drclaudiocutrim@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "Painel Delphi <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// Rótulos dos itens, na ordem, para montar o e-mail de forma legível
const ROTULOS: Record<string, string> = {
  A1: "A1. VTCI — relevância",
  A2: "A2. VSC — relevância",
  A3: "A3. VFE — relevância",
  A4: "A4. VEXO — relevância",
  A5: "A5. VRES — relevância",
  B1: "B1. Perfil A — reconhecibilidade/utilidade",
  B2: "B2. Perfil B — reconhecibilidade/utilidade",
  B3: "B3. Perfil C — reconhecibilidade/utilidade",
  C1: "C1. PTC — paciente com baixo domínio técnico",
  C2: "C2. PCEC — paciente que supervaloriza tecnologia cara",
  C3: "C3. PPE — reorganização de percepção de risco",
  C4: "C4. FRI — benefício futuro visível",
  D1: "D1. Coerência interna",
  D2: "D2. Utilidade analítica",
  D3: "D3. Originalidade",
};

const ESCALA_ROTULO: Record<number, string> = {
  1: "Discordo totalmente",
  2: "Discordo",
  3: "Concordo",
  4: "Concordo totalmente",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { respostas, comentarios, perfil } = body as {
      respostas: Record<string, number>;
      comentarios: Record<string, string>;
      perfil: { area: string; experiencia: string; vinculo: string; email?: string };
    };

    if (!respostas || Object.keys(respostas).length === 0) {
      return NextResponse.json({ error: "Sem respostas" }, { status: 400 });
    }

    const carimbo = new Date().toISOString();
    const idResposta = "delphi-" + Math.random().toString(36).slice(2, 10);

    // Monta tabela HTML das respostas
    const linhasTabela = Object.entries(respostas)
      .map(([id, valor]) => {
        const nota = valor as number;
        const concorda = nota >= 3 ? "✓ concordância" : "";
        return `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${ROTULOS[id] || id}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center;">${nota} — ${ESCALA_ROTULO[nota] || ""}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;color:#1F6F54;font-weight:600;">${concorda}</td>
        </tr>`;
      })
      .join("");

    const comentariosHtml = comentarios && Object.keys(comentarios).length > 0
      ? `<h3>Comentários abertos</h3>` +
        Object.entries(comentarios)
          .filter(([, v]) => v && v.trim())
          .map(([bloco, v]) => `<p><strong>Bloco ${bloco}:</strong> ${v}</p>`)
          .join("")
      : "";

    const htmlPesquisador = `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
        <h2>Nova resposta — Painel Delphi AVN-P/EAA</h2>
        <p><strong>ID da submissão:</strong> ${idResposta}<br/>
           <strong>Data/hora:</strong> ${carimbo}</p>
        <p><strong>Perfil:</strong> ${perfil?.area || "—"} · ${perfil?.experiencia || "—"} · ${perfil?.vinculo || "—"}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#14213D;color:#fff;">
              <th style="padding:8px 10px;text-align:left;">Item</th>
              <th style="padding:8px 10px;">Nota</th>
              <th style="padding:8px 10px;">IVC</th>
            </tr>
          </thead>
          <tbody>${linhasTabela}</tbody>
        </table>
        ${comentariosHtml}
        <hr/>
        <h3>JSON bruto (para tabulação em R/SPSS)</h3>
        <pre style="background:#f5f5f5;padding:12px;border-radius:8px;font-size:12px;overflow-x:auto;">${JSON.stringify(
          { idResposta, carimbo, perfil, respostas, comentarios },
          null,
          2
        )}</pre>
      </div>
    `;

    // Envia ao pesquisador
    await enviarEmail({
      to: EMAIL_PESQUISADOR,
      subject: `Nova resposta Delphi — ${idResposta}`,
      html: htmlPesquisador,
    });

    // Confirmação opcional ao especialista
    if (perfil?.email) {
      const totalItens = Object.keys(ROTULOS).length;
      const respondidos = Object.keys(respostas).length;
      await enviarEmail({
        to: perfil.email,
        subject: "Confirmação — Painel Delphi AVN-P/EAA",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2>Obrigado pela sua contribuição</h2>
            <p>Sua avaliação foi registrada com sucesso e enviada ao pesquisador responsável.</p>
            <p><strong>${respondidos} de ${totalItens}</strong> itens avaliados.</p>
            <p style="color:#888;font-size:13px;">ID de referência: ${idResposta}<br/>Data/hora: ${carimbo}</p>
            <hr/>
            <p style="font-size:12px;color:#888;">
              Pesquisa PPGE/UFPA — Economia da Saúde, Biocapitalismo e Assimetria Informacional<br/>
              Dr. Claudio Roberto Cutrim Carvalho · ${EMAIL_PESQUISADOR}
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, idResposta });
  } catch (err) {
    console.error("Erro ao processar envio:", err);
    const mensagem = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}

async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY ausente no ambiente de execução — envio abortado.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(`Resend falhou: ${res.status} ${texto}`);
  }
}
