// Storyboard: Como funciona o chuveiro elétrico (chuveiro com caixa transparente num banheiro; o guia monta peça por peça)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BANHEIRO = { fundo: 'interior', chao: 'piso', horario: 'dia' };
const S = [];
const add = (inicio, fim, c) => S.push({ inicio, fim, transicao: 'flash', ambiente: BANHEIRO, ...c });
const talk = (de, ate) => ({ clip: 'talk', de, ate, fala: true, camada: 1, mascara: ['head', 'face', 'armL'] });
const olhaCam = (em) => [{ em, alvo: 'camera' }];
const etq = (texto, de, ate, ponto = '#d9473a') => ({ tipo: 'etiqueta', texto, pos: [0.5, 0.3], ponto, de, ate });

// ---- banheiro e chuveiro (centro do chuveiro em [0, 2.75, -0.4]) ----
const CX = 0, CY = 2.75, CZ = -0.4;
const banheiro = () => [
  { id: 'parede', asset: 'forma', pos: [0, 0, -1.3], params: { tipo: 'caixa', tamanho: [4.4, 3.4, 0.2], cor: '#bfe3ff' } },
  { id: 'box', asset: 'forma', pos: [1.6, 0, -0.2], opacidade: 0.25, params: { tipo: 'caixa', tamanho: [0.06, 2.2, 2], cor: '#e8eef5' } },
  { id: 'ralo', asset: 'forma', pos: [0, 0.01, -0.4], params: { tipo: 'cilindro', tamanho: [0.3, 0.02, 0.3], cor: '#9aa7b5' } },
  { id: 'cano', asset: 'tubo', pos: [0, 0, 0], params: { pontos: [[0, 3.4, -1.2], [0, 3.1, -1.2], [0, 3.1, CZ]], raio: 0.06, cor: '#c9cdd2' } },
];
const caixa = (extra = {}) => ({ id: 'chuv', asset: 'forma', pos: [CX, 2.55, CZ], opacidade: 0.4, params: { tipo: 'caixa', tamanho: [0.8, 0.45, 0.8], cor: '#f2f2f2' }, ...extra });
// resistência em mola (hélice ao longo de x)
const MOLA = Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2 * 4; return [CX - 0.3 + (i / 48) * 0.6, CY + Math.sin(a) * 0.12, CZ + Math.cos(a) * 0.12]; });
const MEIA = MOLA.slice(24);
const resist = (extra = {}) => ({ id: 'resist', asset: 'tubo', pos: [0, 0, 0], params: { pontos: MOLA, raio: 0.02, cor: '#c97b3a' }, ...extra });
const P_FIO = [[-2.1, 3.0, -1.2], [-0.5, 3.0, -1.2], [-0.5, CY, CZ], [MOLA[0][0], MOLA[0][1], MOLA[0][2]]];
const fio = () => ({ id: 'fio', asset: 'tubo', pos: [0, 0, 0], params: { pontos: P_FIO, raio: 0.025, cor: '#2f3338' } });
const diafragma = (anima = false, extra = {}) => ({ id: 'diaf', asset: 'forma', pos: [CX, 2.93, CZ], params: { tipo: 'cilindro', tamanho: [0.4, 0.04, 0.4], cor: '#2f3338' }, ...(anima ? { anim: { oscila: { eixo: 'y', amp: 0.025, freq: 1.2 } } } : {}), ...extra });
const P_TERRA = [[0.4, 2.7, CZ], [1.0, 2.7, -1.2], [1.0, 0.05, -1.2]];
const terra = (extra = {}) => ({ id: 'terra', asset: 'tubo', pos: [0, 0, 0], params: { pontos: P_TERRA, raio: 0.025, cor: '#4f9d4a' }, ...extra });
const chave = (vel = 0, extra = {}) => ({ id: 'chave', asset: 'engrenagem', variante: 'vermelha', escala: 0.06, pos: [0.3, 2.55, 0.02], params: { velocidade: vel }, ...extra });
const chuveiro = (o = {}) => [caixa(), resist(), fio(), ...(o.diaf === false ? [] : [diafragma(o.anima)]), ...(o.terra === false ? [] : [terra()]), ...(o.chave === false ? [] : [chave(o.vel)])];

