# Painel Delphi — AVN-P/EAA (versão compacta, 15 itens)

Formulário web para especialistas responderem em 5-7 minutos. Sem banco de dados —
cada resposta é enviada diretamente por e-mail para o pesquisador (e, opcionalmente,
uma confirmação para o especialista), via Resend. Nada fica persistido em servidor.

## Onde colocar os arquivos

Dentro de um projeto Next.js novo (mesmo processo do survey-percepcao):

```
seu-projeto/
  app/
    page.tsx              <- substitui o app/page.tsx padrão
    api/
      enviar/
        route.ts           <- cria essas pastas dentro de app/
```

## Criar o projeto (no terminal do VAIO)

```bash
cd ~
npx create-next-app@latest delphi-avnp --typescript --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*"
cd delphi-avnp
```

Depois copie os dois arquivos (`page.tsx` e `api/enviar/route.ts`) para dentro de `app/`,
mantendo a estrutura de pastas acima.

## Variáveis de ambiente (.env.local)

```
RESEND_API_KEY=sua_chave_do_resend
EMAIL_PESQUISADOR=drclaudiocutrim@gmail.com
EMAIL_FROM=Painel Delphi <onboarding@resend.dev>
```

A `RESEND_API_KEY` você já deve ter de projetos anteriores (DVP/DVS). Se não tiver,
crie conta grátis em resend.com — o plano gratuito cobre até 100 e-mails/dia, mais
que suficiente para um painel de 7-12 especialistas.

## Testar localmente

```bash
npm run dev
```

Abra `http://localhost:3000`. Responda o formulário como teste — se `RESEND_API_KEY`
não estiver configurada, o envio é simulado (aparece só no log do terminal, sem erro).

## Deploy

```bash
git init
git add .
git commit -m "Painel Delphi AVN-P/EAA - versao compacta"
gh repo create delphi-avnp --public --source=. --remote=origin --push
```

Depois, importe o repositório em vercel.com/new e adicione as 3 variáveis de ambiente
na tela de configuração antes de clicar em Deploy.

## O que o pesquisador recebe

Um e-mail por resposta, com:
- ID único da submissão + data/hora
- Perfil do respondente (área, experiência, vínculo)
- Tabela com todos os 15 itens, nota e se conta como concordância (nota ≥ 3)
- Comentários abertos de cada bloco (se preenchidos)
- JSON bruto ao final, pronto para colar em planilha ou importar no R/SPSS para
  cálculo formal do IVC por item e do IVC médio geral

## Comprovação para o especialista

Ao concluir, a tela mostra uma confirmação explícita ("✓ Contribuição registrada")
com o número de itens respondidos. Se o especialista informar e-mail (campo opcional),
recebe também uma confirmação por e-mail com o mesmo ID de referência — útil caso
precise comprovar a participação depois.
