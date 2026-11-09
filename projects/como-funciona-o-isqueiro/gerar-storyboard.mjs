// Storyboard: Como funciona o isqueiro (isqueiro gigante numa oficina; o guia "constrói" peça por peça)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, transicao: 'flash', ambiente: SALA, ...c });
const talk = (de, ate) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'] });
const olhaCam = (em) => [{ em, alvo: 'camera' }];
const SALA = { fundo: 'interior', chao: 'madeira', horario: 'dia' };

// ---- peças do isqueiro (base no chão, x=0) ----
const corpo = (extra = {}) => ({ id: 'corpo', asset: 'forma', pos: [0, 0, 0], opacidade: 0.4, params: { tipo: 'caixa', tamanho: [1.2, 2, 0.6], cor: '#e8452c' }, ...extra });
const liquido = (extra = {}) => ({ id: 'liq', asset: 'forma', pos: [0, 0.06, 0], params: { tipo: 'caixa', tamanho: [1.05, 1.3, 0.45], cor: '#9fd3f0' }, ...extra });
const bico = (extra = {}) => ({ id: 'bico', asset: 'forma', pos: [0.35, 2, 0], params: { tipo: 'cilindro', tamanho: [0.14, 0.28, 0.14], cor: '#9aa7b5', brilho: true }, ...extra });
const alavanca = (extra = {}) => ({ id: 'alav', asset: 'forma', pos: [-0.42, 2, 0], params: { tipo: 'caixa', tamanho: [0.4, 0.12, 0.45], cor: '#2f3338' }, ...extra });
const pedra = (extra = {}) => ({ id: 'pedra', asset: 'forma', pos: [-0.05, 2, 0], params: { tipo: 'cilindro', tamanho: [0.12, 0.25, 0.12], cor: '#5b5f66' }, ...extra });
const roda = (vel = 0, extra = {}) => ({ id: 'roda', asset: 'engrenagem', variante: 'prata', escala: 0.13, pos: [-0.05, 2.25, 0], params: { velocidade: vel, dentes: 20 }, ...extra });
const protetor = (extra = {}) => ({ id: 'prot', asset: 'forma', pos: [0.15, 2, 0], opacidade: 0.55, params: { tipo: 'caixa', tamanho: [0.78, 0.55, 0.68], cor: '#c9cdd2', brilho: true }, ...extra });
const isqueiro = ({ vel = 0, prot = true, valv = true, pedr = true } = {}) => [
  corpo(), liquido(), ...(valv ? [bico(), alavanca()] : []), ...(pedr ? [pedra(), roda(vel)] : []), ...(prot ? [protetor()] : []),
];
const moveis = () => [
  { id: 'mesa', asset: 'forma', pos: [-3.2, 0, -1.5], params: { tipo: 'caixa', tamanho: [1.6, 0.9, 0.9], cor: '#a9743f' } },
  { id: 'caixa1', asset: 'caixa_madeira', pos: [3.3, 0, -1.2] },
];
const FOGO = (de, ate, extra = {}) => ({ material: 'fogo', origem: [0.35, 2.35, 0], taxa: 40, dispersao: 0.08, ...(de !== undefined ? { de, ate } : {}), ...extra });
const GAS = (de, ate) => ({ material: 'ar', origem: [0.35, 2.3, 0], taxa: 25, dispersao: 0.1, subida: 1.2, de, ate });
const FAISCA = (de, ate) => ({ material: 'fagulha', origem: [-0.05, 2.3, 0.08], destino: [0.35, 2.45, 0.05], taxa: 45, espalha: 0.25, de, ate });

const guia = (pos, extra = {}) => ({ id: 'guia', preset: 'construtor', pos, giro: -35, ...extra });
const CAM_GERAL = { tipo: 'fixa', pos: [2.4, 2.3, 7.2], olha: [0.2, 1.4, 0], fov: 45 };
const CAM_TOPO = { tipo: 'fixa', pos: [1.6, 3.0, 4.4], olha: [0.5, 2.0, 0.3], fov: 42 };
const CAM_LADO = { tipo: 'fixa', pos: [-3.6, 2.2, 5.2], olha: [0, 1.3, 0], fov: 44 };

