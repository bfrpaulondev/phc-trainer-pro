# 🥋 PHC DOJO — Treino Prático · Gestão Cegid PHC Evolution

> Web app estática (zero build, zero dependências) que transforma o caminho para **expert no módulo Gestão do Cegid PHC Evolution/CS Desktop** num sistema de **prática deliberada gamificada**: missões práticas num PHC real, repetição espaçada, flashcards, testes por cinturão e registo de provas.

**Demo:** https://bfrpaulondev.github.io/phc-evolution-sensei/

Material de estudo **não oficial**, baseado em fontes públicas da Cegid PHC (Help Center, programa oficial de certificação, documentação de parceiros). Nomes de menus/ecrãs seguem o software em PT-PT.

---

## ✨ O que tem dentro

| Recurso | Descrição |
|---|---|
| 🎯 **57 missões práticas (L00–L56)** | Passos exatos para executar num PHC instalado, do SQL/instalação até desenvolvimento Xbase/C# e um projeto final de implementação |
| 📖 **Conceito antes da prática** | Cada missão abre com um bloco de teoria: o que é, conceitos-chave e erros comuns |
| 📚 **Aba Teoria** | O guia completo do expert (15 capítulos) embutido no app, com navegação por capítulo |
| 🥋 **9 cinturões** | Branca → Amarela → Laranja → Verde → Azul → Roxa → Marrom → Preta → Grão-Mestre |
| 📸 **Provas obrigatórias** | Cada missão exige evidência (print nomeado, consulta SQL, ficheiro gerado ou explicação gravada) — "sem prova, não aconteceu" |
| 🔁 **Repetição espaçada** | Missões voltam em 1, 2, 4, 7, 14, 30 e 60 dias; metas cronometradas por missão |
| 🃏 **126 flashcards** | Com o mesmo SRS (Errei / Quase / Sabia) — também exportados para Anki em [`assets/flashcards-phc.csv`](assets/flashcards-phc.csv) |
| 📝 **9 testes (54 perguntas)** | Aprovação ≥ 80% + todas as missões do nível "sei de cor" = cinturão sobe |
| 🏆 **Progresso & sequência** | Barras por cinturão, streak diário, portefólio de provas exportável em CSV |
| 💾 **Sem servidor** | Progresso em `localStorage` + botões Exportar/Importar (JSON) para backup e migração entre dispositivos |

## 📚 Teoria de referência

O guia completo que fundamenta as missões está em [`docs/guia-expert-phc-gestao-evolution.md`](docs/guia-expert-phc-gestao-evolution.md) (15 capítulos: produto, arquitetura, instalação, mapa funcional do Gestão, configuração, fiscalidade PT/ES/PE, desenvolvimento com a Framework PHC, base de dados, integrações, operação, formação oficial e plano de estudos).

## 🚀 Executar localmente

Não há build. Basta abrir o ficheiro:

```bash
git clone <este-repo>
cd phc-dojo
# abra index.html no navegador (duplo clique) — ou:
python3 -m http.server 8080   # http://localhost:8080
```

> ⚠️ O progresso é guardado **por origem** (navegador/dispositivo). Abrindo via `file://` ou em outro domínio, o histórico é separado — use **💾 Exportar / 📂 Importar** para migrar.

## 🌐 Publicar (GitHub Pages)

O site é 100% estático — a raiz do repositório já é o deploy:

1. **Settings → Pages → Source:** `Deploy from a branch`
2. Branch: `main`, pasta: `/ (root)` → **Save**
3. O site fica em `https://<utilizador>.github.io/<repo>/`

(Se usar token/API: `POST /repos/{owner}/{repo}/pages` com `{"source":{"branch":"main","path":"/"}}`.)

## 🗂 Estrutura

```
phc-dojo/
├── index.html                  # a aplicação inteira (HTML+CSS+JS+dados, auto-contida)
├── README.md
├── LEIA-ME.md                  # instruções rápidas de utilização do dojo
├── LICENSE                     # MIT
├── docs/
│   └── guia-expert-phc-gestao-evolution.md   # teoria completa
└── assets/
    └── flashcards-phc.csv      # baralho para Anki (separador ;)
```

## 🧭 Como treinar (resumo)

1. Aba **📜 Protocolo** — leia as regras do dojo (regra 0: **conceito antes da prática**).
2. Missões **L00–L05** — prepare ambiente (pastas, SQL Server, PHC demo, backups, acessos, Dicionário de Dados).
3. Siga a aba **📌 Hoje** diariamente: 📖 conceito → cartas vencidas → repetições → 1 missão nova → provas → explicação em voz alta.
4. A partir da 3ª repetição, **cronometre** (cada missão tem meta). Bateu 2×? **🧠 Sei de cor**.
5. Cinturão = missões dominadas + teste ≥ 80%.

## 🛣 Roadmap (ideias)

- [ ] PWA (manifest + service worker) para instalar no telemóvel e treinar offline
- [ ] Modo multijogador/turmas (partilhar progresso via gist/export)
- [ ] Mais missões: POS, Contabilidade aprofundada, RH, Manufatura
- [ ] Variantes por país (PT/ES/PE/AO/MZ) e por gama (Corporate/Advanced/Enterprise)
- [ ] Baralho de cartas "erros reais de suporte"

## ⚖️ Aviso legal

Projeto educativo independente. **PHC®/Cegid PHC® são marcas dos respetivos proprietários.** Este repositório não é afiliado, endossado ou relacionado com a Cegid ou a PHC Software. Todo o conteúdo deriva de documentação pública; confirme sempre os detalhes na sua versão/gama no Help Center oficial e nos manuais in-app.

## 📄 Licença

[MIT](LICENSE) — use, adapte e partilhe. Se o ajudar a chegar a cinto preto, conte-nos! 🥋
