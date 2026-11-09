// Storyboard: Por que sua casa tem caixa d'água?
// Rode: node projects/por-que-sua-casa-tem-caixa-d-agua/gerar-storyboard.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, transicao: 'flash', ...c });
const talk = (de, ate, extra = {}) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'], ...extra });
const olhaCam = (em) => [{ em, alvo: 'camera' }];
const AZUL = '#3d8ee0';

// ---------- terreno da "sua casa" ----------
const TERRENO = { fundo: 'campo', chao: 'grama', horario: 'dia' };
const casa = () => ({ id: 'casa', asset: 'casa_simples', variante: 'amarela', pos: [0, 0, 0] });
const arvores = () => [
  { id: 'arv1', asset: 'arvore_redonda', pos: [-9, 0, -4], params: { seed: 3 } },
  { id: 'arv2', asset: 'arvore_frutifera', variante: 'laranja', pos: [10, 0, -5] },
  { id: 'arb1', asset: 'arbusto', variante: 'florido', pos: [-9.5, 0, 1] },
  { id: 'cerca', asset: 'cerca', variante: 'branca', pos: [-12, 0, 2], giro: 90, params: { length: 6 } },
];
const poco = (agua = true, aparece) => [
  { id: 'poco', asset: 'forma', pos: [-7, 0, 5.6], params: { tipo: 'cilindro', tamanho: [1.6, 0.9, 1.6], cor: '#9aa0a6' } },
  ...(agua ? [{ id: 'pocoagua', asset: 'forma', pos: [-7, 0.86, 5.6], params: { tipo: 'cilindro', tamanho: [1.3, 0.06, 1.3], cor: AZUL, brilho: true }, ...(aparece ? { aparece } : {}) }] : []),
];
const pia = () => [
  { id: 'pia', asset: 'forma', pos: [2.4, 0, 4.8], params: { tipo: 'caixa', tamanho: [1.3, 0.9, 0.7], cor: '#e8eef5' } },
];
const bomba = (aparece, vel = 120) => [
  { id: 'bomba', asset: 'forma', pos: [-4.5, 0, 5.6], params: { tipo: 'caixa', tamanho: [1, 0.8, 0.8], cor: '#d9473a' }, ...(aparece ? { aparece } : {}) },
  { id: 'motor', asset: 'engrenagem', variante: 'prata', escala: 0.28, pos: [-4.5, 0.8, 6.05], params: { velocidade: vel }, ...(aparece ? { aparece } : {}) },
];
// cano poço -> bomba -> torneira
const P_TORNEIRA = [[-7, 0.6, 5.6], [-4.5, 0.4, 5.6], [2.4, 0.4, 5.6], [2.4, 1.3, 5.6], [2.4, 1.3, 4.95]];
const canoTorneira = () => ({ id: 'cano1', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_TORNEIRA, raio: 0.1, cor: '#5b8fb9' } });
// torre da caixa d'água
const TX = 6.5, TZ = 1.5, TH = 5;
const torre = (etapa, aparece) => [
  ...[[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].map(([dx, dz], i) => ({ id: `perna${i}`, asset: 'forma', pos: [TX + dx, 0, TZ + dz], params: { tipo: 'caixa', tamanho: [0.22, TH, 0.22], cor: '#8a5a34' }, ...(aparece ? { aparece } : {}) })),
  { id: 'plataforma', asset: 'forma', pos: [TX, TH, TZ], params: { tipo: 'caixa', tamanho: [2.6, 0.2, 2.6], cor: '#a9743f' }, ...(aparece ? { aparece } : {}) },
  { id: 'caixa', asset: 'tanque', variante: 'agua', pos: [TX, TH + 0.2, TZ], params: { raio: 1.1, altura: 2, nivel: 0.8 }, ...(etapa ? { etapa } : {}), ...(aparece ? { aparece } : {}) },
];
const P_SOBE = [[-4.5, 0.75, 6.3], [7.9, 0.75, 6.3], [7.9, 0.75, TZ], [7.9, TH + 2.6, TZ], [TX, TH + 2.6, TZ], [TX, TH + 2.1, TZ]];
const canoSobe = () => ({ id: 'cano2', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_SOBE, raio: 0.1, cor: '#5b8fb9' } });
const P_DESCE = [[TX - 0.6, TH + 0.4, TZ + 0.6], [TX - 0.6, 1.6, TZ + 0.6], [TX - 0.6, 1.6, 4.95], [2.4, 1.6, 4.95], [2.4, 1.3, 4.95]];
const canoDesce = () => ({ id: 'cano3', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_DESCE, raio: 0.1, cor: '#5b8fb9' } });
const aguaTorneira = (de, ate, extra = {}) => ({ material: 'agua', origem: [2.4, 1.25, 4.95], destino: [2.4, 0.92, 4.8], taxa: 40, dispersao: 0.05, espalha: 0.25, ...(de !== undefined ? { de, ate } : {}), ...extra });

