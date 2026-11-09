// Turbina eólica: turbina de 40 m num campo; closes no rotor e na caixa de engrenagens.
import { fileURLToPath } from 'node:url';
import { salvar, talk, olhaCam, etq, icone, pb, forma } from '../../tools/sb-lib.mjs';

const CAMPO = { fundo: 'campo', chao: 'grama', horario: 'dia' };
const H = 40;
const rot = (giro, ox, oz) => { const a = (giro * Math.PI) / 180; return [ox * Math.cos(a) + oz * Math.sin(a), -ox * Math.sin(a) + oz * Math.cos(a)]; };
// turbina inteira em (x0, z0), virada para "giro" graus; vel = graus/s do rotor
const turbina = ({ x0 = 0, z0 = 0, giro = 0, vel = 90, ap, id = '', nacOpac } = {}) => {
  const a = (ox, oz) => { const [x, z] = rot(giro, ox, oz); return [x0 + x, z0 + z]; };
  const [nx, nz] = a(0, -0.5); const [rx, rz] = a(0, 3.4); const [cx, cz] = a(0, 3.9);
  const apar = (t) => (ap !== undefined ? { aparece: ap + t } : {});
  return [
    forma(`torre${id}`, 'cilindro', [2.2, H, 2.2], '#f2f2f2', [x0, 0, z0], apar(0)),
    forma(`nacele${id}`, 'caixa', [3.2, 3.2, 7], '#e8eef5', [nx, H, nz], { giro, ...(nacOpac ? { opacidade: nacOpac } : {}), ...apar(0.6) }),
    { id: `rotor${id}`, asset: 'helice', variante: 'turbina', pos: [rx, H + 1.6 - 17, rz], giro, params: { pas: 3, raio: 15, cor: '#f2f2f2', velocidade: vel }, ...apar(1.2) },
  ];
};
const engrenagens = (rapida = true, apRapida) => [
  { id: 'engG', asset: 'engrenagem', variante: 'prata', escala: 1.0, pos: [0, H + 0.4, 1.4], params: { velocidade: 25, dentes: 24 } },
  ...(rapida ? [{ id: 'engP', asset: 'engrenagem', variante: 'vermelha', escala: 0.4, pos: [0, H + 1.2, -0.4], params: { velocidade: -300, dentes: 10 }, ...(apRapida ? { aparece: apRapida } : {}) },
    forma('gerador', 'cilindro', [1.4, 1.4, 1.4], '#3d6fb6', [0, H + 0.8, -2.6], apRapida ? { aparece: apRapida + 0.4 } : {})] : []),
];
const paisagem = () => [
  { id: 'casa', asset: 'casa_simples', variante: 'verde', pos: [-14, 0, -12] },
  { id: 'a1', asset: 'arvore_redonda', pos: [9, 0, 14], params: { seed: 2 } }, { id: 'a2', asset: 'arvore_pinheiro', pos: [-9, 0, 18] },
  { id: 'a3', asset: 'arvore_redonda', variante: 'grande', pos: [16, 0, -10], params: { seed: 5 } },
];
const VENTO = (extra = {}) => ({ material: 'ar', origem: [-40, H, 12], destino: [40, H, 12], taxa: 50, dispersao: 10, espalha: 10, tamanho: 0.45, ...extra });
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [3.5, 0, 22], giro: 0, ...extra });
const LONGE = { tipo: 'fixa', pos: [16, 14, 70], olha: [0, 25, 0], fov: 50 };
const CUBO = { tipo: 'fixa', pos: [12, H + 4, 26], olha: [0, H + 1.5, 3], fov: 44 };
const DENTRO = { tipo: 'fixa', pos: [5.5, H + 2.4, 5], olha: [0, H + 1.2, 0], fov: 46 };
const CHAO = { tipo: 'fixa', pos: [5.5, 1.8, 30], olha: [1.5, 6, 0], fov: 56 };

