# Umadle 🐎

**Umadle** é um jogo de adivinhação diário (estilo Wordle e Loldle) focado no universo de **Uma Musume: Pretty Derby**. O objetivo é deduzir a personagem ou a carta de suporte correta do dia usando dicas e atributos!

![Umadle Preview](https://gametora.com/images/umamusume/characters/icons/chr_icon_1001.png)

## ✨ Funcionalidades (Features)

* **Desafio Diário Global:** Alimentado por um gerador Pseudo-Aleatório (PRNG) com *Seed*, o jogo oferece exatamente a mesma resposta para todos os jogadores do mundo naquele dia.
* **Múltiplos Modos de Jogo:**
  * **Modo Classic:** Adivinhe a Uma Musume baseada em Distância, Estratégia, Altura, Vitórias G1, Ano de Nascimento, etc.
  * **Modo Support Cards:** Adivinhe a Support Card correta baseando-se no Tipo, Personagem da capa e Raridade (SSR, SR).
  * *(Em Breve)* Splash, Quote e Emojis!
* **Feedback Visual Code-Color:**
  * 🟩 **Verde:** Acerto exato.
  * 🟨 **Amarelo:** Chegou perto (ex: diferença de 3cm na altura).
  * 🟥 **Vermelho:** Errado.
  * ⬆️⬇️ **Setas Direcionais:** Ajudam a deduzir atributos numéricos (maior ou menor).
* **Persistência de Dados (Auto-Save):** Seu progresso diário é automaticamente salvo no seu navegador via `localStorage`. Pode fechar a aba e voltar depois que suas tentativas continuam lá!
* **Compartilhamento (Share):** Exporte seus resultados no famoso formato de grade de emojis para colar no Twitter/Discord.

## 🛠️ Tecnologias Utilizadas
O projeto foi construído **100% Vanilla** (sem frameworks) com foco em leveza e performance:
- **HTML5:** Estrutura e semântica.
- **CSS3:** Estilização, variáveis globais dinâmicas, responsividade e animações em flip 3D.
- **JavaScript (ES6+):** Programação Assíncrona, Lógica do PRNG, manipulação da DOM e Fetch API.
- **JSON:** Armazenamento das "Databases" separadas.

## 🚀 Como Executar o Projeto Localmente

Como o jogo utiliza a **Fetch API** moderna do JavaScript para buscar separadamente os bancos de dados JSON, navegadores por padrão bloqueiam (via política estrutural CORS) a requisição via protocolo `file:///`.

Portanto, **não basta dar dois cliques no `index.html`.** Você precisa hospedar num servidor local:

1. Clone ou baixe este repositório.
2. Abra a pasta no **VS Code**.
3. Instale e inicie a extensão **[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)**.
4. O navegador abrirá automaticamente no endereço `http://127.0.0.1:5500/` com o jogo rodando perfeitamente!

*(Alternativamente, você pode usar Python com `python -m http.server 8000` ou rodar no Vercel/GitHub Pages).*

## 📂 Estrutura de Arquivos

```text
/umadle
│
├── index.html           # Interface Principal e Navegação
├── style.css            # Folha de Estilos, Temas e Animações
├── script.js            # Lógica principal, Máquina de Estados, Fetch e PRNG
├── database.json        # DB de personagens Mode Classic (100 itens)
└── support_cards.json   # DB de Cartas Modo Support
```

---
*Stay motivated and run with everything you've got!* 🥕
