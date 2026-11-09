// Geladeira: geladeira transparente com o circuito do gás visível (evaporador, compressor, condensador, capilar).
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const COZ = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [1.25, 0, 1.3], giro: -25, ...extra });
const cozinha = () => [forma('armario', 'caixa', [1.4, 2.2, 0.6], '#a9743f', [-2.6, 0, -1.0]), forma('pia', 'caixa', [1.2, 0.9, 0.6], '#c9cdd2', [2.6, 0, -1.0])];
const corpo = (extra = {}) => forma('corpo', 'caixa', [1.6, 3, 1.4], '#e8eef5', [0, 0, 0], { opacidade: 0.28, ...extra });
const comida = (extra = {}) => [
  forma('prat', 'caixa', [1.5, 0.05, 1.3], '#c9cdd2', [0, 1.5, 0], extra),
  forma('garrafa', 'cilindro', [0.25, 0.6, 0.25], '#4f9d4a', [-0.4, 1.55, 0.2], extra),
  forma('leite', 'caixa', [0.3, 0.5, 0.25], '#3d8ee0', [0.3, 1.55, 0.1], extra),
  forma('fruta', 'esfera', [0.35, 0.35, 0.35], '#d9473a', [0, 0.8, 0.2], extra),
];
const P_EVAP = [[-0.6, 2.3, -0.5], [0.6, 2.3, -0.5], [0.6, 2.5, -0.5], [-0.6, 2.5, -0.5], [-0.6, 2.7, -0.5], [0.6, 2.7, -0.5]];
const P_SUC = [[0.6, 2.7, -0.5], [0.75, 2.7, -0.5], [0.75, 0.3, -1.05], [0.4, 0.3, -1.05]];
const P_COND = [[0.4, 0.55, -1.05], [0.55, 0.6, -0.85], [0.55, 2.6, -0.85], [0.25, 2.6, -0.85], [0.25, 0.6, -0.85], [-0.05, 0.6, -0.85], [-0.05, 2.6, -0.85], [-0.35, 2.6, -0.85], [-0.35, 0.6, -0.85], [-0.6, 0.6, -0.85]];
const P_CAP = [[-0.6, 0.6, -0.85], [-0.75, 0.6, -0.85], [-0.75, 2.3, -0.85], [-0.6, 2.3, -0.5]];
const tubo = (id, pontos, cor, raio = 0.04, extra = {}) => ({ id, asset: 'tubo', pos: [0, 0, 0], params: { pontos, raio, cor }, ...extra });
const evaporador = (extra = {}) => tubo('evap', P_EVAP, '#9fd3f0', 0.04, extra);
const succao = (extra = {}) => tubo('suc', P_SUC, '#9aa7b5', 0.03, extra);
const compressor = (vibra = true, extra = {}) => forma('comp', 'cilindro', [0.5, 0.55, 0.5], '#2f3338', [0.4, 0, -1.05], { ...(vibra ? { anim: { oscila: { eixo: 'x', amp: 0.01, freq: 12 } } } : {}), ...extra });
const condensador = (extra = {}) => tubo('cond', P_COND, '#2f3338', 0.035, extra);
const capilar = (extra = {}) => tubo('cap', P_CAP, '#c97b3a', 0.015, extra);
const termostato = (extra = {}) => forma('termo', 'caixa', [0.22, 0.12, 0.08], '#d9473a', [0.55, 2.85, 0.55], { params: { emissivo: true }, anim: { pulsa: 0.2 }, ...extra });
const geladeira = (o = {}) => [corpo(), ...comida(), evaporador(), succao(), compressor(o.vibra ?? true), condensador(), capilar(), ...(o.termo ? [termostato()] : [])];
const CICLO = (extra = {}) => [
  { material: 'ar', caminho: P_EVAP, taxa: 12, velocidade: 0.8, tamanho: 0.04 },
  { material: 'ar', caminho: P_SUC, taxa: 10, velocidade: 1.2, tamanho: 0.04 },
  { material: 'agua', caminho: P_COND, taxa: 12, velocidade: 1.5, tamanho: 0.035 },
  { material: 'agua', caminho: P_CAP, taxa: 10, velocidade: 1.2, tamanho: 0.025 },
];
const FRIO = (extra = {}) => ({ material: 'neve', origem: [0, 1.9, 0.1], taxa: 14, dispersao: 0.5, tamanho: 0.035, ...extra });
const CALOR_ATRAS = (extra = {}) => ({ material: 'vapor', origem: [0, 1.4, -1.1], taxa: 12, dispersao: 0.5, subida: 0.8, tamanho: 0.09, ...extra });
const FRENTE = { tipo: 'fixa', pos: [3.4, 2.4, 4.6], olha: [0, 1.5, -0.3], fov: 46 };
const TRAS = { tipo: 'fixa', pos: [2.6, 2.0, -4.0], olha: [0, 1.4, -0.8], fov: 46 };
const MESA = () => [forma('mesa', 'caixa', [1.4, 0.8, 0.8], '#a9743f', [0, 0, 0.3])];
const MESA_CAM = { tipo: 'fixa', pos: [0.6, 1.8, 4.6], olha: [0.2, 1.0, 0.3], fov: 44 };