const AGUA = (extra = {}) => ({ material: 'agua', origem: [CX, 2.5, CZ], destino: [CX, 0.02, CZ], taxa: 70, dispersao: 0.3, espalha: 0.4, tamanho: 0.04, ...extra });
const VAPOR = (extra = {}) => ({ material: 'vapor', origem: [CX, 1.6, CZ], taxa: 10, dispersao: 0.5, subida: 0.6, tamanho: 0.1, ...extra });
const CORRENTE = (caminho = P_FIO.concat(MOLA), extra = {}) => ({ material: 'eletricidade', caminho, taxa: 25, velocidade: 2.5, tamanho: 0.035, ...extra });
const BRILHO = (pts = MOLA, extra = {}) => ({ material: 'luz', caminho: pts, taxa: 30, velocidade: 0.8, tamanho: 0.03, ...extra });

const guia = (extra = {}) => ({ id: 'guia', preset: 'construtor', pos: [1.0, 0, 0.7], giro: -30, ...extra });
const CAM_BANHO = { tipo: 'fixa', pos: [1.8, 2.1, 4.8], olha: [0.3, 1.8, -0.4], fov: 46 };
const CAM_CHUV = { tipo: 'fixa', pos: [0.7, 3.0, 1.5], olha: [0, 2.72, CZ], fov: 40 };
const CAM_BAIXO = { tipo: 'fixa', pos: [-1.2, 1.4, 2.8], olha: [0, 2.3, CZ], fov: 46 };