// 1  fósforo não serve
const fosforo = (id, x, extra = {}) => [
  { id: `pal${id}`, asset: 'forma', pos: [x, 0, 0.6], params: { tipo: 'caixa', tamanho: [0.12, 1.6, 0.12], cor: '#e8d3a0' }, ...extra },
  { id: `cab${id}`, asset: 'forma', pos: [x, 1.7, 0.6], params: { tipo: 'esfera', tamanho: [0.26, 0.32, 0.26], cor: '#d9473a', apoiada: false }, ...extra },
];
add(0, 5.35, {
  transicao: 'corte',
  ambiente: { ...SALA, clima: 'chuva' },
  objetos: [...moveis(), ...fosforo('a', -0.4), ...fosforo('b', 0.4, { some: 4.2 }), ...fosforo('c', 1.1, { some: 4.6 })],
  personagens: [guia([1.9, 0, 1.6], { viraPara: olhaCam(0.3), acoes: [{ clip: 'shrug', de: 2.8, ate: 5.35, expressao: 'sad' }, talk(0, 5.35)] })],
  fluxos: [FOGO(0, 2.2, { origem: [-0.4, 1.8, 0.6], taxa: 30 }), { material: 'fumaca', origem: [-0.4, 1.8, 0.6], taxa: 10, de: 2.2, ate: 5.35 },
    { material: 'agua', origem: [0, 4, 0.6], destino: [0, 0, 0.6], taxa: 60, dispersao: 1.6, espalha: 1.6, vida: 0.7, tamanho: 0.06, de: 2.6, ate: 5.35 }],
  camera: { tipo: 'fixa', pos: [1.2, 1.8, 6], olha: [0.3, 1.3, 0.6], fov: 44 },
  textos: [{ texto: 'COMO UM ISQUEIRO FAZ FOGO?', de: 0.1, ate: 5.2, estilo: 'titulo' }],
});
// 2  combustível líquido (álcool)
const garrafa = () => [
  { id: 'garrafa', asset: 'forma', pos: [0, 0, 0], opacidade: 0.5, params: { tipo: 'cilindro', tamanho: [0.8, 1.6, 0.8], cor: '#3d8ee0' } },
  { id: 'alcool', asset: 'forma', pos: [0, 0.05, 0], params: { tipo: 'cilindro', tamanho: [0.68, 1.0, 0.68], cor: '#bfe3ff' } },
];
add(5.35, 8.8, {
  objetos: [...moveis(), ...garrafa().map((o) => ({ ...o, aparece: 5.6 }))],
  personagens: [guia([1.4, 0, 1.2], { movimentos: [{ de: 5.35, ate: 6.8, para: [1.1, 0.9], clip: 'walk' }], acoes: [{ clip: 'point', de: 6.9, ate: 8.8, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'agua', origem: [0, 2.6, 0], destino: [0, 1.0, 0], taxa: 40, dispersao: 0.1, de: 5.8, ate: 8 }],
  camera: CAM_GERAL,
});
// 3  álcool evapora e vaza
add(8.8, 12.0, {
  objetos: [...moveis(), ...garrafa()],
  personagens: [guia([1.1, 0, 0.9], { viraPara: olhaCam(8.9), acoes: [{ clip: 'surprised', de: 9, ate: 12, expressao: 'worried' }] })],
  fluxos: [{ material: 'vapor', origem: [0, 1.65, 0], taxa: 18, dispersao: 0.3 }, { material: 'agua', origem: [0.38, 0.4, 0.3], destino: [0.7, 0, 0.6], taxa: 20, de: 9.2, ate: 12 }],
  camera: { tipo: 'fixa', pos: [1.6, 1.6, 4.8], olha: [0.3, 1, 0], fov: 42 },
  efeitos: [{ tipo: 'pretoebranco', de: 9.2, ate: 11.9, zoom: 1.1 }],
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.25, 0.34], tamanho: 0.17, de: 9.4, ate: 11.9 }],
});
// 4  butano: gás que vira líquido quando apertado
add(12.0, 16.85, {
  objetos: [...moveis(), { id: 'tq', asset: 'tanque', pos: [0, 0, 0], params: { raio: 0.75, altura: 2, liquido: '#9fd3f0', nivel: 0.05 }, etapa: [[12.6, 0.05], [16.5, 0.65]] }],
  personagens: [guia([2.3, 0, 0.4], { giro: -90, movimentos: [{ de: 12.4, ate: 15.5, para: [1.15, 0.4], clip: 'push' }], acoes: [{ clip: 'push', de: 12.4, ate: 15.5 }] })],
  fluxos: [{ material: 'ar', origem: [-2.2, 2.4, 0], destino: [0, 1.6, 0], taxa: 35, de: 12.2, ate: 16.5 }],
  camera: { tipo: 'fixa', pos: [0.6, 1.8, 6], olha: [0.4, 1.1, 0], fov: 44 },
  elementos: [{ tipo: 'etiqueta', texto: 'butano', pos: [0.5, 0.3], ponto: '#9fd3f0', de: 12.6, ate: 16.7 }],
});
// 5  tanquinho com o dobro da pressão → reservatório
add(16.85, 23.05, {
  objetos: [...moveis(), corpo({ aparece: 17.2 }), liquido({ aparece: 18.4 })],
  personagens: [guia([1.6, 0, 1.1], { overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 17.3, ate: 21.2 }, { clip: 'point', de: 21.4, ate: 23.05, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'bolha', origem: [0, 0.4, 0], taxa: 12, dispersao: 0.35, subida: 0.6, de: 18.6 }],
  camera: CAM_GERAL,
  elementos: [{ tipo: 'etiqueta', texto: 'reservatório', pos: [0.5, 0.3], ponto: '#e8452c', de: 21.7, ate: 22.95 }],
});
// 6  o gás tenta escapar
add(23.05, 25.25, {
  objetos: [...moveis(), corpo(), liquido(), bico({ aparece: 23.2 })],
  personagens: [guia([1.6, 0, 1.1], { acoes: [{ clip: 'surprised', de: 23.3, ate: 25.25, expressao: 'worried' }] })],
  fluxos: [GAS(23.3, 25.25)],
  camera: CAM_TOPO,
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.78, 0.34], tamanho: 0.15, pulsa: true, de: 23.4, ate: 25.1 }],
});
// 7  borrachinha numa alavanca
add(25.25, 29.0, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca({ aparece: 25.8 })],
  personagens: [guia([1.6, 0, 1.1], { overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 26, ate: 29 }] })],
  fluxos: [GAS(25.25, 25.8)],
  camera: { tipo: 'fixa', pos: [-1.2, 3.2, 3.4], olha: [0, 2.05, 0], fov: 40 },
});
// 8  aperta o botão, o gás sai → válvula
add(29.0, 33.3, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca({ anim: { oscila: { eixo: 'y', amp: 0.05, freq: 1 } } })],
  personagens: [guia([1.6, 0, 1.1], { acoes: [{ clip: 'point', de: 29.2, ate: 33.3, params: { dir: 'forward' } }] })],
  fluxos: [GAS(29.4, 30.4), GAS(30.9, 31.9)],
  camera: CAM_TOPO,
  elementos: [{ tipo: 'etiqueta', texto: 'válvula', pos: [0.5, 0.3], ponto: '#2f3338', de: 32.1, ate: 33.2 }],
});
// 9  gás sozinho não acende
add(33.3, 37.2, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca()],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(33.4), acoes: [{ clip: 'shrug', de: 33.5, ate: 35.3 }, { clip: 'think', de: 35.4, ate: 37.2 }] })],
  fluxos: [GAS(33.3, 37.2)],
  camera: CAM_GERAL,
  elementos: [{ tipo: 'icone', icone: 'interrogacao', pos: [0.3, 0.34], tamanho: 0.15, de: 33.6, ate: 37 }],
});
// 10  rodinha de aço raspando na pedrinha
add(37.2, 41.0, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca(), pedra({ aparece: 37.4 }), roda(400, { aparece: 37.9 })],
  personagens: [guia([1.6, 0, 1.1], { acoes: [{ clip: 'point', de: 38, ate: 41, params: { dir: 'forward' } }] })],
  fluxos: [FAISCA(38.6, 41)],
  camera: { tipo: 'fixa', pos: [0.2, 2.6, 2.4], olha: [0, 2.3, 0], fov: 38 },
});
// 11  lascas pegam fogo no ar
add(41.0, 45.35, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca(), pedra(), roda(500)],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(41.2), acoes: [{ clip: 'surprised', de: 41.5, ate: 45.35, expressao: 'happy' }] })],
  fluxos: [FAISCA(41, 45.35), { material: 'fagulha', origem: [-0.05, 2.3, 0.08], taxa: 30, dispersao: 0.15, subida: 0.4, de: 41.2, ate: 45.3 }],
  camera: CAM_TOPO,
  efeitos: [{ tipo: 'zoom', de: 41, ate: 45.3, para: 1.15 }],
});
// 12  essa pedrinha nem é pedra
add(45.35, 48.65, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca(), pedra({ anim: { pulsa: 0.08 } }), roda(0)],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(45.4), acoes: [{ clip: 'think', de: 45.5, ate: 48.65 }] })],
  fluxos: [{ material: 'luz', origem: [-0.05, 2.12, 0.1], taxa: 10, dispersao: 0.1 }],
  camera: { tipo: 'fixa', pos: [-0.5, 2.5, 1.9], olha: [-0.05, 2.15, 0], fov: 36 },
  elementos: [{ tipo: 'seta', direcao: 'baixo', pos: [0.5, 0.42], tamanho: 0.12, pulsa: true, de: 45.6, ate: 48.5 }],
});
// 13  liga de ferro com cério → pederneira
add(48.65, 53.55, {
  objetos: [...moveis(), corpo(), liquido(), bico(), alavanca(), pedra(), roda(450)],
  personagens: [guia([1.6, 0, 1.1], { acoes: [{ clip: 'point', de: 48.8, ate: 53.55, params: { dir: 'forward' } }] })],
  fluxos: [FAISCA(49.2, 53.5)],
  camera: { tipo: 'fixa', pos: [0.6, 2.5, 2.2], olha: [0, 2.2, 0], fov: 38 },
  elementos: [{ tipo: 'etiqueta', texto: 'ferro + cério', pos: [0.5, 0.3], ponto: '#5b5f66', de: 49, ate: 51.8 },
    { tipo: 'etiqueta', texto: 'pederneira', pos: [0.5, 0.3], ponto: '#d9473a', de: 52, ate: 53.45 }],
});
// 14  faísca para todo lado, o vento apaga
add(53.55, 57.55, {
  objetos: [...moveis(), ...isqueiro({ prot: false, vel: 0 })],
  personagens: [guia([1.6, 0, 1.1], { acoes: [{ clip: 'surprised', de: 55.4, ate: 57.55, expressao: 'worried' }] })],
  fluxos: [FOGO(53.6, 55.4, { vento: [1.5, 0] }), { material: 'fumaca', origem: [0.35, 2.35, 0], taxa: 10, de: 55.4, ate: 57.55 },
    { material: 'ar', origem: [-2.5, 2.4, 0], destino: [2, 2.4, 0], taxa: 30, de: 53.6, ate: 57 }],
  camera: CAM_TOPO,
  efeitos: [{ tipo: 'pretoebranco', de: 55.4, ate: 57.5, zoom: 1.1 }],
});
// 15  capinha de metal furada
add(57.55, 60.9, {
  objetos: [...moveis(), ...isqueiro({ prot: false }), protetor({ aparece: 58.2 })],
  personagens: [guia([1.6, 0, 1.1], { overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 58.4, ate: 60.9 }] })],
  fluxos: [{ material: 'ar', origem: [-2.5, 2.4, 0], destino: [2, 2.4, 0], taxa: 20 }],
  camera: CAM_GERAL,
});
// 16  segura o vento, deixa o ar entrar → protetor
add(60.9, 65.05, {
  objetos: [...moveis(), ...isqueiro({ vel: 300 })],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(61), acoes: [{ clip: 'cheer', de: 61.2, ate: 65.05, expressao: 'happy' }] })],
  fluxos: [FOGO(61.3, 65.05), { material: 'ar', origem: [-2.5, 2.3, 0], destino: [-0.3, 2.3, 0], taxa: 20, de: 60.9, ate: 65 }],
  camera: { tipo: 'fixa', pos: [1.8, 3, 4.4], olha: [0.2, 2.2, 0], fov: 40 },
  elementos: [{ tipo: 'etiqueta', texto: 'protetor', pos: [0.5, 0.3], ponto: '#c9cdd2', de: 63.8, ate: 64.95 }],
});
// 17  aceso muito tempo, fica gelado
add(65.05, 69.25, {
  objetos: [...moveis(), ...isqueiro()],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(65.2), acoes: [{ clip: 'surprised', de: 67, ate: 69.25, expressao: 'surprised' }] })],
  fluxos: [FOGO(65.05, 69.25), { material: 'neve', origem: [0, 1, 0.4], taxa: 14, dispersao: 0.7, subida: 0.2, de: 66.5, ate: 69.25 }],
  camera: CAM_LADO,
  elementos: [{ tipo: 'icone', icone: 'relogio', pos: [0.8, 0.33], tamanho: 0.14, de: 65.3, ate: 66.8 }],
});
// 18  butano rouba calor (igual suor)
add(69.25, 75.45, {
  objetos: [...moveis(), ...isqueiro()],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(69.3), acoes: [{ clip: 'point', de: 69.5, ate: 72.5, params: { dir: 'forward' } }, talk(69.25, 75.45)] })],
  fluxos: [FOGO(69.25, 75.45), { material: 'bolha', origem: [0, 1.2, 0], destino: [0.3, 2.1, 0], taxa: 18, dispersao: 0.3 },
    { material: 'neve', origem: [0, 1, 0.4], taxa: 12, dispersao: 0.7, subida: 0.2 }],
  camera: { tipo: 'fixa', pos: [-0.6, 1.6, 4.6], olha: [0.2, 1.3, 0], fov: 44 },
  elementos: [{ tipo: 'seta', direcao: 'cima', pos: [0.42, 0.45], tamanho: 0.12, pulsa: true, de: 69.6, ate: 73 }],
});
// 19  você construiu um isqueiro
add(75.45, 78.05, {
  objetos: [...moveis(), ...isqueiro({ vel: 300 })],
  personagens: [guia([1.6, 0, 1.1], { viraPara: olhaCam(75.5), acoes: [{ clip: 'cheer', de: 75.6, ate: 78.05, expressao: 'happy' }] })],
  fluxos: [FOGO(75.45, 78.05), FAISCA(75.45, 76.2)],
  camera: { tipo: 'travelling', de: { pos: [-2.5, 2.5, 6], olha: [0.2, 1.5, 0] }, para: { pos: [3, 2.5, 6], olha: [0.2, 1.5, 0] }, fov: 46 },
});
// 20  pergunta
const PERG = 'JÁ MACHUCOU O DEDÃO NA RODINHA?';
add(78.05, 83.1, {
  objetos: [...moveis(), ...isqueiro()],
  personagens: [guia([1.3, 0, 1.6], { giro: 0, viraPara: olhaCam(78.1), acoes: [{ clip: 'shrug', de: 78.3, ate: 80.5 }, { clip: 'point', de: 80.8, ate: 83.1, params: { dir: 'forward' } }, talk(78.05, 83.1)] })],
  fluxos: [FOGO(78.05, 83.1)],
  camera: { tipo: 'fixa', pos: [1.6, 1.7, 5.6], olha: [0.9, 1.5, 0.6], fov: 44 },
  textos: [{ texto: PERG, de: 78.2, ate: 83.1, estilo: 'pergunta' }],
  elementos: [{ tipo: 'etiqueta', texto: 'sim ou não?', pos: [0.5, 0.27], ponto: '#ffd60a', de: 81, ate: 83 }],
});