const CAM_POCO = { tipo: 'fixa', pos: [-4.2, 3.2, 12], olha: [-6.6, 0.8, 5.8], fov: 40 };
const CAM_BOMBA = { tipo: 'fixa', pos: [-1.8, 2.6, 11.5], olha: [-4.5, 0.8, 5.6], fov: 40 };
const CAM_PIA = { tipo: 'fixa', pos: [5.2, 2.3, 10.5], olha: [2.6, 1.1, 5.3], fov: 40 };
const CAM_TORRE = { tipo: 'fixa', pos: [11, 3.2, 17], olha: [4.5, 4, 2], fov: 46 };
const guia = (pos, extra = {}) => ({ id: 'guia', preset: 'construtor', pos, giro: 0, ...extra });
const mulher = (extra = {}) => ({ id: 'mulher', preset: 'mulher', pos: [3.55, 0, 5.3], giro: -70, ...extra });

// ---------- cenas ----------
// 1  gancho: casa americana sem caixa d'água
add(0, 4.4, {
  transicao: 'corte',
  ambiente: { fundo: 'cidade', chao: 'grama' },
  objetos: [
    { id: 'rua', asset: 'rua_reta', pos: [0, 0, 6], giro: 90, params: { length: 60 } },
    { id: 'casa', asset: 'casa_moderna', variante: 'quente', pos: [0, 0, -4] },
    { id: 'arb', asset: 'arbusto', variante: 'florido', pos: [3.6, 0, 1.2] },
    { id: 'arv', asset: 'arvore_redonda', pos: [-7, 0, -2], params: { seed: 4 } },
    { id: 'mang', asset: 'tubo', pos: [0, 0, 0], params: { pontos: [[4.6, 0.6, -0.1], [4.6, 0.05, 0.4], [2.5, 0.05, 1.4], [2.2, 1.0, 1.6]], raio: 0.05, cor: '#4f9d5a' } },
    { id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [-25, 0.06, 7.7], giro: 90, movimentos: [{ de: 0, ate: 4.4, para: [20, 7.7] }] },
  ],
  personagens: [{ id: 'homem', preset: 'homem', pos: [2, 0, 1.8], giro: 120, acoes: [{ clip: 'point', de: 0, ate: 4.4, params: { dir: 'forward' } }] }],
  fluxos: [{ material: 'agua', origem: [2.4, 1.05, 1.5], destino: [3.6, 0.6, 1.2], taxa: 50, arco: 0.8, espalha: 0.3 }],
  camera: { tipo: 'travelling', de: { pos: [9, 2.2, 16], olha: [0, 2.4, -3] }, para: { pos: [6, 1.8, 12], olha: [0, 2.6, -3] }, fov: 42 },
  textos: [{ texto: "POR QUE SUA CASA TEM CAIXA D'ÁGUA?", de: 0.1, ate: 4.3, estilo: 'titulo' }],
  elementos: [{ tipo: 'etiqueta', texto: 'EUA: sem caixa no telhado', pos: [0.5, 0.3], ponto: '#d9473a', de: 1.2, ate: 4.3 }],
});
// 2  por que a sua tem?
add(4.4, 6.2, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...torre([[4.4, 0.3], [6.2, 0.8]]), ...poco(), ...bomba(), canoSobe()],
  personagens: [guia([2, 0, 8], { viraPara: olhaCam(4.4), acoes: [{ clip: 'point', de: 4.5, ate: 6.2, params: { dir: 'forwardUp' } }, talk(4.4, 6.2)] })],
  fluxos: [{ material: 'agua', caminho: P_SOBE, taxa: 30, velocidade: 4 }],
  camera: CAM_TORRE,
});
// 3  você vai levar água sozinho (terreno sem nada)
add(6.2, 10.7, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores()],
  personagens: [guia([-8, 0, 10], {
    movimentos: [{ de: 6.2, ate: 8.8, para: [-5.5, 7.5], clip: 'walk' }],
    viraPara: olhaCam(8.9),
    acoes: [{ clip: 'point', de: 9, ate: 10.7, params: { dir: 'forward' } }, talk(8.9, 10.7)],
  })],
  fluxos: [{ material: 'agua', origem: [-7, 1.2, 5.6], taxa: 6, dispersao: 0.3, de: 9, ate: 10.7 }],
  camera: { tipo: 'enquadrar', alvo: 'casa', plano: 'geral', angulo: -35, elevacao: 12, deriva: 15 },
});
// 4  cava um poço
add(10.7, 13.8, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(true, 12.9),
    { id: 'monte', asset: 'monte', variante: 'terra', pos: [-9.3, 0, 6.5], params: { raio: 0.9 }, etapa: [[10.7, 0.1], [13.8, 1]] }],
  personagens: [guia([-7, 0, 7.2], { giro: 200, overrides: { held: { R: 'shovel' } }, acoes: [{ clip: 'dig', de: 10.7, ate: 12.9 }, { clip: 'cheer', de: 12.9, ate: 13.8, expressao: 'happy' }] })],
  fluxos: [
    { material: 'terra', origem: [-7, 0.9, 5.6], destino: [-9.3, 0.6, 6.5], taxa: 30, arco: 1, de: 10.8, ate: 12.8 },
    { material: 'agua', origem: [-7, 0.7, 5.6], taxa: 20, dispersao: 0.5, de: 12.9, ate: 13.8, subida: 1 },
  ],
  camera: CAM_POCO,
});
// 5  carregar balde é pesado
add(13.8, 17.4, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(),
    { id: 'balde', asset: 'forma', pos: [-6.2, 0.75, 7.3], params: { tipo: 'cilindro', tamanho: [0.4, 0.4, 0.4], cor: '#3d6fb6' },
      movimentos: [{ de: 13.8, ate: 17.4, para: [-2.9, 7.3] }] }],
  personagens: [guia([-6.2, 0, 6.85], {
    movimentos: [{ de: 13.8, ate: 17.4, para: [-2.9, 6.85], clip: 'carry', velocidade: 0.6 }],
    acoes: [{ clip: 'carry', de: 13.8, ate: 17.4, expressao: 'worried' }],
  })],
  fluxos: [{ material: 'agua', origem: { ancora: 'balde', desloca: [0, 0.4, 0] }, taxa: 10, dispersao: 0.15, tamanho: 0.05 }],
  camera: { tipo: 'fixa', pos: [-4, 1.6, 13], olha: [-4.5, 0.9, 7], fov: 40 },
  efeitos: [{ tipo: 'zoom', de: 13.8, ate: 17.4, para: 1.12 }],
});
// 6  bomba que puxa água pelo cano até a torneira
add(17.4, 22.5, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(17.6), canoTorneira(), ...pia()],
  personagens: [guia([-3, 0, 8], { viraPara: [{ em: 17.4, alvo: 'bomba' }, { em: 20, alvo: 'pia' }], acoes: [{ clip: 'point', de: 17.6, ate: 22.5, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'agua', caminho: P_TORNEIRA, taxa: 30, velocidade: 3.2, de: 18.2, ate: 22.5 }, aguaTorneira(20.2, 22.5)],
  camera: { tipo: 'travelling', de: { pos: [-3, 3, 14], olha: [-4, 0.6, 5.6] }, para: { pos: [3, 3, 14], olha: [1.5, 0.8, 5.2] }, fov: 46 },
  elementos: [{ tipo: 'etiqueta', texto: 'bomba', ancora: 'bomba', alturaRel: 1.6, ponto: '#d9473a', de: 18, ate: 20 }],
});
// 7  a bomba liga toda vez
add(22.5, 26.1, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(undefined, 220), canoTorneira(), ...pia(),
    { id: 'fio', asset: 'tubo', pos: [0, 0, 0], params: { pontos: [[-3.4, 2.4, 4.2], [-4.5, 1.6, 5.6], [-4.5, 0.85, 5.6]], raio: 0.03, cor: '#2f3338' } }],
  personagens: [mulher({ acoes: [{ clip: 'crouch', de: 22.5, ate: 23.4 }, { clip: 'idle', de: 23.4, ate: 26.1 }] })],
  fluxos: [
    { material: 'eletricidade', caminho: [[-3.4, 2.4, 4.2], [-4.5, 1.6, 5.6], [-4.5, 0.85, 5.6]], taxa: 20, velocidade: 3, de: 23, ate: 26.1 },
    { material: 'agua', caminho: P_TORNEIRA, taxa: 30, velocidade: 3.2, de: 23.2, ate: 26.1 },
    aguaTorneira(24.5, 26.1),
  ],
  camera: CAM_BOMBA,
  elementos: [{ tipo: 'icone', icone: 'raio', ancora: 'bomba', alturaRel: 2, tamanho: 0.16, pulsa: true, de: 23, ate: 26 }],
});
// 8  se a energia acaba, sem água
add(26.1, 29.8, {
  ambiente: { ...TERRENO, horario: 'nublado' },
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(undefined, 0), canoTorneira(), ...pia()],
  personagens: [mulher({ viraPara: olhaCam(26.6), acoes: [{ clip: 'surprised', de: 26.6, ate: 29.8, expressao: 'worried' }] }),
    guia([0.5, 0, 7.5], { viraPara: [{ em: 26.1, alvo: 'pia' }], acoes: [{ clip: 'shrug', de: 27, ate: 29.8, expressao: 'sad' }] })],
  fluxos: [aguaTorneira(26.1, 27.2, { taxa: 12 })],
  camera: CAM_PIA,
  efeitos: [{ tipo: 'pretoebranco', de: 27, ate: 29.7, zoom: 1.1 }, { tipo: 'tremor', de: 27, ate: 27.6, intensidade: 0.5 }],
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.75, 0.32], tamanho: 0.18, de: 27.3, ate: 29.7 }],
});
// 9  truque dos romanos: aqueduto por gravidade
const ARCOS = [-8, -4, 0, 4, 8];
const P_AQ = [[-11, 5.4, 0], [11, 3.6, 0]];
add(29.8, 33.1, {
  ambiente: { fundo: 'campo', chao: 'grama' },
  objetos: [
    ...ARCOS.map((x, i) => ({ id: `pilar${i}`, asset: 'forma', pos: [x, 0, 0], params: { tipo: 'caixa', tamanho: [1, 5 - (x + 11) * 0.08, 1.2], cor: '#d8c39a' }, aparece: 29.9 + i * 0.25 })),
    { id: 'canal', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.5, params: { pontos: P_AQ, raio: 0.35, cor: '#c8b48a' }, aparece: 31.2 },
    { id: 'arv', asset: 'arvore_pinheiro', pos: [-12, 0, -5] },
  ],
  personagens: [guia([3, 0, 6], { viraPara: olhaCam(29.8), acoes: [{ clip: 'think', de: 29.8, ate: 31.3 }, { clip: 'point', de: 31.3, ate: 33.1, params: { dir: 'forwardUp' } }] })],
  fluxos: [{ material: 'agua', caminho: P_AQ, taxa: 50, velocidade: 4, de: 31.4, ate: 33.1 }],
  camera: { tipo: 'travelling', de: { pos: [4, 3, 24], olha: [0, 3, 0] }, para: { pos: [7, 3.5, 20], olha: [0, 3.2, 0] }, fov: 50 },
});
// 10  bombeia uma vez para um tanque no alto
add(33.1, 36.9, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(), ...torre([[33.1, 0], [36.9, 0.85]], 33.2), canoSobe(), ...pia()],
  personagens: [guia([3.5, 0, 8.5], { viraPara: [{ em: 33.1, alvo: 'caixa' }], acoes: [{ clip: 'point', de: 33.4, ate: 36.9, params: { dir: 'forwardUp' } }] })],
  fluxos: [{ material: 'agua', caminho: P_SOBE, taxa: 35, velocidade: 5, de: 33.5, ate: 36.9 }],
  camera: { tipo: 'travelling', de: { pos: [1, 1.6, 16], olha: [0, 1, 5] }, para: { pos: [2, 3.5, 17], olha: [TX, TH, TZ] }, fov: 44 },
});
// 11  gravidade empurra de graça
add(36.9, 41.3, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(undefined, 0), ...torre([[36.9, 0.85], [41.3, 0.65]]), canoSobe(), canoDesce(), ...pia()],
  personagens: [mulher({ acoes: [{ clip: 'crouch', de: 36.9, ate: 38 }, { clip: 'cheer', de: 38.5, ate: 41.3, expressao: 'happy' }] })],
  fluxos: [{ material: 'agua', caminho: P_DESCE, taxa: 35, velocidade: 3.5, de: 37.2, ate: 41.3 }, aguaTorneira(38, 41.3)],
  camera: CAM_TORRE,
  textos: [{ texto: 'GRAVIDADE: R$ 0', de: 38.8, ate: 41.2, estilo: 'destaque' }],
  elementos: [{ tipo: 'seta', direcao: 'baixo', ancora: 'perna0', alturaRel: 0.6, dx: -0.1, tamanho: 0.14, pulsa: true, de: 37.3, ate: 41.2 }],
});
// 12  dez metros = uma atmosfera
add(41.3, 46.2, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...torre([[41.3, 0.65], [46.2, 0.5]]), canoDesce(), ...pia()],
  personagens: [guia([4.5, 0, 6.5], { viraPara: olhaCam(41.3), acoes: [{ clip: 'point', de: 41.5, ate: 46.2, params: { dir: 'forwardUp' } }, talk(41.3, 46.2)] })],
  fluxos: [{ material: 'agua', caminho: P_DESCE, taxa: 40, velocidade: 5, de: 41.3, ate: 46.2 }, aguaTorneira(41.3, 46.2, { taxa: 70, arco: 0.4, destino: [2.4, 0.92, 4.4] })],
  camera: { tipo: 'fixa', pos: [8, 0.8, 13], olha: [5.6, 3.6, 2], fov: 46 },
  elementos: [
    { tipo: 'seta', direcao: 'vertical', ancora: 'perna1', alturaRel: 0.5, dx: 0.1, tamanho: 0.14, de: 41.6, ate: 46 },
    { tipo: 'etiqueta', texto: '10 metros = 1 atmosfera', pos: [0.5, 0.28], ponto: AZUL, de: 42, ate: 46 },
  ],
});
// ---------- prédio ----------
const CIDADE = { fundo: 'cidade', chao: 'concreto' };
const P_PREDIO = [[7.6, 61, 5.2], [7.6, 0.6, 5.2], [9.5, 0.6, 5.2]];
const predio = () => ({ id: 'predio', asset: 'predio_apartamentos', variante: 'azul', pos: [0, 0, 0], params: { floors: 20 } });
const canoPredio = () => ({ id: 'canoP', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_PREDIO, raio: 0.18, cor: '#5b8fb9' } });
// 13  mas aí vem o problema: prédio de vinte andares
add(46.2, 50.4, {
  ambiente: CIDADE,
  objetos: [predio(), canoPredio(),
    { id: 'rua', asset: 'rua_reta', pos: [0, 0, 14], giro: 90, params: { length: 70 } },
    { id: 'onibus', asset: 'onibus', variante: 'vermelho', pos: [-30, 0.06, 15.7], giro: 90, movimentos: [{ de: 46.2, ate: 50.4, para: [25, 15.7] }] }],
  personagens: [guia([3, 0, 9], { viraPara: [{ em: 46.2, alvo: 'predio' }], acoes: [{ clip: 'surprised', de: 46.6, ate: 50.4 }] })],
  fluxos: [{ material: 'agua', caminho: P_PREDIO, taxa: 40, velocidade: 12 }],
  camera: { tipo: 'travelling', de: { pos: [10, 1.8, 30], olha: [0, 4, 0] }, para: { pos: [12, 4, 40], olha: [0, 32, 0] }, fov: 50 },
  textos: [{ texto: 'E UM PRÉDIO DE 20 ANDARES?', de: 47.6, ate: 50.3, estilo: 'destaque' }],
});
// 14  pressão estoura os canos
add(50.4, 54.4, {
  ambiente: CIDADE,
  objetos: [predio(), canoPredio(), { id: 'rua', asset: 'rua_reta', pos: [0, 0, 14], giro: 90, params: { length: 70 } }],
  personagens: [guia([10.5, 0, 8], { viraPara: olhaCam(50.4), acoes: [{ clip: 'surprised', de: 51.4, ate: 54.4, expressao: 'surprised' }] })],
  fluxos: [
    { material: 'agua', caminho: P_PREDIO, taxa: 50, velocidade: 14 },
    { material: 'agua', origem: [7.6, 1.6, 5.4], destino: [10, 0.1, 8], taxa: 90, arco: 0.6, dispersao: 0.2, espalha: 1, de: 51.2, ate: 54.4 },
    { material: 'agua', origem: [7.6, 3.2, 5.4], destino: [6, 0.1, 8.5], taxa: 60, arco: 0.6, dispersao: 0.2, espalha: 1, de: 52, ate: 54.4 },
  ],
  camera: { tipo: 'fixa', pos: [14, 3, 17], olha: [8, 2, 5.5], fov: 42 },
  efeitos: [{ tipo: 'pretoebranco', de: 51.2, ate: 54.3, zoom: 1.1 }, { tipo: 'tremor', de: 51.2, ate: 51.9, intensidade: 0.7 }],
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.25, 0.34], tamanho: 0.18, pulsa: true, de: 51.3, ate: 54.3 }],
});
// 15  válvulas seguram a pressão
add(54.4, 59.6, {
  ambiente: CIDADE,
  objetos: [predio(), canoPredio(), { id: 'rua', asset: 'rua_reta', pos: [0, 0, 14], giro: 90, params: { length: 70 } },
    { id: 'valvula', asset: 'forma', pos: [7.6, 1.6, 5.2], params: { tipo: 'esfera', tamanho: [0.7, 0.7, 0.7], cor: '#d9473a', apoiada: false }, aparece: 55 },
    { id: 'volante', asset: 'engrenagem', variante: 'vermelha', escala: 0.25, pos: [7.6, 1.35, 5.6], params: { velocidade: 90 }, aparece: 55 }],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [9.2, 0, 7], giro: -40, acoes: [{ clip: 'hammer', de: 55.2, ate: 57.4 }, { clip: 'nod', de: 57.6, ate: 59.6, expressao: 'happy' }] }],
  fluxos: [
    { material: 'agua', caminho: [[7.6, 61, 5.2], [7.6, 1.6, 5.2]], taxa: 50, velocidade: 14 },
    { material: 'agua', caminho: [[7.6, 1.6, 5.2], [7.6, 0.6, 5.2], [9.5, 0.6, 5.2]], taxa: 15, velocidade: 1.2, de: 56 },
  ],
  camera: { tipo: 'fixa', pos: [13, 2.6, 12.5], olha: [8, 1.3, 5.5], fov: 40 },
  elementos: [{ tipo: 'etiqueta', texto: 'válvula redutora de pressão', pos: [0.5, 0.3], ponto: '#d9473a', de: 55.4, ate: 59.4 }],
});
// 16  arranha-céus: de tanque em tanque
const ALT = [0.2, 24, 48];
const P_ARR = [[12.6, 1, 10], [12.6, 23.6, 10], [12.6, 26, 10], [12.6, 47.6, 10], [12.6, 50, 10], [12.6, 70, 10]];
add(59.6, 65.4, {
  ambiente: CIDADE,
  objetos: [{ id: 'torreA', asset: 'arranha_ceu', variante: 'verde', pos: [0, 0, 0] },
    { id: 'canoA', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_ARR, raio: 0.25, cor: '#5b8fb9' } },
    ...ALT.flatMap((y, i) => [
      ...(i ? [{ id: `laje${i}`, asset: 'forma', pos: [12.6, y - 0.3, 10], params: { tipo: 'caixa', tamanho: [3, 0.3, 3], cor: '#9aa3ad' } }] : []),
      { id: `tq${i}`, asset: 'tanque', variante: 'agua', pos: [12.6, y, 10], params: { raio: 1.2, altura: 2.4, nivel: 0.1 }, etapa: [[59.6 + i * 1.8, 0.1], [61.4 + i * 1.8, 0.9]] },
    ])],
  personagens: [{ id: 'eng', preset: 'engenheira', pos: [16, 0, 13], giro: -30, viraPara: olhaCam(59.6), acoes: [{ clip: 'point', de: 59.8, ate: 65.4, params: { dir: 'forwardUp' } }] }],
  fluxos: [0, 1, 2].map((i) => ({ material: 'agua', caminho: P_ARR.slice(i * 2, i * 2 + 2), taxa: 30, velocidade: 10, de: 59.6 + i * 1.8, ate: 65.4 })),
  camera: { tipo: 'travelling', de: { pos: [42, 8, 58], olha: [12, 12, 10] }, para: { pos: [46, 30, 66], olha: [12, 36, 10] }, fov: 50 },
  elementos: [{ tipo: 'etiqueta', texto: 'tanques no meio do prédio', pos: [0.5, 0.3], ponto: AZUL, de: 61, ate: 65.2 }],
});
// 17  a parte mais estranha
add(65.4, 67.9, {
  ambiente: TERRENO,
  objetos: [casa(), ...arvores(), ...torre(), canoDesce(), ...pia()],
  personagens: [guia([0, 0, 12], {
    movimentos: [{ de: 65.4, ate: 66.6, para: [0, 13.2], clip: 'walk' }],
    viraPara: olhaCam(66.6),
    acoes: [{ clip: 'surprised', de: 66.6, ate: 67.9, expressao: 'surprised' }, talk(65.4, 67.9)],
  })],
  fluxos: [{ material: 'agua', caminho: P_DESCE, taxa: 20, velocidade: 3 }],
  camera: { tipo: 'enquadrar', alvo: 'guia', plano: 'medio', angulo: 10, elevacao: 6, aproxima: 0.8 },
  efeitos: [{ tipo: 'zoom', de: 66.6, ate: 67.9, para: 1.2 }],
});
// 18  EUA: rede sempre cheia
const P_REDE = [[-30, 0.12, 3.9], [30, 0.12, 3.9]];
add(67.9, 74.0, {
  ambiente: { fundo: 'cidade', chao: 'grama' },
  objetos: [
    { id: 'rua', asset: 'rua_reta', pos: [0, 0, 8], giro: 90, params: { length: 60 } },
    { id: 'casa', asset: 'casa_moderna', variante: 'quente', pos: [0, 0, -4] },
    { id: 'casa2', asset: 'casa_moderna', variante: 'escura', pos: [-13, 0, -4] },
    { id: 'arb', asset: 'arbusto', variante: 'florido', pos: [3.6, 0, 1.2] },
    { id: 'rede', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.5, params: { pontos: P_REDE, raio: 0.2, cor: '#5b8fb9' } },
    { id: 'ramal', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.5, params: { pontos: [[1, 0.12, 3.9], [1, 0.12, -0.2]], raio: 0.1, cor: '#5b8fb9' } },
    { id: 'mang', asset: 'tubo', pos: [0, 0, 0], params: { pontos: [[4.6, 0.6, -0.1], [4.6, 0.05, 0.4], [2.5, 0.05, 1.4], [2.2, 1.0, 1.6]], raio: 0.05, cor: '#4f9d5a' } },
    { id: 'carro', asset: 'carro_hatch', variante: 'vermelho', pos: [22, 0.06, 6.3], giro: -90, movimentos: [{ de: 67.9, ate: 74, para: [-24, 6.3] }] },
  ],
  personagens: [{ id: 'homem', preset: 'homem', pos: [2, 0, 1.8], giro: 120, acoes: [{ clip: 'point', de: 67.9, ate: 74, params: { dir: 'forward' } }] }],
  fluxos: [
    { material: 'agua', caminho: P_REDE, taxa: 40, velocidade: 6 },
    { material: 'agua', caminho: [[1, 0.12, 3.9], [1, 0.12, -0.2]], taxa: 15, velocidade: 2 },
    { material: 'agua', origem: [2.4, 1.05, 1.5], destino: [3.6, 0.6, 1.2], taxa: 50, arco: 0.8, espalha: 0.3 },
  ],
  camera: { tipo: 'travelling', de: { pos: [-6, 4, 18], olha: [0, 1, 2] }, para: { pos: [7, 3.5, 16], olha: [1, 1.2, 1] }, fov: 44 },
  elementos: [{ tipo: 'etiqueta', texto: 'EUA: rede cheia 24 horas', pos: [0.5, 0.3], ponto: AZUL, de: 68.4, ate: 73.8 }],
});
// 19  Brasil: falta água por horas, dias
add(74.0, 79.3, {
  ambiente: { ...TERRENO, horario: 'tarde' },
  objetos: [casa(), ...arvores(), canoTorneira(), ...pia()],
  personagens: [mulher({ viraPara: olhaCam(75), acoes: [{ clip: 'crouch', de: 74, ate: 75 }, { clip: 'shake_head', de: 75.2, ate: 79.3, expressao: 'sad' }] })],
  fluxos: [aguaTorneira(74.4, 79.3, { taxa: 1.5, tamanho: 0.07 })],
  camera: CAM_PIA,
  efeitos: [{ tipo: 'pretoebranco', de: 74.6, ate: 79.2, zoom: 1.1 }],
  elementos: [{ tipo: 'icone', icone: 'relogio', pos: [0.78, 0.33], tamanho: 0.17, pulsa: true, de: 75.5, ate: 79.2 }],
});
// 20  a caixa não é só um tanque
add(79.3, 82.4, {
  ambiente: { ...TERRENO, horario: 'tarde' },
  objetos: [casa(), ...arvores(), ...torre([[79.3, 0.9], [82.4, 0.75]]), canoDesce(), ...pia()],
  personagens: [mulher({ acoes: [{ clip: 'crouch', de: 79.3, ate: 80.3 }, { clip: 'idle', de: 80.3, ate: 82.4 }] })],
  fluxos: [{ material: 'agua', caminho: P_DESCE, taxa: 35, velocidade: 3.5, de: 79.6 }, aguaTorneira(80.6, 82.4)],
  camera: { ...CAM_TORRE, pos: [-1, 3, 17] },
});
// 21  seguro contra a torneira seca
add(82.4, 85.1, {
  ambiente: { ...TERRENO, horario: 'tarde' },
  objetos: [casa(), ...arvores(), ...torre([[82.4, 0.75], [85.1, 0.65]]), canoDesce(), ...pia()],
  personagens: [mulher({ viraPara: olhaCam(82.6), acoes: [{ clip: 'cheer', de: 82.8, ate: 85.1, expressao: 'happy' }] })],
  fluxos: [{ material: 'agua', caminho: P_DESCE, taxa: 35, velocidade: 3.5 }, aguaTorneira(82.4, 85.1)],
  camera: { ...CAM_PIA, pos: [6, 1.9, 9.5] },
  textos: [{ texto: 'SEGURO CONTRA TORNEIRA SECA', de: 82.6, ate: 85, estilo: 'destaque' }],
  elementos: [{ tipo: 'icone', icone: 'v', pos: [0.8, 0.36], tamanho: 0.16, de: 83, ate: 85 }],
});
// 22-23  pergunta final
const PERG = 'A ÁGUA JÁ ACABOU NA SUA CASA?';
add(85.1, 90.2, {
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(), ...torre([[85.1, 0.4], [90.2, 0.8]]), canoSobe(), canoDesce(), ...pia()],
  ambiente: TERRENO,
  personagens: [guia([0.5, 0, 9.5], { viraPara: olhaCam(85.1), acoes: [{ clip: 'shrug', de: 85.3, ate: 87, }, talk(85.1, 90.2)] }),
    mulher({ viraPara: olhaCam(85.1), acoes: [{ clip: 'wave', de: 85.5, ate: 90.2 }] })],
  fluxos: [{ material: 'agua', caminho: P_SOBE, taxa: 30, velocidade: 5 }],
  camera: { tipo: 'enquadrar', alvo: 'guia', plano: 'medio', angulo: 15, elevacao: 6, deriva: 10 },
  textos: [{ texto: PERG, de: 85.4, ate: 90.2, estilo: 'pergunta' }],
});
add(90.2, 94.2, {
  transicao: 'corte',
  objetos: [casa(), ...arvores(), ...poco(), ...bomba(), ...torre([[90.2, 0.8], [94.2, 1]]), canoSobe(), canoDesce(), ...pia()],
  ambiente: TERRENO,
  personagens: [guia([0.5, 0, 9.5], { viraPara: olhaCam(90.2), acoes: [{ clip: 'point', de: 90.4, ate: 94.2, params: { dir: 'forward' } }, talk(90.2, 94.2)] }),
    mulher({ viraPara: olhaCam(90.2), acoes: [{ clip: 'cheer', de: 90.4, ate: 94.2, expressao: 'happy' }] })],
  fluxos: [{ material: 'agua', caminho: P_SOBE, taxa: 30, velocidade: 5 }, aguaTorneira(90.2, 94.2)],
  camera: { tipo: 'enquadrar', alvo: 'guia', plano: 'medio', angulo: -15, elevacao: 6, aproxima: 0.88 },
  textos: [{ texto: PERG, de: 90.2, ate: 94.2, estilo: 'pergunta' }],
  elementos: [{ tipo: 'etiqueta', texto: 'sim ou não?', pos: [0.5, 0.27], ponto: '#ffd60a', de: 90.6, ate: 94 }],
});

