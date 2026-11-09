// Wi-Fi: casa vista de cima, quarto (frente) e sala (atrás) separados por uma parede.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const CASA = { fundo: 'interior', chao: 'madeira', horario: 'dia' };
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [-0.7, 0, 1.9], giro: 0, ...extra });
const mulher = (extra = {}) => ({ id: 'mulher', preset: 'mulher', pos: [-0.3, 0, -1.7], giro: 0, ...extra });
const casa = () => [
  forma('parede', 'caixa', [5, 1.0, 0.2], '#e8dcc4', [0, 0, 0]),
  forma('mesa', 'caixa', [0.9, 0.75, 0.6], '#a9743f', [0.9, 0, 1.4]),
  forma('sofa', 'caixa', [2, 0.5, 0.8], '#3d6fb6', [-0.2, 0, -2.6]),
  forma('balcao', 'caixa', [1, 0.9, 0.6], '#c9cdd2', [1.6, 0, -2.0]),
];
const roteador = (antenas = 1, extra = {}) => [
  forma('rot', 'caixa', [0.6, 0.12, 0.4], '#f2f2f2', [0.9, 0.75, 1.4], extra),
  forma('led', 'esfera', [0.07, 0.07, 0.07], '#4f9d4a', [1.1, 0.88, 1.6], { params: { emissivo: true }, anim: { pulsa: 0.4 }, ...extra }),
  ...[0, -0.2, 0.2].slice(0, antenas).map((dx, i) => forma(`ant${i}`, 'cilindro', [0.05, 0.5, 0.05], '#2f3338', [0.9 + dx, 0.87, 1.25], extra)),
];
const microondas = (extra = {}) => forma('micro', 'caixa', [0.6, 0.4, 0.45], '#e8eef5', [1.6, 0.9, -2.0], extra);
const P_WIFI = [[0.9, 1.35, 1.3], [0.5, 2.0, 0.1], [-0.3, 1.5, -1.6]];
const ONDA = (extra = {}) => ({ material: 'luz', caminho: P_WIFI, taxa: 30, velocidade: 3, tamanho: 0.06, ...extra });
const GERAL = { tipo: 'fixa', pos: [0.4, 7.0, 6.0], olha: [0.1, 0.5, -0.4], fov: 52 };
const GERAL2 = { tipo: 'fixa', pos: [-2.2, 6.4, 5.6], olha: [0.2, 0.5, -0.4], fov: 52 };
const ROT = { tipo: 'fixa', pos: [1.7, 1.8, 3.3], olha: [0.9, 1.0, 1.35], fov: 38 };
const SALA = { tipo: 'fixa', pos: [1.4, 2.9, 1.4], olha: [1.0, 0.9, -1.9], fov: 50 };

