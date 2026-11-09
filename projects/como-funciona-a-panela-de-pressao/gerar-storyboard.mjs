// Storyboard: Como funciona a panela de pressão (panela gigante no fogão; o guia monta peça por peça)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COZINHA = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, transicao: 'flash', ambiente: COZINHA, ...c });
const talk = (de, ate) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'] });
const olhaCam = (em) => [{ em, alvo: 'camera' }];

const cozinha = () => [
  { id: 'fogao', asset: 'forma', pos: [0, 0, 0], params: { tipo: 'caixa', tamanho: [2.2, 0.9, 1.4], cor: '#f2f2f2' } },
  { id: 'boca', asset: 'forma', pos: [0, 0.9, 0], params: { tipo: 'cilindro', tamanho: [1.0, 0.04, 1.0], cor: '#2f3338' } },
  { id: 'armario', asset: 'forma', pos: [-2.7, 0, -0.8], params: { tipo: 'caixa', tamanho: [1.4, 2, 0.6], cor: '#a9743f' } },
  { id: 'geladeira', asset: 'forma', pos: [2.7, 0, -0.8], params: { tipo: 'caixa', tamanho: [0.9, 1.9, 0.8], cor: '#e8eef5' } },
];
const panela = (nivel = 0.6, extra = {}) => ({ id: 'panela', asset: 'tanque', pos: [0, 0.94, 0], params: { raio: 0.7, altura: 1.1, liquido: '#8a5a34', casca: '#c9cdd2', nivel }, ...extra });
const tampa = (extra = {}) => ({ id: 'tampa', asset: 'forma', pos: [0, 2.04, 0], params: { tipo: 'cilindro', tamanho: [1.55, 0.1, 1.55], cor: '#b8bec6', brilho: true }, ...extra });
const anel = (extra = {}) => ({ id: 'anel', asset: 'forma', pos: [0, 1.99, 0], params: { tipo: 'cilindro', tamanho: [1.5, 0.07, 1.5], cor: '#2f3338' }, ...extra });
const pino = (danca = false, extra = {}) => [
  { id: 'pino', asset: 'forma', pos: [0, 2.14, 0], params: { tipo: 'cilindro', tamanho: [0.08, 0.22, 0.08], cor: '#5b5f66' }, ...extra },
  { id: 'peso', asset: 'forma', pos: [0, 2.3, 0], params: { tipo: 'cilindro', tamanho: [0.24, 0.18, 0.24], cor: '#2f3338' }, ...(danca ? { anim: { oscila: { eixo: 'y', amp: 0.04, freq: 5 } } } : {}), ...extra },
];
const seguranca = (extra = {}) => ({ id: 'seg', asset: 'forma', pos: [0.45, 2.14, 0.25], params: { tipo: 'cilindro', tamanho: [0.15, 0.1, 0.15], cor: '#d9473a' }, ...extra });
const completa = (o = {}) => [panela(o.nivel ?? 0.6), anel(), tampa(), ...pino(o.danca), ...(o.seg === false ? [] : [seguranca()])];

const FOGO = (extra = {}) => ({ material: 'fogo', origem: [0, 0.92, 0], taxa: 60, dispersao: 0.4, tamanho: 0.05, vida: 0.25, subida: 0.15, ...extra });
const BOLHAS = (extra = {}) => ({ material: 'bolha', origem: [0, 1.1, 0], taxa: 25, dispersao: 0.45, subida: 0.6, tamanho: 0.05, ...extra });
const VAPOR = (origem, extra = {}) => ({ material: 'vapor', origem, taxa: 18, dispersao: 0.1, subida: 1, tamanho: 0.09, ...extra });

const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [1.7, 0, 1.2], giro: -35, ...extra });
const CAM_GERAL = { tipo: 'fixa', pos: [2.3, 2.4, 6.4], olha: [0.3, 1.4, 0], fov: 44 };
const CAM_PANELA = { tipo: 'fixa', pos: [1.1, 2.8, 3.8], olha: [0.2, 1.8, 0], fov: 42 };
const CAM_DENTRO = { tipo: 'fixa', pos: [-0.4, 1.7, 3.1], olha: [0, 1.45, 0], fov: 40 };
const etq = (texto, de, ate, ponto = '#d9473a') => ({ tipo: 'etiqueta', texto, pos: [0.5, 0.3], ponto, de, ate });

