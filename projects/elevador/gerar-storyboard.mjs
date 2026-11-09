// Elevador: poço em corte com cabine, contrapeso, cabos, polia, freio, portas e molas.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const PREDIO = { fundo: 'cidade', chao: 'concreto', horario: 'dia' };
const TOPO = 14;
const poco = () => [
  forma('fundo', 'caixa', [4.4, 16, 0.2], '#e8dcc4', [0, 0, -1.3]),
  forma('trilhoE', 'caixa', [0.12, TOPO, 0.12], '#7b8794', [-0.95, 0, 0]),
  forma('trilhoD', 'caixa', [0.12, TOPO, 0.12], '#7b8794', [0.95, 0, 0]),
  forma('maquinas', 'caixa', [3.6, 1.8, 2.6], '#9aa3ad', [0.2, TOPO, 0]),
  ...[0, 3.5, 7, 10.5].map((y, i) => forma(`laje${i}`, 'caixa', [1.6, 0.25, 2.4], '#c9cdd2', [-2.1, y, 0])),
];
const portaAndar = (y, i, extra = {}) => forma(`porta${i}`, 'caixa', [0.08, 2.1, 1.2], '#7b8794', [-1.3, y + 0.25, 0], extra);
const portas = (skip = -1) => [0, 3.5, 7, 10.5].map((y, i) => (i === skip ? null : portaAndar(y, i))).filter(Boolean);
const cabine = (y = 0, extra = {}) => forma('cabine', 'caixa', [1.6, 2.3, 1.6], '#d9a441', [0, y, 0], { opacidade: 0.55, ...extra });
const contrapeso = (y = 9, extra = {}) => forma('contra', 'caixa', [0.5, 1.6, 0.35], '#5b5f66', [1.45, y, -0.8], extra);
const polia = (vel = 0, extra = {}) => ({ id: 'polia', asset: 'engrenagem', variante: 'prata', escala: 0.45, pos: [0.7, TOPO + 0.4, 1.35], params: { velocidade: vel, dentes: 20 }, ...extra });
// cabo da cabine: do teto da cabine até a casa de máquinas (n = quantos cabos lado a lado)
const caboCab = (y = 0, n = 1, anim, extra = {}) => Array.from({ length: n }, (_, i) => forma(`caboC${i}`, 'caixa', [0.04, TOPO + 1 - (y + 2.3), 0.04], '#2f3338', [-0.25 + i * 0.1, y + 2.3, 0], { ...(anim ? { anim } : {}), ...extra }));
const caboContra = (y = 9, anim, extra = {}) => forma('caboP', 'caixa', [0.04, TOPO + 1 - (y + 1.6), 0.04], '#2f3338', [1.45, y + 1.6, -0.8], { ...(anim ? { anim } : {}), ...extra });
const garras = (y = 0, extra = {}) => [-0.82, 0.82].map((x, i) => forma(`garra${i}`, 'caixa', [0.2, 0.3, 0.3], '#d9473a', [x, y + 0.2, 0], extra));
const molas = (extra = {}) => [-0.4, 0.4].map((x, i) => forma(`mola${i}`, 'cilindro', [0.3, 0.55, 0.3], '#d9473a', [x, 0, 0], extra));
const camY = (y, dist = 8, fov = 46) => ({ tipo: 'fixa', pos: [1.4, y + 1.6, dist], olha: [0, y + 1.1, 0], fov });
const guiaAndar = (y, extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [-2.2, y + 0.25, 0.5], giro: 60, ...extra });

