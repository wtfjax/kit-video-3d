// Storyboard: Como funciona o freio do carro (rua + oficina com o sistema de freio gigante)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OFICINA = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const RUA = { fundo: 'cidade', chao: 'grama', horario: 'dia' };
const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, transicao: 'flash', ambiente: OFICINA, ...c });
const talk = (de, ate) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'] });
const olhaCam = (em) => [{ em, alvo: 'camera' }];
const etq = (texto, de, ate, ponto = '#d9473a') => ({ tipo: 'etiqueta', texto, pos: [0.5, 0.3], ponto, de, ate });

// ---- oficina: pedal → cilindro mestre → cano → pinça no disco ----
const pedal = (treme = 0, extra = {}) => {
  const anim = treme ? { anim: { oscila: { eixo: 'z', amp: 0.04, freq: treme } } } : {};
  return [
    { id: 'haste', asset: 'forma', pos: [-3, 0, 0.3], params: { tipo: 'caixa', tamanho: [0.18, 1.2, 0.18], cor: '#2f3338' }, ...anim, ...extra },
    { id: 'pedal', asset: 'forma', pos: [-3, 1.1, 0.45], params: { tipo: 'caixa', tamanho: [0.55, 0.12, 0.45], cor: '#5b5f66' }, ...anim, ...extra },
  ];
};
const mestre = (extra = {}) => ({ id: 'mestre', asset: 'forma', pos: [-2.2, 0.85, 0], opacidade: 0.5, params: { tipo: 'caixa', tamanho: [0.9, 0.38, 0.38], cor: '#9aa7b5' }, ...extra });
const P_CANO = [[-1.75, 1.04, 0], [0.4, 1.04, 0], [0.4, 1.04, -0.6], [1.6, 1.04, -0.6], [1.6, 1.5, -0.6], [2.1, 1.5, -0.6]];
const cano = (extra = {}) => ({ id: 'cano', asset: 'tubo', pos: [0, 0, 0], opacidade: 0.45, params: { pontos: P_CANO, raio: 0.07, cor: '#d9a441' }, ...extra });
const disco = (vel = 120, variante = 'prata', extra = {}) => ({ id: 'disco', asset: 'engrenagem', variante, escala: 0.42, pos: [2.4, 1.0, -0.6], params: { velocidade: vel, dentes: 48 }, ...extra });
const pinca = (extra = {}) => ({ id: 'pinca', asset: 'forma', pos: [2.4, 1.2, -0.6], opacidade: 0.45, params: { tipo: 'caixa', tamanho: [0.55, 0.55, 0.7], cor: '#d9473a' }, ...extra });
const pastilhas = (aperta = 0, extra = {}) => [-0.22, 0.22].map((dz, i) => ({ id: `past${i}`, asset: 'forma', pos: [2.4, 1.25, -0.6 + dz], params: { tipo: 'caixa', tamanho: [0.42, 0.38, 0.07], cor: '#2f3338' }, ...(aperta ? { anim: { oscila: { eixo: 'z', amp: 0.02, freq: aperta } } } : {}), ...extra }));
const sensor = (extra = {}) => ({ id: 'sensor', asset: 'forma', pos: [3.35, 0.9, -0.6], params: { tipo: 'caixa', tamanho: [0.18, 0.18, 0.18], cor: '#3d6fb6' }, ...extra });
const motor = (vel = 0, extra = {}) => [
  { id: 'caixaabs', asset: 'forma', pos: [0.4, 0, -1.2], params: { tipo: 'caixa', tamanho: [0.7, 0.6, 0.5], cor: '#3d6fb6' }, ...extra },
  { id: 'motorabs', asset: 'engrenagem', variante: 'prata', escala: 0.15, pos: [0.4, 0.6, -0.93], params: { velocidade: vel }, ...extra },
];
const P_SENSOR = [[3.35, 0.9, -0.6], [3.35, 0.3, -1.2], [0.75, 0.3, -1.2]];
const fioSensor = (extra = {}) => ({ id: 'fios', asset: 'tubo', pos: [0, 0, 0], params: { pontos: P_SENSOR, raio: 0.025, cor: '#2f3338' }, ...extra });
const sistema = (o = {}) => [...pedal(o.treme), mestre(), cano(), disco(o.vel ?? 120, o.discoVar), pinca(), ...pastilhas(o.aperta), ...(o.abs ? [sensor(), fioSensor(), ...motor(o.motorVel ?? 0)] : [])];
const oficina = () => [
  { id: 'banc', asset: 'forma', pos: [-4.6, 0, -1.6], params: { tipo: 'caixa', tamanho: [1.6, 0.9, 0.7], cor: '#a9743f' } },
  { id: 'pneus', asset: 'forma', pos: [4.6, 0, -1.6], params: { tipo: 'cilindro', tamanho: [0.9, 0.9, 0.9], cor: '#2f3338' } },
  { id: 'cx', asset: 'caixa_madeira', pos: [-4.4, 0, 0.6] },
];
const FLUIDO = (extra = {}) => ({ material: 'agua', caminho: P_CANO, taxa: 30, velocidade: 3, tamanho: 0.05, ...extra });
const ATRITO = (extra = {}) => ({ material: 'fagulha', origem: [2.4, 1.2, -0.3], taxa: 30, dispersao: 0.15, tamanho: 0.03, ...extra });
const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [0.6, 0, 1.6], giro: 0, ...extra });
const OF_GERAL = { tipo: 'fixa', pos: [0.2, 2.6, 7.8], olha: [0, 1.0, -0.3], fov: 50 };
const OF_DISCO = { tipo: 'fixa', pos: [3.6, 1.8, 3.0], olha: [2.3, 1.2, -0.6], fov: 42 };
const OF_PEDAL = { tipo: 'fixa', pos: [-1.6, 1.8, 2.8], olha: [-2.7, 0.9, 0.1], fov: 42 };

