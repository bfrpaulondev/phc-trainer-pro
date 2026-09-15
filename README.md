# 🧠 PHC Trainer Pro — Formação Profissional · Gestão Cegid PHC Evolution

> Plataforma web (PWA) de **formação prática** para dominar o módulo **Gestão do Cegid PHC Evolution / PHC CS Desktop**: 57 missões passo-a-passo num PHC real, **tutor de IA** que explica cada parágrafo em linguagem simples aplicado à sua **empresa de treino** (12 segmentos de negócio portugueses realistas), flashcards com repetição espaçada, testes por nível e portfólio de evidências.

**🌐 Produção:** https://bfrpaulondev.github.io/phc-trainer-pro/

Material educativo **não oficial**, baseado em fontes públicas da Cegid PHC (Help Center, programa oficial de certificação, documentação de parceiros). *Cegid PHC® é marca dos respetivos proprietários — projeto sem afiliação.*

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 🧭 **Jornada guiada (v4.0)** | Liberação progressiva: cada missão concluída libera a seguinte; níveis abrem com 50% do anterior. Página inicial mostra apenas o essencial: missão atual, revisões do dia e meta diária (5 ações). **Modo Foco**: missão em wizard passo-a-passo (🔊 ouvir, 🧠 explicar com IA, ✅ feito) → evidências → perguntas. Modo livre opcional em ⚙️ |
| 🎯 **90 missões práticas (L00–L89)** | Passos exatos num PHC instalado: infraestrutura, ficheiros, vendas, compras/stocks, financeiro, fiscal, análises, desenvolvimento (Xbase/C#), projeto final + **4 packs de especialização: Contabilidade (L57–L66), Pessoal/Vencimentos (L67–L74), POS & Retalho (L75–L82) e Suporte/Pós-venda (L83–L89)** — tudo com a mesma empresa de treino |
| 🏢 **Empresa de treino personalizável** | 12 segmentos portugueses realistas (hotelaria, eletrónica, restauração, distribuição, construção, clínica, consultoria IT, indústria, oficina, agricultura, e-commerce, transportes) — cada um com empresa fictícia completa: nome, **NIF com dígito de controlo válido**, CAE, morada, artigos com preços e necessidades reais do negócio. Os textos das missões e da IA **adaptam-se automaticamente** à empresa escolhida |
| 🎓 **Curso personalizado por IA** | Entrevista de 3 passos (segmento → empresa → objetivos/interesses/tempo) gera destaques e ordem das missões; alternativa offline: plano padrão calibrado por segmento |
| 📖 **Conceito antes da prática** | Cada missão abre com teoria em **carrossel interativo**: o que é, conceitos-chave (1 cartão por conceito) e erros comuns |
| 🎓 **Aula Guiada** | O Professor (tutor IA com voz TTS pt-BR) explica **parágrafo a parágrafo**, em linguagem acessível, aplicado à sua empresa — com avanço automático e cache local |
| 🧠 **Tutor IA (chat)** | Perguntas livres sobre PHC Gestão com contexto automático da missão em curso (OpenRouter) |
| 🎭 **Mascote interativo** | Professor Einstein 2D (SVG animado): pisca, fala (TTS), "pensa" durante chamadas de IA e dá dicas contextuais por aba |
| 🔄 **Circuitos interativos** | 10 grandes fluxos em carrossel (56 passos): vendas, compras, séries de documentos, transporte/AT, SAF-T, conta corrente, tesouraria, integração contabilística, personalização e fecho do mês — com narração e explicação da IA |
| 📖 **Dicionário (94 termos)** | ATCUD, SAF-T, e-Fatura, CIUS-PT, PCMP, CEVMC, aging, reverse charge… com busca, filtros por tema, detalhe prático, voz e aprofundamento do Professor |
| 🗂 **126 flashcards (SRS)** | Repetição espaçada 1→2→4→7→14→30→60 dias; também em `assets/flashcards-phc.csv` (Anki) |
| 📝 **13 testes de nível** | 78 perguntas com explicação; aprovação ≥ 80% |
| 🌍 **Contexto país + gama** | Seletor PT/ES/AO/MZ/CV/PE com ficha de obrigações fiscais e particularidades do software (SII/TicketBAI, AGT/SAF-T AO, retenções PE…); gama Corporate/Advanced/Enterprise com **avisos de requisitos em cada missão** |
| 👥 **Progresso de equipa** | Cada técnico exporta a sua ficha (JSON); o formador importa e compara a equipa numa tabela (com export CSV) — para parceiros que formam vários técnicos |
| 📸 **Portfólio de evidências** | "Sem evidência, não aconteceu": registo de provas por missão, exportável em CSV |
| 🏅 **24 conquistas** | Marcos profissionais desbloqueáveis (constância, exames, portefólio e as 4 especializações: Contabilidade, Pessoal, Retalho, Pós-venda) com data de obtenção |
| 📚 **Teoria completa embutida** | Guia do expert (15 capítulos) no app, com Aula Guiada por capítulo |
| 📱 **PWA** | Instalável e **offline** após a 1ª visita (service worker) |
| 💾 **Sem backend** | Progresso em `localStorage` + Exportar/Importar JSON |

## 🤖 Tutor IA (OpenRouter)

- Aulas guiadas e chat usam a API do [OpenRouter](https://openrouter.ai) (modelo padrão `openai/gpt-4o-mini`). Explicações ficam em **cache no navegador** — cada parágrafo só consome créditos uma vez.
- **Modo econômico** (⚙️ Definições): desliga a IA; a aula passa a ler o texto original em voz alta.
- 🔑 **Chave:** nenhuma chave vem no código (repositório público). Cada utilizador cola a sua em **⚙️ Definições** (fica só no `localStorage`) **ou** abre uma vez um link pessoal `…/#aik=SUA_CHAVE` (o fragmento nunca chega ao servidor). Recomenda-se **limite de créditos** no painel OpenRouter.
- **Voz:** Web Speech API (pt-BR quando disponível), velocidade ajustável + mensagem de boas-vindas gravada.

## 🚀 Executar localmente

Sem build (React 18 + Ant Design 5 via CDN; JSX transpilado no navegador):

```bash
git clone https://github.com/bfrpaulondev/phc-trainer-pro.git
cd phc-trainer-pro
python3 -m http.server 8080   # http://localhost:8080  (ou abra index.html)
```

> Requer internet na 1ª visita (~4 MB de bibliotecas); depois o service worker serve tudo offline.

## 🌐 Publicar (GitHub Pages)

Site 100% estático — a raiz do repositório é o deploy: **Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`**.

## 🗂 Estrutura

```
phc-trainer-pro/
├── index.html               # aplicação completa (React+AntD via CDN; dados, guia e IA embutidos)
├── sw.js                    # service worker (offline-first)
├── manifest.webmanifest     # PWA
├── icons/                   # ícones 192/512/maskable/apple/favicon
├── assets/
│   ├── img/hero-pro.jpg         # ilustração corporativa (arte original)
│   ├── img/einstein-pro.jpg     # Professor Einstein (arte original)
│   ├── audio/bemvindo.mp3       # mensagem de boas-vindas
│   └── flashcards-phc.csv       # baralho para Anki
├── docs/guia-expert-phc-gestao-evolution.md   # teoria completa (15 capítulos)
├── README.md · LEIA-ME.md · LICENSE (MIT) · .gitignore
```

## 🧭 Método de formação

1. **📜 Protocolo** — regras do treino (regra 0: conceito antes da prática).
2. **🏢 Empresa** — escolha o segmento (ou faça a entrevista de IA) e defina a sua empresa de treino.
3. Missões **L00–L05** — ambiente: SQL Server, instalação PHC, backups, acessos, Dicionário de Dados.
4. Em cada missão: **📖 Conceito** (carrossel) → **🎓 Aula guiada** (opcional) → passos no PHC → **📸 evidências** → ✅ Registar repetição (revisões em 1, 2, 4, 7, 14, 30, 60 dias).
5. A partir da 3ª repetição, **cronometre** (meta por missão). Dominou? **🧠 Sei de cor**.
6. O nível avança com todas as missões 🧠 + teste ≥ 80%.

## 🛣 Roadmap

- [x] Packs de missões: **Contabilidade** (L57–L66) e **Pessoal/Vencimentos** (L67–L74) ✔ v3.2
- [x] **Conquistas** profissionais (22 marcos) ✔ v3.2
- [x] Pack POS/Retalho (L75–L82) e Suporte/Pós-venda (L83–L89) ✔ v3.3
- [x] Contexto por país (PT/ES/AO/MZ/CV/PE) e por gama com avisos de requisitos ✔ v3.3
- [x] Progresso de equipa (fichas exportáveis + painel comparativo) ✔ v3.3

## 📄 Licença

[MIT](LICENSE) — use, adapte e partilhe. Sem evidência, não há aprendizado.
