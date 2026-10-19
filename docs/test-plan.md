# Test plan and results

**Build under test:** v1 bundle (the build deployed to Cloudflare), 2026-10-19 · **Environment:** Node 22, Chromium (Playwright 1.56), Linux
**Result:** ✅ typecheck clean · ✅ 29/29 unit tests · ✅ 16/16 end-to-end tests · ✅ production build · ✅ manual visual pass. Raw outputs are in [`test-results/`](test-results/).

## 1. Scope and strategy

| Layer | What it protects | Tool | Where |
|---|---|---|---|
| Typecheck | Data model consistency across modules | `tsc --noEmit` (strict) | `npm run typecheck` |
| Unit | The triage agent's behaviour: extraction, V×F×P, effort, routing, ranking, rationale contract | Vitest | `src/triage/engine.test.ts` |
| End-to-end | Every module's core journey in a real browser, plus phone layout | Playwright | `e2e/app.spec.ts` |
| Visual / manual | Brand fidelity against gitlab.com, readability, motion | Screenshots at 1440×900 and 390×844 | Section 5 below |

The triage agent gets the most coverage because it's the core of the product and the part most likely to be quietly wrong.

## 2. Unit tests: triage agent (29)

| Area | Cases | What a pass proves |
|---|---|---|
| Workflow extraction | 7 phrasings → expected workflow; unmatched → `low` confidence; quotes contain the matched phrase | The agent finds the right workflow and shows its evidence. It doesn't guess on a miss. |
| 100x potential | Explicit people/cadence/hours parsed; `raw = V×F×P`; `potential = raw/125×100`; "every PM in Sec" scoped to 11; first-person sized down; priors labelled; monthly burden; pain words | The score is the formula the brief specified, and every factor is traceable |
| Effort | Reuse lowers effort (strict); Zendesk + Gong + customer names → XL; Run-level autonomy adds effort and changes the rationale | Consume-before-build and risk adjustments work |
| Routing | Broken Duo Chat and licence requests → Hub; orphaned-agent use case stays on the backlog | The handbook routing rule holds without false positives |
| Ranking | ≥ 25 seed items ranked 1…n; sorted by priority; all four tiers used; **exactly two sentences with the rank in every rationale**; 7 trace steps; related requests found; deterministic | The backlog contract: every item ranked, explained the same way, reproducible |
| Titles | Long first clause cut on a word boundary; short sentence kept | Auto-titles stay readable |

**Mutation check.** I deliberately broke the formula (`/125` → `/100`) and disabled the reuse discount. **2 tests failed**, as they should. I restored both and all 29 passed again, so the suite catches real regressions.

**Result:** 29 passed, 0 failed ([`unit.txt`](test-results/unit.txt)).

## 3. End-to-end tests (16)

| # | Journey | Result |
|---|---|---|
| 1 | Landing opens with the three-part statement (verbatim), then the product; one sample-data line (desktop and phone) | ✅ ✅ |
| 2 | Tanuki sits top-left (x < 80px, y < 20px) | ✅ |
| 3 | Intake → live triage → all 7 steps reveal → rationale shown → "See on backlog" → row highlighted at `?focus=AI-129` | ✅ |
| 4 | "Broken tool" example → routed to the Enterprise AI Hub | ✅ |
| 5 | A submission persists across reload (`localStorage`) and opens in the drawer | ✅ |
| 6 | Backlog: ≥ 25 rows, #1 first, tier label present; drawer has the rationale and 7 trace steps; Escape closes it | ✅ |
| 7 | Board view has 4 tier columns; Themes tab groups by theme | ✅ |
| 8 | Theme filter narrows the list | ✅ |
| 9 | Fleet: "3 agents have no owner" alert; ≥ 13 rows; assigning an owner drops the alert to 2 | ✅ |
| 10 | Champions: 12 roster cards including 2 vacancies; 5 rituals; ≥ 8 demos; reaction increments | ✅ |
| 11 | Skills: blob path and frontmatter; version history; 5-item promotion checklist; ≥ 8 skills | ✅ |
| 12 | Global search (`/`) jumps to an agent | ✅ |
| 13 | No horizontal scroll on any page at phone width (desktop project and Pixel 7) | ✅ ✅ |
| 14 | No demo banners or placeholder copy on any page | ✅ |

The runner fails any test on an uncaught page error, so "passed" also means no runtime exceptions.

**Result:** 16 passed, 0 failed ([`e2e.txt`](test-results/e2e.txt)).

## 4. Requirements traceability

| PRD requirement | Covered by |
|---|---|
| R1–R4 Intake | e2e 3, 4, 5 |
| R5 Workflow extraction | unit: extraction (8) |
| R6 100x potential | unit: potential (6); e2e 3 (`volume 3 × frequency 3`) |
| R7 Effort | unit: effort (3) |
| R8–R9 Theme, related | unit: ranking (related); e2e 7 |
| R10 Priority and tiers | unit: ranking (sorted, tiers) |
| R11 Two-sentence rationale | unit: ranking (exactly two sentences, every item) |
| R12 Reasoning trace | unit (7 steps); e2e 3, 6 |
| R13 Hub routing | unit: routing (3); e2e 4 |
| R14–R16 Fleet, unowned flag, assign | e2e 9 |
| R17–R20 Champions | e2e 10 |
| R21–R24 Skills | e2e 11 |

## 5. Manual checks

| Check | Method | Result |
|---|---|---|
| Brand fidelity | Side-by-side with gitlab.com Work items and Boards screenshots (`docs/design/assets/`) | ✅ Canvas, panel, sidebar, scoped labels and buttons match the measured values |
| Logo usage | Unmodified `@gitlab/svgs` tanuki, 24px in a 48px bar, top-left; no effects | ✅ |
| Type | GitLab Sans and GitLab Mono load (self-hosted, OFL) | ✅ |
| Reasoning animation | Watched an intake end to end; steps reveal about 0.75s apart and auto-scroll | ✅ |
| Reduced motion | `prefers-reduced-motion` reveals the whole trace at once (code path reviewed) | ✅ |
| Phone layout | 390×844 screenshots of Overview, Backlog and Fleet | ✅ Sidebar collapses behind a toggle; rows stack |
| Copy and voice | Read every page for sentence case, no exclamation marks, no banners | ✅ |

## 6. Known limitations

- Tested in Chromium only. Firefox and Safari weren't available in the build environment. The app uses only standard CSS and ES2020, but it's untested there.
- No automated accessibility audit (axe) yet. It's planned for v2 CI.
- `localStorage` is per browser, so visitors don't see each other's submissions. That's by design for an open demo; v2 writes to GitLab work items.

## 7. How to re-run

```bash
npm ci
npm run typecheck
npm test               # unit
npx playwright test    # e2e (builds and serves on :4173)
```
