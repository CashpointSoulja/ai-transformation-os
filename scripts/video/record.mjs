// Records the walkthrough as separate scenes (straight cuts), with a visible
// cursor, eased mouse movement and smooth scrolling at desktop size.
// Every subtitle cue is timestamped live while the scene plays, so captions stay in sync.
//
// Usage: npm run build && npm run preview &   then   node scripts/video/record.mjs <outDir>
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT = process.argv[2] ?? 'video-out';
const W = 1440, H = 900;
mkdirSync(OUT, { recursive: true });

const CURSOR = `
(() => {
  const mount = () => {
    if (document.getElementById('__cursor')) return;
    const c = document.createElement('div');
    c.id = '__cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 26 26"><path d="M3 2 L3 21 L8.2 16.4 L11.6 24 L15 22.5 L11.7 15 L19 15 Z" fill="#171321" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', width: '26px', height: '26px', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(720px, 450px)', willChange: 'transform' });
    const ring = document.createElement('div');
    ring.id = '__ring';
    Object.assign(ring.style, { position: 'fixed', left: '-14px', top: '-14px', width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(119,89,194,.9)', zIndex: 2147483646, pointerEvents: 'none', opacity: '0', transform: 'translate(720px,450px) scale(.4)', transition: 'opacity .35s, transform .35s' });
    document.body.append(ring, c);
    let x = 720, y = 450;
    document.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }, true);
    document.addEventListener('mousedown', () => {
      ring.style.transition = 'none'; ring.style.opacity = '1'; ring.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(.4)';
      requestAnimationFrame(() => { ring.style.transition = 'opacity .45s, transform .45s'; ring.style.opacity = '0'; ring.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.4)'; });
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: false });
})();`;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

async function scene(name, browser, fn, { storageState, startUrl } = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: W, height: H } }, storageState, reducedMotion: 'no-preference' });
  await ctx.addInitScript(CURSOR);
  const page = await ctx.newPage();
  const pageCreated = Date.now();
  await page.goto(BASE + startUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
  let mx = W / 2, my = H / 2;
  await page.mouse.move(mx, my);
  const t0 = Date.now();
  const cues = [];
  const now = () => (Date.now() - t0) / 1000;
  const wait = (ms) => page.waitForTimeout(ms);
  const minDur = (text) => Math.max(2.6, text.length / 15);

  const api = {
    page,
    wait,
    async say(text) {
      const last = cues[cues.length - 1];
      if (last) {
        const due = last.start + minDur(last.text);
        if (now() < due) await wait((due - now()) * 1000);
      }
      cues.push({ start: now(), text });
    },
    async move(x, y, ms = 700) {
      const sx = mx, sy = my;
      const steps = Math.max(8, Math.round(ms / 16));
      for (let i = 1; i <= steps; i++) {
        const k = ease(i / steps);
        await page.mouse.move(sx + (x - sx) * k, sy + (y - sy) * k);
        await wait(ms / steps);
      }
      mx = x; my = y;
    },
    async to(locator, ms = 700, dx = 0.5, dy = 0.5) {
      const l = typeof locator === 'string' ? page.locator(locator).first() : locator;
      await l.scrollIntoViewIfNeeded();
      const b = await l.boundingBox();
      await api.move(b.x + b.width * dx, b.y + b.height * dy, ms);
    },
    async click(locator, ms = 700) {
      await api.to(locator, ms);
      await wait(180);
      await page.mouse.down();
      await wait(90);
      await page.mouse.up();
      await wait(250);
    },
    async scroll(y, ms = 1200, selector) {
      await page.evaluate(
        ([target, dur, sel]) =>
          new Promise((res) => {
            const el = sel ? document.querySelector(sel) : document.scrollingElement;
            const start = el.scrollTop, delta = target - start, t0 = performance.now();
            const e = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
            const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.scrollTop = start + delta * e(k); k < 1 ? requestAnimationFrame(step) : res(); };
            requestAnimationFrame(step);
          }),
        [y, ms, selector ?? null],
      );
    },
    async scrollTo(locator, offset = 120, ms = 1200) {
      const l = typeof locator === 'string' ? page.locator(locator).first() : locator;
      const top = await l.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      await api.scroll(Math.max(0, top - offset), ms);
    },
    async type(locator, text, delay = 22) {
      await api.click(locator, 500);
      await page.locator(locator).pressSequentially(text, { delay });
    },
  };

  await fn(api);
  const last = cues[cues.length - 1];
  if (last) {
    const due = last.start + minDur(last.text) + 0.4;
    if (now() < due) await wait((due - now()) * 1000);
  }
  const end = now();
  const state = await ctx.storageState();
  const video = page.video();
  await ctx.close();
  const file = join(OUT, `${name}.webm`);
  renameSync(await video.path(), file);
  console.log(`${name}: ${end.toFixed(1)}s, ${cues.length} cues`);
  return { name, file, trim: (t0 - pageCreated) / 1000, duration: end, cues, state };
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const scenes = [];