// ---- rua ----
const rua = () => [
  { id: 'rua', asset: 'rua_reta', pos: [0, 0, 0], giro: 90, params: { length: 90 } },
  { id: 'c1', asset: 'casa_simples', variante: 'amarela', pos: [-8, 0, -9] },
  { id: 'c2', asset: 'sobrado', variante: 'salmao', pos: [4, 0, -9] },
  { id: 'arv', asset: 'arvore_redonda', pos: [-2, 0.2, -5.8], params: { seed: 3 } },
  { id: 'poste', asset: 'poste_luz', pos: [10, 0.2, -5] },
];
const carro = (de, ate, de_x, ate_x, extra = {}) => ({ id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [de_x, 0.06, 1.7], giro: 90, movimentos: [{ de, ate, para: [ate_x, 1.7] }], ...extra });

// 1  cem por hora, uma tonelada, ponta do pé
add(0, 4.6, {
  transicao: 'corte', ambiente: RUA,
  objetos: [...rua(), carro(0, 4.6, -45, 12)],
  fluxos: [{ material: 'poeira', origem: { ancora: 'carro', desloca: [0, 0.2, -2.2] }, taxa: 12, tamanho: 0.2 }],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [3, 0.2, 5.5], giro: -90, viraPara: [{ em: 0.5, alvo: 'carro' }], acoes: [{ clip: 'surprised', de: 2.5, ate: 4.6 }] }],
  camera: { tipo: 'fixa', pos: [9, 1.4, 10], olha: [-2, 1, 1.7], fov: 46 },
  textos: [{ texto: '100 KM/H. 1 TONELADA. SÓ O SEU PÉ.', de: 0.1, ate: 4.5, estilo: 'titulo' }],
});
// 2  sua perna não empurra nem ele parado
add(4.6, 9.2, {
  ambiente: RUA,
  objetos: [...rua(), { id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [0, 0.06, 1.7], giro: 90 }],
  personagens: [guia({ pos: [-2.9, 0.06, 1.7], giro: 90, acoes: [{ clip: 'push', de: 4.8, ate: 9.2, expressao: 'angry' }] })],
  camera: { tipo: 'fixa', pos: [-3, 1.6, 7.5], olha: [-1.2, 0.9, 1.7], fov: 44 },
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.75, 0.34], tamanho: 0.15, de: 6.5, ate: 9 }],
  fluxos: [{ material: 'poeira', origem: [-3, 0.1, 1.7], taxa: 6, tamanho: 0.08, de: 5, ate: 9 }],
});
// 3  pedal numa alavanca que multiplica
add(9.2, 13.45, {
  objetos: [...oficina(), ...pedal(0, { aparece: 9.6 })],
  personagens: [guia({ pos: [-4.0, 0, 1.0], giro: 70, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 9.8, ate: 12 }, { clip: 'point', de: 12.1, ate: 13.45, params: { dir: 'forward' } }] })],
  camera: OF_PEDAL,
  elementos: [{ tipo: 'seta', direcao: 'esquerda', pos: [0.5, 0.42], tamanho: 0.13, pulsa: true, de: 11.5, ate: 13.3 }],
  fluxos: [{ material: 'fagulha', origem: [-3, 1.15, 0.45], taxa: 15, tamanho: 0.03, de: 9.8, ate: 11.5 }],
});
// 4  a roda está lá longe, e girando
add(13.45, 16.2, {
  ambiente: RUA,
  objetos: [...rua(), carro(13.45, 16.2, -18, 14)],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [1, 0.2, 5.5], giro: 0, viraPara: [{ em: 13.5, alvo: 'carro' }], acoes: [{ clip: 'point', de: 13.7, ate: 16.2, params: { dir: 'forward' } }] }],
  camera: { tipo: 'fixa', pos: [2, 0.6, 6.5], olha: [0, 0.4, 1.7], fov: 50 },
});
// 5  enche um cano com óleo
add(16.2, 18.45, {
  objetos: [...oficina(), ...pedal(), mestre({ aparece: 16.3 }), cano({ aparece: 16.8 })],
  personagens: [guia({ acoes: [{ clip: 'point', de: 16.4, ate: 18.45, params: { dir: 'forward' } }] })],
  fluxos: [FLUIDO({ de: 17.2 })],
  camera: OF_GERAL,
});
// 6  óleo não se espreme: empurra de um lado, sai do outro
add(18.45, 23.15, {
  objetos: [...oficina(), ...pedal(1.2), mestre(), cano()],
  personagens: [guia({ acoes: [{ clip: 'push', de: 18.6, ate: 23.15 }] })],
  fluxos: [FLUIDO({ taxa: 45, velocidade: 5 })],
  camera: { tipo: 'travelling', de: { pos: [-1.6, 1.9, 3.2], olha: [-2.4, 1, 0] }, para: { pos: [2.2, 2.2, 3.4], olha: [1.4, 1.3, -0.5] }, fov: 46 },
  elementos: [{ tipo: 'seta', direcao: 'direita', pos: [0.5, 0.4], tamanho: 0.13, pulsa: true, de: 19.5, ate: 23 }],
});
// 7  esse é o fluido de freio
add(23.15, 25.3, {
  objetos: [...oficina(), ...pedal(), mestre(), cano()],
  personagens: [guia({ viraPara: olhaCam(23.2), acoes: [{ clip: 'nod', de: 23.3, ate: 25.3, expressao: 'happy' }] })],
  fluxos: [FLUIDO()],
  camera: OF_GERAL,
  elementos: [etq('fluido de freio', 23.4, 25.2, '#d9a441')],
});
// 8  pistão bem maior, a força cresce de novo
add(25.3, 30.95, {
  objetos: [...oficina(), ...pedal(1.2), mestre(), cano(), pinca({ aparece: 25.8 })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, acoes: [{ clip: 'point', de: 26, ate: 30.95, params: { dir: 'forward' } }] })],
  fluxos: [FLUIDO({ taxa: 45, velocidade: 5 })],
  camera: { tipo: 'fixa', pos: [2.8, 2.4, 3.4], olha: [2, 1.6, -0.6], fov: 42 },
  elementos: [{ tipo: 'seta', direcao: 'baixo', pos: [0.48, 0.38], tamanho: 0.14, pulsa: true, de: 27.5, ate: 30.8 }],
});
// 9  esse é o cilindro
add(30.95, 32.6, {
  objetos: [...oficina(), ...pedal(), mestre(), cano(), pinca({ anim: { pulsa: 0.05 } })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, acoes: [{ clip: 'nod', de: 31, ate: 32.6 }] })],
  fluxos: [FLUIDO()],
  camera: { tipo: 'fixa', pos: [3.4, 2.2, 3], olha: [2.4, 1.6, -0.6], fov: 40 },
  elementos: [etq('cilindro', 31.2, 32.5)],
});
// 10  mas empurrar o quê?
add(32.6, 34.15, {
  objetos: [...oficina(), ...pedal(), mestre(), cano(), pinca()],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, viraPara: olhaCam(32.7), acoes: [{ clip: 'shrug', de: 32.7, ate: 34.15 }] })],
  fluxos: [FLUIDO({ taxa: 15 })],
  camera: OF_GERAL,
});
// 11  disco de aço + pastilhas apertando, igual pinça
add(34.15, 40.6, {
  objetos: [...oficina(), ...pedal(), mestre(), cano(), pinca(), disco(160, 'prata', { aparece: 34.6 }), ...pastilhas(0, { aparece: 37 })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 34.8, ate: 37.8 }, { clip: 'point', de: 38, ate: 40.6, params: { dir: 'forward' } }] })],
  fluxos: [FLUIDO({ de: 38 }), ATRITO({ de: 38.5 })],
  camera: OF_DISCO,
});
// 12  essas são as pastilhas
add(40.6, 42.8, {
  objetos: [...oficina(), ...sistema({ vel: 90, aperta: 3 })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, viraPara: olhaCam(40.7), acoes: [{ clip: 'nod', de: 40.8, ate: 42.8, expressao: 'happy' }] })],
  fluxos: [ATRITO()],
  camera: { tipo: 'fixa', pos: [2.9, 2.3, 1.4], olha: [2.4, 1.55, -0.6], fov: 38 },
  elementos: [etq('pastilhas', 40.8, 42.7, '#2f3338')],
});
// 13  atrito transforma velocidade em calor
add(42.8, 46.9, {
  objetos: [...oficina(), ...sistema({ vel: 60 })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, acoes: [{ clip: 'point', de: 43, ate: 46.9, params: { dir: 'forward' } }] })],
  fluxos: [ATRITO({ taxa: 45 }), { material: 'vapor', origem: [2.4, 1.6, -0.6], taxa: 12, subida: 0.8, tamanho: 0.08, de: 44 }],
  camera: OF_DISCO,
});
// 14  passa de trezentos graus
add(46.9, 51.0, {
  objetos: [...oficina(), ...sistema({ vel: 40 })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, viraPara: olhaCam(47), acoes: [{ clip: 'surprised', de: 47.2, ate: 51, expressao: 'surprised' }] })],
  fluxos: [ATRITO({ taxa: 35 }), { material: 'fogo', origem: [2.4, 1.3, -0.35], taxa: 18, dispersao: 0.25, tamanho: 0.05, vida: 0.3, subida: 0.2 }],
  camera: { tipo: 'fixa', pos: [4.2, 1.6, 3.4], olha: [2.6, 1.2, -0.4], fov: 44 },
  textos: [{ texto: 'MAIS DE 300 °C', de: 47.6, ate: 50.8, estilo: 'destaque' }],
});
// 15  carro de corrida: fica vermelho
add(51.0, 54.4, {
  objetos: [...oficina(), ...sistema({ vel: 40, discoVar: 'vermelha' })],
  personagens: [guia({ pos: [1.0, 0, 0.9], giro: 35, acoes: [{ clip: 'cheer', de: 51.2, ate: 54.4, expressao: 'happy' }] })],
  fluxos: [ATRITO({ taxa: 60 }), { material: 'fogo', origem: [2.4, 1.0, -0.35], taxa: 30, dispersao: 0.5, tamanho: 0.05, vida: 0.3, subida: 0.2 }],
  camera: { tipo: 'fixa', pos: [2.6, 1.3, 2.4], olha: [2.4, 1.1, -0.6], fov: 44 },
  efeitos: [{ tipo: 'zoom', de: 51, ate: 54.3, para: 1.15 }],
});
// 16  roda trava, carro escorrega reto
add(54.4, 60.05, {
  ambiente: RUA,
  objetos: [...rua(), carro(54.4, 59.5, -26, 6), { id: 'cone', asset: 'cone', pos: [8, 0.06, 1.7] }],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [4, 0.2, 5.5], giro: -90, viraPara: [{ em: 54.6, alvo: 'carro' }], acoes: [{ clip: 'surprised', de: 56.5, ate: 60.05, expressao: 'surprised' }] }],
  fluxos: [{ material: 'fumaca', origem: { ancora: 'carro', desloca: [0, 0.2, -1.4] }, taxa: 22, tamanho: 0.18, de: 55.5, ate: 59.5 }],
  camera: { tipo: 'fixa', pos: [12, 2.2, 10], olha: [0, 0.8, 1.7], fov: 46 },
  efeitos: [{ tipo: 'pretoebranco', de: 56, ate: 60, zoom: 1.1 }],
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.25, 0.34], tamanho: 0.15, de: 57, ate: 59.9 }],
});
// 17  sensor que vê a roda parando + motorzinho
add(60.05, 64.2, {
  objetos: [...oficina(), ...pedal(), mestre(), cano(), disco(80), pinca(), ...pastilhas(), sensor({ aparece: 60.4 }), fioSensor({ aparece: 61.2 }), ...motor(200, { aparece: 62.4 })],
  personagens: [guia({ pos: [1.6, 0, 1.6], giro: 0, acoes: [{ clip: 'point', de: 60.4, ate: 64.2, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'eletricidade', caminho: P_SENSOR, taxa: 20, velocidade: 2.5, tamanho: 0.035, de: 61.4 }],
  camera: { tipo: 'fixa', pos: [2.2, 2.4, 4.6], olha: [1.6, 0.8, -0.8], fov: 46 },
});
// 18  solta e aperta sozinho, quinze vezes por segundo
add(64.2, 68.2, {
  objetos: [...oficina(), ...sistema({ vel: 80, aperta: 15, abs: true, motorVel: 300 })],
  personagens: [guia({ pos: [1.6, 0, 1.6], viraPara: olhaCam(64.3), acoes: [{ clip: 'surprised', de: 64.5, ate: 68.2, expressao: 'happy' }] })],
  fluxos: [{ material: 'eletricidade', caminho: P_SENSOR, taxa: 25, velocidade: 3, tamanho: 0.035 }, ATRITO({ taxa: 20 })],
  camera: OF_DISCO,
  textos: [{ texto: '15 VEZES POR SEGUNDO', de: 65.6, ate: 68, estilo: 'destaque' }],
});
// 19  tremedeira no pedal
add(68.2, 70.6, {
  objetos: [...oficina(), ...sistema({ vel: 80, aperta: 15, abs: true, motorVel: 300, treme: 15 })],
  personagens: [guia({ pos: [-4.0, 0, 1.0], giro: 70, acoes: [{ clip: 'surprised', de: 68.3, ate: 70.6 }] })],
  fluxos: [FLUIDO({ taxa: 40 })],
  camera: OF_PEDAL,
  efeitos: [{ tipo: 'tremor', de: 68.3, ate: 70.5, intensidade: 0.3 }],
});
// 20  esse é o ABS (o carro desvia obedecendo)
add(70.6, 72.4, {
  ambiente: RUA,
  objetos: [...rua(), { id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [-14, 0.06, 1.7], giro: 90, movimentos: [{ de: 70.6, ate: 71.6, para: [-4, 1.7] }, { de: 71.6, ate: 72.4, para: [2, -1.4] }] },
    { id: 'cone', asset: 'cone', pos: [4, 0.06, 1.7] }],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [6, 0.2, 5.5], giro: -90, viraPara: olhaCam(70.7), acoes: [{ clip: 'cheer', de: 70.7, ate: 72.4, expressao: 'happy' }] }],
  camera: { tipo: 'fixa', pos: [10, 3, 11], olha: [0, 0.6, 1], fov: 48 },
  elementos: [etq('ABS', 70.8, 72.3, '#3d6fb6')],
});
// 21  o fluido puxa umidade do ar
add(72.4, 76.9, {
  ambiente: { ...OFICINA, horario: 'nublado' },
  objetos: [...oficina(), ...pedal(), mestre(), cano()],
  personagens: [guia({ pos: [-1.0, 0, 1.6], viraPara: olhaCam(72.5), acoes: [{ clip: 'point', de: 72.7, ate: 76.9, params: { dir: 'forward' } }] })],
  fluxos: [{ material: 'vapor', origem: [-2.2, 2.6, 0.8], destino: [-2.2, 1.1, 0], taxa: 14, tamanho: 0.07 }, { material: 'bolha', origem: [-2.2, 0.95, 0], taxa: 8, dispersao: 0.3, tamanho: 0.04 }],
  camera: { tipo: 'fixa', pos: [-1.4, 1.8, 3], olha: [-2.2, 1.1, 0], fov: 42 },
});
// 22  ferve dentro do cano, vira bolha, pedal afunda
add(76.9, 83.0, {
  ambiente: { ...OFICINA, horario: 'nublado' },
  objetos: [...oficina(), ...pedal(), mestre(), cano(), disco(120), pinca(), ...pastilhas()],
  personagens: [guia({ pos: [-4.0, 0, 1.0], giro: 70, acoes: [{ clip: 'push', de: 77, ate: 80 }, { clip: 'surprised', de: 80.2, ate: 83, expressao: 'surprised' }] })],
  fluxos: [{ material: 'bolha', caminho: P_CANO, taxa: 25, velocidade: 1.5, tamanho: 0.06 }, { material: 'vapor', origem: [0.4, 1.1, -0.3], taxa: 8, tamanho: 0.07 }],
  camera: OF_GERAL,
  efeitos: [{ tipo: 'pretoebranco', de: 78, ate: 82.9, zoom: 1.1 }],
  elementos: [{ tipo: 'icone', icone: 'alerta', pos: [0.25, 0.33], tamanho: 0.15, pulsa: true, de: 78.2, ate: 82.8 }],
});
// 23  trocar a cada dois anos
add(83.0, 86.1, {
  objetos: [...oficina(), ...pedal(), mestre(), cano(), { id: 'frasco', asset: 'forma', pos: [-2.0, 1.3, 0.4], params: { tipo: 'cilindro', tamanho: [0.25, 0.45, 0.25], cor: '#d9a441' }, aparece: 83.2 }],
  personagens: [guia({ pos: [-3.6, 0, 0.9], giro: 70, acoes: [{ clip: 'crouch', de: 83.3, ate: 86.1 }] })],
  fluxos: [{ material: 'agua', origem: [-2.05, 1.55, 0.3], destino: [-2.2, 1.05, 0], taxa: 30, tamanho: 0.04, de: 83.6 }, FLUIDO({ de: 84.2 })],
  camera: { tipo: 'fixa', pos: [-0.6, 2.2, 3.2], olha: [-2.0, 1.1, 0.1], fov: 42 },
  elementos: [{ tipo: 'etiqueta', texto: 'a cada 2 anos', pos: [0.5, 0.3], ponto: '#d9a441', de: 84, ate: 86 }],
});
// 24  pronto, você construiu um freio
add(86.1, 89.0, {
  ambiente: RUA,
  objetos: [...rua(), carro(86.1, 88.6, -20, 0)],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [3, 0.2, 5.2], giro: 0, viraPara: olhaCam(86.2), acoes: [{ clip: 'cheer', de: 86.3, ate: 89, expressao: 'happy' }] }],
  camera: { tipo: 'fixa', pos: [5, 1.8, 12], olha: [1, 1, 2.5], fov: 46 },
});
// 25  pergunta
add(89.0, 95.2, {
  ambiente: RUA,
  objetos: [...rua(), { id: 'carro', asset: 'carro_sedan', variante: 'azul', pos: [0, 0.06, 1.7], giro: 90 }],
  personagens: [{ id: 'guia', preset: 'construtor', pos: [1.5, 0.2, 4.6], giro: 0, viraPara: olhaCam(89.1), acoes: [{ clip: 'shrug', de: 89.2, ate: 91.5 }, { clip: 'point', de: 91.7, ate: 95.2, params: { dir: 'forward' } }, talk(89, 95.2)] }],
  fluxos: [{ material: 'fumaca', origem: { ancora: 'carro', desloca: [0, 0.3, -2.3] }, taxa: 4, tamanho: 0.12 }],
  camera: { tipo: 'fixa', pos: [2.2, 1.7, 9.2], olha: [1.3, 1.5, 3.5], fov: 44 },
  textos: [{ texto: 'O SEU PEDAL JÁ TREMEU?', de: 89.1, ate: 95.2, estilo: 'pergunta' }],
  elementos: [{ tipo: 'etiqueta', texto: 'sim ou não?', pos: [0.5, 0.27], ponto: '#ffd60a', de: 93, ate: 95 }],
});

