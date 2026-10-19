# AGENTS.md: standing context for anyone (human or agent) working in this repo

## What this is

**AI Transformation OS · Product & Design** is the operating system an AI Transformation Owner (ATO) runs for GitLab's Product & Design function. It has five modules: intake, triage agent, agent fleet registry, Champion hub and skills library. It's an independent concept built as a job artifact for GitLab's *AI Transformation Owner, Product & Design* role.

- Live: https://ai-transformation-os.ayomideahmedcp.workers.dev (Cloudflare Worker, open link, no sign-in)
- Stack: Vite 5 + React 18 + TypeScript (strict), no backend, hash routing, `localStorage` for visitor submissions

## Non-negotiables

1. **It must look like GitLab.** Use only Pajamas tokens. Everything is in `docs/design/DESIGN.md` and in `:root` in `src/styles.css`. Don't invent colours.
2. **The tanuki is sacred.** It's the unmodified `@gitlab/svgs` logomark, top-left, 24px. Never recolour, rotate, animate or add effects, and never make it a mascot or character. The triage agent uses the product `tanuki-ai` icon.
3. **Two registers.** Only the landing statement uses the brand register (Charcoal and the AI gradient). Everything else uses the product register.
4. **Voice.** Sentence case, plain verbs, no exclamation marks in product chrome. The statement and the docs are first person.
5. **No banners or disclaimers.** There's exactly one sample-data line under the statement and one footer line. Don't add more.
6. **Zero tool attribution.** Don't mention AI coding tools or vendors in the UI, docs, commits or code comments. The footer credits the independent concept only.
7. **The triage agent must stay explainable.** Every number it shows must trace to the request or a named prior. If you change scoring, update the trace text and the tests.
8. **Two sentences.** Every backlog rationale is exactly two sentences and includes the rank. A unit test enforces this.

## Map

| Path | What |
|---|---|
| `src/triage/engine.ts` | **The core.** Workflow extraction, V×F×P, effort, routing, ranking, rationale, trace |
| `src/triage/text.ts` | Tokenizing, phrase matching, quotes |
| `src/data/workflows.ts` | Workflow catalog and priors. **Calibrate here, not in the engine.** |
| `src/data/org.ts` | Sub-teams and headcounts, themes, outcomes and their weights |
| `src/data/submissions.ts` | Seed requests (plain language, nothing pre-scored) |
| `src/data/agents.ts` | Fleet (AI Catalog-aligned fields plus accountability fields) |
| `src/data/champions.ts` | Roster, vacancies, adoption, rituals, demo wall |
| `src/data/skills.ts` | Skill files (SKILL.md frontmatter), changelogs, promotion checklist |
| `src/store.tsx` | Derives triage for everything at load; persistence; router |
| `src/pages/*` | One file per module, plus Overview |
| `src/components.tsx` | Labels, status pills, drawer, the animated reasoning `Trace` |
| `docs/` | PRD and PM package, design MD and brand guide, research, test plan, video |
| `scripts/build-worker.mjs` | Single-file build wrapped as a Cloudflare Worker |
| `scripts/video/` | Scripted walkthrough recorder and compositor |

## Domain vocabulary (from GitLab's handbook)

- **Hub & Spoke & Hub:** Enterprise AI (the platform Hub), the ATO (the spoke) and the function's Champion community (the in-function hub)
- **Raise → Triage → Scout → Deliver → Share:** the request lifecycle. These are statuses, not `workflow::` labels.
- **Consume before build:** reuse library skills and fleet agents first. The engine lowers effort when it can.
- **Routing rule:** use cases go to the ATO; bugs, access and platform problems go to the Hub (via Compass)
- **Builder spectrum:** Consumer → Configurer → Builder → Contributor
- **Crawl → Walk → Run:** agent autonomy; permission tiers are Autonomous / Propose-and-wait / Escalate immediately
- **Prompts are Process:** skills are shared, versioned and owned, and promoted to canonical through a five-question checklist

## Commands

```bash
npm ci
npm run dev            # http://localhost:5173
npm run typecheck
npm test               # unit tests (Vitest) for the triage engine
npx playwright test    # e2e (builds and serves on :4173)
npm run build          # static build to dist/
npm run build:worker   # single-file Worker bundle to dist-worker/worker.js
```

## Changing the triage model

1. Change priors or keywords in `src/data/workflows.ts`, or weights in `src/data/org.ts`.
2. Run `npm test`. Ranking, tier and rationale contracts must still pass.
3. Check the seed backlog still uses all four tiers and that the top items make sense to a PM.
4. Note the change and why in `docs/decisions.md`.

## Deploying

The Worker `ai-transformation-os` runs on the account's workers.dev subdomain. Build with `npm run build:worker` and upload `dist-worker/worker.js` as an ES module (`main_module: worker.js`). Every path serves the app; routing happens client-side.
