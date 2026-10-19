<img src="public/brand/tanuki.svg" width="40" alt="GitLab tanuki">

# AI Transformation OS · Product & Design

**The intake, triage, fleet and adoption system the AI Transformation Owner runs, working today.**

▶ **Live demo:** https://ai-transformation-os.ayomideahmedcp.workers.dev (open link, no sign-in)
🎬 **Walkthrough (3½ min, silent with captions):** https://drive.google.com/file/d/1BSe8tVLCsuQabeaQk3afHzT4aEETTxfE/view · also in the repo at [`docs/video/walkthrough.mp4`](docs/video/walkthrough.mp4)

---

> I read the AI Transformation Owner job description. Your issue is uneven AI adoption: scattered requests with no intake route, agents without owners, priorities churning. Your own playbook says some teams find value fast and others never find an entry point.
>
> I've solved this before: at Corgi I ran product ops and built the internal systems the team worked from; before that I founded my own company and built its whole operating system with AI agents.
>
> This is what I built for you: the intake, triage, fleet and adoption system the AI Transformation Owner runs, working, today.

## The five modules

| Module | What it does |
|---|---|
| **Intake** | Anyone in Product & Design describes an AI pain point or idea in plain language. No template. |
| **Triage agent** (the core) | Analyzes each request live. It extracts the workflow, scores **100x potential = volume × frequency × pain**, estimates effort (checking the skills library and fleet first: *consume before build*), groups it into a theme tied to a business outcome, ranks it, and writes a **two-sentence executive rationale**. Its full reasoning is visible, step by step. Platform problems are routed to the Enterprise AI Hub. |
| **Agent fleet** | Every agent with its owner, KPIs, eval status and last-run health. **Unowned agents are flagged.** The ATO is accountable for them until an owner is assigned. |
| **Champion hub** | Champion roster by sub-team (vacancies shown), sync cadence from GitLab's operating rhythm, adoption and builder spectrum by sub-team, and a demo wall of what teams shipped. |
| **Skills library** | Versioned skill files (agent instruction sets) with owners, usage notes, version history and the five-question promotion checklist. Copy, link or download them. |

Seeded with a busy, realistic 117-person Product & Design org: 38 requests, 15 agents, 10 Champions plus 2 vacancies, 10 skills and 8 demos. Every request is scored by the same engine at load time; nothing is hand-scored.

## How it's built

- **Looks like GitLab because it's built from GitLab:** Pajamas brand source, `@gitlab/ui` design tokens, the official tanuki from `@gitlab/svgs`, GitLab Sans and GitLab Mono from `@gitlab/fonts`, and the layout measured on live gitlab.com. See [`docs/design/DESIGN.md`](docs/design/DESIGN.md) and the [visual brand guide](docs/design/brand-guide.html).
- **Follows GitLab's own operating model** for this role: Hub & Spoke & Hub, Raise → Triage → Scout → Deliver → Share, consume before build, the routing rules, the builder spectrum, Prompts are Process. See [`docs/research/`](docs/research/).
- **A deterministic, explainable triage engine** (`src/triage/engine.ts`): instant, reproducible and fully traced. [Decision #3](docs/decisions.md) explains why it isn't a model call in v1.
- Vite + React + TypeScript, static, hash-routed. Deployed as a single-file Cloudflare Worker.

## PM package

| Doc | |
|---|---|
| [PRD](docs/PRD.md) | Problem, users, goals, requirements R1–R24, risks |
| [ELI5](docs/ELI5.md) | The whole thing, explained to a five-year-old |
| [5 Whys](docs/five-whys.md) | From "uneven adoption" to a root cause the product addresses |
| [Jobs to be done](docs/jtbd.md) | Main job and small jobs for the ATO, team members and Champions |
| [Metrics](docs/metrics.md) | North star, adoption, portfolio health, guardrails |
| [Test plan and results](docs/test-plan.md) | 29 unit and 16 end-to-end tests, all passing; traceability to the PRD |
| [Viability memo](docs/viability-memo.md) | How this maps to the AI Transformation Owner role, and the first 90 days |
| [v2 roadmap](docs/roadmap-v2.md) | Work-item write-back, a Duo Agent Platform triage flow, an eval harness |
| [Build decisions](docs/decisions.md) | The calls I made and why, in first person |
| [Using GitLab: notes](docs/research/gitlab-product-notes.md) | What I learned from GitLab itself and what changed because of it |
| [Voiceover script](docs/video/voiceover-script.md) | Timed script for the walkthrough's voice track |

## Run it

```bash
npm ci
npm run dev            # http://localhost:5173
npm test               # triage engine unit tests
npx playwright test    # end-to-end
npm run build:worker   # Cloudflare Worker bundle
```

---

<sub>An independent concept for GitLab's AI Transformation Owner, Product &amp; Design role. GITLAB and the tanuki logo are trademarks of GitLab Inc.</sub>
