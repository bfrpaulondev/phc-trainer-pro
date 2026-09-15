# 🧠 PHC DOJO SENSEI — Escola ACME DO MUNDO 🏜️

> Web app (PWA) que transforma o caminho para **expert no módulo Gestão do Cegid PHC Evolution/CS Desktop** num treino prático gamificado com **tutor de IA**, **mascote Einstein animado que pisca e fala**, e tudo explicado **como se fosse para um burro** com exemplos da empresa fictícia **ACME DO MUNDO LTDA** (a ACME dos desenhos animados: foguetes, bigornas e túneis pintados na parede).

**🌐 Demo/Produção:** https://bfrpaulondev.github.io/phc-evolution-sensei/

Material de estudo **não oficial**, baseado em fontes públicas da Cegid PHC. *PHC®/Cegid PHC® são marcas dos respetivos proprietários.*

---

## ✨ O que tem dentro

| Recurso | Descrição |
|---|---|
| 🎯 **57 missões práticas (L00–L56)** | Passos exatos para executar num PHC instalado, do SQL/instalação até desenvolvimento Xbase/C# e projeto final |
| 📖 **Conceito antes da prática** | Cada missão abre com teoria: o que é, conceitos-chave e erros comuns |
| 🎓 **Aula Guiada ACME (IA)** | O Professor explica **parágrafo a parágrafo**, como se fosse para um burro, aplicado à ACME DO MUNDO LTDA — com **voz (TTS pt-BR)** e avanço automático |
| 🧠 **Tutor IA (chat)** | Pergunte qualquer coisa sobre PHC Gestão; respostas com humor, analogias ACME e rigor técnico (OpenRouter) |
| 🎭 **Mascote 2D animado** | Albert Einstein de desenho animado (SVG): **pisca**, mexe a boca quando fala, fica "a pensar" e celebra — presente o tempo todo, com dicas por aba |
| 🥋 **9 cinturões + 126 flashcards SRS + 9 testes (54 perguntas)** | Repetição espaçada 1→2→4→7→14→30→60 dias; aprovação ≥80% |
| 📸 **Provas obrigatórias** | "Sem prova, não aconteceu": portefólio de evidências exportável em CSV |
| 📚 **Teoria completa embutida** | Guia do expert (15 capítulos) dentro do app, com "Aula ACME" por capítulo |
| 📱 **PWA** | Instalável (ícone ⊕ no navegador) e **funciona offline** após a 1ª visita (service worker) |
| 💾 **Sem backend** | Progresso em `localStorage` + Exportar/Importar JSON |

## 🤖 Tutor IA (OpenRouter)

- **Como funciona:** as explicações da Aula Guiada e do chat chamam a API do [OpenRouter](https://openrouter.ai) (modelo padrão `openai/gpt-4o-mini`). As respostas são **guardadas em cache** no seu navegador — cada parágrafo só é explicado uma vez (custo mínimo).
- **Modo econômico:** nas ⚙️ Definições pode desligar a IA (a aula passa a ler o texto original em voz alta, sem custos).
- **Voz:** TTS do navegador (Web Speech API), pt-BR quando disponível, com velocidade ajustável.
- 🔑 **Segurança da chave:** nenhuma chave vem embutida no código (o GitHub Push Protection nem deixaria — repositório público). Cada utilizador cola a SUA chave em **⚙️ Definições** (fica só no `localStorage` do navegador) **ou** abre uma vez um link pessoal terminado em `#aik=SUA_CHAVE` (o fragmento nunca chega ao servidor nem fica no repositório). Recomendado: definir **limite de créditos** no painel OpenRouter.

## 🚀 Executar localmente

Não há build (React + Ant Design via CDN, JSX transpilado no navegador):

```bash
git clone https://github.com/bfrpaulondev/phc-evolution-sensei.git
cd phc-evolution-sensei
python3 -m http.server 8080   # http://localhost:8080  (ou abra index.html)
```

> Precisa de internet na 1ª visita (CDN ~4 MB); depois o service worker serve tudo offline. Abrindo via `file://` o PWA não regista, mas a app funciona.

## 🌐 Publicar (GitHub Pages)

100% estático — a raiz do repositório é o deploy: **Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`**.

## 🗂 Estrutura

```
phc-evolution-sensei/
├── index.html              # app inteira (React+AntD via CDN, dados, guia e IA embutidos)
├── sw.js                   # service worker (offline-first)
├── manifest.webmanifest    # PWA
├── icons/                  # ícones 192/512/maskable/apple/favicon
├── assets/
│   ├── img/hero-acme.jpg       # armazém ACME no deserto
│   ├── img/einstein-mascot.jpg # Professor ACMEinstein
│   ├── audio/bemvindo.mp3      # boas-vindas gravadas do Professor
│   └── flashcards-phc.csv      # baralho para Anki
├── docs/guia-expert-phc-gestao-evolution.md   # teoria completa (15 capítulos)
├── README.md · LEIA-ME.md · LICENSE (MIT) · .gitignore
```

## 🧭 Como treinar

1. **📜 Protocolo** — as regras do dojô (regra 0: conceito antes da prática).
2. Missões **L00–L05** — ambiente: SQL Server, PHC demo, backups, acessos, Dicionário de Dados.
3. Em cada missão: **📖 Conceito** → (opcional) **🎓 Aula guiada ACME** com o Professor → passos no PHC → **📸 provas** → ✅ Registar repetição.
4. A partir da 3ª repetição, **cronometre** (meta 🏁). Bateu 2×? **🧠 Sei de cor**.
5. Cinturão = missões 🧠 + teste ≥ 80%.

## 🛣 Roadmap

- [ ] Mais vozes/áudios pré-gravados do Professor (welcome pack)
- [ ] Modo "turma" (partilhar progresso entre colegas via export/gist)
- [ ] Missões POS, Contabilidade aprofundada, RH, Manufatura
- [ ] Variantes por país (PT/ES/PE/AO/MZ) e gama (Corporate/Advanced/Enterprise)
- [ ] Conquistas/badges por streak e projetos

## ⚖️ Aviso legal

Projeto educativo independente, sem afiliação com a Cegid ou PHC Software. Conteúdo derivado de documentação pública; confirme os detalhes na sua versão/gama no Help Center oficial e nos manuais in-app.

## 📄 Licença

[MIT](LICENSE) — use, adapte e partilhe. Planos infalíveis exigem técnicos infalíveis. 🚀
