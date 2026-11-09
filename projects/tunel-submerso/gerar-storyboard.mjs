// Gera storyboard.json do túnel submerso. Rode: node projects/tunel-submerso/gerar-storyboard.mjs
import fs from 'node:fs';
const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, ...c });
const F = (id, pos, tamanho, cor, extra = {}, params = {}) => ({ id, asset: 'forma', pos, params: { tipo: 'caixa', tamanho, cor, ...params }, ...extra });
const talk = (de, ate, extra = {}) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'], ...extra });
const olha = (em) => [{ em, alvo: 'camera' }];
const fl = (material, origem, destino, extra = {}) => ({ material, origem, ...(destino ? { destino } : {}), ...extra });
const LIT = { fundo: 'litoral' };
const IND = { fundo: 'industrial' };
const CONC = '#aab2bd', TAMPA = '#e0533d';

// cenário do mar em corte: leito com vala, margens, água, cais
const mar = (agua = {}) => [
  F('leito', [0, 0, 0], [34, 0.5, 10], '#e3c98f'),
  F('margemA', [0, 0, -4.3], [34, 1.5, 3.2], '#d9b878'),
  F('margemB', [0, 0, 4.3], [34, 1.5, 3.2], '#d9b878'),
  F('agua', [0, 0, 0], [34, 3.4, 11], '#2f8fd8', { opacidade: 0.5, ...agua }),
  F('cais', [0, 0, 9.4], [14, 1, 3.4], '#a9743f'),
];
const seg = (id, pos, extra = {}) => F(id, pos, [7, 2, 3.6], CONC, extra, { brilho: false });
const tampas = (idBase, x, y, extra = {}) => [
  F(idBase + 'L', [x - 3.6, y, 0], [0.3, 2, 3.6], TAMPA, extra),
  F(idBase + 'R', [x + 3.6, y, 0], [0.3, 2, 3.6], TAMPA, extra),
];

// segmento móvel (corpo + tampas) com as mesmas chaves de posição
const segMovel = (id, chaves, { tampa = true, tampaSome, opac, oscila } = {}) => {
  const mk = (dx) => chaves.map(([t, p]) => [t, [p[0] + dx, p[1], p[2]]]);
  const an = (dx) => ({ pos: mk(dx), ...(oscila ? { oscila } : {}) });
  const lista = [seg(id, chaves[0][1], { anim: an(0), ...(opac ? { opacidade: opac } : {}) })];
  if (tampa) for (const [suf, dx] of [['L', -3.6], ['R', 3.6]]) lista.push(F(id + suf, [chaves[0][1][0] + dx, chaves[0][1][1], chaves[0][1][2]], [0.3, 2, 3.6], TAMPA, { anim: an(dx), ...(tampaSome ? { some: tampaSome } : {}) }));
  return lista;
};
const SEGA = () => seg('segA', [-7.2, 0.5, 0]);
const camMar = (de, para) => ({ tipo: 'travelling', de, para });

