// Trims each recorded scene, joins them with straight cuts, builds the SRT from the
// live cue timings, burns the captions in, and writes a silent H.264 MP4.
// Also writes the timed voiceover script from the same cue data.
//
// Usage: node scripts/video/compose.mjs <recordDir> <outDir>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , REC = 'video-out', OUT = 'docs/video'] = process.argv;
mkdirSync(OUT, { recursive: true });
const scenes = JSON.parse(readFileSync(join(REC, 'scenes.json'), 'utf8'));
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const TITLES = {
  '01-statement': 'The statement, then the product',
  '02-intake': 'Intake and live triage',
  '03-backlog': 'Triage backlog',
  '04-fleet': 'Agent fleet registry',
  '05-champions': 'Champion hub',
  '06-skills': 'Skills library',
  '07-close': 'Close',
};

// 1 · Trim and normalise every scene (same codec/fps so the concat is a clean straight cut)
const parts = scenes.map((s) => {
  const out = join(REC, `${s.name}.mp4`);
  ff(['-ss', s.trim.toFixed(3), '-i', s.file, '-t', s.duration.toFixed(3), '-an', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString());
  return { ...s, mp4: out, real: d };
});

// 2 · Concatenate
const list = join(REC, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.mp4.split('/').pop()}'`).join('\n'));
const joined = join(REC, 'joined.mp4');
ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined]);

// 3 · Subtitles from the live cue timings
const ts = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
};
const wrap = (text, max = 58) => {
  if (text.length <= max) return text;
  const words = text.split(' ');
  let best = text, bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff && a.length <= max + 6 && b.length <= max + 6) { best = `${a}\n${b}`; bestDiff = diff; }
  }
  return best;
};
const cues = [];
let offset = 0;
for (const p of parts) {
  p.offset = offset;
  p.cues.forEach((c, i) => {
    const next = p.cues[i + 1];
    const end = next ? next.start - 0.15 : Math.min(p.real - 0.1, c.start + Math.max(3, c.text.length / 13));
    cues.push({ scene: p.name, start: offset + c.start, end: offset + end, text: c.text });
  });
  offset += p.real;
}
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${wrap(c.text)}\n`).join('\n');
writeFileSync(join(OUT, 'walkthrough.en.srt'), srt);

// 4 · Burn captions (Inter: the Pajamas-approved fallback for GitLab Sans), silent output
const style = [
  'FontName=Inter', 'FontSize=13', 'Bold=0', 'PrimaryColour=&H00FFFFFF', 'BackColour=&H33211317', 'OutlineColour=&H33211317',
  'BorderStyle=3', 'Outline=7', 'Shadow=0', 'MarginV=20', 'Alignment=2', 'Spacing=0',
].join(',');
const final = join(OUT, 'walkthrough.mp4');
ff(['-i', joined, '-vf', `subtitles=${join(OUT, 'walkthrough.en.srt')}:fontsdir=/usr/share/fonts/opentype/inter:force_style='${style}'`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', final]);

// 5 · Timed voiceover script
const tc = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let md = `# Walkthrough: timed voiceover script

The video is **silent on purpose**. The voice track is recorded separately and laid over it. Every line below starts at the timecode shown, the same timing the burned-in subtitles use (\`walkthrough.en.srt\`). Read each line in its window. If a line runs long, the next cut is the hard stop.

- Total runtime: **${mmss(offset)}** (${offset.toFixed(1)}s) · 1440×900 · 30 fps · H.264 · no audio track
- Scenes are separate recordings joined with straight cuts. There are no transitions and no zoom.
- Delivery: first person, conversational, a calm pace (about 150 words a minute). Pause briefly at each cut.

`;
for (const p of parts) {
  md += `## ${mmss(p.offset)} · ${TITLES[p.name] ?? p.name}  _(scene ${p.name.slice(0, 2)}, ${p.real.toFixed(1)}s)_\n\n| In | Out | Line |\n|---|---|---|\n`;
  for (const c of cues.filter((x) => x.scene === p.name)) md += `| ${tc(c.start)} | ${tc(c.end)} | ${c.text} |\n`;
  md += '\n';
}
md += `## Full read-through (no timecodes)\n\n${cues.map((c) => c.text).join(' ')}\n`;
writeFileSync(join(OUT, 'voiceover-script.md'), md);
console.log(`final: ${final} (${offset.toFixed(1)}s), ${cues.length} cues`);
