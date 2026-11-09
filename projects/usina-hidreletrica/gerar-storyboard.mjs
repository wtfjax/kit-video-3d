// Usina hidrelétrica: rio, barragem, lago, conduto, turbina, gerador, vertedouro e linhas até a cidade.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const VALE = { fundo: 'floresta', chao: 'grama', horario: 'dia' };
const AZUL = '#3d8ee0';
const rio = () => forma('rio', 'caixa', [8, 0.08, 80], AZUL, [0, 0, 0], { params: { brilho: true } });
const barragem = (extra = {}) => forma('barragem', 'caixa', [30, 14, 4], '#b9b9b4', [0, 0, -6], extra);
const lago = (y = 12, extra = {}) => forma('lago', 'caixa', [30, 0.3, 40], AZUL, [0, y, -28], { params: { brilho: true }, ...extra });
const P_COND = [[-3, 6, -9], [-3, 3, -4], [-3, 1.5, 2]];
const conduto = (extra = {}) => ({ id: 'cond', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.4, params: { pontos: P_COND, raio: 1.0, cor: '#9aa7b5' }, ...extra });
const casaForca = (extra = {}) => forma('casaF', 'caixa', [8, 5, 6], '#c9cdd2', [-3, 0, 4], { opacidade: 0.35, ...extra });
const turbina = (vel = 240, extra = {}) => ({ id: 'turb', asset: 'helice', variante: 'turbina', pos: [-3, 1.6 - 1.4, 4], params: { pas: 6, raio: 1.4, cor: '#d9a441', velocidade: vel }, ...extra });
const gerador = (vel = 240, extra = {}) => [
  forma('bobina', 'cilindro', [2.6, 1.2, 2.6], '#c97b3a', [-3, 3.0, 4], { opacidade: 0.5, ...extra }),
  forma('ima', 'caixa', [1.8, 1.0, 0.5], '#d9473a', [-3, 3.1, 4], { anim: { gira: vel, eixo: 'y' }, ...extra }),
];
const usina = (o = {}) => [rio(), barragem(), lago(o.lagoY ?? 12), conduto(), casaForca(), turbina(o.vel), ...gerador(o.vel)];
const vertedouro = (aberto = false) => [
  ...[0, 1, 2].map((i) => forma(`degrau${i}`, 'caixa', [5, 1.2, 3], '#b9b9b4', [10, 9 - i * 4, -3 + i * 3])),
  ...(aberto ? [] : [forma('comporta', 'caixa', [5, 2.5, 0.5], '#d9473a', [10, 12, -4.2])]),
];
const AGUA_COND = (extra = {}) => ({ material: 'agua', caminho: P_COND, taxa: 40, velocidade: 6, tamanho: 0.2, ...extra });
const ELET = (extra = {}) => ({ material: 'eletricidade', caminho: [[-3, 3.2, 4], [-3, 6, 7], [12, 9, 14], [30, 9, 22]], taxa: 20, velocidade: 8, tamanho: 0.12, ...extra });
const arvores = () => [[-18, 6], [-22, -2], [18, 8], [22, -4], [-14, 14]].map(([x, z], i) => ({ id: `arv${i}`, asset: i % 2 ? 'arvore_pinheiro' : 'arvore_redonda', pos: [x, 0, z], params: i % 2 ? {} : { seed: i + 2 } }));
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [5.5, 0, 12], giro: -15, ...extra });
const LONGE = { tipo: 'fixa', pos: [24, 28, 38], olha: [0, 6, -12], fov: 52 };
const CASA = { tipo: 'fixa', pos: [5, 5, 14], olha: [-3, 2.4, 4], fov: 44 };
const GUIA_CAM = { tipo: 'fixa', pos: [8, 2.4, 22], olha: [3, 4, 4], fov: 52 };

const cidade = () => [
  { id: 'p1', asset: 'predio_apartamentos', variante: 'azul', pos: [0, 0, -6], params: { floors: 6 } },
  { id: 'c1', asset: 'casa_simples', variante: 'amarela', pos: [-12, 0, 2] }, { id: 'c2', asset: 'sobrado', variante: 'salmao', pos: [12, 0, 2] },
  { id: 'poste', asset: 'poste_luz', pos: [5, 0, 8] },
];

