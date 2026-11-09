// Bateria de celular: célula gigante em corte numa bancada; o guia monta peça por peça.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const LAB = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [0.95, 0, 1.25], giro: -30, ...extra });
const moveis = () => [forma('mesa', 'caixa', [1.6, 0.9, 0.8], '#a9743f', [-3.2, 0, -1.4]), { id: 'cx', asset: 'caixa_madeira', pos: [3.3, 0, -1.3] }];

// célula (centro x=0)
const anodo = (x = -0.6, extra = {}) => forma('anodo', 'caixa', [0.16, 1.5, 1.0], '#2f3338', [x, 0.05, 0], extra);
const catodo = (extra = {}) => forma('catodo', 'caixa', [0.16, 1.5, 1.0], '#8a95a3', [0.6, 0.05, 0], { params: { brilho: true }, ...extra });
const separador = (extra = {}) => forma('sep', 'caixa', [0.04, 1.5, 1.0], '#ffffff', [0, 0.05, 0], { opacidade: 0.75, ...extra });
const eletrolito = (extra = {}) => forma('eletro', 'caixa', [1.36, 1.45, 0.96], '#9fd3f0', [0, 0.05, 0], { opacidade: 0.3, ...extra });
const caixa = (extra = {}) => forma('caixa', 'caixa', [1.7, 1.75, 1.15], '#c9cdd2', [0, 0, 0], { opacidade: 0.18, ...extra });
const chip = (extra = {}) => forma('chip', 'caixa', [0.55, 0.1, 0.4], '#4f9d4a', [0, 1.75, 0], extra);
const celula = (o = {}) => [caixa(o.caixa), anodo(), catodo(), ...(o.sep === false ? [] : [separador()]), ...(o.eletro === false ? [] : [eletrolito()]), ...(o.chip ? [chip()] : [])];
const IONS = (extra = {}) => ({ material: 'luz', caminho: [[-0.5, 0.9, 0.25], [0.5, 0.9, 0.25]], taxa: 18, velocidade: 0.9, ...extra });
const IONS2 = (extra = {}) => ({ material: 'luz', caminho: [[-0.5, 0.5, -0.2], [0.5, 0.5, -0.2]], taxa: 14, velocidade: 0.8, ...extra });
const celular = () => [forma('cel', 'caixa', [1.1, 2.0, 0.16], '#2f3338', [0, 0, 0]), forma('tela', 'caixa', [0.98, 1.8, 0.02], '#5b8fb9', [0, 0.1, 0.09], { params: { emissivo: true }, anim: { pulsa: 0.02 } })];

const CAM = { tipo: 'fixa', pos: [1.3, 1.8, 5.2], olha: [0.1, 0.9, 0], fov: 44 };
const CLOSE = { tipo: 'fixa', pos: [0.6, 1.5, 3.7], olha: [0, 0.85, 0], fov: 40 };
const TOPO = { tipo: 'fixa', pos: [0.9, 2.8, 2.6], olha: [0, 1.2, 0], fov: 42 };

