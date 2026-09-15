# 🧠 PHC DOJO SENSEI — Arena Starr Park 🏆 (Brawl Stars Edition)

> Web app (PWA) que transforma o caminho para **expert no módulo Gestão do Cegid PHC Evolution/CS Desktop** num treino prático gamificado com **tutor de IA**, **mascote Einstein gamer animado que pisca e fala**, e tudo explicado **como se fosse para um burro** com analogias de **Brawl Stars** — implementando a empresa fictícia **STARR PARK COMERCIAL LTDA** (cliente: SPIKE ATACADISTA LTDA · fornecedor: DYNAMIKE EXPLOSIVOS S.A.).

**🌐 Produção:** https://bfrpaulondev.github.io/phc-evolution-sensei/

Material de estudo **não oficial**. *Cegid PHC® é marca da Cegid; Brawl Stars® é marca da Supercell — projeto educativo de fã, sem qualquer afiliação. As artes são originais/genéricas (não usam assets dos jogos).*

---

## ✨ O que tem dentro

| Recurso | Descrição |
|---|---|
| 🎯 **57 missões práticas (L00–L56)** | Passos exatos para executar num PHC instalado, do SQL/instalação até desenvolvimento Xbase/C# e projeto final (implementar a STARR PARK COMERCIAL) |
| 📖 **Conceito antes da prática** | Cada missão abre com teoria: o que é, conceitos-chave e erros comuns |
| 🎓 **Aula Guiada Brawl (IA)** | O Professor Brawleinstein explica **parágrafo a parágrafo**, como se fosse para um burro, com analogias de Brawl Stars (Gem Grab = ciclo de vendas, Heist = compras, arbusto = dado sem prova, Poder de Estrela = personalização…) — com **voz TTS pt-BR** e avanço automático |
| 🧠 **Tutor IA (chat)** | Pergunte qualquer coisa sobre PHC Gestão; contexto automático da missão em que você está (OpenRouter, respostas em cache) |
| 🎭 **Mascote 2D animado** | Einstein gamer (SVG): **pisca**, mexe a boca ao falar, "pensa" durante a IA e celebra — com dicas por aba |
| 🏆 **9 ranks (Bronze → Lenda de Starr)** | Substituem os cinturões: missões 🧠 "de cor" + teste ≥ 80% = sobe de rank |
| 🃏 **126 flashcards "Starr Drop"** | Repetição espaçada 1→2→4→7→14→30→60 dias (também em `assets/flashcards-phc.csv` para Anki) |
| 📸 **Provas obrigatórias** | "Sem prova, não subiu de rank": portefólio de evidências exportável em CSV |
| 📚 **Teoria completa embutida** | Guia do expert (15 capítulos) no app, com 🎓 Aula Brawl por capítulo |
| 📱 **PWA** | Instalável (ícone ⊕) e **offline** após a 1ª visita (service worker cacheia tudo) |
| 💾 **Sem backend** | Progresso em `localStorage` + Exportar/Importar JSON (migra automaticamente da v1/v2) |

## 🤖 Tutor IA (OpenRouter)

- **Como funciona:** Aula Guiada e chat chamam a API do [OpenRouter](https://openrouter.ai) (padrão `openai/gpt-4o-mini`). Cada parágrafo explicado fica em **cache no navegador** — só gasta créditos uma vez.
- **Modo econômico:** em ⚙️ Definições, desligue a IA (a aula lê o texto original em voz alta, custo zero).
- 🔑 **Chave:** nenhuma chave vem no código (repo público + GitHub Push Protection). Cole a sua em **⚙️ Definições** (fica só no seu navegador) **ou** abra uma vez um link pessoal `…/#aik=SUA_CHAVE` (o fragmento nunca chega ao servidor). Recomendado: **limite de créditos** no painel OpenRouter.
- **Voz:** Web Speech API (pt-BR quando disponível), velocidade ajustável + áudio de boas-vindas gravado.

## 🚀 Executar localmente

Sem build (React 18 + Ant Design 5 via CDN, JSX transpilado no navegador):

```bash
git clone https://github.com/bfrpaulondev/phc-evolution-sensei.git
cd phc-evolution-sensei
python3 -m http.server 8080   # http://localhost:8080  (ou abra index.html)
```

> Precisa de internet na 1ª visita (~4 MB de bibliotecas); depois o service worker serve tudo offline.

## 🌐 Publicar (GitHub Pages)

100% estático: **Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`**.

## 🗂 Estrutura

```
phc-evolution-sensei/
├── index.html               # app inteira (React+AntD via CDN; dados, guia e IA embutidos)
├── sw.js                    # service worker (offline-first, cache v3)
├── manifest.webmanifest     # PWA
├── icons/                   # ícones 192/512/maskable/apple/favicon (arte original)
├── assets/
│   ├── img/hero-arena.jpg       # arena estilo Starr Park (arte original)
│   ├── img/einstein-brawl.jpg   # Professor Brawleinstein (arte original)
│   ├── audio/bemvindo.mp3       # boas-vindas gravadas do Professor
│   └── flashcards-phc.csv       # baralho Anki
├── docs/guia-expert-phc-gestao-evolution.md  # teoria completa (15 capítulos)
├── README.md · LEIA-ME.md · LICENSE (MIT) · .gitignore
```

## 🧭 Como treinar

1. **📜 Protocolo** — regras da arena (regra 0: conceito antes da prática).
2. Missões **L00–L05** — ambiente: SQL Server, PHC demo, backups, acessos, Dicionário de Dados.
3. Em cada missão: **📖 Conceito** → **🎓 Aula guiada Brawl** (opcional) → passos no PHC → **📸 provas** → ✅ Registar repetição.
4. Da 3ª repetição em diante, **cronometre** (meta 🏁). Bateu 2×? **🧠 Sei de cor**.
5. Rank sobe com missões 🧠 + teste ≥ 80%. GG!

## 🛣 Roadmap

- [ ] Modo "Clube" (partilhar progresso da turma via export/gist)
- [ ] Mais áudios do Professor (conquistas, rank up)
- [ ] Missões POS, Contabilidade aprofundada, RH, Manufatura
- [ ] Variantes por país (PT/ES/PE/AO/MZ) e gama (Corporate/Advanced/Enterprise)
- [ ] Temporadas (como no Brawl Pass): metas mensais com recompensas

## 📄 Licença

[MIT](LICENSE) — use, adapte e partilhe. Sem prova, não subiu de rank. 🏆