const cenas = [
  { fim: 2.45, objetos: [{ id: 'predio', asset: 'predio_apartamentos', variante: 'alto', pos: [0, 0, -10], params: { floors: 20 } }, { id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [-20, 0, 6], giro: 90, movimentos: [{ de: 0, ate: 2.45, para: [20, 6] }] }],
    personagens: [{ id: 'guia', preset: 'construtor', pos: [2, 0, 2], giro: 0, viraPara: olhaCam(0.1), acoes: [{ clip: 'point', de: 0.2, ate: 2.45, params: { dir: 'forwardUp' } }, talk(0, 2.45)] }],
    camera: { tipo: 'fixa', pos: [4, 1.6, 14], olha: [0, 14, -10], fov: 60 }, textos: [{ texto: 'VINTE ANDARES SEM ESCADA', de: 0.1, ate: 2.4, estilo: 'titulo' }] },
  { fim: 5.6, objetos: [...poco(), ...portas(), cabine(0, { anim: { pos: [[2.6, [0, 0, 0]], [5.6, [0, 0.4, 0]]] } }), ...caboCab(0, 1, { pos: [[2.6, [-0.25, 2.3, 0]], [5.6, [-0.25, 2.7, 0]]] }), polia(60)],
    personagens: [guiaAndar(0, { acoes: [{ clip: 'point', de: 2.6, ate: 5.6, params: { dir: 'forward' } }] })], camera: camY(0.5, 9, 50) },
  { fim: 10.05, objetos: [...poco(), ...portas(), cabine(0.4), ...caboCab(0.4), polia(20), forma('motor', 'cilindro', [0.7, 0.9, 0.7], '#3d6fb6', [-0.9, TOPO + 1.8, 0], { anim: { oscila: { eixo: 'x', amp: 0.03, freq: 14 } } })],
    fluxos: [{ material: 'fumaca', origem: [-0.9, TOPO + 2.8, 0], taxa: 14 }], camera: { tipo: 'fixa', pos: [1.6, TOPO + 3, 6], olha: [0, TOPO + 1.4, 0], fov: 46 },
    efeitos: [pb(6.3, 10), { tipo: 'tremor', de: 6.3, ate: 7, intensidade: 0.4 }], elementos: [icone('x', 6.5, 9.9)] },
  { fim: 15.0, objetos: [...poco(), ...portas(), cabine(0), ...caboCab(0), polia(0), contrapeso(9, { aparece: 10.6 }), caboContra(9, null, { aparece: 10.6 })],
    personagens: [guiaAndar(0, { overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 10.2, ate: 15 }] })],
    camera: { tipo: 'fixa', pos: [2.4, 6, 14], olha: [0.3, 6, 0], fov: 54 }, elementos: [{ tipo: 'seta', direcao: 'vertical', pos: [0.66, 0.42], tamanho: 0.13, pulsa: true, de: 11.5, ate: 14.8 }] },
  { fim: 18.55, objetos: [...poco(), ...portas(), cabine(0, { anim: { pos: [[15.2, [0, 0, 0]], [18.4, [0, 1.6, 0]]] } }), ...caboCab(0, 1, { pos: [[15.2, [-0.25, 2.3, 0]], [18.4, [-0.25, 3.9, 0]]] }),
      contrapeso(9, { anim: { pos: [[15.2, [1.45, 9, -0.8]], [18.4, [1.45, 7.4, -0.8]]] } }), caboContra(7.4, { pos: [[15.2, [1.45, 10.6, -0.8]], [18.4, [1.45, 9, -0.8]]] }), polia(90)],
    personagens: [guiaAndar(0, { acoes: [{ clip: 'cheer', de: 16, ate: 18.55, expressao: 'happy' }] })], camera: { tipo: 'fixa', pos: [2.4, 6, 14], olha: [0.3, 6, 0], fov: 54 },
    elementos: [etq('contrapeso', 17.2, 18.4, '#5b5f66')] },
  { fim: 24.3, objetos: [...poco(), ...portas(), cabine(1.6), ...caboCab(1.6), contrapeso(7.4), caboContra(7.4), polia(120)],
    fluxos: [{ material: 'fagulha', origem: [0.7, TOPO + 0.9, 1.5], taxa: 6, dispersao: 0.2 }], camera: { tipo: 'fixa', pos: [2.4, TOPO + 1.6, 4.4], olha: [0.6, TOPO + 0.9, 1.2], fov: 42 },
    elementos: [{ tipo: 'seta', direcao: 'baixo', pos: [0.42, 0.5], tamanho: 0.12, pulsa: true, de: 19, ate: 24 }] },
  { fim: 26.45, objetos: [...poco(), ...portas(), cabine(1.6), ...caboCab(1.6), contrapeso(7.4), caboContra(7.4), polia(120)],
    fluxos: [{ material: 'fagulha', origem: [0.7, TOPO + 0.9, 1.5], taxa: 6, dispersao: 0.2 }], camera: { tipo: 'fixa', pos: [-1.6, TOPO + 1.2, 4.6], olha: [0.5, TOPO + 0.9, 1.2], fov: 42 },
    elementos: [etq('polia de tração', 24.6, 26.3, '#9aa7b5')] },
  { fim: 28.45, objetos: [...poco(), ...portas(), cabine(7), ...caboCab(7, 1, null, { some: 27.3 }), polia(0)], personagens: [{ id: 'guia', preset: 'construtor', pos: [0, 7, 0], giro: 0, viraPara: olhaCam(26.5), acoes: [{ clip: 'surprised', de: 27.3, ate: 28.45, expressao: 'surprised' }] }],
    fluxos: [{ material: 'fagulha', origem: [-0.25, 9.6, 0], taxa: 60, dispersao: 0.3, de: 27.3, ate: 27.9 }], camera: camY(7, 7), efeitos: [pb(27.3, 28.4), { tipo: 'tremor', de: 27.3, ate: 28, intensidade: 0.6 }],
    elementos: [icone('alerta', 27.4, 28.4, [0.25, 0.33])] },
  { fim: 31.05, objetos: [...poco(), ...portas(), cabine(7), ...garras(7, { aparece: 29 })], personagens: [{ id: 'guia', preset: 'construtor', pos: [0, 7, 0], giro: 0, acoes: [{ clip: 'point', de: 28.6, ate: 31.05, params: { dir: 'forward' } }] }],
    fluxos: [{ material: 'luz', origem: [-0.82, 7.3, 0], taxa: 8, dispersao: 0.1 }], camera: camY(7, 6.5) },
  { fim: 36.0, objetos: [...poco(), ...portas(), cabine(7, { anim: { pos: [[31.2, [0, 7, 0]], [32.6, [0, 5.4, 0]]] } }), ...[-0.82, 0.82].map((x, i) => forma(`garra${i}`, 'caixa', [0.2, 0.3, 0.3], '#d9473a', [x, 7.2, 0], { anim: { pos: [[31.2, [x, 7.2, 0]], [32.6, [x, 5.6, 0]]] } }))],
    fluxos: [{ material: 'fagulha', origem: [-0.95, 5.7, 0], taxa: 50, dispersao: 0.15, de: 32.4, ate: 33.4 }, { material: 'fagulha', origem: [0.95, 5.7, 0], taxa: 50, dispersao: 0.15, de: 32.4, ate: 33.4 }],
    camera: camY(5.6, 8, 50), efeitos: [{ tipo: 'tremor', de: 32.5, ate: 33.2, intensidade: 0.5 }] },
  { fim: 38.35, objetos: [...poco(), ...portas(), cabine(5.4), ...garras(5.4)], personagens: [{ id: 'guia', preset: 'construtor', pos: [0, 5.4, 0], giro: 0, viraPara: olhaCam(36), acoes: [{ clip: 'cheer', de: 36.1, ate: 38.35, expressao: 'happy' }] }],
    fluxos: [{ material: 'fumaca', origem: [-0.95, 5.6, 0], taxa: 6 }], camera: camY(5.4, 6.5), elementos: [etq('freio de segurança', 36.3, 38.2)] },
  { fim: 41.55, objetos: [...poco(), ...portas(0), portaAndar(0, 0, { pos: [-1.3, 0.25, 1.3] }), cabine(1.9), ...caboCab(1.9)],
    personagens: [guiaAndar(0, { viraPara: olhaCam(38.4), acoes: [{ clip: 'surprised', de: 38.8, ate: 41.55, expressao: 'surprised' }] })],
    fluxos: [{ material: 'poeira', origem: [-1.2, 0.3, 0], taxa: 5 }], camera: camY(1, 7, 50), efeitos: [pb(39, 41.5)], elementos: [icone('x', 39.2, 41.4)] },
  { fim: 48.0, objetos: [...poco(), ...portas(1), cabine(1.9, { anim: { pos: [[41.8, [0, 1.9, 0]], [44.2, [0, 3.5, 0]]] } }), ...caboCab(1.9, 1, { pos: [[41.8, [-0.25, 4.2, 0]], [44.2, [-0.25, 5.8, 0]]] }),
      forma('trava', 'caixa', [0.12, 0.2, 0.12], '#d9473a', [-1.38, 5.6, 0.45], { params: { emissivo: true }, anim: { pulsa: 0.2 } }),
      portaAndar(3.5, 1, { movimentos: [{ de: 45, ate: 46, para: [-1.3, 1.3] }] })],
    personagens: [guiaAndar(3.5, { acoes: [{ clip: 'point', de: 42, ate: 45, params: { dir: 'forward' } }, { clip: 'nod', de: 46, ate: 48, expressao: 'happy' }] })],
    camera: camY(3.6, 7.5, 50), elementos: [etq('trava da porta', 46, 47.9, '#d9473a')] },
  { fim: 51.25, objetos: [...poco(), ...portas(), cabine(3.5, { anim: { pos: [[48.1, [0, 3.5, 0]], [50.8, [0, 0.1, 0]]] } })],
    personagens: [guiaAndar(0, { viraPara: olhaCam(48.2), acoes: [{ clip: 'surprised', de: 49.5, ate: 51.25, expressao: 'worried' }] })],
    camera: camY(0.8, 8, 54), efeitos: [pb(50, 51.2)], elementos: [icone('alerta', 49.6, 51.1, [0.25, 0.33])] },
  { fim: 57.35, objetos: [...poco(), ...portas(), ...molas({ aparece: 51.6, anim: { oscila: { eixo: 'y', amp: 0.03, freq: 2 } } }), cabine(0.6, { aparece: 53 })],
    personagens: [guiaAndar(0, { overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 51.4, ate: 54 }, { clip: 'point', de: 54.2, ate: 57.35, params: { dir: 'forward' } }] })],
    camera: camY(0.2, 6.5, 48), elementos: [etq('amortecedores', 55.3, 57.2, '#d9473a')] },
  { fim: 61.6, objetos: [...poco(), ...portas(), cabine(7), ...Array.from({ length: 6 }, (_, i) => forma(`caboN${i}`, 'caixa', [0.04, TOPO + 1 - 9.3, 0.04], '#2f3338', [-0.3 + i * 0.12, 9.3, 0], { aparece: 57.6 + i * 0.5 })), polia(60)],
    personagens: [{ id: 'guia', preset: 'construtor', pos: [0, 7, 0], giro: 0, viraPara: olhaCam(57.4), acoes: [{ clip: 'surprised', de: 57.6, ate: 61.6, expressao: 'surprised' }] }],
    camera: { tipo: 'fixa', pos: [1.4, 10.2, 6], olha: [0, 9.4, 0], fov: 44 } },
  { fim: 65.3, objetos: [...poco(), ...portas(), cabine(7), ...Array.from({ length: 6 }, (_, i) => forma(`caboN${i}`, 'caixa', [0.04, TOPO + 1 - 9.3, 0.04], '#2f3338', [-0.3 + i * 0.12, 9.3, 0])), polia(60)],
    personagens: [{ id: 'guia', preset: 'construtor', pos: [0, 7, 0], giro: 0, viraPara: olhaCam(61.7), acoes: [{ clip: 'point', de: 61.8, ate: 65.3, params: { dir: 'forwardUp' } }] }],
    fluxos: [{ material: 'luz', origem: [0, 10.5, 0.1], taxa: 10, dispersao: 0.3 }], camera: camY(7.4, 7), elementos: [etq('cada cabo aguenta sozinho', 62, 65.1, '#2f3338')] },
  { fim: 68.2, objetos: [...poco(), ...portas(), cabine(0, { anim: { pos: [[65.4, [0, 0, 0]], [68.1, [0, 1.6, 0]]] } }), ...caboCab(0, 1, { pos: [[65.4, [-0.25, 2.3, 0]], [68.1, [-0.25, 3.9, 0]]] }),
      contrapeso(9, { anim: { pos: [[65.4, [1.45, 9, -0.8]], [68.1, [1.45, 7.4, -0.8]]] } }), caboContra(7.4, { pos: [[65.4, [1.45, 10.6, -0.8]], [68.1, [1.45, 9, -0.8]]] }), polia(90), ...molas()],
    personagens: [guiaAndar(0, { viraPara: olhaCam(65.4), acoes: [{ clip: 'cheer', de: 65.5, ate: 68.2, expressao: 'happy' }] })],
    camera: { tipo: 'travelling', de: { pos: [-1, 5, 14], olha: [0, 5, 0] }, para: { pos: [3, 7, 13], olha: [0, 6, 0] }, fov: 56 } },
  { fim: 72.4, objetos: [...poco(), ...portas(), cabine(0), ...caboCab(0), polia(0), ...molas()],
    personagens: [guiaAndar(0, { pos: [-1.6, 0.25, 1.4], giro: 0, viraPara: olhaCam(68.3), acoes: [{ clip: 'shrug', de: 68.4, ate: 70.3 }, { clip: 'point', de: 70.5, ate: 72.4, params: { dir: 'forward' } }, talk(68.2, 72.4)] })],
    fluxos: [{ material: 'luz', origem: [0, 1.2, 0.3], taxa: 6, dispersao: 0.4 }], camera: { tipo: 'fixa', pos: [-1.2, 1.9, 5.6], olha: [-1.2, 1.7, 1.2], fov: 46 },
    textos: [{ texto: 'VOCÊ TEM MEDO DE ELEVADOR?', de: 68.3, ate: 72.4, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Elevador', duracao: 72.4, ambiente: PREDIO, cenas,
  sons: [
    { som: 'carro', de: 0, ate: 2.3, volume: 0.1 }, { som: 'maquina', de: 6.2, ate: 8.6, volume: 0.1 }, { som: 'erro', de: 6.5, volume: 0.12 },
    { som: 'martelo', de: 10.3, volume: 0.1 }, { som: 'sucesso', de: 17.3, volume: 0.14 }, { som: 'sucesso', de: 24.7, volume: 0.12 },
    { som: 'estouro', de: 27.3, volume: 0.2 }, { som: 'martelo', de: 32.5, ate: 33.3, volume: 0.12 }, { som: 'sucesso', de: 36.4, volume: 0.14 },
    { som: 'erro', de: 39.2, volume: 0.12 }, { som: 'sucesso', de: 46.1, volume: 0.14 }, { som: 'alerta', de: 49.6, ate: 51, volume: 0.08 },
    { som: 'sucesso', de: 55.4, volume: 0.14 }, { som: 'sucesso', de: 65.6, volume: 0.2 },
  ],
});
