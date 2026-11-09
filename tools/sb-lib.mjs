// Apoio para escrever storyboards em JS (gerar-storyboard.mjs dos projetos).
// As cenas são encadeadas: cada uma começa onde a anterior termina; só se informa o "fim".
import fs from 'node:fs';
import path from 'node:path';

export const talk = (de, ate) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'] });
export const olhaCam = (em) => [{ em, alvo: 'camera' }];
export const etq = (texto, de, ate, ponto = '#d9473a') => ({ tipo: 'etiqueta', texto, pos: [0.5, 0.3], ponto, de, ate });
export const icone = (nome, de, ate, pos = [0.78, 0.34], extra = {}) => ({ tipo: 'icone', icone: nome, pos, tamanho: 0.15, de, ate, ...extra });
export const pb = (de, ate) => ({ tipo: 'pretoebranco', de, ate, zoom: 1.1 });
export const forma = (id, tipo, tamanho, cor, pos, extra = {}) => ({ id, asset: 'forma', pos, params: { tipo, tamanho, cor, ...(extra.params || {}) }, ...Object.fromEntries(Object.entries(extra).filter(([k]) => k !== 'params')) });

// tamanho padrão das partículas (escala humana)
export const TAM = { fogo: 0.08, fagulha: 0.035, ar: 0.07, fumaca: 0.14, vapor: 0.1, neve: 0.05, bolha: 0.05, agua: 0.05, luz: 0.025, eletricidade: 0.04, poeira: 0.12, terra: 0.08, pedra: 0.08, brita: 0.06, areia: 0.05, asfalto: 0.06, concreto: 0.07 };

// cenas: [{ fim, ...cena }]; a primeira entra com corte, as outras com flash
export function salvar(arquivoGerador, { titulo, duracao, ambiente, cenas, sons = [], escalaParticulas = 1 }) {
  let t = 0;
  const S = cenas.map((c, i) => {
    const { fim, ...resto } = c;
    const s = { inicio: +t.toFixed(2), fim: +fim.toFixed(2), transicao: i ? 'flash' : 'corte', ambiente, ...resto };
    t = fim;
    return s;
  });
  S[S.length - 1].fim = duracao;
  for (const c of S) for (const f of c.fluxos || []) {
    if (f.tamanho === undefined && TAM[f.material]) f.tamanho = +(TAM[f.material] * escalaParticulas).toFixed(3);
    // o motor só aceita eletricidade com "caminho" (origem/destino trava o render)
    if (f.material === 'eletricidade' && !f.caminho && Array.isArray(f.origem)) {
      const o = f.origem;
      const d = Array.isArray(f.destino) ? f.destino : [o[0], o[1] + 0.6, o[2]];
      f.caminho = [o, d];
      f.velocidade ??= 2;
      delete f.origem; delete f.destino; delete f.dispersao; delete f.espalha;
    }
  }
  const sb = {
    versao: 1, titulo, formato: { largura: 1080, altura: 1920, fps: 30 }, duracao,
    audio: 'narracao.mp3', palavras: 'palavras.json', legendas: { ativo: true, palavrasPorBloco: 1 },
    ambiente, cenas: S, sons,
  };
  const dir = path.dirname(arquivoGerador);
  fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
  console.log(`storyboard.json: ${S.length} cenas, ${duracao}s`);
}