const cenas = [
  { fim: 3.65, ambiente: { ...COZ, horario: 'tarde' }, objetos: [...cozinha(), ...MESA(), forma('frango', 'esfera', [0.4, 0.3, 0.35], '#e8a03a', [-0.2, 0.8, 0.3]), forma('sol', 'esfera', [0.6, 0.6, 0.6], '#ffd60a', [-1.6, 2.6, -1.2], { params: { emissivo: true }, anim: { pulsa: 0.08 } })],
    personagens: [guia({ pos: [0.9, 0, 1.2], viraPara: olhaCam(0.1), acoes: [{ clip: 'look_around', de: 0, ate: 3.65, expressao: 'worried' }, talk(0, 3.65)] })],
    fluxos: [{ material: 'vapor', origem: [-0.2, 1.0, 0.3], taxa: 10, dispersao: 0.3, subida: 0.5 }, { material: 'agua', origem: [0.9, 1.8, 1.2], destino: [0.9, 0, 1.3], taxa: 4, tamanho: 0.03 }],
    camera: MESA_CAM, textos: [{ texto: 'COMIDA GELADA A 40 GRAUS', de: 0.1, ate: 3.6, estilo: 'titulo' }] },
  { fim: 10.15, objetos: [...cozinha(), ...MESA(), forma('caixaG', 'caixa', [1.0, 0.7, 0.7], '#e8eef5', [0, 0.8, 0.3], { opacidade: 0.35 }),
      ...[[-0.25, 0.1], [0.2, 0.15], [0, 0.45]].map(([x, z], i) => forma(`gelo${i}`, 'caixa', [0.25, 0.25, 0.25], '#bfe3ff', [x, 0.82, z], { anim: { escala: [[4, 1], [9.6, 0.35]] } }))],
    personagens: [guia({ pos: [0.9, 0, 1.2], acoes: [{ clip: 'point', de: 4, ate: 6, params: { dir: 'forward' } }, { clip: 'shrug', de: 6.3, ate: 10.15, expressao: 'sad' }] })],
    fluxos: [{ material: 'agua', origem: [0.45, 0.85, 0.5], destino: [0.6, 0, 0.8], taxa: 10 }], camera: MESA_CAM, efeitos: [pb(6.2, 10.1)], elementos: [icone('x', 6.4, 10)] },
  { fim: 14.5, objetos: [...cozinha(), ...MESA(), forma('frasco', 'cilindro', [0.2, 0.4, 0.2], '#3d8ee0', [0.4, 0.8, 0.4])],
    personagens: [guia({ pos: [0.9, 0, 1.2], viraPara: olhaCam(10.2), acoes: [{ clip: 'point', de: 10.4, ate: 12.4, params: { dir: 'forward' } }, { clip: 'surprised', de: 12.6, ate: 14.5, expressao: 'surprised' }] })],
    fluxos: [{ material: 'vapor', origem: [0.75, 1.25, 1.45], taxa: 10, dispersao: 0.1, subida: 0.5, tamanho: 0.06 }, { material: 'neve', origem: [0.75, 1.25, 1.45], taxa: 8, dispersao: 0.15 }],
    camera: { tipo: 'fixa', pos: [1.2, 1.6, 3.4], olha: [0.8, 1.3, 1.2], fov: 42 }, elementos: [etq('álcool na mão: gelado', 11, 14.3, '#3d8ee0')] },
  { fim: 18.5, objetos: [...cozinha(), ...MESA(), forma('poca', 'cilindro', [0.6, 0.02, 0.6], '#9fd3f0', [0, 0.8, 0.3], { anim: { escala: [[14.6, 1], [18.4, 0.5]] } })],
    personagens: [guia({ pos: [0.9, 0, 1.2], acoes: [{ clip: 'think', de: 14.6, ate: 18.5 }] })],
    fluxos: [{ material: 'vapor', origem: [0, 0.85, 0.3], taxa: 14, dispersao: 0.25, subida: 0.5, tamanho: 0.06 }, { material: 'neve', origem: [0, 0.9, 0.3], taxa: 10, dispersao: 0.3 }],
    camera: MESA_CAM, elementos: [etq('evaporar rouba calor', 14.8, 18.3, '#9fd3f0')] },
  { fim: 22.25, objetos: [...cozinha(), corpo({ aparece: 18.8 }), ...comida({ aparece: 19.4 }), evaporador({ aparece: 20.4 })],
    personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 18.8, ate: 22.25 }] })], camera: FRENTE },
  { fim: 27.85, objetos: [...cozinha(), corpo(), ...comida(), evaporador()], personagens: [guia({ acoes: [{ clip: 'point', de: 22.5, ate: 27.85, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'ar', caminho: P_EVAP, taxa: 14, velocidade: 0.8, tamanho: 0.04 }, FRIO({ de: 23 })], camera: { tipo: 'fixa', pos: [1.8, 2.6, 3.2], olha: [0, 2.0, -0.2], fov: 42 },
    elementos: [etq('evaporador', 25.9, 27.7, '#9fd3f0')] },
  { fim: 31.4, objetos: [...cozinha(), corpo(), ...comida(), evaporador()], personagens: [guia({ viraPara: olhaCam(27.9), acoes: [{ clip: 'shrug', de: 28.1, ate: 31.4 }] })],
    fluxos: [{ material: 'ar', caminho: P_EVAP, taxa: 4, velocidade: 0.3, tamanho: 0.04 }], camera: FRENTE, elementos: [icone('x', 28.4, 31.3)] },
  { fim: 35.25, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao({ aparece: 31.6 }), compressor(true, { aparece: 32.2 })],
    personagens: [guia({ pos: [-1.5, 0, -1.9], giro: 100, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 31.6, ate: 33.6 }, { clip: 'point', de: 33.8, ate: 35.25, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'ar', caminho: P_SUC, taxa: 12, velocidade: 1.2, tamanho: 0.04, de: 32.6 }], camera: TRAS, elementos: [etq('compressor', 33.9, 35.1, '#2f3338')] },
  { fim: 38.1, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao(), compressor()],
    personagens: [guia({ pos: [-1.5, 0, -1.9], giro: 100, acoes: [{ clip: 'surprised', de: 35.6, ate: 38.1, expressao: 'surprised' }] })],
    fluxos: [{ material: 'fogo', origem: [0.4, 0.6, -1.05], taxa: 16, dispersao: 0.12, vida: 0.3, tamanho: 0.05 }, { material: 'ar', caminho: P_SUC, taxa: 12, velocidade: 1.2, tamanho: 0.04 }],
    camera: { tipo: 'fixa', pos: [1.6, 1.3, -2.8], olha: [0.4, 0.5, -1.0], fov: 42 }, elementos: [icone('alerta', 35.6, 38, [0.25, 0.33])] },
  { fim: 43.3, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao(), compressor(), condensador({ aparece: 38.6 })],
    personagens: [guia({ pos: [-1.5, 0, -1.9], giro: 100, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 38.4, ate: 41.5 }, { clip: 'point', de: 41.7, ate: 43.3, params: { dir: 'forward' } }] })],
    fluxos: [CALOR_ATRAS({ de: 40 })], camera: TRAS },
  { fim: 47.75, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao(), compressor(), condensador()],
    personagens: [guia({ pos: [-1.5, 0, -1.9], giro: 100, acoes: [{ clip: 'nod', de: 45.8, ate: 47.75, expressao: 'happy' }] })],
    fluxos: [{ material: 'agua', caminho: P_COND, taxa: 14, velocidade: 1.5, tamanho: 0.035 }, CALOR_ATRAS()], camera: TRAS, elementos: [etq('condensador', 46, 47.6, '#2f3338')] },
  { fim: 50.2, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao(), compressor(false), condensador()],
    personagens: [guia({ viraPara: olhaCam(47.8), acoes: [{ clip: 'think', de: 47.9, ate: 50.2 }] })],
    fluxos: [{ material: 'agua', origem: [-0.6, 0.6, -0.85], taxa: 4, dispersao: 0.05 }], camera: FRENTE, elementos: [icone('interrogacao', 48, 50.1, [0.3, 0.34])] },
  { fim: 54.8, objetos: [...cozinha(), corpo(), ...comida(), evaporador(), succao(), compressor(), condensador(), capilar({ aparece: 50.6 })],
    personagens: [guia({ pos: [-1.6, 0, -1.6], giro: 110, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 50.4, ate: 52.8 }, { clip: 'point', de: 53, ate: 54.8, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'agua', caminho: P_CAP, taxa: 12, velocidade: 1.2, tamanho: 0.025, de: 51.2 }], camera: { tipo: 'fixa', pos: [-2.6, 2.0, -3.4], olha: [-0.4, 1.5, -0.7], fov: 44 } },
  { fim: 58.6, objetos: [...cozinha(), ...geladeira()], personagens: [guia({ acoes: [{ clip: 'cheer', de: 55, ate: 58.6, expressao: 'happy' }] })],
    fluxos: [...CICLO(), FRIO()], camera: FRENTE, elementos: [etq('tubo capilar', 56.9, 58.5, '#c97b3a')] },
  { fim: 62.0, objetos: [...cozinha(), ...geladeira(), ...['garrafa', 'leite'].map((n, i) => forma(`gel${i}`, 'caixa', [0.4, 0.65, 0.35], '#f2f2f2', [i ? 0.3 : -0.4, 1.53, i ? 0.1 : 0.2], { opacidade: 0.7, aparece: 59.4 + i * 0.5 }))],
    personagens: [guia({ viraPara: olhaCam(58.7), acoes: [{ clip: 'surprised', de: 59, ate: 62, expressao: 'worried' }] })],
    fluxos: [...CICLO(), FRIO({ taxa: 40 })], camera: FRENTE, efeitos: [pb(59.2, 61.9)], elementos: [icone('alerta', 59.3, 61.8, [0.25, 0.33])] },
  { fim: 67.8, objetos: [...cozinha(), ...geladeira({ vibra: false }), termostato({ aparece: 62.6 })],
    personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 62.3, ate: 64.6 }, { clip: 'nod', de: 64.8, ate: 67.8, expressao: 'happy' }] })],
    fluxos: [FRIO({ taxa: 8 })], camera: { tipo: 'fixa', pos: [1.6, 2.9, 2.8], olha: [0.3, 2.5, 0.2], fov: 42 }, elementos: [etq('termostato', 66.2, 67.7)] },
  { fim: 74.45, objetos: [...cozinha(), ...geladeira({ termo: true })],
    personagens: [guia({ pos: [-1.4, 0, -1.9], giro: 100, acoes: [{ clip: 'point', de: 68, ate: 71.5, params: { dir: 'forward' } }, { clip: 'surprised', de: 71.7, ate: 74.45, expressao: 'surprised' }] })],
    fluxos: [...CICLO(), CALOR_ATRAS({ taxa: 20 })], camera: TRAS, elementos: [{ tipo: 'seta', direcao: 'cima', pos: [0.42, 0.42], tamanho: 0.12, pulsa: true, de: 68.2, ate: 74.3 }] },
  { fim: 77.8, objetos: [...cozinha(), ...geladeira({ termo: true })], personagens: [guia({ viraPara: olhaCam(74.5), acoes: [{ clip: 'cheer', de: 74.6, ate: 77.8, expressao: 'happy' }] })],
    fluxos: [...CICLO(), FRIO(), CALOR_ATRAS()], camera: { tipo: 'travelling', de: { pos: [-3.4, 2.4, 4.4], olha: [0, 1.5, -0.3] }, para: { pos: [3.6, 2.4, 4.2], olha: [0, 1.5, -0.3] }, fov: 46 } },
  { fim: 82.7, objetos: [...cozinha(), ...geladeira({ termo: true })], personagens: [guia({ pos: [1.2, 0, 1.8], giro: 0, viraPara: olhaCam(77.9), acoes: [{ clip: 'shrug', de: 78, ate: 80.3 }, { clip: 'point', de: 80.5, ate: 82.7, params: { dir: 'forward' } }, talk(77.8, 82.7)] })],
    fluxos: [FRIO()], camera: { tipo: 'fixa', pos: [1.4, 1.7, 5.6], olha: [1.0, 1.5, 1.4], fov: 44 },
    textos: [{ texto: 'JÁ ABRIU SÓ PRA SE REFRESCAR?', de: 77.9, ate: 82.7, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Geladeira', duracao: 82.7, ambiente: COZ, cenas,
  sons: [
    { som: 'erro', de: 6.4, volume: 0.12 }, { som: 'agua', de: 6.5, ate: 8.3, volume: 0.06 }, { som: 'martelo', de: 18.9, volume: 0.1 },
    { som: 'sucesso', de: 26, volume: 0.14 }, { som: 'bomba', de: 32.3, ate: 34.6, volume: 0.1 }, { som: 'alerta', de: 35.6, ate: 37.4, volume: 0.08 },
    { som: 'sucesso', de: 46.1, volume: 0.14 }, { som: 'sucesso', de: 57, volume: 0.14 }, { som: 'erro', de: 59.4, volume: 0.12 },
    { som: 'sucesso', de: 66.3, volume: 0.14 }, { som: 'sucesso', de: 74.7, volume: 0.2 },
  ],
});