// 1  fora da América Latina quase ninguém conhece
add(0, 3.9, {
  transicao: 'corte',
  ambiente: { fundo: 'cidade', chao: 'grama' },
  objetos: [
    { id: 'rua', asset: 'rua_reta', pos: [0, 0, 6], giro: 90, params: { length: 60 } },
    { id: 'casa', asset: 'casa_moderna', variante: 'escura', pos: [0, 0, -4] },
    { id: 'arv', asset: 'arvore_pinheiro', pos: [-6, 0, -2] },
    { id: 'carro', asset: 'carro_sedan', variante: 'branco', pos: [-25, 0.06, 7.7], giro: 90, movimentos: [{ de: 0, ate: 3.9, para: [20, 7.7] }] },
  ],
  personagens: [guia({ pos: [2.5, 0, 2.5], giro: 0, viraPara: olhaCam(0.2), acoes: [{ clip: 'shrug', de: 0.5, ate: 3.9 }, talk(0, 3.9)] })],
  camera: { tipo: 'travelling', de: { pos: [7, 2, 14], olha: [1, 2, -2] }, para: { pos: [5, 1.8, 10], olha: [1.5, 1.8, 0] }, fov: 44 },
  textos: [{ texto: 'O CHUVEIRO QUE SÓ O BRASIL USA', de: 0.1, ate: 3.8, estilo: 'titulo' }],
});
// 2  aqui está em quase toda casa
add(3.9, 6.6, {
  ambiente: { fundo: 'cidade', chao: 'grama' },
  objetos: [
    { id: 'rua', asset: 'rua_reta', pos: [0, 0, 6], giro: 90, params: { length: 60 } },
    { id: 'c1', asset: 'casa_simples', variante: 'amarela', pos: [-8, 0, -3] },
    { id: 'c2', asset: 'casa_simples', variante: 'azul', pos: [0, 0, -3] },
    { id: 'c3', asset: 'casa_simples', variante: 'verde', pos: [8, 0, -3] },
    { id: 'poste', asset: 'poste_luz', pos: [4, 0.2, 3.2] },
  ],
  personagens: [guia({ pos: [1.5, 0, 3], giro: 0, viraPara: olhaCam(4), acoes: [{ clip: 'point', de: 4.1, ate: 6.6, params: { dir: 'forwardUp' } }] })],
  fluxos: [-8, 0, 8].map((x, i) => VAPOR({ origem: [x + 1.5, 4.6, -1.5], taxa: 8, tamanho: 0.25, subida: 1, de: 4 + i * 0.4 })),
  camera: { tipo: 'fixa', pos: [3, 3.5, 16], olha: [0, 2.5, -2], fov: 50 },
});
// 3  você quer banho quente
add(6.6, 8.6, {
  objetos: [...banheiro()],
  personagens: [guia({ pos: [0, 0, -0.2], giro: 0, viraPara: olhaCam(6.7), acoes: [{ clip: 'shrug', de: 6.8, ate: 8.6, expressao: 'sad' }] })],
  fluxos: [AGUA({ origem: [0, 3.05, CZ], taxa: 50 }), { material: 'neve', origem: [0, 2.6, 0], taxa: 10, dispersao: 0.8, tamanho: 0.04 }],
  camera: CAM_BANHO,
});
// 4  esquentar no fogão e jogar com balde demora
add(8.6, 14.65, {
  ambiente: { fundo: 'interior', chao: 'madeira' },
  objetos: [
    { id: 'fogao', asset: 'forma', pos: [-1.5, 0, -0.6], params: { tipo: 'caixa', tamanho: [1.4, 0.9, 1], cor: '#f2f2f2' } },
    { id: 'panela', asset: 'tanque', pos: [-1.5, 0.9, -0.6], params: { raio: 0.35, altura: 0.5, liquido: '#3fa5e0', nivel: 0.7 } },
    { id: 'balde', asset: 'forma', pos: [-0.6, 0.75, 0.75], params: { tipo: 'cilindro', tamanho: [0.4, 0.4, 0.4], cor: '#3d6fb6' }, movimentos: [{ de: 10.2, ate: 14.4, para: [2.6, 0.75] }] },
  ],
  personagens: [guia({ pos: [-0.6, 0, 0.3], giro: 90, movimentos: [{ de: 10.2, ate: 14.4, para: [2.6, 0.3], clip: 'carry', velocidade: 0.75 }], acoes: [{ clip: 'carry', de: 10.2, ate: 14.65, expressao: 'worried' }] })],
  fluxos: [{ material: 'fogo', origem: [-1.5, 0.9, -0.6], taxa: 30, dispersao: 0.2, tamanho: 0.04, vida: 0.25, subida: 0.15 }, VAPOR({ origem: [-1.5, 1.45, -0.6], taxa: 10, tamanho: 0.08 })],
  camera: { tipo: 'fixa', pos: [0.6, 1.8, 5.2], olha: [0.4, 1, 0], fov: 46 },
  elementos: [{ tipo: 'icone', icone: 'relogio', pos: [0.78, 0.33], tamanho: 0.15, pulsa: true, de: 11, ate: 14.5 }],
});
// 5  caixinha + fio enrolado em mola
add(14.65, 20.15, {
  objetos: [...banheiro(), caixa({ aparece: 15 }), resist({ aparece: 16.6 })],
  personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 15, ate: 17.5 }, { clip: 'point', de: 17.7, ate: 20.15, params: { dir: 'forwardUp' } }] })],
  fluxos: [{ material: 'agua', caminho: [[0, 3.1, CZ], [0, 2.95, CZ]], taxa: 20, velocidade: 1, tamanho: 0.04, de: 15.4 }, AGUA({ de: 17.4 })],
  camera: CAM_CHUV,
});
// 6  a eletricidade passa e o fio esquenta
add(20.15, 25.55, {
  objetos: [...banheiro(), caixa(), resist(), fio()],
  personagens: [guia({ acoes: [{ clip: 'point', de: 20.4, ate: 25.55, params: { dir: 'forwardUp' } }] })],
  fluxos: [CORRENTE(), BRILHO(MOLA, { de: 21.5 }), AGUA(), VAPOR({ de: 22.5 })],
  camera: { tipo: 'travelling', de: { pos: [-1.6, 3.2, 1.8], olha: [-0.8, 2.9, -0.8] }, para: { pos: [0.6, 3.0, 1.6], olha: [0, 2.72, CZ] }, fov: 42 },
});
// 7  essa é a resistência
add(25.55, 27.25, {
  objetos: [...banheiro(), caixa(), resist(), fio()],
  personagens: [guia({ viraPara: olhaCam(25.6), acoes: [{ clip: 'nod', de: 25.7, ate: 27.25, expressao: 'happy' }] })],
  fluxos: [CORRENTE(), BRILHO(), AGUA(), VAPOR()],
  camera: CAM_BANHO,
  elementos: [etq('resistência', 25.7, 27.15, '#c97b3a')],
});
// 8  sem água o fio fica vermelho e arrebenta
add(27.25, 32.2, {
  objetos: [...banheiro(), caixa(), resist({ some: 29.6 }), fio()],
  personagens: [guia({ viraPara: olhaCam(27.4), acoes: [{ clip: 'surprised', de: 29.4, ate: 32.2, expressao: 'surprised' }] })],
  fluxos: [CORRENTE(P_FIO.concat(MOLA), { ate: 29.6 }), { material: 'fogo', caminho: MOLA, taxa: 40, velocidade: 0.8, tamanho: 0.03, de: 28, ate: 29.6 },
    { material: 'fagulha', origem: [CX, CY, CZ], taxa: 60, dispersao: 0.2, tamanho: 0.03, de: 29.5, ate: 30.3 }, { material: 'fumaca', origem: [CX, CY, CZ], taxa: 10, tamanho: 0.08, de: 29.6, ate: 32.2 }],
  camera: CAM_CHUV,
  efeitos: [{ tipo: 'pretoebranco', de: 29.6, ate: 32.1, zoom: 1.1 }, { tipo: 'tremor', de: 29.5, ate: 30.1, intensidade: 0.6 }],
  elementos: [{ tipo: 'icone', icone: 'x', pos: [0.78, 0.34], tamanho: 0.15, de: 29.8, ate: 32 }],
});
// 9  borrachinha que a água empurra
add(32.2, 36.05, {
  objetos: [...banheiro(), caixa(), resist(), fio(), diafragma(false, { aparece: 32.6 })],
  personagens: [guia({ overrides: { held: { R: 'hammer' } }, acoes: [{ clip: 'hammer', de: 32.7, ate: 36.05 }] })],
  fluxos: [{ material: 'agua', caminho: [[0, 3.1, CZ], [0, 2.95, CZ]], taxa: 20, velocidade: 1, tamanho: 0.04 }],
  camera: { tipo: 'fixa', pos: [-0.6, 3.3, 1.4], olha: [0, 2.85, CZ], fov: 40 },
});
// 10  ela sobe, contatos encostam, corrente passa → diafragma
add(36.05, 42.55, {
  objetos: [...banheiro(), caixa(), resist(), fio(), diafragma(true)],
  personagens: [guia({ acoes: [{ clip: 'point', de: 36.3, ate: 40.6, params: { dir: 'forwardUp' } }, { clip: 'nod', de: 40.8, ate: 42.55, expressao: 'happy' }] })],
  fluxos: [AGUA({ de: 36.4 }), CORRENTE(P_FIO.concat(MOLA), { de: 37.8 }), BRILHO(MOLA, { de: 38.5 })],
  camera: CAM_CHUV,
  elementos: [etq('diafragma', 40.9, 42.45, '#2f3338')],
});
// 11  fio pelado dentro da água: choque
add(42.55, 48.5, {
  objetos: [...banheiro(), caixa(), resist(), fio(), diafragma()],
  personagens: [guia({ pos: [0, 0, -0.15], giro: 0, viraPara: olhaCam(42.6), acoes: [{ clip: 'surprised', de: 44.5, ate: 48.5, expressao: 'surprised' }] })],
  fluxos: [AGUA(), VAPOR(), { material: 'eletricidade', caminho: [[CX, 2.5, CZ], [0, 2.0, -0.2], [0, 1.4, -0.1]], taxa: 30, velocidade: 2, tamanho: 0.04, de: 44.4, ate: 47 }],
  camera: CAM_BANHO,
  efeitos: [{ tipo: 'pretoebranco', de: 44.4, ate: 48.4, zoom: 1.1 }, { tipo: 'tremor', de: 44.4, ate: 45.2, intensidade: 0.5 }],
  elementos: [{ tipo: 'icone', icone: 'raio', pos: [0.25, 0.33], tamanho: 0.15, pulsa: true, de: 44.5, ate: 48.3 }],
});
// 12  carcaça num fio que leva a fuga pro chão → fio terra
add(48.5, 54.35, {
  objetos: [...banheiro(), caixa(), resist(), fio(), diafragma(), terra({ aparece: 49.2 })],
  personagens: [guia({ acoes: [{ clip: 'crouch', de: 49, ate: 51 }, { clip: 'point', de: 51.2, ate: 54.35, params: { dir: 'forward' } }] })],
  fluxos: [AGUA(), { material: 'eletricidade', caminho: P_TERRA, taxa: 20, velocidade: 2, tamanho: 0.035, de: 50 }],
  camera: { tipo: 'fixa', pos: [2.4, 1.8, 3.6], olha: [0.7, 1.5, -0.9], fov: 46 },
  elementos: [etq('fio terra', 52.8, 54.25, '#4f9d4a')],
});
// 13  no verão você quer menos calor
add(54.35, 56.6, {
  ambiente: { ...BANHEIRO, horario: 'tarde' },
  objetos: [...banheiro(), ...chuveiro({ chave: false })],
  personagens: [guia({ viraPara: olhaCam(54.4), acoes: [{ clip: 'shake_head', de: 54.5, ate: 56.6, expressao: 'sad' }] })],
  fluxos: [AGUA(), VAPOR({ taxa: 25 }), BRILHO()],
  camera: CAM_BAIXO,
  elementos: [{ tipo: 'icone', icone: 'fogo', pos: [0.78, 0.33], tamanho: 0.14, pulsa: true, de: 54.6, ate: 56.5 }],
});
// 14  chave que muda o caminho da corrente
add(56.6, 60.2, {
  objetos: [...banheiro(), ...chuveiro({ chave: false }), chave(120, { aparece: 57.2 })],
  personagens: [guia({ acoes: [{ clip: 'point', de: 57, ate: 60.2, params: { dir: 'forwardUp' } }] })],
  fluxos: [AGUA(), CORRENTE()],
  camera: { tipo: 'fixa', pos: [0.9, 2.7, 1.6], olha: [0.2, 2.6, -0.2], fov: 40 },
});
// 15  no inverno: pedaço menor da resistência
add(60.2, 66.75, {
  ambiente: { ...BANHEIRO, horario: 'nublado' },
  objetos: [...banheiro(), ...chuveiro()],
  personagens: [guia({ viraPara: olhaCam(60.3), acoes: [{ clip: 'think', de: 60.4, ate: 63 }, { clip: 'point', de: 63.2, ate: 66.75, params: { dir: 'forwardUp' } }] })],
  fluxos: [AGUA(), CORRENTE(P_FIO.concat(MOLA), { ate: 63 }), CORRENTE([...P_FIO, ...MEIA], { de: 63, taxa: 40 }), BRILHO(MEIA, { de: 63, taxa: 45 })],
  camera: CAM_CHUV,
  elementos: [etq('verão: fio inteiro', 61, 63, '#3d8ee0'), etq('inverno: só um pedaço', 63.2, 66.6)],
});
// 16  fio mais curto, mais corrente, mais calor → seletor
add(66.75, 72.7, {
  ambiente: { ...BANHEIRO, horario: 'nublado' },
  objetos: [...banheiro(), ...chuveiro()],
  personagens: [guia({ acoes: [{ clip: 'cheer', de: 67, ate: 70.8, expressao: 'happy' }, { clip: 'nod', de: 71, ate: 72.7 }] })],
  fluxos: [AGUA(), CORRENTE([...P_FIO, ...MEIA], { taxa: 50 }), BRILHO(MEIA, { taxa: 50 }), VAPOR({ taxa: 22 })],
  camera: CAM_BAIXO,
  elementos: [etq('seletor', 71.4, 72.6)],
});
// 17  abre mais o registro, a água esfria
add(72.7, 77.05, {
  objetos: [...banheiro(), ...chuveiro(),
    { id: 'registro', asset: 'engrenagem', variante: 'prata', escala: 0.12, pos: [-0.9, 1.3, -1.18], params: { velocidade: 90 } }],
  personagens: [guia({ pos: [-0.5, 0, 0.3], giro: 160, acoes: [{ clip: 'point', de: 72.8, ate: 74.5, params: { dir: 'forward' } }, { clip: 'surprised', de: 74.7, ate: 77.05 }] })],
  fluxos: [AGUA({ taxa: 140, dispersao: 0.45 }), CORRENTE(), { material: 'neve', origem: [0, 2.2, CZ], taxa: 8, dispersao: 0.5, tamanho: 0.04, de: 74.6 }],
  camera: CAM_BANHO,
});
// 18  calor é o mesmo, dividido por mais água
add(77.05, 80.3, {
  objetos: [...banheiro(), ...chuveiro()],
  personagens: [guia({ viraPara: olhaCam(77.1), acoes: [{ clip: 'shrug', de: 77.2, ate: 80.3 }, talk(77.05, 80.3)] })],
  fluxos: [AGUA({ taxa: 140, dispersao: 0.45 }), BRILHO()],
  camera: CAM_BAIXO,
  textos: [{ texto: 'MESMO CALOR PRA MAIS ÁGUA', de: 77.3, ate: 80.2, estilo: 'destaque' }],
});
// 19  você construiu um chuveiro elétrico
add(80.3, 83.2, {
  objetos: [...banheiro(), ...chuveiro()],
  personagens: [guia({ pos: [0, 0, -0.15], giro: 0, viraPara: olhaCam(80.4), acoes: [{ clip: 'cheer', de: 80.5, ate: 83.2, expressao: 'happy' }] })],
  fluxos: [AGUA(), VAPOR({ taxa: 15 }), BRILHO()],
  camera: { tipo: 'travelling', de: { pos: [-2.2, 2, 4.6], olha: [0, 1.7, -0.4] }, para: { pos: [2.2, 2, 4.6], olha: [0, 1.7, -0.4] }, fov: 46 },
});
// 20  pergunta
add(83.2, 87.9, {
  objetos: [...banheiro(), ...chuveiro()],
  personagens: [guia({ pos: [1.1, 0, 1.2], giro: 0, viraPara: olhaCam(83.3), acoes: [{ clip: 'shrug', de: 83.4, ate: 85.5 }, { clip: 'point', de: 85.7, ate: 87.9, params: { dir: 'forward' } }, talk(83.2, 87.9)] })],
  fluxos: [AGUA(), VAPOR()],
  camera: { tipo: 'fixa', pos: [1.5, 1.7, 5.0], olha: [0.8, 1.6, 0.3], fov: 44 },
  textos: [{ texto: 'O SEU FICA NO INVERNO OU NO VERÃO?', de: 83.3, ate: 87.9, estilo: 'pergunta' }],
});