const sb = {
  versao: 1,
  titulo: "Por que sua casa tem caixa d'água?",
  formato: { largura: 1080, altura: 1920, fps: 30 },
  duracao: 94.2,
  audio: 'narracao.mp3',
  palavras: 'palavras.json',
  legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: { horario: 'dia', chao: 'grama', nuvens: true, fundo: 'campo' },
  cenas: S,
  sons: [
    { som: 'carro', de: 0, ate: 4.4, volume: 0.15 }, { som: 'agua', de: 0.5, ate: 4.4, volume: 0.15 },
    { som: 'agua', de: 4.4, ate: 6.2, volume: 0.15 },
    { som: 'cavar', de: 10.8, ate: 12.8, volume: 0.3 }, { som: 'respingo', de: 12.9, volume: 0.3 }, { som: 'sucesso', de: 12.9, volume: 0.22 },
    { som: 'passos', de: 13.8, ate: 17.4, volume: 0.25 },
    { som: 'bomba', de: 17.6, ate: 22.5, volume: 0.15 }, { som: 'agua', de: 18.2, ate: 22.5, volume: 0.15 },
    { som: 'eletrico', de: 23, ate: 24.5, volume: 0.15 }, { som: 'bomba', de: 23, ate: 26.1, volume: 0.18 }, { som: 'agua', de: 24.5, ate: 26.1, volume: 0.15 },
    { som: 'erro', de: 27, volume: 0.3 },
    { som: 'agua', de: 31.4, ate: 33.1, volume: 0.15 },
    { som: 'bomba', de: 33.1, ate: 36.9, volume: 0.15 }, { som: 'agua', de: 33.5, ate: 36.9, volume: 0.12 },
    { som: 'agua', de: 37.2, ate: 41.3, volume: 0.15 }, { som: 'sucesso', de: 38.5, volume: 0.22 },
    { som: 'agua', de: 41.3, ate: 46.2, volume: 0.18 },
    { som: 'carro', de: 46.2, ate: 50.4, volume: 0.15 },
    { som: 'estouro', de: 51.2, volume: 0.35 }, { som: 'alerta', de: 51.4, ate: 54.2, volume: 0.12 }, { som: 'agua', de: 51.2, ate: 54.4, volume: 0.2 },
    { som: 'martelo', de: 55.2, ate: 57.4, volume: 0.25 }, { som: 'sucesso', de: 57.6, volume: 0.2 },
    { som: 'agua', de: 59.6, ate: 65.4, volume: 0.12 },
    { som: 'carro', de: 67.9, ate: 74, volume: 0.12 }, { som: 'agua', de: 68, ate: 74, volume: 0.12 },
    { som: 'relogio', de: 75.2, ate: 79.2, volume: 0.2 }, { som: 'respingo', de: 75.5, volume: 0.2 },
    { som: 'agua', de: 79.6, ate: 82.4, volume: 0.15 },
    { som: 'sucesso', de: 82.8, volume: 0.3 }, { som: 'agua', de: 82.4, ate: 85.1, volume: 0.12 },
    { som: 'agua', de: 85.1, ate: 94, volume: 0.1 },
  ],
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
console.log(`storyboard.json: ${S.length} cenas, ${sb.duracao}s`);