// 1 · The statement, then the product opens below it
scenes.push(await scene('01-statement', browser, async (s) => {
  await s.wait(600);
  await s.say('I read the AI Transformation Owner job description.');
  await s.to('.statement-part:nth-child(1) p', 1100, 0.3, 0.2);
  await s.wait(1200);
  await s.say('Your issue is uneven AI adoption: scattered requests, agents without owners, priorities churning.');
  await s.move(560, 360, 1400);
  await s.wait(1500);
  await s.say("I've solved this before: product ops at Corgi, and an AI-agent operating system for my own company.");
  await s.to('.statement-part:nth-child(2) p', 1000, 0.3, 0.3);
  await s.wait(2000);
  await s.say("So I built the system the AI Transformation Owner runs. It's working, today.");
  await s.to('.statement-part:nth-child(3) p', 1000, 0.4, 0.5);
  await s.wait(1800);
  await s.say('Every request moves Raise → Triage → Scout → Deliver → Share, the flow in GitLab’s own handbook.');
  await s.scrollTo('h2.section', 90, 1600);
  await s.to('.pipe-step:nth-child(2)', 900);
  await s.wait(700);
  await s.to('.pipe-step:nth-child(5)', 1100);
  await s.say('Up top: hours on the table, agents with no owner, evals passing and weekly AI use.');
  await s.to('.tile:nth-child(1)', 900);
  await s.wait(700);
  await s.to('.tile:nth-child(2)', 800);
  await s.wait(900);
  await s.to('.tile:nth-child(4)', 900);
  await s.wait(800);
  await s.say('And the problem itself, in one chart: weekly AI use runs from 25% to 91% by sub-team.');
  await s.scrollTo('.hbar', 140, 1500);
  await s.to('.hbar:last-of-type .track', 1000, 0.15, 0.5);
  await s.wait(2600);
}, { startUrl: '/#/' }));

// 2 · Intake → live triage
scenes.push(await scene('02-intake', browser, async (s) => {
  await s.say('Intake: anyone in Product & Design describes a pain point in plain language.');
  await s.type('#name', 'Sam Rivera', 45);
  await s.click('#team', 600);
  await s.page.selectOption('#team', 'pm-dev');
  await s.page.keyboard.press('Escape');
  await s.say('No template. Numbers help, and if they’re missing the agent estimates and says so.');
  await s.type('#desc', 'Every release I spend about 3 hours copying issue descriptions into release notes and cutting them to 125 words. Every PM in Dev does the same thing and it is tedious.', 16);
  await s.wait(500);
  await s.click('button[type=submit]', 800);
  await s.say('The triage agent reads it live. First, the workflow it touches, with the evidence quoted.');
  await s.page.locator('[data-step="workflow"].done').waitFor();
  await s.to('[data-step="workflow"] .ev-quote', 900, 0.4, 0.5);
  await s.say('Then the 100x potential: volume × frequency × pain, each traced to the request or a labelled prior.');
  await s.page.locator('[data-step="size"].done').waitFor();
  await s.to('[data-step="size"] .formula', 900, 0.5, 0.5);
  await s.say('Effort checks the skills library and the fleet first: consume before build.');
  await s.page.locator('[data-step="effort"].done').waitFor();
  await s.to('[data-step="effort"] .ev:nth-child(2) .ev-detail', 900, 0.3, 0.5);
  await s.say('Then it groups the theme, weighs it against this half’s outcomes, and ranks it.');
  await s.page.locator('[data-step="rank"].done').waitFor();
  await s.to('[data-step="rank"] .formula', 900, 0.5, 0.5);
  await s.say('Last, a two-sentence rationale an executive can read.');
  await s.page.locator('[data-step="rationale"] .rationale-box').waitFor();
  await s.to('[data-step="rationale"] .rationale-box', 900, 0.3, 0.4);
  await s.wait(3200);
  await s.scrollTo('.factor-grid', 260, 1000);
  await s.wait(600);
  await s.click(s.page.getByRole('button', { name: /on the backlog/ }), 900);
  await s.wait(1600);
}, { startUrl: '/#/intake' }));
const afterIntake = scenes[scenes.length - 1].state;