const cenas = [
  { fim: 2.15, objetos: [...paisagem()], personagens: [guia({ pos: [1, 0, 8], viraPara: olhaCam(0.1), acoes: [{ clip: 'look_around', de: 0, ate: 2.15 }, talk(0, 2.15)] })],
    fluxos: [{ material: 'ar', origem: [-12, 2, 6], destino: [12, 2, 6], taxa: 30, dispersao: 2, espalha: 2, tamanho: 0.15 }], camera: { tipo: 'fixa', pos: [2, 1.7, 14], olha: [0.5, 1.6, 6], fov: 46 },
    textos: [{ texto: 'ENERGIA DO VENTO', de: 0.1, ate: 2.1, estilo: 'titulo' }] },
  { fim: 8.85, objetos: [...paisagem(), forma('torreF', 'caixa', [0.35, 6, 0.35], '#8a5a34', [0, 0, 0]), { id: 'cata', asset: 'helice', variante: 'ventilador', pos: [0, 6.2 - 1.6, 0.4], params: { pas: 12, raio: 1.6, cor: '#c9cdd2', velocidade: 40 } }],
    personagens: [guia({ pos: [1.8, 0, 3], giro: -20, acoes: [{ clip: 'point', de: 2.4, ate: 6, params: { dir: 'forwardUp' } }, { clip: 'shrug', de: 6.2, ate: 8.85, expressao: 'sad' }] })],
    fluxos: [{ material: 'ar', origem: [-10, 6, 3], destino: [10, 6, 3], taxa: 20, dispersao: 2, espalha: 2, tamanho: 0.15 }], camera: { tipo: 'fixa', pos: [3, 3, 13], olha: [0.5, 4, 0], fov: 50 },
    efeitos: [pb(6.1, 8.8)], elementos: [icone('x', 6.3, 8.8)] },
  { fim: 13.75, objetos: [...paisagem(), ...turbina({ ap: 9.2 })], personagens: [guia({ acoes: [{ clip: 'point', de: 9.2, ate: 13.75, params: { dir: 'forwardUp' } }] })], fluxos: [VENTO()], camera: LONGE },
  { fim: 19.15, objetos: [...paisagem(), ...turbina()], fluxos: [{ material: 'ar', origem: [-14, H + 6, 6], destino: [14, H + 4, 6], taxa: 50, dispersao: 2, espalha: 2, tamanho: 0.3 }],
    camera: CUBO, elementos: [{ tipo: 'seta', direcao: 'cima', pos: [0.3, 0.42], tamanho: 0.12, pulsa: true, de: 14.5, ate: 17.4 }, etq('pás', 17.6, 19, '#f2f2f2')] },
  { fim: 24.15, objetos: [...paisagem(), ...turbina({ nacOpac: 0.3 }), ...engrenagens(false)], camera: DENTRO, fluxos: [{ material: 'ar', origem: [-8, H + 2, 6], destino: [8, H + 2, 6], taxa: 20, dispersao: 1, tamanho: 0.2 }],
    elementos: [etq('15 voltas por minuto', 19.5, 22.4, '#9aa7b5'), icone('x', 22.5, 24)] },
  { fim: 29.9, objetos: [...paisagem(), ...turbina({ nacOpac: 0.3 }), ...engrenagens(true, 24.6)], camera: DENTRO,
    fluxos: [{ material: 'eletricidade', caminho: [[0, H + 1.5, -2.6], [0, H + 1.5, -3.6], [0, 2, -1]], taxa: 20, velocidade: 8, de: 26 }], elementos: [etq('caixa multiplicadora', 28, 29.8, '#d9473a')] },
  { fim: 32.6, objetos: [...paisagem(), ...turbina({ vel: 15 })], personagens: [guia({ viraPara: olhaCam(30), acoes: [{ clip: 'surprised', de: 30.2, ate: 32.6, expressao: 'worried' }] })],
    fluxos: [{ material: 'ar', origem: [40, H, 0], destino: [-40, H, 0], taxa: 50, dispersao: 8, espalha: 8, tamanho: 0.45 }], camera: LONGE, elementos: [{ tipo: 'seta', direcao: 'esquerda', pos: [0.5, 0.4], tamanho: 0.14, pulsa: true }] },
  { fim: 36.0, objetos: [...paisagem(), ...turbina({ vel: 15 }), forma('poste', 'cilindro', [0.2, 1.4, 0.2], '#5b5f66', [0, H + 3.2, -3.3], { aparece: 33 }), { id: 'anemo', asset: 'helice', variante: 'ventilador', pos: [0, H + 4.8 - 0.6, -3.0], params: { pas: 3, raio: 0.6, cor: '#3d6fb6', velocidade: 500 }, aparece: 33.4 }],
    fluxos: [{ material: 'ar', origem: [20, H + 4.5, -3], destino: [-20, H + 4.5, -3], taxa: 30, dispersao: 1, tamanho: 0.25 }], camera: { tipo: 'fixa', pos: [8, H + 7, 6], olha: [0, H + 3.5, -2.5], fov: 44 } },
  { fim: 40.4, objetos: [...paisagem(), ...turbina({ giro: 90 }), { id: 'yaw', asset: 'engrenagem', variante: 'vermelha', escala: 0.6, pos: [0, H - 1.4, 1.2], params: { velocidade: 120 } }],
    personagens: [guia({ acoes: [{ clip: 'cheer', de: 37, ate: 40.4, expressao: 'happy' }] })],
    fluxos: [{ material: 'ar', origem: [40, H, 0], destino: [-40, H, 0], taxa: 50, dispersao: 8, espalha: 8, tamanho: 0.45 }], camera: { tipo: 'fixa', pos: [48, 16, 46], olha: [0, 26, 0], fov: 50 },
    elementos: [etq('sistema de giro', 39.1, 40.3, '#d9473a')] },
  { fim: 44.25, objetos: [...paisagem(), forma('torreB', 'cilindro', [0.4, 5, 0.4], '#f2f2f2', [0, 0, 0]), { id: 'rotorB', asset: 'helice', variante: 'turbina', pos: [0, 5.2 - 2, 0.4], params: { pas: 3, raio: 2, cor: '#f2f2f2', velocidade: 30 } }],
    personagens: [guia({ pos: [2.2, 0, 3], giro: -20, acoes: [{ clip: 'shrug', de: 40.6, ate: 44.25, expressao: 'sad' }] })],
    fluxos: [{ material: 'poeira', origem: [-3, 0.5, 2], taxa: 14, dispersao: 2, subida: 0.6, tamanho: 0.2 }, { material: 'ar', origem: [-8, 2, 2], destino: [8, 3, 2], taxa: 14, dispersao: 2, tamanho: 0.12 }],
    camera: { tipo: 'fixa', pos: [3, 2.6, 12], olha: [0.6, 3, 0], fov: 50 } },
  { fim: 49.05, objetos: [...paisagem(), ...turbina(), { id: 'predio', asset: 'predio_apartamentos', variante: 'alto', pos: [-26, 0, -6], params: { floors: 14 } }],
    personagens: [guia({ acoes: [{ clip: 'point', de: 44.5, ate: 49.05, params: { dir: 'forwardUp' } }] })], fluxos: [VENTO()], camera: { tipo: 'fixa', pos: [-4, 14, 78], olha: [-10, 24, 0], fov: 50 } },
  { fim: 53.45, ambiente: { ...CAMPO, clima: 'chuva', horario: 'nublado' }, objetos: [...paisagem(), ...turbina({ vel: 420 })], fluxos: [VENTO({ taxa: 90 })], camera: LONGE,
    efeitos: [pb(50.5, 53.4), { tipo: 'tremor', de: 50.5, ate: 51.4, intensidade: 0.5 }], elementos: [icone('alerta', 50.6, 53.3, [0.25, 0.33])] },
  { fim: 58.1, ambiente: { ...CAMPO, clima: 'chuva', horario: 'nublado' }, objetos: [...paisagem(), ...turbina({ vel: 160 })], fluxos: [{ material: 'ar', origem: [-14, H + 4, 6], destino: [14, H + 2, 6], taxa: 60, dispersao: 3, tamanho: 0.3 }],
    camera: CUBO, elementos: [etq('pás viradas de lado', 54.2, 58, '#f2f2f2')] },
  { fim: 63.0, ambiente: { ...CAMPO, clima: 'chuva', horario: 'nublado' }, objetos: [...paisagem(), ...turbina({ vel: 12 })], personagens: [guia({ viraPara: olhaCam(58.2), acoes: [{ clip: 'nod', de: 58.4, ate: 63, expressao: 'happy' }] })],
    fluxos: [VENTO({ taxa: 80 })], camera: LONGE, elementos: [etq('controle de passo', 61.3, 62.9, '#d9473a')] },
  { fim: 68.45, objetos: [...paisagem(), ...turbina({ vel: 120 })], fluxos: [{ material: 'ar', origem: [0, H + 1.6, 6], taxa: 30, dispersao: 13, tamanho: 0.25 }],
    camera: { tipo: 'fixa', pos: [20, H + 6, 34], olha: [0, H + 1, 3], fov: 52 }, textos: [{ texto: '300 KM/H NA PONTA', de: 63.6, ate: 68.3, estilo: 'destaque' }] },
  { fim: 72.0, ambiente: { ...CAMPO, horario: 'tarde' }, objetos: [...paisagem(), ...turbina(), ...turbina({ x0: -45, z0: -40, id: 'b', vel: 80 }), ...turbina({ x0: 45, z0: -30, id: 'c', vel: 100 })],
    personagens: [guia({ viraPara: olhaCam(68.5), acoes: [{ clip: 'cheer', de: 68.6, ate: 72, expressao: 'happy' }] })], fluxos: [VENTO()],
    camera: { tipo: 'travelling', de: { pos: [-20, 8, 80], olha: [0, 24, -10] }, para: { pos: [20, 8, 80], olha: [0, 24, -10] }, fov: 54 } },
  { fim: 76.7, ambiente: { ...CAMPO, horario: 'tarde' }, objetos: [...paisagem(), ...turbina()], personagens: [guia({ pos: [3.5, 0, 22], viraPara: olhaCam(72.1), acoes: [{ clip: 'shrug', de: 72.2, ate: 74.3 }, { clip: 'point', de: 74.5, ate: 76.7, params: { dir: 'forward' } }, talk(72, 76.7)] })],
    fluxos: [VENTO()], camera: { tipo: 'fixa', pos: [4.6, 1.8, 26.6], olha: [3.2, 3.0, 20], fov: 50 }, textos: [{ texto: 'JÁ VIU UMA DE PERTO?', de: 72.1, ate: 76.7, estilo: 'pergunta' }] },
];

salvar(fileURLToPath(import.meta.url), {
  titulo: 'Turbina eólica', duracao: 76.7, ambiente: CAMPO, cenas,
  sons: [
    { som: 'vento', de: 0, ate: 2, volume: 0.1 }, { som: 'erro', de: 6.3, volume: 0.12 }, { som: 'sucesso', de: 17.7, volume: 0.14 },
    { som: 'maquina', de: 24.6, ate: 26.8, volume: 0.1 }, { som: 'sucesso', de: 28.1, volume: 0.14 }, { som: 'bomba', de: 37, ate: 38.8, volume: 0.08 },
    { som: 'sucesso', de: 39.2, volume: 0.14 }, { som: 'vento', de: 49.2, ate: 51.4, volume: 0.12 }, { som: 'alerta', de: 50.6, ate: 52.6, volume: 0.08 },
    { som: 'sucesso', de: 61.4, volume: 0.14 }, { som: 'sucesso', de: 68.7, volume: 0.2 },
  ],
});
