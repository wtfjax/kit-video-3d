// Micro-ondas: aparelho gigante e transparente numa bancada; o guia monta peça por peça.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const COZ = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [0.75, 0, 1.75], giro: -20, ...extra });
const bancada = () => [forma('banc', 'caixa', [4, 0.9, 2], '#a9743f', [0, 0, 0]), forma('arm', 'caixa', [1.4, 2.2, 0.6], '#8a5a34', [-2.9, 0, -1.2])];
const corpo = (extra = {}) => forma('corpo', 'caixa', [2.6, 1.6, 1.8], '#e8eef5', [0, 0.9, 0], { opacidade: 0.28, ...extra });
const painel = (extra = {}) => [forma('painel', 'caixa', [0.5, 1.5, 1.7], '#2f3338', [1.05, 0.95, 0], { opacidade: 0.5, ...extra }), forma('visor', 'caixa', [0.36, 0.16, 0.03], '#4fd36b', [1.05, 2.05, 0.86], { params: { emissivo: true }, anim: { pulsa: 0.15 }, ...extra })];
const magnetron = (extra = {}) => forma('mag', 'cilindro', [0.4, 0.5, 0.4], '#d9473a', [1.05, 1.6, -0.3], extra);
const prato = (gira = 0, extra = {}) => [
  forma('prato', 'cilindro', [1.3, 0.05, 1.3], '#f2f2f2', [-0.25, 0.95, 0], { ...(gira ? { anim: { gira, eixo: 'y' } } : {}), ...extra }),
  forma('comida', 'cilindro', [0.7, 0.35, 0.7], '#e8a03a', [-0.25, 1.0, 0], { ...(gira ? { anim: { gira, eixo: 'y' } } : {}), ...extra }),
];
const porta = (extra = {}) => forma('porta', 'caixa', [2.0, 1.4, 0.05], '#2f3338', [-0.25, 1.0, 0.92], { opacidade: 0.4, ...extra });
const aparelho = (o = {}) => [corpo(o.corpo), ...painel(), magnetron(), ...prato(o.gira ?? 0), ...(o.porta === false ? [] : [porta()])];
const P_ONDA = [[1.05, 2.15, -0.3], [0.5, 2.35, 0], [-0.25, 1.25, 0]];
const P_QUICA = [[1.05, 2.15, -0.3], [-1.2, 2.35, -0.6], [-0.9, 1.0, 0.8], [0.6, 2.3, 0.7], [-0.25, 1.25, 0]];
const ONDA = (extra = {}) => ({ material: 'luz', caminho: P_ONDA, taxa: 30, velocidade: 2.5, tamanho: 0.04, ...extra });
const VAPOR = (extra = {}) => ({ material: 'vapor', origem: [-0.25, 1.4, 0], taxa: 10, dispersao: 0.25, subida: 0.6, tamanho: 0.08, ...extra });
const CAM = { tipo: 'fixa', pos: [0.4, 2.0, 5.6], olha: [0, 1.25, 0], fov: 44 };
const PERTO = { tipo: 'fixa', pos: [-0.1, 1.9, 3.0], olha: [-0.2, 1.15, 0], fov: 40 };
const MAG = { tipo: 'fixa', pos: [1.9, 2.4, 2.4], olha: [1.0, 1.7, -0.2], fov: 40 };

