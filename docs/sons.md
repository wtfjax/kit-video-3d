# Efeitos sonoros (obrigatório nos acontecimentos principais)

Todo vídeo tem **efeitos sonoros ao fundo da voz** nos momentos principais: a água começa a correr, a máquina liga, o cano estoura, algo dá certo ou errado. **Não coloque som em tudo**: escolha só os acontecimentos que a narração destaca (cerca de **1 som a cada 2 cenas**, de 8 a 14 sons num vídeo de 90 s). Os sons ficam **bem baixos** (0,08–0,25): a voz do narrador sempre vem primeiro.

> **Retorno do criador (vídeo da caixa d'água):** foram 65 sons, e a água tocou quase o vídeo inteiro. Ficou repetitivo e um pouco alto. Em uma cena havia um carro passando, e o som do carro teria sido melhor que mais água. Varie os sons, use cada som contínuo em no máximo 2–3 momentos e deixe o volume baixo.

Os sons são gerados pelo próprio ffmpeg (`assets/sons/`, sem download e sem direitos autorais). O render mixa tudo sozinho por baixo da narração.

## Sons disponíveis (`node tools/sons.mjs lista`)

| `som` | Quando usar | Tipo |
|---|---|---|
| `agua` | água correndo em cano, torneira, rio, chuva | loop (use `ate`) |
| `respingo` | gota, jato que começa, algo caindo na água | curto |
| `bomba` | motor elétrico, bomba, ventilador, máquina pequena ligada | loop |
| `maquina` | escavadeira, fábrica, betoneira, máquina pesada | loop |
| `carro` | carro, ônibus ou caminhão passando | loop |
| `whoosh` | passagem rápida, algo voando (automático nas transições `flash`) | curto |
| `pop` | algo aparecendo (automático em `aparece`) | curto |
| `sucesso` | deu certo, solução encontrada, "ding" | curto |
| `erro` | deu errado, o problema aparece | curto |
| `alerta` | perigo, pressão alta, aviso | 1 s (loop com `ate`) |
| `eletrico` | eletricidade, faísca, choque, energia chegando | loop |
| `estouro` | algo quebra, estoura, cai, impacto | curto |
| `cavar` | pá cavando, terra caindo | curto (loop com `ate`) |
| `martelo` | martelada, batida em metal, aperto de peça | curto (loop com `ate`) |
| `relogio` | tempo passando, espera | loop |
| `passos` | alguém andando/carregando peso | loop |
| `vento` | vento, ar, altura | loop |
| `fogo` | fogo, chama, calor | loop |

## Como colocar no storyboard

Dentro da cena (ou no topo do storyboard), com tempos **em segundos do vídeo**:

```json
"sons": [
  { "som": "agua", "de": 18.2, "ate": 20.5, "volume": 0.12 },
  { "som": "sucesso", "de": 20.3, "volume": 0.2 }
]
```

- `de`: quando começa (padrão: início da cena). Alinhe com o instante em que a coisa **acontece na tela** (o `aparece`, o `de` do fluxo, a ação do personagem).
- `ate`: se existir, o som repete até esse instante (para água, motor, máquina). Sem `ate`, toca uma vez.
- `volume`: 0 a 1 (padrão 0,15). Use 0,08–0,15 para sons contínuos (água, motor) e 0,15–0,25 para impactos curtos (estouro, sucesso). Acima de 0,3 o validador avisa.
- `"sonsVolume": 0.8` no topo do storyboard ajusta todos de uma vez. `"sonsAutomaticos": false` desliga o whoosh/pop automáticos.

## Regras

1. **Som segue a imagem:** se a água começa a correr em 18,2 s na tela, o som de água começa em 18,2 s.
2. **Principais, não todos:** o problema (`erro`, `estouro`, `alerta`), a solução (`sucesso`), e o processo que a frase destaca (`agua`, `bomba`, `maquina`, `eletrico`...).
3. **Sempre ao fundo:** nunca acima de 0,3 de volume; sons contínuos entre 0,08 e 0,15.
4. **Varie:** o mesmo som contínuo em no máximo 2–3 momentos (o validador avisa se um som passa de 20% do vídeo). Escolha o som do que **chama atenção na tela** (um carro passando → `carro`, não `agua` de novo).
5. **Curto é melhor:** um som contínuo dura de 1 a 3 s (o instante em que a coisa começa), não a cena inteira.
6. **Silêncio também conta:** quando "a energia acaba", o som da bomba **para**; o corte do som reforça o problema.
7. No `plano-animacao.md`, inclua a coluna **SOM** (qual efeito, se houver).

O validador avisa quando há poucos efeitos. Para renderizar sem eles: `node tools/render.mjs projects/<nome> --sem-sons`. Para conferir só o áudio: `node tools/sons.mjs mixar projects/<nome>` gera `render/audio-final.wav`.