const sb = {
  versao: 1,
  titulo: 'Como funciona o chuveiro elétrico',
  formato: { largura: 1080, altura: 1920, fps: 30 },
  duracao: 87.9,
  audio: 'narracao.mp3',
  palavras: 'palavras.json',
  legendas: { ativo: true, palavrasPorBloco: 1 },
  ambiente: BANHEIRO,
  cenas: S,
  sons: [
    { som: 'carro', de: 0.3, ate: 2.6, volume: 0.1 },
    { som: 'agua', de: 6.7, ate: 8.4, volume: 0.1 },
    { som: 'passos', de: 10.3, ate: 13, volume: 0.12 },
    { som: 'martelo', de: 15.1, volume: 0.12 },
    { som: 'eletrico', de: 20.4, ate: 21.8, volume: 0.08 },
    { som: 'sucesso', de: 25.8, volume: 0.15 },
    { som: 'estouro', de: 29.5, volume: 0.2 },
    { som: 'sucesso', de: 41, volume: 0.15 },
    { som: 'eletrico', de: 44.4, ate: 45.6, volume: 0.1 },
    { som: 'sucesso', de: 52.9, volume: 0.15 },
    { som: 'martelo', de: 57.3, volume: 0.1 },
    { som: 'sucesso', de: 71.5, volume: 0.15 },
    { som: 'agua', de: 72.9, ate: 74.8, volume: 0.1 },
    { som: 'sucesso', de: 80.5, volume: 0.2 },
  ],
};
const dir = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(dir, 'storyboard.json'), JSON.stringify(sb, null, 1));
console.log(`storyboard.json: ${S.length} cenas, ${sb.duracao}s`);