// 3 · Backlog
scenes.push(await scene('03-backlog', browser, async (s) => {
  await s.say('The backlog: every request ranked, labelled the GitLab way, with its rationale inline.');
  await s.to('.list-row:nth-child(1) .row-title', 900, 0.3, 0.5);
  await s.wait(900);
  await s.to('.list-row:nth-child(1) .gl-label', 700);
  await s.wait(700);
  await s.to('.list-row:nth-child(1) .score', 800);
  await s.wait(700);
  await s.say('Open any item and the whole reasoning trace is there. Nothing is a black box.');
  await s.click('.list-row:nth-child(1) .row-title', 800);
  await s.wait(1200);
  await s.to('.drawer .rationale-box', 800, 0.4, 0.5);
  await s.wait(1500);
  await s.scroll(520, 1600, '.drawer-body');
  await s.move(1080, 520, 900);
  await s.wait(1500);
  await s.scroll(1150, 1600, '.drawer-body');
  await s.wait(1400);
  await s.click('.drawer [aria-label="Close"]', 900);
  await s.say('Board by tier: Now, Next, Later and Park, with the hours each tier would return.');
  await s.click(s.page.getByRole('tab', { name: /Board by tier/ }), 900);
  await s.wait(900);
  await s.to('.board-col:nth-child(1) .board-col-head .meta', 900);
  await s.wait(1000);
  await s.to('.board-col:nth-child(3) .card:nth-child(2)', 1000);
  await s.wait(1200);
  await s.say('Broken tools and access requests skip the queue and route straight to the Enterprise AI Hub.');
  await s.click(s.page.getByRole('tab', { name: /Routed to Hub/ }), 900);
  await s.wait(800);
  await s.to('.list-row:nth-child(1) .row-rationale', 1000, 0.3, 0.5);
  await s.wait(2400);
}, { startUrl: '/#/backlog?focus=AI-129', storageState: afterIntake }));

// 4 · Fleet
scenes.push(await scene('04-fleet', browser, async (s) => {
  await s.say('The agent fleet: every agent with its owner, KPIs, eval and last-run health.');
  await s.scrollTo('.table-wrap', 200, 1200);
  await s.to('tbody tr:nth-child(1) td:nth-child(2)', 900);
  await s.wait(600);
  await s.to('tbody tr:nth-child(1) td:nth-child(3)', 800, 0.3, 0.5);
  await s.wait(600);
  await s.to('tbody tr:nth-child(1) td:nth-child(4)', 700);
  await s.wait(500);
  await s.to('tbody tr:nth-child(1) .spark', 700);
  await s.wait(700);
  await s.say("Three agents have no owner. Until they do, I'm accountable for them.");
  await s.scroll(0, 1200);
  await s.to('.alert-danger .alert-title', 900, 0.3, 0.5);
  await s.wait(1500);
  await s.click(s.page.getByRole('tab', { name: /Unowned/ }), 900);
  await s.wait(900);
  await s.say("This one closes issues on its own, with no owner and no eval. That's the risk this view catches.");
  await s.click('tbody tr:nth-child(1) .cell-title', 900);
  await s.wait(1200);
  await s.to('.drawer .badge-tier', 900);
  await s.wait(1400);
  await s.say('Assign an owner from the sub-team, and the alert updates.');
  await s.click('.drawer .alert .btn', 900);
  await s.wait(700);
  await s.click('.drawer .menu button:nth-child(1)', 900);
  await s.wait(1200);
  await s.click('.drawer [aria-label="Close"]', 800);
  await s.wait(600);
  await s.to('.alert-danger .alert-title', 900, 0.3, 0.5);
  await s.wait(2200);
}, { startUrl: '/#/fleet', storageState: afterIntake }));