// 1  feijão: três horas
add(0, 3.7, {
  transicao: 'corte',
  objetos: [...cozinha(), panela(0.6), { id: 'relog', asset: 'forma', pos: [-2.7, 2.3, -0.5], params: { tipo: 'cilindro', tamanho: [0.5, 0.08, 0.5], cor: '#ffffff', apoiada: false }, anim: { pulsa: 0.06 } }],
  personagens: [guia({ viraPara: olhaCam(0.2), acoes: [{ clip: 'think', de: 0.3, ate: 3.7 }] })],
  fluxos: [FOGO(), BOLHAS({ taxa: 10 })],
  camera: CAM_GERAL,
  textos: [{ texto: 'FEIJÃO EM MEIA HORA?', de: 0.1, ate: 3.6, estilo: 'titulo' }],
  elementos: [{ tipo: 'icone', icone: 'relogio', pos: [0.22, 0.33], tamanho: 0.15, pulsa: true, de: 0.6, ate: 3.6 }],
});
// 2  como a panela de pressão faz isso?
add(3.7, 7.25, {
  objetos: [...cozinha(), ...completa({ danca: true })],
  personagens: [guia({ viraPara: olhaCam(3.8), acoes: [{ clip: 'surprised', de: 4, ate: 7.25, expressao: 'surprised' }, talk(3.7, 7.25)] })],
  fluxos: [FOGO(), VAPOR([0, 2.45, 0])],
  camera: { tipo: 'travelling', de: { pos: [3, 2, 6], olha: [0.3, 1.6, 0] }, para: { pos: [1.8, 2.3, 4.8], olha: [0.3, 1.8, 0] }, fov: 44 },
});
// 3  coloca o feijão e liga o fogo
add(7.25, 10.5, {
  objetos: [...cozinha(), panela(0.15, { etapa: [[7.6, 0.15], [9.6, 0.6]] })],
  personagens: [guia({ acoes: [{ clip: 'point', de: 7.4, ate: 10.5, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'brita', origem: [0.6, 3, 0.3], destino: [0, 1.6, 0], taxa: 35, tamanho: 0.06, de: 7.4, ate: 9 }, FOGO({ de: 9.2, ate: 10.5 })],
  camera: CAM_PANELA,
});
// 4  ferve a cem graus e não passa disso
add(10.5, 14.45, {
  objetos: [...cozinha(), panela(0.6)],
  personagens: [guia({ acoes: [{ clip: 'shake_head', de: 12, ate: 14.45 }] })],
  fluxos: [FOGO(), BOLHAS()],
  camera: CAM_DENTRO,
  elementos: [etq('100 °C', 10.8, 14.3, '#3d8ee0')],
});
// 5  vapor escapa e leva o calor
add(14.45, 17.75, {
  objetos: [...cozinha(), panela(0.6)],
  personagens: [guia({ viraPara: olhaCam(14.5), acoes: [{ clip: 'shrug', de: 14.8, ate: 17.75, expressao: 'sad' }] })],
  fluxos: [FOGO(), BOLHAS(), VAPOR([0, 2.05, 0], { taxa: 40, dispersao: 0.5, tamanho: 0.12 })],
  camera: CAM_PANELA,
  elementos: [{ tipo: 'seta', direcao: 'cima', pos: [0.45, 0.32], tamanho: 0.12, pulsa: true, de: 15, ate: 17.6 }],
});
// 6  fecha com tampa justa
add(17.75, 21.35, {
  objetos: [...cozinha(), panela(0.6), tampa({ aparece: 18.2 })],
  personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 18.3, ate: 21.35 }] })],
  fluxos: [FOGO(), BOLHAS()],
  camera: CAM_GERAL,
});
// 7  vapor vaza pelas beiradas
add(21.35, 24.0, {
  objetos: [...cozinha(), panela(0.6), tampa()],
  personagens: [guia({ acoes: [{ clip: 'surprised', de: 21.6, ate: 24, expressao: 'worried' }] })],
  fluxos: [FOGO(), ...[[0.78, 0], [-0.78, 0], [0, 0.78], [0, -0.78]].map(([x, z]) => VAPOR([x, 2.05, z], { taxa: 14 }))],
  camera: CAM_PANELA,
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.78, 0.34], tamanho: 0.15, de: 21.8, ate: 23.9 }],
});
// 8  anel de borracha → anel de vedação
add(24.0, 29.25, {
  objetos: [...cozinha(), panela(0.6), anel({ aparece: 24.6 }), tampa({ aparece: 25.8 })],
  personagens: [guia({ acoes: [{ clip: 'crouch', de: 24.2, ate: 26 }, { clip: 'point', de: 26.2, ate: 29.25, params: { dir: 'forward' } }] })],
  fluxos: [FOGO(), BOLHAS()],
  camera: { tipo: 'fixa', pos: [0.6, 2.4, 3.2], olha: [0, 2, 0], fov: 40 },
  elementos: [etq('anel de vedação', 27.3, 29.1, '#2f3338')],
});
// 9  vapor preso aperta a água
add(29.25, 32.75, {
  objetos: [...cozinha(), panela(0.6, { anim: { pulsa: 0.02 } }), anel(), tampa()],
  personagens: [guia({ acoes: [{ clip: 'push', de: 29.4, ate: 32.75 }] })],
  fluxos: [FOGO(), BOLHAS({ taxa: 35 })],
  camera: CAM_DENTRO,
  elementos: [{ tipo: 'seta', direcao: 'baixo', pos: [0.5, 0.36], tamanho: 0.12, pulsa: true, de: 29.5, ate: 32.6 }],
});
// 10  ferve mais quente: cento e vinte graus
add(32.75, 37.55, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa()],
  personagens: [guia({ viraPara: olhaCam(32.8), acoes: [{ clip: 'point', de: 33, ate: 37.55, params: { dir: 'forward' } }, talk(32.75, 37.55)] })],
  fluxos: [FOGO({ taxa: 70 }), BOLHAS({ taxa: 45 })],
  camera: { tipo: 'fixa', pos: [1.8, 1.9, 4.6], olha: [0.6, 1.5, 0.3], fov: 42 },
  textos: [{ texto: '100 °C → 120 °C', de: 34.6, ate: 37.4, estilo: 'destaque' }],
});
// 11  calor a mais amolece o feijão
add(37.55, 40.8, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa()],
  personagens: [guia({ acoes: [{ clip: 'cheer', de: 37.8, ate: 40.8, expressao: 'happy' }] })],
  fluxos: [FOGO({ taxa: 70 }), BOLHAS({ taxa: 45 }), { material: 'brita', origem: [0, 1.1, 0], taxa: 12, dispersao: 0.4, subida: 0.4, tamanho: 0.06 }],
  camera: CAM_DENTRO,
});
// 12  pressão sobe até a tampa voar
add(40.8, 46.25, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa({ anim: { oscila: { eixo: 'y', amp: 0.07, freq: 7 } } })],
  personagens: [guia({ viraPara: olhaCam(41), acoes: [{ clip: 'surprised', de: 42, ate: 46.25, expressao: 'surprised' }] })],
  fluxos: [FOGO({ taxa: 70 }), BOLHAS({ taxa: 50 }), ...[[0.78, 0], [-0.78, 0]].map(([x, z]) => VAPOR([x, 2.08, z], { taxa: 25, de: 43.5, ate: 46.25 }))],
  camera: CAM_GERAL,
  efeitos: [{ tipo: 'pretoebranco', de: 43, ate: 46.2, zoom: 1.12 }, { tipo: 'tremor', de: 44.8, ate: 45.6, intensidade: 0.7 }],
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.25, 0.33], tamanho: 0.16, pulsa: true, de: 41.2, ate: 46.1 }],
});
// 13  furinho na tampa + peso
add(46.25, 50.65, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa(), ...pino(false, { aparece: 47 })],
  personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 46.4, ate: 50.65 }] })],
  fluxos: [FOGO(), BOLHAS()],
  camera: { tipo: 'fixa', pos: [0.9, 2.9, 2.6], olha: [0, 2.15, 0], fov: 40 },
});
// 14  vapor levanta o peso e escapa
add(50.65, 55.1, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa(), ...pino(true)],
  personagens: [guia({ acoes: [{ clip: 'point', de: 50.8, ate: 55.1, params: { dir: 'forward' } }] })],
  fluxos: [FOGO(), BOLHAS({ taxa: 40 }), VAPOR([0, 2.45, 0], { de: 51.5 })],
  camera: { tipo: 'fixa', pos: [-0.8, 2.7, 2.8], olha: [0, 2.2, 0], fov: 38 },
});
// 15  chia, pino dança → válvula de pressão
add(55.1, 59.75, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa(), ...pino(true)],
  personagens: [guia({ viraPara: olhaCam(55.2), acoes: [{ clip: 'cheer', de: 55.3, ate: 57.6, expressao: 'happy' }, { clip: 'point', de: 57.8, ate: 59.75, params: { dir: 'forward' } }] })],
  fluxos: [FOGO(), VAPOR([0, 2.45, 0], { taxa: 26 })],
  camera: CAM_PANELA,
  elementos: [etq('válvula de pressão', 58, 59.6, '#2f3338')],
});
// 16  casca de feijão entope o furinho
add(59.75, 63.25, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa(), ...pino(false)],
  personagens: [guia({ acoes: [{ clip: 'surprised', de: 60.2, ate: 63.25, expressao: 'worried' }] })],
  fluxos: [FOGO({ taxa: 70 }), BOLHAS({ taxa: 50 }), { material: 'brita', origem: [0, 1.5, 0], destino: [0, 2.1, 0], taxa: 8, tamanho: 0.07, de: 60, ate: 61.5 }],
  camera: { tipo: 'fixa', pos: [0.4, 2.6, 2.4], olha: [0, 2.1, 0], fov: 38 },
  efeitos: [{ tipo: 'pretoebranco', de: 60.4, ate: 63.2, zoom: 1.1 }],
  elementos: [{ tipo: 'icone', icone: 'proibido', pos: [0.75, 0.34], tamanho: 0.15, de: 61, ate: 63.1 }],
});
// 17  segunda saída que se solta
add(63.25, 69.45, {
  objetos: [...cozinha(), panela(0.6), anel(), tampa(), ...pino(false), seguranca({ aparece: 64 })],
  personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 64.2, ate: 66.5 }, { clip: 'point', de: 66.7, ate: 69.45, params: { dir: 'forward' } }] })],
  fluxos: [FOGO(), BOLHAS(), VAPOR([0.45, 2.3, 0.25], { taxa: 30, de: 67.5, ate: 69.2 })],
  camera: { tipo: 'fixa', pos: [1.4, 2.8, 2.9], olha: [0.3, 2.15, 0.1], fov: 40 },
});
// 18  válvula de segurança
add(69.45, 72.05, {
  objetos: [...cozinha(), ...completa({ danca: true })],
  personagens: [guia({ viraPara: olhaCam(69.5), acoes: [{ clip: 'nod', de: 69.6, ate: 72.05, expressao: 'happy' }] })],
  fluxos: [FOGO(), VAPOR([0, 2.45, 0])],
  camera: CAM_GERAL,
  elementos: [etq('válvula de segurança', 69.7, 71.9)],
});
// 19  La Paz: ferve a menos de noventa graus
const ALTO = { fundo: 'campo', chao: 'terra', horario: 'tarde' };
const fogareiro = () => [
  { id: 'fogareiro', asset: 'forma', pos: [0, 0, 0], params: { tipo: 'caixa', tamanho: [1.2, 0.9, 1.2], cor: '#5b5f66' } },
  { id: 'pin1', asset: 'arvore_pinheiro', variante: 'nevada', pos: [-4, 0, -4] },
  { id: 'pin2', asset: 'arvore_pinheiro', variante: 'nevada', pos: [4.5, 0, -5] },
  { id: 'casa', asset: 'casa_simples', variante: 'azul', pos: [-6, 0, -9] },
];
const panelaComum = () => ({ id: 'panela', asset: 'tanque', pos: [0, 0.9, 0], params: { raio: 0.6, altura: 0.9, liquido: '#8a5a34', casca: '#c9cdd2', nivel: 0.6 } });
add(72.05, 78.15, {
  ambiente: ALTO,
  objetos: [...fogareiro(), panelaComum()],
  personagens: [guia({ pos: [1.6, 0, 1.3], viraPara: olhaCam(72.2), acoes: [{ clip: 'point', de: 72.3, ate: 78.15, params: { dir: 'forward' } }, talk(72.05, 78.15)] })],
  fluxos: [FOGO({ origem: [0, 0.9, 0] }), BOLHAS({ origem: [0, 1.05, 0], taxa: 18 }), { material: 'neve', origem: [0, 5, 0], destino: [0, 0, 0], taxa: 20, dispersao: 4, espalha: 4, tamanho: 0.05 }],
  camera: { tipo: 'travelling', de: { pos: [2, 3, 9], olha: [0, 1.5, -2] }, para: { pos: [2.2, 2.2, 6], olha: [0.3, 1.3, 0] }, fov: 46 },
  elementos: [etq('La Paz: 3.600 metros', 72.6, 75.2, '#3d8ee0'), etq('ferve a ~88 °C', 75.4, 78, '#d9473a')],
});
// 20  sem panela de pressão, demora muito mais
add(78.15, 83.15, {
  ambiente: ALTO,
  objetos: [...fogareiro(), panelaComum()],
  personagens: [guia({ pos: [1.6, 0, 1.3], viraPara: olhaCam(78.2), acoes: [{ clip: 'shrug', de: 78.4, ate: 80.5, expressao: 'sad' }, { clip: 'look_around', de: 80.6, ate: 83.15 }] })],
  fluxos: [FOGO({ origem: [0, 0.9, 0] }), BOLHAS({ origem: [0, 1.05, 0], taxa: 10 }), { material: 'neve', origem: [0, 5, 0], destino: [0, 0, 0], taxa: 20, dispersao: 4, espalha: 4, tamanho: 0.05 }],
  camera: { tipo: 'fixa', pos: [-1.6, 1.8, 4.8], olha: [0.4, 1.2, 0.4], fov: 44 },
  elementos: [{ tipo: 'icone', icone: 'relogio', pos: [0.78, 0.33], tamanho: 0.15, pulsa: true, de: 78.5, ate: 83 }],
});
// 21  você construiu uma panela de pressão
add(83.15, 86.3, {
  objetos: [...cozinha(), ...completa({ danca: true })],
  personagens: [guia({ viraPara: olhaCam(83.2), acoes: [{ clip: 'cheer', de: 83.3, ate: 86.3, expressao: 'happy' }] })],
  fluxos: [FOGO(), VAPOR([0, 2.45, 0])],
  camera: { tipo: 'travelling', de: { pos: [-2.6, 2.6, 5.6], olha: [0.2, 1.6, 0] }, para: { pos: [2.8, 2.6, 5.6], olha: [0.2, 1.6, 0] }, fov: 46 },
});
// 22  pergunta
add(86.3, 90.4, {
  objetos: [...cozinha(), ...completa({ danca: true })],
  personagens: [guia({ pos: [1.4, 0, 1.7], giro: 0, viraPara: olhaCam(86.4), acoes: [{ clip: 'shrug', de: 86.5, ate: 88.6 }, { clip: 'point', de: 88.8, ate: 90.4, params: { dir: 'forward' } }, talk(86.3, 90.4)] })],
  fluxos: [FOGO(), VAPOR([0, 2.45, 0])],
  camera: { tipo: 'fixa', pos: [1.7, 1.7, 5.6], olha: [1, 1.5, 0.6], fov: 44 },
  textos: [{ texto: 'NA SUA CASA ELA CHIA OU APITA?', de: 86.4, ate: 90.4, estilo: 'pergunta' }],
});