const cenas = [
  { fim: 3.3, ambiente: { fundo: 'cidade', chao: 'grama', horario: 'tarde' }, objetos: cidade(), personagens: [guia({ pos: [2, 0, 10], giro: 0, viraPara: olhaCam(0.1), acoes: [{ clip: 'point', de: 0.2, ate: 3.3, params: { dir: 'forwardUp' } }, talk(0, 3.3)] })],
    fluxos: [{ material: 'luz', origem: [0, 8, -0.2], taxa: 20, dispersao: 6, tamanho: 0.15 }], camera: { tipo: 'fixa', pos: [4, 3, 22], olha: [0, 6, -2], fov: 52 },
    textos: [{ texto: 'UMA CIDADE ACESA POR UM RIO', de: 0.1, ate: 3.2, estilo: 'titulo' }] },
  { fim: 9.55, objetos: [...arvores(), rio(), { id: 'roda', asset: 'helice', variante: 'ventilador', pos: [4.4, 2.5 - 2.5, 2], giro: 90, params: { pas: 8, raio: 2.5, cor: '#8a5a34', velocidade: 25 } }],
    personagens: [guia({ pos: [7, 0, 7], giro: -30, acoes: [{ clip: 'point', de: 3.6, ate: 6.6, params: { dir: 'forward' } }, { clip: 'shrug', de: 7, ate: 9.55, expressao: 'sad' }] })],
    fluxos: [{ material: 'agua', origem: [0, 0.2, -20], destino: [0, 0.2, 20], taxa: 20, dispersao: 3, tamanho: 0.15, vida: 4 }], camera: { tipo: 'fixa', pos: [12, 4, 16], olha: [3, 2, 2], fov: 48 },
    efeitos: [pb(7.1, 9.5)], elementos: [icone('x', 7.3, 9.4)] },
  { fim: 13.3, objetos: [...arvores(), rio(), barragem({ aparece: 10 }), lago(0.1)], personagens: [guia({ acoes: [{ clip: 'point', de: 10, ate: 13.3, params: { dir: 'forwardUp' } }] })],
    fluxos: [{ material: 'agua', origem: [0, 1, -30], destino: [0, 1, -8], taxa: 30, dispersao: 3, tamanho: 0.25 }], camera: LONGE },
  { fim: 17.45, objetos: [...arvores(), rio(), barragem(), lago(0.1, { anim: { pos: [[13.5, [0, 0.1, -28]], [16.5, [0, 12, -28]]] } })], personagens: [guia({ acoes: [{ clip: 'cheer', de: 16, ate: 17.45, expressao: 'happy' }] })],
    camera: LONGE, elementos: [etq('barragem', 15.9, 17.3, '#b9b9b4')], fluxos: [{ material: 'agua', origem: [0, 3, -30], destino: [0, 2, -9], taxa: 25, dispersao: 4, tamanho: 0.25, ate: 16.5 }] },
  { fim: 20.05, objetos: [...arvores(), rio(), barragem(), lago()], personagens: [guia({ viraPara: olhaCam(17.5), acoes: [{ clip: 'shrug', de: 17.7, ate: 20.05 }] })],
    fluxos: [{ material: 'bolha', origem: [0, 12.3, -20], taxa: 3, dispersao: 8, tamanho: 0.2 }], camera: GUIA_CAM, elementos: [icone('interrogacao', 18, 20, [0.3, 0.34])] },
  { fim: 26.85, objetos: [...arvores(), rio(), barragem({ opacidade: 0.5 }), lago(), conduto({ aparece: 20.5 }), casaForca({ aparece: 21 })],
    personagens: [guia({ acoes: [{ clip: 'point', de: 20.3, ate: 26.85, params: { dir: 'forward' } }] })], fluxos: [AGUA_COND({ de: 21.6 })],
    camera: { tipo: 'fixa', pos: [16, 9, 12], olha: [-3, 4, -3], fov: 48 }, elementos: [etq('conduto forçado', 25.3, 26.7, '#9aa7b5')] },
  { fim: 31.65, objetos: [...arvores(), rio(), barragem(), lago(), conduto(), casaForca(), turbina(300, { aparece: 27.1 })],
    fluxos: [AGUA_COND(), { material: 'agua', origem: [-3, 0.6, 5], destino: [-3, 0.1, 12], taxa: 30, tamanho: 0.15 }], camera: CASA, elementos: [etq('turbina', 30.1, 31.5, '#d9a441')],
    personagens: [guia({ pos: [3, 0, 9], giro: -40, acoes: [{ clip: 'point', de: 27, ate: 31.65, params: { dir: 'forward' } }] })] },
  { fim: 33.7, objetos: [...arvores(), rio(), barragem(), lago(), conduto(), casaForca(), turbina(300), forma('lamp', 'esfera', [0.6, 0.6, 0.6], '#9aa7b5', [3, 2.2, 9], { params: { apoiada: false } })],
    personagens: [guia({ pos: [4, 0, 9.5], giro: -40, viraPara: olhaCam(31.7), acoes: [{ clip: 'shrug', de: 31.8, ate: 33.7, expressao: 'sad' }] })], fluxos: [AGUA_COND()], camera: CASA },
  { fim: 37.7, objetos: [...arvores(), rio(), barragem(), lago(), conduto(), casaForca(), turbina(300), ...gerador(300, { aparece: 34 })],
    personagens: [guia({ pos: [3, 0, 9], giro: -40, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 34, ate: 37.7 }] })], fluxos: [AGUA_COND()], camera: { tipo: 'fixa', pos: [2, 4.6, 10], olha: [-3, 3, 4], fov: 42 } },
  { fim: 41.95, objetos: [...arvores(), ...usina({ vel: 300 }), forma('lamp', 'esfera', [0.6, 0.6, 0.6], '#ffd60a', [3, 2.2, 9], { params: { apoiada: false, emissivo: true }, aparece: 39.5 })],
    personagens: [guia({ pos: [4, 0, 9.5], giro: -40, acoes: [{ clip: 'cheer', de: 39.6, ate: 41.95, expressao: 'happy' }] })],
    fluxos: [AGUA_COND(), { material: 'eletricidade', caminho: [[-3, 3.2, 4], [3, 2.2, 9]], taxa: 25, velocidade: 4, tamanho: 0.08, de: 38.5 }], camera: CASA, elementos: [etq('gerador', 40.7, 41.8, '#c97b3a')] },
  { fim: 47.05, ambiente: { ...VALE, clima: 'chuva', horario: 'nublado' }, objetos: [...arvores(), ...usina({ lagoY: 12 }), lago(12, { id: 'lago2', anim: { pos: [[42.5, [0, 12, -28]], [46, [0, 14.3, -28]]] } })],
    personagens: [guia({ viraPara: olhaCam(42.2), acoes: [{ clip: 'surprised', de: 44, ate: 47.05, expressao: 'worried' }] })],
    fluxos: [{ material: 'agua', origem: [0, 14.5, -8], destino: [0, 0.5, -3.5], taxa: 50, dispersao: 10, tamanho: 0.25, de: 45.5 }], camera: LONGE,
    efeitos: [pb(44.5, 47)], elementos: [icone('alerta', 44.6, 46.9, [0.25, 0.33])] },
  { fim: 52.8, ambiente: { ...VALE, clima: 'chuva', horario: 'nublado' }, objetos: [...arvores(), ...usina(), ...vertedouro(true), forma('comporta', 'caixa', [5, 2.5, 0.5], '#d9473a', [10, 12, -4.2], { some: 48 })],
    personagens: [guia({ acoes: [{ clip: 'point', de: 47.3, ate: 52.8, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'agua', caminho: [[10, 12.4, -6], [10, 10.4, -3], [10, 6.4, 0], [10, 2.4, 3], [10, 0.3, 8]], taxa: 60, velocidade: 6, tamanho: 0.25, de: 48 }],
    camera: { tipo: 'fixa', pos: [26, 10, 22], olha: [8, 6, -2], fov: 48 }, elementos: [etq('vertedouro', 51.2, 52.7, '#b9b9b4')] },
  { fim: 56.45, ambiente: { fundo: 'floresta', chao: 'grama', horario: 'dia' }, objetos: [...arvores(), ...usina()], personagens: [guia({ viraPara: olhaCam(52.9), acoes: [{ clip: 'look_around', de: 53, ate: 56.45 }] })],
    fluxos: [AGUA_COND()], camera: { tipo: 'fixa', pos: [30, 30, 60], olha: [0, 0, -5], fov: 50 } },
  { fim: 60.0, objetos: [...arvores(), ...usina(), forma('trafo', 'caixa', [2.5, 2.5, 2.5], '#5b5f66', [6, 0, 9], { aparece: 56.8 }), ...[[12, 14], [30, 22]].map(([x, z], i) => forma(`torreL${i}`, 'caixa', [0.6, 9, 0.6], '#7b8794', [x, 0, z], { aparece: 57.5 + i * 0.6 }))],
    personagens: [guia({ pos: [3.5, 0, 12], giro: 20, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 56.8, ate: 60 }] })],
    fluxos: [{ material: 'eletricidade', caminho: [[-3, 3.2, 4], [6, 2.6, 9]], taxa: 20, velocidade: 4, tamanho: 0.1 }], camera: { tipo: 'fixa', pos: [14, 6, 28], olha: [6, 3, 8], fov: 50 } },
  { fim: 64.0, objetos: [...arvores(), ...usina(), forma('trafo', 'caixa', [2.5, 2.5, 2.5], '#5b5f66', [6, 0, 9]), ...[[12, 14], [30, 22]].map(([x, z], i) => forma(`torreL${i}`, 'caixa', [0.6, 9, 0.6], '#7b8794', [x, 0, z])),
      { id: 'cabo', asset: 'tubo', pos: [0, 0, 0], params: { pontos: [[6, 2.6, 9], [12, 9, 14], [30, 9, 22], [50, 9, 30]], raio: 0.06, cor: '#2f3338' } }],
    personagens: [guia({ pos: [3.5, 0, 12], giro: 20, acoes: [{ clip: 'point', de: 60.2, ate: 64, params: { dir: 'forward' } }] })],
    fluxos: [{ material: 'eletricidade', caminho: [[6, 2.6, 9], [12, 9, 14], [30, 9, 22], [50, 9, 30]], taxa: 25, velocidade: 10, tamanho: 0.15 }], camera: { tipo: 'fixa', pos: [4, 4, 34], olha: [18, 6, 14], fov: 52 },
    elementos: [etq('linhas de transmissão', 61.9, 63.9, '#7b8794')] },
  { fim: 68.95, ambiente: { fundo: 'cidade', chao: 'grama', horario: 'tarde' }, objetos: cidade(), personagens: [guia({ pos: [2, 0, 10], giro: 0, viraPara: olhaCam(64.1), acoes: [{ clip: 'cheer', de: 64.3, ate: 68.95, expressao: 'happy' }] })],
    fluxos: [{ material: 'luz', origem: [0, 8, -0.2], taxa: 30, dispersao: 6, tamanho: 0.15 }, { material: 'eletricidade', caminho: [[-20, 8, 6], [5, 6, 8]], taxa: 15, velocidade: 6, tamanho: 0.1 }],
    camera: { tipo: 'fixa', pos: [4, 3, 22], olha: [0, 6, -2], fov: 52 }, textos: [{ texto: 'MAIS DA METADE DO BRASIL', de: 64.5, ate: 68.8, estilo: 'destaque' }] },
  { fim: 72.45, objetos: [...arvores(), ...usina(), ...vertedouro()], personagens: [guia({ viraPara: olhaCam(69), acoes: [{ clip: 'cheer', de: 69.1, ate: 72.45, expressao: 'happy' }] })],
    fluxos: [AGUA_COND(), ELET()], camera: { tipo: 'travelling', de: { pos: [-20, 14, 40], olha: [0, 5, -6] }, para: { pos: [28, 14, 36], olha: [0, 5, -6] }, fov: 52 } },
  { fim: 76.9, objetos: [...arvores(), ...usina()], personagens: [guia({ pos: [4, 0, 14], giro: 0, viraPara: olhaCam(72.5), acoes: [{ clip: 'shrug', de: 72.6, ate: 74.8 }, { clip: 'point', de: 75, ate: 76.9, params: { dir: 'forward' } }, talk(72.45, 76.9)] })],
    fluxos: [AGUA_COND()], camera: { tipo: 'fixa', pos: [4.6, 1.8, 18.6], olha: [3.5, 2.6, 10], fov: 50 },
    textos: [{ texto: 'JÁ VIU UMA BARRAGEM DE PERTO?', de: 72.6, ate: 76.9, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Usina hidrelétrica', duracao: 76.9, ambiente: VALE, cenas, escalaParticulas: 2.5,
  sons: [
    { som: 'agua', de: 3.6, ate: 5.6, volume: 0.08 }, { som: 'erro', de: 7.3, volume: 0.12 }, { som: 'sucesso', de: 16, volume: 0.14 },
    { som: 'agua', de: 21.6, ate: 23.4, volume: 0.1 }, { som: 'maquina', de: 27.2, ate: 29.4, volume: 0.1 }, { som: 'eletrico', de: 38.5, ate: 39.8, volume: 0.08 },
    { som: 'sucesso', de: 40.8, volume: 0.14 }, { som: 'alerta', de: 44.6, ate: 46.6, volume: 0.08 }, { som: 'agua', de: 48.1, ate: 50.4, volume: 0.1 },
    { som: 'sucesso', de: 51.3, volume: 0.14 }, { som: 'eletrico', de: 60.3, ate: 61.6, volume: 0.08 }, { som: 'sucesso', de: 69.1, volume: 0.2 },
  ],
});