// 5 · Champions
scenes.push(await scene('05-champions', browser, async (s) => {
  await s.say('The Champion hub: one Champion per sub-team, at five to ten percent of their time.');
  await s.to('.tile:nth-child(1)', 900);
  await s.wait(1200);
  await s.say("Cadence follows GitLab's operating rhythm: fortnightly syncs, office hours and a monthly demo.");
  await s.scrollTo('.cadence', 140, 1300);
  await s.to('.ritual:nth-child(1) .next', 900, 0.4, 0.5);
  await s.wait(800);
  await s.to('.ritual:nth-child(3) .next', 1000, 0.4, 0.5);
  await s.wait(1200);
  await s.say('The builder spectrum shows where each team is, and where my coaching time goes first.');
  await s.scrollTo('.legend', 110, 1300);
  await s.to('.box .hbar:last-of-type .stack', 1000, 0.3, 0.5);
  await s.wait(1200);
  await s.to('.grid-2 .box:nth-child(2) h3', 1000);
  await s.wait(1600);
  await s.scrollTo('.champ.vacant', 260, 1500);
  await s.say('Gaps are shown, not hidden: two sub-teams still need a Champion.');
  await s.to('.champ.vacant', 1000, 0.4, 0.4);
  await s.wait(1800);
  await s.scrollTo('.wall', 120, 1600);
  await s.say('And the demo wall: what teams shipped, with the number that proves it.');
  await s.to('.demo:nth-child(1) .metric', 900);
  await s.wait(900);
  await s.click('.demo:nth-child(3) .react', 1000);
  await s.wait(1800);
}, { startUrl: '/#/champions', storageState: afterIntake }));

// 6 · Skills
scenes.push(await scene('06-skills', browser, async (s) => {
  await s.say('The skills library: the instruction sets agents run on. Shared, versioned, owned.');
  await s.wait(600);
  await s.click('.skill-item:nth-child(2)', 1000);
  await s.wait(900);
  await s.to('.blob-code', 900, 0.35, 0.3);
  await s.wait(1200);
  await s.say('Every skill has an owner, a version history and the five-question promotion checklist.');
  await s.click(s.page.getByRole('tab', { name: /Versions/ }), 900);
  await s.wait(1600);
  await s.click(s.page.getByRole('tab', { name: /Promotion/ }), 900);
  await s.wait(1700);
  await s.say('Copy, link or download it, so the whole function runs on the same skill.');
  await s.click(s.page.getByRole('tab', { name: /SKILL.md/ }), 900);
  await s.wait(500);
  await s.click(s.page.getByRole('button', { name: 'Copy link' }), 900);
  await s.wait(2200);
}, { startUrl: '/#/skills/research-synthesis', storageState: afterIntake }));

// 7 · Close
scenes.push(await scene('07-close', browser, async (s) => {
  await s.wait(500);
  await s.say("Intake, triage, fleet and adoption: the AI Transformation Owner's job, as working software.");
  await s.to('.statement h1', 1400, 0.45, 0.5);
  await s.wait(1200);
  await s.say('Built for GitLab Product & Design. Open the link and try it yourself.');
  await s.to('.statement .btn-light', 1200);
  await s.wait(2400);
}, { startUrl: '/#/', storageState: afterIntake }));

await browser.close();
writeFileSync(join(OUT, 'scenes.json'), JSON.stringify(scenes.map(({ state, ...x }) => x), null, 2));
console.log('done');