const sb = {
  versao: 1,
  titulo: 'Como funciona a panela de pressão',
  formato: { largura: 1080, altura: 1920, fps: 30 },
  duracao: 90.4,
  audio: 'narracao.mp3',
  palavras: 'palavras.json',
  legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: COZINHA,
  cenas: S,
  sons: [
    { som: 'relogio', de: 0.6, ate: 3, volume: 0.1 },
    { som: 'fogo', de: 9.2, ate: 10.4, volume: 0.1 },
    { som: 'agua', de: 10.8, ate: 12.6, volume: 0.08 },
    { som: 'vento', de: 14.8, ate: 16.6, volume: 0.08 },
    { som: 'martelo', de: 18.3, volume: 0.15 },
    { som: 'erro', de: 21.8, volume: 0.12 },
    { som: 'sucesso', de: 27.4, volume: 0.15 },
    { som: 'alerta', de: 41.3, ate: 44.6, volume: 0.08 },
    { som: 'estouro', de: 44.8, volume: 0.2 },
    { som: 'martelo', de: 47.1, volume: 0.15 },
    { som: 'vento', de: 51.6, ate: 53.6, volume: 0.1 },
    { som: 'sucesso', de: 58.1, volume: 0.15 },
    { som: 'erro', de: 60.4, volume: 0.12 },
    { som: 'sucesso', de: 69.8, volume: 0.15 },
    { som: 'sucesso', de: 83.4, volume: 0.2 },
  ],
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
console.log(`storyboard.json: ${S.length} cenas, ${sb.duracao}s`);