// 1  gancho: cavar na praia
add(0, 3.8, {
  ambiente: LIT,
  objetos: [F('mar', [0, 0, -16], [40, 0.4, 14], '#3aa0e8', {}), { id: 'esc', asset: 'escavadeira', pos: [-3.5, 0, -1], giro: 0, params: { ciclo: 2.4, fase: 0 } },
    { id: 'monte', asset: 'monte', variante: 'areia', pos: [-8.5, 0, -1], etapa: [[0, 0.2], [3.6, 1]] }],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [3.4, 0, 4], giro: 0, viraPara: olha(0), acoes: [talk(0, 3.8), { clip: 'point', de: 2.7, ate: 3.8, params: { dir: 'forward' } }] }],
  fluxos: [fl('poeira', { ancora: 'esc', desloca: [0, 0.4, 3.2] }, null, { taxa: 12 })],
  camera: { tipo: 'enquadrar', alvo: 'guia', plano: 'medio', angulo: 25, elevacao: 8, aproxima: 0.9 },
  textos: [{ texto: 'TÚNEL NO FUNDO DO MAR?', de: 0.2, ate: 3.7, estilo: 'titulo' }],
});
// 2  o mar invade o buraco
add(3.8, 6.65, {
  transicao: 'flash', ambiente: LIT,
  objetos: [
    F('fundoBuraco', [0, 0, 0], [8, 0.3, 5], '#8a5a34'),
    F('paredeA', [0, 0, -3], [8, 1.6, 1], '#a9743f'), F('paredeB', [0, 0, 3], [8, 1.6, 1], '#a9743f'),
    F('paredeC', [-4.5, 0, 0], [1, 1.6, 7], '#a9743f'),
    F('aguaBuraco', [0, -1.3, 0], [7.6, 1.3, 5], '#3aa0e8', { opacidade: 0.7, anim: { pos: [[3.8, [0, -1.3, 0]], [6.4, [0, 0.1, 0]]] } }),
    F('mar2', [10.5, 0, 0], [8, 1.2, 8], '#3aa0e8', { opacidade: 0.8 }),
  ],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [-1, 0, 6], giro: 0, viraPara: olha(3.8), acoes: [{ clip: 'surprised', de: 4.5, ate: 6.6, expressao: 'worried' }, talk(3.8, 6.6)] }],
  fluxos: [fl('agua', [7, 1.2, 0], [1, 0.4, 0], { taxa: 55, de: 3.9, ate: 6.6, espalha: 1.2, arco: 0.8 })],
  camera: { tipo: 'fixa', pos: [5, 8, 13], olha: [0, 0.3, 0], fov: 45 },
  efeitos: [{ tipo: 'pretoebranco', de: 4.6, ate: 6.6, zoom: 1.08 }],
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.5, 0.42], tamanho: 0.2, de: 4.8, ate: 6.6 }],
});
// 3  pedaços gigantes num estaleiro seco
add(6.65, 13, {
  transicao: 'flash', ambiente: IND,
  objetos: [
    { id: 'gui', asset: 'guindaste', pos: [-9, 0, -4], params: { height: 14, jib: 12 } },
    F('base', [3, 0, 0], [10, 0.4, 6], '#7b8794'),
    seg('bloco1', [0, 0.4, 0], { aparece: 7.2 }),
    seg('bloco2', [7.4, 0.4, 0], { aparece: 9.6 }),
    F('bloco3', [14.8, 0.4, 0], [7, 2, 3.6], CONC, { aparece: 11.4 }),
    { id: 'cam', asset: 'betoneira', pos: [-3, 0, 6], giro: 0 },
  ],
  personagens: [
    { id: 'serv', preset: 'servente', pos: [-6, 0, 3], giro: 0, viraPara: [{ em: 6.65, alvo: 'bloco1' }], acoes: [{ clip: 'hammer', de: 6.65, ate: 13 }] },
    { id: 'eng', preset: 'engenheira', pos: [4, 0, 6], giro: 0, viraPara: olha(6.65), acoes: [talk(6.65, 13), { clip: 'point', de: 8, ate: 10, params: { dir: 'forward' } }] },
  ],
  fluxos: [fl('poeira', [0, 2.5, 0], null, { taxa: 10 }), fl('concreto', { ancora: 'cam', desloca: [0, 2.6, 4.6] }, [0, 1.8, 0.5], { taxa: 30, de: 7.4, ate: 9.4 })],
  camera: camMar({ pos: [10, 7, 24], olha: [5, 1.4, 0] }, { pos: [4, 5, 18], olha: [6, 1.4, 0] }),
  textos: [{ texto: 'PEDAÇOS GIGANTES', de: 8, ate: 12.4, estilo: 'destaque' }],
});
// 4  pesam milhares de toneladas
add(13, 17.55, {
  transicao: 'flash', ambiente: IND,
  objetos: [seg('bloco', [0, 0.4, 0], { anim: { oscila: { eixo: 'y', amp: 0.08, freq: 1.4 } } }),
    { id: 'gui', asset: 'guindaste', pos: [-9, 0, -4], params: { height: 14, jib: 12 } }],
  personagens: [
    { id: 'serv', preset: 'servente', pos: [-5, 0, 2.5], giro: -90, movimentos: [{ de: 13.4, ate: 15, para: [-4.2, 2.5], clip: 'push' }], acoes: [{ clip: 'push', de: 15, ate: 17.5, expressao: 'worried' }] },
    { id: 'guia', preset: 'construtor', pos: [4.5, 0, 5], giro: 0, viraPara: olha(13), acoes: [{ clip: 'shrug', de: 16.3, ate: 17.5 }, talk(13, 17.5)] },
  ],
  fluxos: [fl('poeira', [-3.6, 0.3, 2], null, { taxa: 16, de: 15, ate: 17.5 })],
  camera: { tipo: 'enquadrar', alvo: 'bloco', plano: 'geral', angulo: 25, elevacao: 12, aproxima: 0.9 },
  elementos: [{ tipo: 'etiqueta', texto: 'MILHARES DE TONELADAS', pos: [0.5, 0.3], ponto: '#e0533d', de: 13.6, ate: 17.4 }, { tipo: 'icone', icone: 'interrogacao', ancora: 'guia', alturaRel: 1.3, dx: 0.16, de: 16.4, ate: 17.5, tamanho: 0.16, pulsa: true }],
});
// 5  fecha as pontas, ele vira um tubo oco e flutua
add(17.55, 24, {
  transicao: 'flash', ambiente: LIT,
  objetos: [
    F('leito', [0, 0, 0], [34, 0.5, 10], '#e3c98f'), F('cais', [0, 0, 9.4], [14, 1, 3.4], '#a9743f'),
    F('agua', [0, -3.4, 0], [34, 3.4, 11], '#3aa0e8', { opacidade: 0.42, anim: { pos: [[20.6, [0, -3.3, 0]], [23.2, [0, 0, 0]]] } }),
    ...segMovel('tubo', [[17.55, [0, 0.5, 0]], [20.6, [0, 0.5, 0]], [23.2, [0, 1.7, 0]]], { oscila: { eixo: 'y', amp: 0.08, freq: 0.6 } }),
  ],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [-3, 1, 9.4], giro: 0, viraPara: olha(17.55), acoes: [{ clip: 'point', de: 18.4, ate: 20.4, params: { dir: 'forward' } }, { clip: 'cheer', de: 22.8, ate: 24 }, talk(17.55, 22.6)] }],
  fluxos: [fl('agua', [-17, 0.6, -2], [-6, 0.3, 0], { taxa: 40, de: 20.6, ate: 23, espalha: 2 }), fl('bolha', [0, 0.6, 3], null, { taxa: 8, de: 22.5, ate: 24 })],
  camera: camMar({ pos: [9, 3.2, 22], olha: [0, 1.4, 0] }, { pos: [5, 3.2, 15], olha: [0, 1.6, 0] }),
  elementos: [{ tipo: 'etiqueta', texto: 'PONTAS FECHADAS', pos: [0.5, 0.33], ponto: '#e0533d', de: 19, ate: 21.5 }, { tipo: 'etiqueta', texto: 'TUBO OCO = FLUTUA', pos: [0.5, 0.33], ponto: '#3aa0e8', de: 21.8, ate: 24 }],
});
// 6  e agora? precisa chegar no lugar certo
add(24, 28.5, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[24, [9, 1.7, 0]], [28.5, [9, 1.7, 0]]], { oscila: { eixo: 'y', amp: 0.08, freq: 0.6 } })],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [4, 1, 9.4], giro: 0, viraPara: olha(24), acoes: [{ clip: 'surprised', de: 24.3, ate: 26, expressao: 'surprised' }, { clip: 'point', de: 26.4, ate: 28.4, params: { dir: 'forward' } }, talk(24, 28.4)] }],
  fluxos: [fl('bolha', [9, 1.7, 2.6], null, { taxa: 6 })],
  camera: { tipo: 'fixa', pos: [1, 4.8, 33], olha: [0, 1.4, 0], fov: 45 },
  elementos: [{ tipo: 'seta', direcao: 'esquerda', pos: [0.55, 0.45], tamanho: 0.2, de: 26.2, ate: 28.4, pulsa: true }, { tipo: 'etiqueta', texto: 'VALA NO FUNDO', pos: [0.3, 0.6], ponto: '#d9b878', de: 25.8, ate: 28.4 }],
});
// 7  rebocar até a vala
add(28.5, 35.15, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(),
    ...segMovel('tubo', [[28.5, [14, 1.7, 0]], [34.6, [0, 1.7, 0]]], { oscila: { eixo: 'y', amp: 0.06, freq: 0.5 } }),
    F('reboc', [8.5, 3, 0], [3, 1.1, 1.6], '#d9473a', { anim: { pos: [[28.5, [8.5, 3, 0]], [34.6, [-5.5, 3, 0]]] } }),
    F('cabine', [8.5, 4.1, 0], [1.4, 1, 1.2], '#ffffff', { anim: { pos: [[28.5, [8.5, 4.1, 0]], [34.6, [-5.5, 4.1, 0]]] } })],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [-3, 1, 9.4], giro: 0, viraPara: olha(28.5), acoes: [{ clip: 'point', de: 29, ate: 34.6, params: { dir: 'forward' } }, talk(28.5, 34.6)] }],
  fluxos: [fl('vapor', [8.5, 3.7, 1.5], null, { taxa: 10 })],
  camera: { tipo: 'fixa', pos: [-2, 4.4, 32], olha: [-1, 1.8, 0], fov: 45 },
  elementos: [{ tipo: 'etiqueta', texto: 'REBOCADOR', pos: [0.65, 0.34], ponto: '#d9473a', de: 29, ate: 32 }],
});
// 8  mas ele está boiando
add(35.15, 38.55, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[35.15, [0, 1.7, 0]], [38.55, [0, 1.7, 0]]], { oscila: { eixo: 'y', amp: 0.1, freq: 0.7 } })],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [-1, 1, 9.4], giro: 0, viraPara: olha(35.15), acoes: [{ clip: 'think', de: 35.2, ate: 38.5 }] }],
  camera: { tipo: 'fixa', pos: [4, 3.2, 20], olha: [-2, 1.6, 0], fov: 42 },
  elementos: [{ tipo: 'icone', icone: 'interrogacao', pos: [0.6, 0.4], tamanho: 0.22, de: 36.8, ate: 38.5, pulsa: true }],
});
// 9  enche o pedaço de água (lastro)
add(38.55, 41.2, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[38.55, [0, 1.7, 0]], [41.2, [0, 1.15, 0]]]),
    { id: 'mang', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.5, params: { pontos: [[0, 7, 0], [0, 3.5, 0]], raio: 0.2, cor: '#3d8ee0' } }],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [-2, 1, 9.4], giro: 0, viraPara: olha(38.55), acoes: [{ clip: 'point', de: 38.8, ate: 41.1, params: { dir: 'forward' } }, talk(38.55, 41.1)] }],
  fluxos: [fl('agua', [0, 7, 0], [0, 3, 0], { taxa: 55, de: 38.7, ate: 41.2 })],
  camera: { tipo: 'fixa', pos: [3, 3.2, 14], olha: [0, 2.4, 0], fov: 42 },
  elementos: [{ tipo: 'etiqueta', texto: 'ÁGUA DE LASTRO', pos: [0.5, 0.3], ponto: '#3aa0e8', de: 39, ate: 41.1 }],
});
// 10  desce aos poucos até encostar
add(41.2, 46.4, {
  ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[41.2, [0, 1.15, 0]], [45.8, [0.35, 0.5, 0]]])],
  fluxos: [fl('bolha', [0, 1.2, 3], null, { taxa: 12, de: 41.4, ate: 45.8 })],
  camera: { tipo: 'fixa', pos: [-2, 4, 28], olha: [-3, 1.4, 0], fov: 45 },
  elementos: [{ tipo: 'seta', direcao: 'baixo', pos: [0.5, 0.3], tamanho: 0.2, de: 41.6, ate: 45.6, pulsa: true }],
});
// 11  mas ficou uma fresta
add(46.4, 50.5, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[46.4, [0.35, 0.5, 0]], [50.5, [0.35, 0.5, 0]]])],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [-1, 1, 9.4], giro: 0, viraPara: olha(46.4), acoes: [{ clip: 'surprised', de: 46.6, ate: 48.8, expressao: 'worried' }, talk(49.4, 50.4)] }],
  fluxos: [fl('agua', [-3.4, 3.4, 0], [-3.35, 0.7, 0], { taxa: 20, de: 46.8, ate: 50.3, dispersao: 0.1, espalha: 0.1 })],
  camera: { tipo: 'fixa', pos: [-3, 3.2, 11], olha: [-3.2, 1.3, 0], fov: 38 },
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.5, 0.32], tamanho: 0.2, de: 46.8, ate: 50.4, pulsa: true }],
});
// 12  a pressão da água resolve
add(50.5, 53.8, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[50.5, [0.35, 0.5, 0]], [52.8, [0.35, 0.5, 0]], [53.8, [0.05, 0.5, 0]]])],
  fluxos: [fl('bolha', [3.8, 1.5, 2], null, { taxa: 10 })],
  camera: { tipo: 'fixa', pos: [4, 3.2, 15], olha: [0, 1.4, 0], fov: 40 },
  elementos: [{ tipo: 'seta', direcao: 'esquerda', pos: [0.75, 0.42], tamanho: 0.2, pulsa: true, de: 50.8, ate: 53.7 }, { tipo: 'seta', direcao: 'esquerda', pos: [0.75, 0.52], tamanho: 0.2, pulsa: true, de: 51.1, ate: 53.7 }],
  textos: [{ texto: 'A PRESSÃO FECHA A JUNTA', de: 50.7, ate: 53.7, estilo: 'destaque' }],
});
// 13  empurra, aperta a borracha, nem uma gota
add(53.8, 58.8, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[53.8, [0.05, 0.5, 0]], [54.8, [0, 0.5, 0]], [58.8, [0, 0.5, 0]]]),
    F('borracha', [-3.5, 0.5, 0], [0.35, 1.9, 3.5], '#222226', { aparece: 55 })],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [-3.5, 1, 9.4], giro: 0, viraPara: olha(53.8), acoes: [{ clip: 'point', de: 54.2, ate: 56.6, params: { dir: 'forward' } }, { clip: 'cheer', de: 57.2, ate: 58.8 }, talk(54, 56.6)] }],
  camera: { tipo: 'fixa', pos: [-3, 3.2, 12], olha: [-3.4, 1.4, 0], fov: 38 },
  elementos: [{ tipo: 'etiqueta', texto: 'BORRACHA APERTADA', pos: [0.5, 0.3], ponto: '#222226', de: 55.2, ate: 57.1 }, { tipo: 'icone', icone: 'v', pos: [0.5, 0.42], tamanho: 0.2, de: 57.2, ate: 58.7 }],
  textos: [{ texto: 'NEM UMA GOTA', de: 57.2, ate: 58.7, estilo: 'destaque' }],
});
// 14  água dentro: bombeia pra fora
add(58.8, 64, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[58.8, [0, 0.5, 0]], [64, [0, 0.5, 0]]], { opac: 0.6 }),
    F('aguaDentro', [0, 0.55, 0], [6.4, 1.7, 3.2], '#3d8ee0', { some: 63.3, opacidade: 0.85 }),
    { id: 'cano', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.5, params: { pontos: [[0, 1.5, 0], [0, 5.5, 0], [5, 5.5, 0], [5, 5.5, 3]], raio: 0.2, cor: '#d9473a' } },
    F('bomba', [0, 3.4, 0], [1.4, 1.3, 1.4], '#f2c94c', { apoiada: true }, { tipo: 'cilindro' })],
  personagens: [{ id: 'serv', preset: 'servente', pos: [3, 1, 9.4], giro: 0, viraPara: olha(58.8), acoes: [{ clip: 'point', de: 60, ate: 62, params: { dir: 'forward' } }] }],
  fluxos: [fl('agua', [0, 0, 0], null, { caminho: [[0, 1.5, 0], [0, 5.5, 0], [5, 5.5, 0], [5, 5.5, 3]], taxa: 35, velocidade: 3, de: 59.6, ate: 63.3 })],
  camera: { tipo: 'fixa', pos: [3, 3.2, 22], olha: [1, 2.5, 0], fov: 42 },
  elementos: [{ tipo: 'etiqueta', texto: 'BOMBEIA PRA FORA', pos: [0.5, 0.3], ponto: '#d9473a', de: 60.6, ate: 63.8 }],
});
// 15  seco: as paredes das pontas saem
add(64, 67.9, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), ...segMovel('tubo', [[64, [0, 0.5, 0]], [67.9, [0, 0.5, 0]]], { opac: 0.45, tampaSome: 65.4 }),
    F('tampaA', [-7.2 - 3.6, 0.5, 0], [0.3, 2, 3.6], TAMPA, { some: 65.4 })],
  personagens: [{ id: 'serv', preset: 'servente', pos: [3, 0.5, 0], giro: 90, movimentos: [{ de: 65.4, ate: 67.8, para: [-6, 0], clip: 'walk' }], acoes: [] }],
  camera: { tipo: 'fixa', pos: [1, 3.2, 20], olha: [-2, 1.4, 0], fov: 40 },
  elementos: [{ tipo: 'etiqueta', texto: 'TÚNEL SECO', pos: [0.5, 0.3], ponto: '#3fa94f', de: 64.8, ate: 67.8 }],
});
// 16  mas ele está exposto
add(67.9, 70.4, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), seg('tubo', [0, 0.5, 0]), F('navio', [10, 3, 0], [3.6, 1.1, 1.6], '#d9473a', { movimentos: [{ de: 68, ate: 70.3, para: [-2, 0] }] })],
  fluxos: [fl('bolha', [0, 2.6, 2], null, { taxa: 10 })],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [-1, 1, 9.4], giro: 0, viraPara: olha(67.9), acoes: [{ clip: 'point', de: 68.3, ate: 70.3, params: { dir: 'forward' } }, talk(67.9, 70.3)] }],
  camera: { tipo: 'fixa', pos: [4, 3.6, 24], olha: [-2, 1.4, 0], fov: 42 },
  efeitos: [{ tipo: 'pretoebranco', de: 68.2, ate: 70.3, zoom: 1.06 }],
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.5, 0.36], tamanho: 0.2, de: 68.4, ate: 70.3, pulsa: true }],
});
// 17  cobre com pedras e terra
add(70.4, 73.45, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), SEGA(), seg('tubo', [0, 0.5, 0]),
    { id: 'm1', asset: 'monte', params: { material: 'pedra', raio: 3.2 }, pos: [-6, 2.5, 0], etapa: [[70.6, 0.05], [73.2, 1]] },
    { id: 'm2', asset: 'monte', variante: 'terra', pos: [0, 2.5, 0], etapa: [[70.8, 0.05], [73.3, 1]] },
    { id: 'm3', asset: 'monte', params: { material: 'pedra', raio: 3.2 }, pos: [5, 0.5, 0], etapa: [[71, 0.05], [73.3, 1]] }],
  personagens: [{ id: 'serv', preset: 'servente', pos: [5, 1, 9.4], giro: 0, viraPara: [{ em: 70.4, alvo: 'm2' }], acoes: [{ clip: 'dig', de: 70.4, ate: 73.4 }] }],
  fluxos: [fl('pedra', [-6, 8, 0], [-6, 3, 0], { taxa: 40, de: 70.6, ate: 73.1, espalha: 1.5 }), fl('terra', [0, 8, 0], [0, 3, 0], { taxa: 40, de: 70.8, ate: 73.2, espalha: 1.5 })],
  camera: { tipo: 'fixa', pos: [0, 4.8, 30], olha: [-2, 1.8, 0], fov: 45 },
  textos: [{ texto: 'PEDRAS E TERRA', de: 70.6, ate: 73.3, estilo: 'destaque' }],
});
// 18  carros atravessam o túnel
add(73.45, 78.3, {
  transicao: 'flash', ambiente: LIT,
  objetos: [...mar(), seg('segA', [-7.2, 0.5, 0], { opacidade: 0.4 }), seg('tubo', [0, 0.5, 0], { opacidade: 0.4 }),
    { id: 'm1', asset: 'monte', params: { material: 'pedra', raio: 3.2 }, pos: [-6, 2.5, 0] },
    { id: 'm2', asset: 'monte', variante: 'terra', pos: [0, 2.5, 0] },
    { id: 'carro', asset: 'carro_hatch', variante: 'vermelho', pos: [-13, 0.55, 0.9], movimentos: [{ de: 73.6, ate: 78.1, para: [8, 0.9] }] },
    { id: 'carro2', asset: 'carro_sedan', variante: 'azul', pos: [8, 0.55, -0.9], movimentos: [{ de: 74.4, ate: 78.2, para: [-13, -0.9] }] }],
  camera: { tipo: 'fixa', pos: [-1, 3.2, 24], olha: [-2, 1.6, 0], fov: 42 },
  textos: [{ texto: 'VOCÊ ATRAVESSARIA ESSE TÚNEL?', de: 74.4, ate: 78.2, estilo: 'pergunta' }],
});

const dur = 78.3;
const sb = {
  versao: 1, titulo: 'Túnel submerso', formato: { largura: 1080, altura: 1920, fps: 30 }, duracao: dur,
  audio: 'narracao.wav', palavras: 'palavras.json', legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: { horario: 'dia', chao: 'areia', nuvens: true }, cenas: S,
};
fs.writeFileSync(new URL('./storyboard.json', import.meta.url), JSON.stringify(sb, null, 1));
console.log('cenas', S.length, 'duração', dur);
