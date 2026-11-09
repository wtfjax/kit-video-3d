// Efeitos sonoros: biblioteca gerada pelo próprio ffmpeg (sem download, sem direitos autorais)
// e mixagem por baixo da narração.
//
//   node tools/sons.mjs biblioteca          → gera assets/sons/*.wav (uma vez; o render também gera se faltar)
//   node tools/sons.mjs lista               → mostra os sons disponíveis
//   node tools/sons.mjs mixar projects/<n>  → gera render/audio-final.wav (o render já faz isso sozinho)
//
// No storyboard (por cena ou no topo):
//   "sons": [{ "som": "agua", "de": 18.2, "ate": 22.5, "volume": 0.3 }]
//   - "de": início em segundos do vídeo (padrão: início da cena). "ate": se existir, o som repete até lá.
//   - "volume": 0..1 (padrão 0.15, para ficar BEM ao fundo da voz).
// Automáticos (desligue com "sonsAutomaticos": false): "whoosh" em toda transição "flash" e "pop" quando algo "aparece".

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PASTA_SONS = path.join(raiz, 'assets', 'sons');
const R = 'random(0)*2-1';

// nome: [duração s, expressão aevalsrc, filtros extras, descrição]
export const SONS = {
  agua:       [2, `0.8*(${R})`, 'bandpass=f=1400:width_type=h:w=2400,tremolo=f=11:d=0.6,lowpass=f=5000,volume=1.4', 'água correndo (cano, torneira, rio) — loop'],
  respingo:   [0.6, `(${R})*exp(-7*t)`, 'highpass=f=700,lowpass=f=6000', 'respingo / gota caindo'],
  bomba:      [2, `0.35*sin(2*PI*55*t)+0.25*sin(2*PI*110*t)+0.15*sin(2*PI*165*t)+0.06*(${R})`, 'tremolo=f=24:d=0.3,lowpass=f=1200', 'motor elétrico / bomba / máquina ligada — loop'],
  maquina:    [2, `0.3*sin(2*PI*70*t+2*sin(2*PI*6*t))+0.2*(${R})*(0.5+0.5*sin(2*PI*3*t))`, 'lowpass=f=900', 'máquina pesada trabalhando (escavadeira, fábrica) — loop'],
  carro:      [2, `0.3*sin(2*PI*45*t)+0.2*sin(2*PI*90*t+sin(2*PI*8*t))+0.05*(${R})`, 'lowpass=f=600', 'motor de carro/ônibus passando — loop'],
  whoosh:     [0.6, `(${R})*pow(sin(PI*t/0.6),2)`, 'lowpass=f=2500,highpass=f=200', 'passagem rápida (troca de cena)'],
  pop:        [0.18, `sin(2*PI*(900-2500*t)*t)*exp(-22*t)`, '', 'algo aparecendo (pop)'],
  sucesso:    [1.2, `0.5*sin(2*PI*1318*t)*exp(-4*t)+0.4*sin(2*PI*1760*t)*exp(-5*t)+0.3*sin(2*PI*2637*t)*exp(-6*t)`, '', 'deu certo (ding)'],
  erro:       [0.7, `0.5*sgn(sin(2*PI*140*t))*exp(-3*t)`, 'lowpass=f=1500', 'deu errado (buzzer grave)'],
  alerta:     [1, `0.4*sin(2*PI*if(lt(mod(t,0.5),0.25),880,660)*t)`, '', 'alerta / perigo (bipe de dois tons)'],
  eletrico:   [1, `0.35*sgn(sin(2*PI*120*t))*gt(random(1),0.35)`, 'highpass=f=300,lowpass=f=6000', 'eletricidade / choque / faísca — loop'],
  estouro:    [0.9, `(${R})*exp(-6*t)+0.7*sin(2*PI*60*t)*exp(-8*t)`, 'lowpass=f=900', 'estouro / impacto / algo quebrando'],
  cavar:      [0.5, `(${R})*exp(-10*t)`, 'lowpass=f=1200,highpass=f=120', 'pá cavando / terra caindo'],
  martelo:    [0.5, `(0.6*sin(2*PI*900*t)+0.4*(${R}))*exp(-30*t)`, 'highpass=f=300', 'batida de martelo / metal'],
  relogio:    [1, `0.7*(${R})*exp(-180*mod(t,0.5))`, 'highpass=f=2000', 'tique-taque (tempo passando) — loop'],
  passos:     [1, `0.8*(${R})*exp(-40*mod(t,0.5))`, 'lowpass=f=400,volume=4', 'passos — loop'],
  vento:      [2, `0.6*(${R})`, 'lowpass=f=500,tremolo=f=0.6:d=0.5', 'vento / ar — loop'],
  fogo:       [2, `0.5*(${R})*gt(random(1),0.6)`, 'lowpass=f=3000,highpass=f=200', 'fogo crepitando — loop'],
};