const cenas = [
  { fim: 4.3, objetos: [...casa(), ...roteador()], personagens: [guia({ viraPara: olhaCam(0.2), acoes: [{ clip: 'point', de: 0.4, ate: 4.3, params: { dir: 'forward' } }, talk(0, 4.3)] }), mulher({ acoes: [{ clip: 'wave', de: 1, ate: 4.3 }] })],
    fluxos: [ONDA({ taxa: 12 })], camera: GERAL, textos: [{ texto: 'DO QUARTO PRA SALA, SEM FIO', de: 0.1, ate: 4.2, estilo: 'titulo' }] },
  { fim: 11.1, objetos: [...casa()], personagens: [guia({ viraPara: [{ em: 4.3, alvo: [0, -2] }], acoes: [{ clip: 'talk', de: 4.6, ate: 7.4, params: { energy: 2 } }, { clip: 'shrug', de: 7.6, ate: 11.1, expressao: 'sad' }] }), mulher({ acoes: [{ clip: 'shrug', de: 7.6, ate: 11.1 }] })],
    fluxos: [{ material: 'ar', origem: [-0.7, 1.6, 1.6], destino: [-0.5, 1.5, 0.15], taxa: 20, de: 4.6, ate: 9 }], camera: GERAL2, efeitos: [pb(7.6, 11)], elementos: [icone('x', 7.8, 11)] },
  { fim: 17.5, objetos: [...casa(), ...roteador(1, { aparece: 11.6 })], personagens: [guia({ acoes: [{ clip: 'point', de: 11.8, ate: 17.5, params: { dir: 'forward' } }] }), mulher({ acoes: [{ clip: 'surprised', de: 14.4, ate: 17.5, expressao: 'happy' }] })],
    fluxos: [ONDA({ de: 12.2, velocidade: 6 })], camera: GERAL, elementos: [etq('ondas de rádio', 12.4, 17.3, '#ffd60a')] },
  { fim: 21.5, objetos: [...casa(), forma('rot', 'caixa', [0.6, 0.12, 0.4], '#f2f2f2', [0.9, 0.75, 1.4]), forma('ant0', 'cilindro', [0.05, 0.5, 0.05], '#2f3338', [0.9, 0.87, 1.25], { aparece: 18.2 })],
    personagens: [guia({ pos: [0.2, 0, 1.7], giro: -60, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 17.8, ate: 21.5 }] })],
    fluxos: [{ material: 'eletricidade', caminho: [[0.9, 0.88, 1.25], [0.9, 1.36, 1.25]], taxa: 30, velocidade: 1.5, de: 18.8 }], camera: ROT },
  { fim: 26.0, objetos: [...casa(), ...roteador()], personagens: [guia({ pos: [0.2, 0, 1.7], giro: -60, acoes: [{ clip: 'point', de: 21.7, ate: 26, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'eletricidade', caminho: [[0.9, 0.88, 1.25], [0.9, 1.36, 1.25]], taxa: 30, velocidade: 1.5 }, { material: 'luz', origem: [0.9, 1.4, 1.25], taxa: 40, dispersao: 0.15, espalha: 1.5, destino: [0.9, 1.4, -0.5] }],
    camera: ROT, elementos: [etq('antena', 24.5, 25.9, '#2f3338')] },
  { fim: 29.6, objetos: [...casa(), ...roteador()], personagens: [guia({ acoes: [{ clip: 'think', de: 26.2, ate: 29.6 }] }), mulher({ acoes: [{ clip: 'shrug', de: 26.5, ate: 29.6 }] })],
    fluxos: [ONDA({ taxa: 20 })], camera: GERAL2, elementos: [icone('interrogacao', 26.4, 29.5, [0.3, 0.34])] },
  { fim: 35.15, objetos: [...casa(), ...roteador()], personagens: [guia({ pos: [0.2, 0, 1.7], giro: -60, acoes: [{ clip: 'point', de: 29.8, ate: 35.15, params: { dir: 'forward' } }] })],
    fluxos: [ONDA({ tamanho: 0.05, taxa: 20, de: 29.6, ate: 31.5 }), ONDA({ tamanho: 0.02, taxa: 20, de: 31.5, ate: 33.2 }), ONDA({ tamanho: 0.05, taxa: 20, de: 33.2, ate: 35.15 })],
    camera: { tipo: 'fixa', pos: [2.4, 2.6, 2.6], olha: [0.3, 1.3, 0.2], fov: 44 }, elementos: [etq('forte · fraca · forte', 30.2, 35, '#ffd60a')] },
  { fim: 39.6, objetos: [...casa(), ...roteador()], personagens: [guia({ pos: [0.2, 0, 1.7], giro: -60, viraPara: olhaCam(35.2), acoes: [{ clip: 'nod', de: 35.3, ate: 39.6, expressao: 'happy' }] })],
    fluxos: [ONDA({ material: 'eletricidade', velocidade: 2.5, taxa: 18 })], camera: { tipo: 'fixa', pos: [2.4, 2.6, 2.6], olha: [0.3, 1.3, 0.2], fov: 44 }, elementos: [etq('0 1 1 0 1 0 0 1', 35.6, 38, '#ffd60a'), etq('modulação', 38.1, 39.5)] },
  { fim: 43.9, objetos: [...casa(), ...roteador(), forma('mesa2', 'caixa', [0.7, 0.75, 0.5], '#8a5a34', [-2.1, 0, -1.0]), forma('rot2', 'caixa', [0.5, 0.12, 0.35], '#d9473a', [-2.1, 0.75, -1.0], { aparece: 40 })],
    personagens: [mulher({ viraPara: olhaCam(39.8), acoes: [{ clip: 'surprised', de: 40.5, ate: 43.9, expressao: 'worried' }] })],
    fluxos: [ONDA(), { material: 'fagulha', caminho: [[-2.1, 1.0, -1.0], [-1.0, 1.6, -1.3], [-0.3, 1.5, -1.6]], taxa: 25, velocidade: 3, de: 40.3 }],
    camera: SALA, efeitos: [pb(41.2, 43.8)], elementos: [icone('alerta', 41.3, 43.8, [0.25, 0.33])] },
  { fim: 49.75, objetos: [...casa(), ...roteador()], personagens: [guia({ acoes: [{ clip: 'point', de: 44.1, ate: 49.75, params: { dir: 'forward' } }] }), mulher({ acoes: [{ clip: 'nod', de: 47, ate: 49.75 }] })],
    fluxos: [ONDA({ caminho: [[0.9, 1.35, 1.3], [0.5, 1.8, 0.1], [-0.3, 1.3, -1.6]] }), ONDA({ caminho: [[0.9, 1.35, 1.3], [0.5, 2.2, 0.1], [-0.3, 1.6, -1.6]], material: 'eletricidade' }), ONDA({ caminho: [[0.9, 1.35, 1.3], [0.5, 2.6, 0.1], [-0.3, 1.9, -1.6]], material: 'fagulha' })],
    camera: GERAL, elementos: [etq('canais', 48, 49.6, '#ffd60a')] },
  { fim: 54.75, objetos: [...casa(), ...roteador()], personagens: [mulher({ viraPara: olhaCam(50), acoes: [{ clip: 'shrug', de: 50.3, ate: 54.75, expressao: 'sad' }] })],
    fluxos: [ONDA(), { material: 'luz', caminho: [[0.9, 1.35, 1.3], [2.4, 1.6, 0.6], [2.4, 1.6, -1.2], [-0.3, 1.5, -1.6]], taxa: 25, velocidade: 2 }],
    camera: GERAL2, elementos: [icone('x', 51, 54.6)] },
  { fim: 61.45, objetos: [...casa(), ...roteador(1), ...roteador(3, { aparece: 55.6 }).slice(1).map((o) => ({ ...o, id: o.id + 'b' }))],
    personagens: [guia({ pos: [0.2, 0, 1.7], giro: -60, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 55, ate: 57.5 }, { clip: 'point', de: 57.7, ate: 61.45, params: { dir: 'forward' } }] }), mulher({ acoes: [{ clip: 'cheer', de: 58.5, ate: 61.45, expressao: 'happy' }] })],
    fluxos: [ONDA({ taxa: 60, velocidade: 6, de: 57.5 })], camera: GERAL, elementos: [etq('beamforming', 59.9, 61.3, '#ffd60a')] },
  { fim: 64.35, objetos: [...casa(), ...roteador(3)], personagens: [{ id: 'homem', preset: 'homem', pos: [2.9, 0, 2.6], giro: -60, acoes: [{ clip: 'point', de: 62, ate: 64.35, params: { dir: 'forward' } }] }, mulher()],
    fluxos: [ONDA(), { material: 'luz', caminho: [[0.9, 1.35, 1.3], [2.9, 1.6, 2.6]], taxa: 20, velocidade: 3 }], camera: GERAL2, efeitos: [pb(62, 64.3)], elementos: [icone('alerta', 62.2, 64.2, [0.25, 0.33])] },
  { fim: 70.8, objetos: [...casa(), ...roteador(3)], personagens: [{ id: 'homem', preset: 'homem', pos: [2.9, 0, 2.6], giro: -60, acoes: [{ clip: 'shake_head', de: 66.5, ate: 70.8, expressao: 'angry' }] }, mulher({ acoes: [{ clip: 'cheer', de: 67.2, ate: 70.8, expressao: 'happy' }] })],
    fluxos: [ONDA(), { material: 'fagulha', caminho: [[0.9, 1.35, 1.3], [2.9, 1.6, 2.6]], taxa: 20, velocidade: 3 }], camera: GERAL, elementos: [etq('senha', 64.8, 68.9, '#4f9d4a'), etq('criptografia', 69.1, 70.7, '#4f9d4a')] },
  { fim: 75.85, objetos: [...casa(), ...roteador(3), microondas({ aparece: 71.4 })], personagens: [mulher({ pos: [1.1, 0, -1.3], giro: 150, acoes: [{ clip: 'point', de: 71.6, ate: 75.85, params: { dir: 'forward' } }] })],
    fluxos: [ONDA({ de: 71, ate: 74 }), { material: 'ar', origem: [1.6, 1.1, -1.75], taxa: 25, dispersao: 0.4, espalha: 1.5, destino: [0.5, 1.6, -0.6], de: 72.5 }], camera: SALA },
  { fim: 78.5, objetos: [...casa(), ...roteador(3), microondas()], personagens: [mulher({ viraPara: olhaCam(75.9), acoes: [{ clip: 'surprised', de: 76, ate: 78.5, expressao: 'angry' }] })],
    fluxos: [{ material: 'ar', origem: [1.6, 1.1, -1.75], taxa: 30, dispersao: 0.4, espalha: 1.5, destino: [0.5, 1.6, -0.6] }], camera: SALA, efeitos: [pb(76, 78.4)], elementos: [icone('x', 76.2, 78.4)] },
  { fim: 81.45, objetos: [...casa(), ...roteador(3)], personagens: [guia({ viraPara: olhaCam(78.6), acoes: [{ clip: 'cheer', de: 78.7, ate: 81.45, expressao: 'happy' }] }), mulher({ acoes: [{ clip: 'cheer', de: 78.7, ate: 81.45, expressao: 'happy' }] })],
    fluxos: [ONDA({ taxa: 40, velocidade: 6 })], camera: { tipo: 'travelling', de: { pos: [-2.6, 5.6, 7], olha: [0, 0.6, -0.2] }, para: { pos: [2.8, 5.6, 7], olha: [0, 0.6, -0.2] }, fov: 52 } },
  { fim: 86.1, objetos: [...casa(), ...roteador(3)], personagens: [guia({ pos: [-0.4, 0, 2.3], viraPara: olhaCam(81.5), acoes: [{ clip: 'shrug', de: 81.6, ate: 84, }, { clip: 'point', de: 84.2, ate: 86.1, params: { dir: 'forward' } }, talk(81.45, 86.1)] })],
    fluxos: [ONDA()], camera: { tipo: 'fixa', pos: [-0.2, 1.7, 6.1], olha: [-0.4, 1.5, 2.2], fov: 44 },
    textos: [{ texto: 'O MICRO-ONDAS JÁ DERRUBOU SEU WI-FI?', de: 81.6, ate: 86.1, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Wi-Fi', duracao: 86.1, ambiente: CASA, cenas,
  sons: [
    { som: 'erro', de: 7.8, volume: 0.12 }, { som: 'eletrico', de: 18.8, ate: 20, volume: 0.08 }, { som: 'sucesso', de: 24.6, volume: 0.14 },
    { som: 'sucesso', de: 38.2, volume: 0.14 }, { som: 'alerta', de: 41.3, ate: 43.3, volume: 0.08 }, { som: 'sucesso', de: 48.1, volume: 0.12 },
    { som: 'martelo', de: 55.1, volume: 0.1 }, { som: 'sucesso', de: 60, volume: 0.14 }, { som: 'sucesso', de: 69.2, volume: 0.14 },
    { som: 'bomba', de: 72.5, ate: 74.5, volume: 0.08 }, { som: 'erro', de: 76.1, volume: 0.12 }, { som: 'sucesso', de: 78.8, volume: 0.2 },
  ],
});