const cenas = [
  { fim: 3.3, objetos: [...moveis(), ...celular()], personagens: [guia({ viraPara: olhaCam(0.2), acoes: [{ clip: 'point', de: 0.3, ate: 3.3, params: { dir: 'forward' } }, talk(0, 3.3)] })],
    fluxos: [{ material: 'eletricidade', origem: [0, 1.1, 0.1], taxa: 10, dispersao: 0.4 }], camera: CAM, textos: [{ texto: 'ENERGIA NUM CELULAR FININHO', de: 0.1, ate: 3.2, estilo: 'titulo' }] },
  { fim: 9.0, objetos: [...moveis(), forma('pilha', 'cilindro', [0.55, 1.4, 0.55], '#3d6fb6', [-0.3, 0, 0.2], { aparece: 3.6, movimentos: [{ de: 4.2, ate: 8.6, para: [0.3, 0.2] }] }), forma('polo', 'cilindro', [0.18, 0.12, 0.18], '#c9cdd2', [-0.3, 1.4, 0.2], { aparece: 3.6, movimentos: [{ de: 4.2, ate: 8.6, para: [0.3, 0.2] }] })],
    personagens: [guia({ pos: [-1.3, 0, 0.2], giro: 90, movimentos: [{ de: 4.2, ate: 8.6, para: [-0.7, 0.2], clip: 'push' }], acoes: [{ clip: 'push', de: 4.2, ate: 9, expressao: 'angry' }] })],
    camera: { tipo: 'fixa', pos: [0.2, 1.6, 4.6], olha: [-0.2, 0.8, 0.2], fov: 44 }, efeitos: [pb(5.7, 8.9)], elementos: [icone('x', 6, 8.9)] },
  { fim: 12.1, objetos: [...moveis(), forma('pilha', 'cilindro', [0.55, 1.4, 0.55], '#3d6fb6', [0.3, 0, 0.2]), forma('polo', 'cilindro', [0.18, 0.12, 0.18], '#c9cdd2', [0.3, 1.4, 0.2])],
    personagens: [guia({ viraPara: olhaCam(9.1), acoes: [{ clip: 'shrug', de: 9.2, ate: 12.1, expressao: 'sad' }] })],
    fluxos: [{ material: 'eletricidade', origem: [0.3, 1.55, 0.2], taxa: 3, dispersao: 0.1 }], camera: CAM, elementos: [etq('pouca energia por grama', 9.5, 12)] },
  { fim: 15.55, objetos: [...moveis(), forma('litio', 'esfera', [0.45, 0.45, 0.45], '#e8eef5', [0, 1.1, 0.2], { params: { brilho: true, apoiada: false }, aparece: 12.4, anim: { oscila: { eixo: 'y', amp: 0.08, freq: 0.6 } } })],
    personagens: [guia({ viraPara: olhaCam(12.3), acoes: [{ clip: 'surprised', de: 12.6, ate: 15.55, expressao: 'happy' }] })],
    fluxos: [{ material: 'luz', origem: [0, 1.1, 0.2], taxa: 10, dispersao: 0.3 }], camera: CAM, elementos: [etq('lítio: o metal mais leve', 12.8, 15.4, '#9aa7b5')] },
  { fim: 20.0, objetos: [...moveis(), caixa(), anodo(-0.6, { aparece: 15.9 }), catodo({ aparece: 17.6 })],
    personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 16, ate: 20 }] })], camera: CAM,
    elementos: [etq('grafite', 16.1, 17.5, '#2f3338'), etq('óxido de metal', 17.7, 19.8, '#8a95a3')] },
  { fim: 25.15, objetos: [...moveis(), caixa(), anodo(), catodo()], personagens: [guia({ acoes: [{ clip: 'point', de: 20.2, ate: 25.15, params: { dir: 'forward' } }] })],
    fluxos: [IONS(), IONS2()], camera: CLOSE, elementos: [etq('eletrodos', 23.5, 25)] },
  { fim: 30.0, objetos: [...moveis(), caixa(), anodo(-0.6, { movimentos: [{ de: 26, ate: 27.2, para: [-0.12, 0] }] }), catodo()],
    personagens: [guia({ viraPara: olhaCam(25.3), acoes: [{ clip: 'surprised', de: 27.3, ate: 30, expressao: 'surprised' }] })],
    fluxos: [{ material: 'fagulha', origem: [0, 0.9, 0.3], taxa: 50, dispersao: 0.3, de: 27.2, ate: 28.2 }, { material: 'fogo', origem: [0, 1.2, 0], taxa: 30, dispersao: 0.4, de: 27.4 }, { material: 'fumaca', origem: [0, 1.6, 0], taxa: 10, de: 27.6 }],
    camera: CAM, efeitos: [pb(27.2, 29.9), { tipo: 'tremor', de: 27.2, ate: 27.9, intensidade: 0.5 }], elementos: [icone('alerta', 27.4, 29.9, [0.25, 0.33])] },
  { fim: 35.25, objetos: [...moveis(), caixa(), anodo(), catodo(), separador({ aparece: 30.6 })], personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 30.5, ate: 35.25 }] })],
    camera: TOPO, elementos: [etq('mais fino que um fio de cabelo', 32, 35.1, '#ffffff')] },
  { fim: 37.15, objetos: [...moveis(), caixa(), anodo(), catodo(), separador()], personagens: [guia({ viraPara: olhaCam(35.3), acoes: [{ clip: 'nod', de: 35.4, ate: 37.15, expressao: 'happy' }] })],
    fluxos: [IONS({ taxa: 10 })], camera: CLOSE, elementos: [etq('separador', 35.5, 37)] },
  { fim: 40.3, objetos: [...moveis(), caixa(), anodo(), catodo(), separador()], personagens: [guia({ acoes: [{ clip: 'think', de: 37.3, ate: 40.3 }] })],
    fluxos: [{ material: 'luz', origem: [-0.45, 0.9, 0.25], taxa: 8, dispersao: 0.2, vida: 0.5 }], camera: CAM, elementos: [icone('interrogacao', 37.6, 40.2)] },
  { fim: 44.9, objetos: [...moveis(), caixa(), anodo(), catodo(), separador(), eletrolito({ aparece: 41.8 })],
    personagens: [guia({ acoes: [{ clip: 'point', de: 40.5, ate: 44.9, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'agua', origem: [0, 2.6, 0], destino: [0, 1.2, 0], taxa: 40, dispersao: 0.2, espalha: 0.5, de: 40.6, ate: 42.6 }, IONS({ de: 42.4 }), IONS2({ de: 42.6 })],
    camera: TOPO, elementos: [etq('eletrólito', 43.5, 44.8, '#9fd3f0')] },
  { fim: 47.8, objetos: [...moveis(), ...celula()], personagens: [guia({ viraPara: olhaCam(45), acoes: [{ clip: 'shrug', de: 45.2, ate: 47.8 }] })],
    fluxos: [IONS({ taxa: 6 })], camera: CLOSE, elementos: [icone('x', 45.5, 47.7)] },
  { fim: 52.7, objetos: [...moveis(), forma('rolo', 'cilindro', [1.1, 1.6, 1.1], '#5b5f66', [0, 0, 0], { aparece: 48.4, anim: { gira: 60, eixo: 'y' } }), forma('rolo2', 'cilindro', [0.7, 1.62, 0.7], '#8a95a3', [0, 0, 0], { aparece: 49.2, anim: { gira: 60, eixo: 'y' } })],
    personagens: [guia({ acoes: [{ clip: 'point', de: 48.2, ate: 52.7, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'luz', origem: [0, 0.9, 0], taxa: 20, dispersao: 0.5 }], camera: CAM },
  { fim: 58.3, objetos: [...moveis(), ...celula(), ...[0.4, 0.75, 1.1].map((y, i) => forma(`agulha${i}`, 'cone', [0.1, 0.35, 0.1], '#e8eef5', [-0.42, y, 0.2 - i * 0.2], { params: { brilho: true }, aparece: 54 + i * 0.9 }))],
    personagens: [guia({ viraPara: olhaCam(53), acoes: [{ clip: 'surprised', de: 54.5, ate: 58.3, expressao: 'worried' }] })],
    fluxos: [{ material: 'eletricidade', origem: [-0.6, 1.9, 0], destino: [-0.6, 1.3, 0], taxa: 40, de: 52.8, ate: 58.3 }, IONS({ taxa: 40, velocidade: 2 })],
    camera: CLOSE, efeitos: [pb(55.5, 58.2)], elementos: [icone('alerta', 55.6, 58.2, [0.25, 0.33])] },
  { fim: 65.2, objetos: [...moveis(), ...celula({ chip: false }), chip({ aparece: 59.2, anim: { pulsa: 0.05 } })],
    personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 58.6, ate: 61.5 }, { clip: 'nod', de: 63, ate: 65.2, expressao: 'happy' }] })],
    fluxos: [{ material: 'eletricidade', origem: [0, 2.4, 0], destino: [0, 1.85, 0], taxa: 30, ate: 61.5 }, IONS()],
    camera: TOPO, elementos: [etq('circuito de proteção', 63.1, 65.1, '#4f9d4a')] },
  { fim: 69.6, objetos: [...moveis(), caixa({ anim: { escala: [[65.5, 1], [68.5, 1.12]] } }), anodo(), catodo(), separador(), eletrolito()],
    personagens: [guia({ viraPara: olhaCam(65.3), acoes: [{ clip: 'surprised', de: 66, ate: 69.6, expressao: 'surprised' }] })],
    fluxos: [{ material: 'bolha', origem: [0, 0.6, 0], taxa: 20, dispersao: 0.5, subida: 0.6 }], camera: CAM, elementos: [etq('gás lá dentro', 66.5, 69.4, '#9aa7b5')] },
  { fim: 72.45, objetos: [...moveis(), ...celular()], personagens: [guia({ viraPara: olhaCam(69.7), acoes: [{ clip: 'cheer', de: 69.8, ate: 72.45, expressao: 'happy' }] })],
    fluxos: [{ material: 'eletricidade', origem: [0, 1.1, 0.1], taxa: 14, dispersao: 0.4 }], camera: { tipo: 'travelling', de: { pos: [-2, 1.8, 5], olha: [0.2, 1, 0] }, para: { pos: [2.4, 1.8, 5], olha: [0.2, 1, 0] }, fov: 46 } },
  { fim: 77.3, objetos: [...moveis(), ...celular()], personagens: [guia({ pos: [1.4, 0, 1.6], giro: 0, viraPara: olhaCam(72.5), acoes: [{ clip: 'shrug', de: 72.6, ate: 74.8 }, { clip: 'point', de: 75, ate: 77.3, params: { dir: 'forward' } }, talk(72.45, 77.3)] })],
    fluxos: [{ material: 'eletricidade', origem: [0, 1.1, 0.1], taxa: 8, dispersao: 0.4 }], camera: { tipo: 'fixa', pos: [1.6, 1.7, 5.4], olha: [1, 1.5, 0.6], fov: 44 },
    textos: [{ texto: 'CARREGA A NOITE TODA?', de: 72.6, ate: 77.3, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Bateria de celular', duracao: 77.3, ambiente: LAB, cenas,
  sons: [
    { som: 'erro', de: 6, volume: 0.12 }, { som: 'martelo', de: 16.1, volume: 0.1 }, { som: 'estouro', de: 27.2, volume: 0.2 },
    { som: 'fogo', de: 27.4, ate: 29.4, volume: 0.08 }, { som: 'sucesso', de: 35.5, volume: 0.14 }, { som: 'agua', de: 40.7, ate: 42.5, volume: 0.08 },
    { som: 'alerta', de: 55.6, ate: 57.6, volume: 0.08 }, { som: 'eletrico', de: 52.9, ate: 54.3, volume: 0.08 }, { som: 'sucesso', de: 63.2, volume: 0.14 },
    { som: 'sucesso', de: 69.8, volume: 0.2 },
  ],
});