const TAM = { fogo: 0.09, fagulha: 0.035, ar: 0.06, fumaca: 0.12, vapor: 0.1, neve: 0.05, bolha: 0.05, agua: 0.06, luz: 0.05 };
for (const c of S) for (const f of c.fluxos || []) if (f.tamanho === undefined && TAM[f.material]) f.tamanho = TAM[f.material];
const sb = {
  versao: 1,
  titulo: 'Como funciona o isqueiro',
  formato: { largura: 1080, altura: 1920, fps: 30 },
  duracao: 83.1,
  audio: 'narracao.mp3',
  palavras: 'palavras.json',
  legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: { horario: 'dia', fundo: 'interior', chao: 'madeira' },
  cenas: S,
  sons: [
    { som: 'fogo', de: 0, ate: 2.2, volume: 0.1 },
    { som: 'respingo', de: 2.7, volume: 0.15 },
    { som: 'erro', de: 9.3, volume: 0.15 },
    { som: 'martelo', de: 17.4, ate: 19.5, volume: 0.12 },
    { som: 'sucesso', de: 21.8, volume: 0.15 },
    { som: 'vento', de: 23.3, ate: 25.1, volume: 0.1 },
    { som: 'sucesso', de: 32.2, volume: 0.15 },
    { som: 'eletrico', de: 38.6, ate: 39.6, volume: 0.08 },
    { som: 'fogo', de: 41.3, ate: 43.3, volume: 0.1 },
    { som: 'sucesso', de: 52.1, volume: 0.15 },
    { som: 'erro', de: 55.4, volume: 0.15 },
    { som: 'sucesso', de: 63.9, volume: 0.15 },
    { som: 'sucesso', de: 75.6, volume: 0.2 },
  ],
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
console.log(`storyboard.json: ${S.length} cenas, ${sb.duracao}s`);