function ff(args) {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg falhou: ${r.stderr || r.error?.message}`);
}

export function garantirBiblioteca(forcar = false) {
  fs.mkdirSync(PASTA_SONS, { recursive: true });
  for (const [nome, [d, expr, filtros]] of Object.entries(SONS)) {
    const arq = path.join(PASTA_SONS, `${nome}.wav`);
    if (!forcar && fs.existsSync(arq)) continue;
    const af = ['afade=t=in:d=0.01', ...(filtros ? [filtros] : []), 'alimiter=limit=0.9'].join(',');
    ff(['-f', 'lavfi', '-i', `aevalsrc='${expr}':s=44100:d=${d}`, '-af', af, '-ac', '1', arq]);
  }
}

// Junta os sons do storyboard (cenas + topo + automáticos) numa lista de eventos.
export function eventosDoStoryboard(sb) {
  const ev = [];
  for (const s of sb.sons || []) ev.push({ ...s });
  for (const c of sb.cenas || []) {
    for (const s of c.sons || []) ev.push({ de: c.inicio, ...s });
    if (sb.sonsAutomaticos !== false) {
      if (c.transicao === 'flash') ev.push({ som: 'whoosh', de: Math.max(0, c.inicio - 0.15), volume: 0.08, auto: true });
      const vistos = new Set();
      for (const o of c.objetos || []) {
        if (typeof o.aparece !== 'number') continue;
        const k = o.aparece.toFixed(1);
        if (vistos.has(k)) continue;
        vistos.add(k);
        ev.push({ som: 'pop', de: o.aparece, volume: 0.12, auto: true });
      }
    }
  }
  return ev.filter((e) => typeof e.de === 'number' && e.de < (sb.duracao ?? Infinity));
}

// Mistura narração + efeitos em um WAV. Retorna o caminho ou null se não houver sons.
export function mixar(sb, pasta, saida) {
  const eventos = eventosDoStoryboard(sb);
  if (!eventos.length) return null;
  garantirBiblioteca();
  const mestre = sb.sonsVolume ?? 1;
  const narr = sb.audio ? path.join(pasta, sb.audio) : null;
  const temNarr = narr && fs.existsSync(narr);
  const entradas = [];
  const filtros = [];
  const rotulos = [];
  if (temNarr) { entradas.push('-i', narr); rotulos.push('[0:a]'); }
  else { entradas.push('-f', 'lavfi', '-i', `anullsrc=r=44100:cl=mono:d=${sb.duracao}`); rotulos.push('[0:a]'); }
  eventos.forEach((e, i) => {
    const k = i + 1;
    const arq = path.join(PASTA_SONS, `${e.som}.wav`);
    if (!fs.existsSync(arq)) throw new Error(`Som "${e.som}" não existe. Veja: node tools/sons.mjs lista`);
    const base = SONS[e.som][0];
    const dur = typeof e.ate === 'number' ? Math.max(0.1, e.ate - e.de) : base;
    if (typeof e.ate === 'number') entradas.push('-stream_loop', '-1');
    entradas.push('-i', arq);
    const vol = (e.volume ?? 0.15) * mestre;
    const fadeOut = Math.min(0.3, dur / 3);
    const ms = Math.round(e.de * 1000);
    filtros.push(`[${k}:a]atrim=0:${dur.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.04,afade=t=out:st=${(dur - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(3)},volume=${vol.toFixed(3)},adelay=${ms}:all=1[s${k}]`);
    rotulos.push(`[s${k}]`);
  });
  filtros.push(`${rotulos.join('')}amix=inputs=${rotulos.length}:normalize=0:duration=longest,atrim=0:${sb.duracao},alimiter=limit=0.95[out]`);
  const script = saida.replace(/\.wav$/, '.filtros.txt');
  fs.writeFileSync(script, filtros.join(';\n'));
  ff([...entradas, '-filter_complex_script', script, '-map', '[out]', '-ac', '1', '-ar', '44100', saida]);
  fs.rmSync(script, { force: true });
  return saida;
}

// ---- linha de comando ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, alvo] = process.argv.slice(2);
  if (cmd === 'biblioteca') { garantirBiblioteca(true); console.log(`${Object.keys(SONS).length} sons gerados em assets/sons/.`); }
  else if (cmd === 'lista') for (const [n, v] of Object.entries(SONS)) console.log(`${n.padEnd(10)} ${v[3]}`);
  else if (cmd === 'mixar' && alvo) {
    const pasta = path.join(raiz, alvo);
    const sb = JSON.parse(fs.readFileSync(path.join(pasta, 'storyboard.json'), 'utf8'));
    fs.mkdirSync(path.join(pasta, 'render'), { recursive: true });
    const r = mixar(sb, pasta, path.join(pasta, 'render', 'audio-final.wav'));
    console.log(r ? `Áudio com efeitos: ${path.relative(raiz, r)} (${eventosDoStoryboard(sb).length} sons).` : 'Nenhum som no storyboard.');
  } else console.log('Uso: node tools/sons.mjs biblioteca | lista | mixar projects/<nome>');
}