const sb = {
  versao: 1,
  titulo: 'Como funciona o freio do carro',
  formato: { largura: 1080, altura: 1920, fps: 30 },
  duracao: 95.2,
  audio: 'narracao.mp3',
  palavras: 'palavras.json',
  legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: OFICINA,
  cenas: S,
  sons: [
    { som: 'carro', de: 0, ate: 4.4, volume: 0.12 },
    { som: 'erro', de: 6.8, volume: 0.12 },
    { som: 'martelo', de: 9.9, volume: 0.12 },
    { som: 'agua', de: 19.2, ate: 21, volume: 0.08 },
    { som: 'sucesso', de: 23.4, volume: 0.15 },
    { som: 'martelo', de: 35, volume: 0.1 },
    { som: 'sucesso', de: 40.8, volume: 0.15 },
    { som: 'fogo', de: 43.4, ate: 45.4, volume: 0.1 },
    { som: 'alerta', de: 55.6, ate: 57.6, volume: 0.08 },
    { som: 'erro', de: 58.2, volume: 0.12 },
    { som: 'eletrico', de: 61.4, ate: 62.6, volume: 0.08 },
    { som: 'bomba', de: 64.3, ate: 66.6, volume: 0.1 },
    { som: 'sucesso', de: 70.8, volume: 0.15 },
    { som: 'alerta', de: 79, ate: 81, volume: 0.08 },
    { som: 'sucesso', de: 87.1, volume: 0.2 },
  ],
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
console.log(`storyboard.json: ${S.length} cenas, ${sb.duracao}s`);
