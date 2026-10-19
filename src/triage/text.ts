const STOPWORDS = new Set(
  'a an the and or but if then so to of in on for with at by from into onto about as is are was were be been being it its this that these those i me my we our us you your they them their he she his her there here what which who whom when where why how all any each every some no not only very can could should would will just also than too more most much many such do does did done have has had having get gets got make makes made up out over under again once per via vs etc really still always often lot lots thing things way ways time times one two'.split(
    ' ',
  ),
);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function stem(word: string): string {
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function tokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const raw of normalize(text).split(/[^a-z0-9-]+/)) {
    if (raw.length < 3 || STOPWORDS.has(raw)) continue;
    out.add(stem(raw));
  }
  return out;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-word (or whole-phrase) match. Returns the index of the first hit or -1. */
export function findPhrase(normalizedText: string, phrase: string): number {
  const re = new RegExp(`(^|[^a-z0-9])${escapeRe(phrase)}(?=[^a-z0-9]|$)`);
  const m = re.exec(normalizedText);
  return m ? m.index + m[1].length : -1;
}

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, dozen: 12, 'a dozen': 12, half: 0.5, 'half a': 0.5,
};

export function parseNumber(token: string): number | null {
  const t = token.trim();
  if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  return NUMBER_WORDS[t] ?? null;
}

export const NUMBER_PATTERN = '(\\d+(?:\\.\\d+)?|a dozen|dozen|half a|half|an|a|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty)';

/** Pulls a short quote (about 60 chars) around an index so the evidence can show where it came from. */
export function quoteAround(original: string, index: number, length: number): string {
  const start = Math.max(0, index - 24);
  const end = Math.min(original.length, index + length + 24);
  return `${start > 0 ? '…' : ''}${original.slice(start, end).trim()}${end < original.length ? '…' : ''}`;
}