const cenas = [
  { fim: 2.4, objetos: [...bancada(), ...prato()], personagens: [guia({ viraPara: olhaCam(0.1), acoes: [{ clip: 'point', de: 0.2, ate: 2.4, params: { dir: 'forward' } }, talk(0, 2.4)] })],
    fluxos: [{ material: 'neve', origem: [-0.25, 1.4, 0], taxa: 8, dispersao: 0.3, subida: 0.3 }], camera: CAM,
    textos: [{ texto: 'COMIDA QUENTE EM 2 MINUTOS', de: 0.1, ate: 2.3, estilo: 'titulo' }], elementos: [icone('relogio', 0.3, 2.3, [0.22, 0.33])] },
  { fim: 7.5, objetos: [...bancada(), forma('fogao', 'caixa', [1.4, 0.15, 1.0], '#2f3338', [-0.25, 0.9, 0]), forma('panela', 'cilindro', [0.9, 0.4, 0.9], '#9aa7b5', [-0.25, 1.05, 0])],
    personagens: [guia({ acoes: [{ clip: 'point', de: 2.6, ate: 4.4, params: { dir: 'forward' } }, { clip: 'surprised', de: 4.6, ate: 7.5, expressao: 'worried' }] })],
    fluxos: [{ material: 'fogo', origem: [-0.25, 1.05, 0], taxa: 60, dispersao: 0.4, vida: 0.4, subida: 0.4 }, { material: 'fumaca', origem: [-0.25, 1.5, 0], taxa: 12, de: 4.6 }],
    camera: PERTO, efeitos: [pb(4.6, 7.4)], elementos: [icone('x', 4.8, 7.4)] },
  { fim: 9.65, objetos: [...bancada(), forma('casca', 'cilindro', [0.95, 0.5, 0.95], '#5a3a22', [-0.25, 0.9, 0], { opacidade: 0.45 }), forma('miolo', 'cilindro', [0.55, 0.4, 0.55], '#9fd3f0', [-0.25, 0.95, 0])],
    personagens: [guia({ viraPara: olhaCam(7.6), acoes: [{ clip: 'shrug', de: 7.7, ate: 9.65, expressao: 'sad' }] })],
    fluxos: [{ material: 'neve', origem: [-0.25, 1.15, 0], taxa: 14, dispersao: 0.2, subida: 0.2 }], camera: PERTO, elementos: [etq('por dentro: gelado', 7.9, 9.5, '#9fd3f0')] },
  { fim: 14.5, objetos: [...bancada(), ...prato()], personagens: [guia({ acoes: [{ clip: 'point', de: 9.8, ate: 14.5, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'luz', origem: [-1.6, 1.2, 0], destino: [-0.3, 1.15, 0], taxa: 30, tamanho: 0.05 }, { material: 'luz', origem: [1.1, 1.2, 0], destino: [-0.2, 1.15, 0], taxa: 30, tamanho: 0.05 }],
    camera: PERTO, elementos: [etq('ondas invisíveis', 10.4, 14.3, '#ffd60a')] },
  { fim: 18.95, objetos: [...bancada(), ...prato(0, { anim: { pulsa: 0.04 } })], personagens: [guia({ viraPara: olhaCam(14.6), acoes: [{ clip: 'nod', de: 14.8, ate: 18.95, expressao: 'happy' }] })],
    fluxos: [{ material: 'bolha', origem: [-0.25, 1.15, 0], taxa: 30, dispersao: 0.28, subida: 0.15, vida: 0.4 }, VAPOR({ de: 16.7 })], camera: PERTO, elementos: [etq('moléculas de água', 14.8, 18.8, '#3d8ee0')] },
  { fim: 24.9, objetos: [...bancada(), ...painel({ aparece: 19.3 }), magnetron({ aparece: 19.9 }), ...prato()],
    personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 19.2, ate: 22 }, { clip: 'point', de: 22.2, ate: 24.9, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'eletricidade', caminho: [[2.1, 0.9, -0.3], [1.05, 1.0, -0.3], [1.05, 1.6, -0.3]], taxa: 25, velocidade: 2, de: 20.6 }, ONDA({ de: 21.5 })],
    camera: MAG, elementos: [etq('magnetron', 23.5, 24.8)] },
  { fim: 28.55, objetos: [...bancada(), ...painel(), magnetron(), ...prato()], personagens: [{ id: 'mulher', preset: 'mulher', pos: [-1.6, 0, 1.6], giro: 20, viraPara: olhaCam(25), acoes: [{ clip: 'surprised', de: 25.4, ate: 28.55, expressao: 'surprised' }] }],
    fluxos: [{ material: 'luz', origem: [1.05, 2.15, -0.3], destino: [-0.5, 2.0, 1.5], taxa: 50, dispersao: 0.3, espalha: 3, tamanho: 0.05 }], camera: CAM, elementos: [icone('alerta', 25.6, 28.4, [0.25, 0.33])] },
  { fim: 31.4, objetos: [...bancada(), ...painel(), magnetron(), ...prato(), corpo({ aparece: 29 })], personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 28.7, ate: 31.4 }] })], camera: CAM },
  { fim: 36.0, objetos: [...bancada(), ...aparelho({ porta: false })], personagens: [guia({ acoes: [{ clip: 'point', de: 31.6, ate: 36, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'luz', caminho: P_QUICA, taxa: 30, velocidade: 2.5, tamanho: 0.04 }], camera: PERTO, elementos: [etq('cavidade', 34.7, 35.9, '#e8eef5')] },
  { fim: 38.35, objetos: [...bancada(), ...aparelho({ porta: false, corpo: { opacidade: 0.95 } })], personagens: [guia({ viraPara: olhaCam(36.1), acoes: [{ clip: 'look_around', de: 36.1, ate: 38.35 }] })],
    fluxos: [{ material: 'fumaca', origem: [-0.25, 2.6, 0], taxa: 3, tamanho: 0.1 }], camera: CAM, elementos: [icone('interrogacao', 36.3, 38.2, [0.3, 0.34])] },
  { fim: 43.0, objetos: [...bancada(), ...aparelho({ porta: false, corpo: { opacidade: 0.95 } }), porta({ aparece: 39 })], personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 38.6, ate: 43 }] })],
    fluxos: [{ material: 'luz', origem: [-0.25, 1.4, 0.95], destino: [-0.25, 1.4, 2.5], taxa: 10, dispersao: 0.5, tamanho: 0.06, de: 40 }], camera: CAM },
  { fim: 47.45, objetos: [...bancada(), ...aparelho()], personagens: [guia({ viraPara: olhaCam(43.1), acoes: [{ clip: 'nod', de: 45.7, ate: 47.45, expressao: 'happy' }] })],
    fluxos: [{ material: 'luz', origem: [-0.25, 1.4, 0.95], destino: [-0.25, 1.5, 2], taxa: 18, dispersao: 0.6, tamanho: 0.035 }, { material: 'luz', caminho: P_QUICA, taxa: 25, velocidade: 2.5, tamanho: 0.04 }],
    camera: PERTO, elementos: [etq('a luz passa, a onda não', 43.2, 45.5, '#ffd60a'), etq('grade da porta', 45.7, 47.3, '#2f3338')] },
  { fim: 51.6, objetos: [...bancada(), ...aparelho({ porta: false })], personagens: [guia({ acoes: [{ clip: 'point', de: 47.6, ate: 51.6, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'luz', caminho: P_QUICA, taxa: 30, velocidade: 2.5, tamanho: 0.04 }, { material: 'fogo', origem: [-0.5, 1.35, 0.15], taxa: 12, dispersao: 0.05, vida: 0.3, tamanho: 0.04 }, { material: 'neve', origem: [0, 1.35, -0.2], taxa: 10, dispersao: 0.08, tamanho: 0.04 }],
    camera: PERTO },
  { fim: 54.7, objetos: [...bancada(), ...aparelho({ porta: false })], personagens: [guia({ viraPara: olhaCam(51.7), acoes: [{ clip: 'shrug', de: 51.8, ate: 54.7, expressao: 'sad' }] })],
    fluxos: [VAPOR({ origem: [-0.45, 1.4, 0.1] }), { material: 'neve', origem: [-0.05, 1.35, -0.15], taxa: 14, dispersao: 0.1 }], camera: PERTO, efeitos: [pb(52, 54.6)], elementos: [icone('x', 52.2, 54.6)] },
  { fim: 61.65, objetos: [...bancada(), ...aparelho({ porta: false, gira: 60 })], personagens: [guia({ acoes: [{ clip: 'point', de: 55, ate: 58, params: { dir: 'forward' } }, { clip: 'cheer', de: 58.2, ate: 61.65, expressao: 'happy' }] })],
    fluxos: [{ material: 'luz', caminho: P_QUICA, taxa: 25, velocidade: 2.5, tamanho: 0.04 }, VAPOR({ taxa: 16 })], camera: CAM, elementos: [etq('prato giratório', 60, 61.5, '#f2f2f2')] },
  { fim: 65.5, ambiente: { fundo: 'industrial', chao: 'concreto', horario: 'dia' },
    objetos: [forma('poste', 'cilindro', [0.25, 2.6, 0.25], '#5b5f66', [0, 0, -1]), forma('antena', 'cilindro', [2.2, 0.15, 2.2], '#c9cdd2', [0, 2.8, -1], { params: { apoiada: false }, anim: { gira: 40, eixo: 'y' } }), forma('mesa', 'caixa', [1, 0.8, 0.6], '#a9743f', [1.4, 0, 0.4])],
    personagens: [{ id: 'eng', preset: 'engenheiro', pos: [-1.5, 0, 1.4], giro: 90, movimentos: [{ de: 61.8, ate: 64.5, para: [0.6, 1.2], clip: 'walk' }] }],
    fluxos: [{ material: 'luz', origem: [0, 2.9, -1], taxa: 25, dispersao: 1, espalha: 4, destino: [0, 4, 3], tamanho: 0.05 }], camera: { tipo: 'fixa', pos: [0.6, 2.2, 6], olha: [0, 1.6, 0], fov: 48 },
    elementos: [etq('radar, 1945', 62, 65.3, '#3d6fb6')] },
  { fim: 69.5, ambiente: { fundo: 'industrial', chao: 'concreto', horario: 'dia' },
    objetos: [forma('poste', 'cilindro', [0.25, 2.6, 0.25], '#5b5f66', [0, 0, -1]), forma('antena', 'cilindro', [2.2, 0.15, 2.2], '#c9cdd2', [0, 2.8, -1], { params: { apoiada: false }, anim: { gira: 40, eixo: 'y' } }), forma('mesa', 'caixa', [1, 0.8, 0.6], '#a9743f', [1.4, 0, 0.4]),
      forma('choco', 'caixa', [0.4, 0.08, 0.2], '#5a3a22', [1.4, 0.8, 0.4], { anim: { escala: [[65.8, 1], [69, 0.4]] } })],
    personagens: [{ id: 'eng', preset: 'engenheiro', pos: [0.6, 0, 1.2], giro: 0, viraPara: olhaCam(65.6), acoes: [{ clip: 'surprised', de: 66.2, ate: 69.5, expressao: 'surprised' }] }],
    fluxos: [{ material: 'asfalto', origem: [1.4, 0.85, 0.4], destino: [1.5, 0, 0.6], taxa: 8, tamanho: 0.04 }, { material: 'luz', origem: [0, 2.9, -1], destino: [1.4, 0.9, 0.4], taxa: 20, tamanho: 0.04 }],
    camera: { tipo: 'fixa', pos: [1.4, 1.6, 3.8], olha: [1.0, 1.0, 0.6], fov: 44 } },
  { fim: 72.6, objetos: [...bancada(), ...aparelho({ gira: 60 })], personagens: [guia({ viraPara: olhaCam(69.6), acoes: [{ clip: 'cheer', de: 69.7, ate: 72.6, expressao: 'happy' }] })],
    fluxos: [VAPOR({ taxa: 14 }), { material: 'luz', origem: [-0.25, 1.4, 0.95], destino: [-0.25, 1.5, 2], taxa: 10, dispersao: 0.6, tamanho: 0.035 }],
    camera: { tipo: 'travelling', de: { pos: [-2.2, 2.0, 5.2], olha: [0, 1.2, 0] }, para: { pos: [2.4, 2.0, 5.2], olha: [0, 1.2, 0] }, fov: 46 } },
  { fim: 77.2, objetos: [...bancada(), ...aparelho({ gira: 60 })], personagens: [guia({ pos: [1.0, 0, 2.0], giro: 0, viraPara: olhaCam(72.7), acoes: [{ clip: 'shrug', de: 72.8, ate: 75, }, { clip: 'point', de: 75.2, ate: 77.2, params: { dir: 'forward' } }, talk(72.6, 77.2)] })],
    fluxos: [VAPOR()], camera: { tipo: 'fixa', pos: [1.2, 1.7, 5.6], olha: [0.8, 1.5, 1.6], fov: 44 },
    textos: [{ texto: 'JÁ PÔS METAL NO MICRO-ONDAS?', de: 72.7, ate: 77.2, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Micro-ondas', duracao: 77.2, ambiente: COZ, cenas,
  sons: [
    { som: 'fogo', de: 2.6, ate: 4.6, volume: 0.1 }, { som: 'erro', de: 4.8, volume: 0.12 }, { som: 'martelo', de: 19.3, volume: 0.1 },
    { som: 'eletrico', de: 20.6, ate: 22, volume: 0.08 }, { som: 'sucesso', de: 23.6, volume: 0.14 }, { som: 'alerta', de: 25.6, ate: 27.6, volume: 0.08 },
    { som: 'sucesso', de: 34.8, volume: 0.12 }, { som: 'sucesso', de: 45.8, volume: 0.14 }, { som: 'erro', de: 52.2, volume: 0.12 },
    { som: 'bomba', de: 55, ate: 57, volume: 0.08 }, { som: 'sucesso', de: 60.1, volume: 0.14 }, { som: 'sucesso', de: 69.8, volume: 0.2 },
  ],
});
