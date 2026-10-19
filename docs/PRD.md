# PRD: AI Transformation OS · Product & Design

**Status:** v1 shipped (live demo) · **Owner:** me, as the AI Transformation Owner (ATO) for Product & Design · **Last updated:** 2026-10-19

## 1. Problem

GitLab has hired AI Transformation Owners to own each function's AI strategy. The handbook describes the role as owning "the *what* and the *why* of AI inside their function". The ATO qualifies use cases against business outcomes, gates in-function builds, runs a Champion community and reports value to the exec sponsor.

The handbook and GitLab's own blog both describe the starting conditions:

- **Uneven adoption.** "Some found real value fast… others hadn't quite found an entry point yet." (GitLab's internal playbook for AI-fluent teams)
- **Scattered requests with no intake route.** Siloed individual experimentation "with no clear arbiter" is one of the problems the Hub & Spoke model exists to solve.
- **Agents without owners.** "Prompts are Process" says process must be "Owned, not orphaned". In practice, hackathon agents and personal prototypes spread before anyone owns them.
- **Priority churn.** Without a scoring model, the loudest request wins and priorities move every week.

The ATO needs one system that turns all of this into a ranked, explainable, owned portfolio. Spreadsheets and Slack threads can't do it, and a generic project tool doesn't know what "100x potential" or "consume before build" means.

## 2. Users

| User | What they need | Where they touch the product |
|---|---|---|
| **AI Transformation Owner** (primary) | One ranked backlog they can defend to an exec; accountability for every agent; a view of where adoption lags | Every module |
| **Product & Design team member** (PM, designer, researcher, DesignOps) | A zero-friction way to say "this hurts" and see that someone read it | Intake, backlog status |
| **Champion** (one per sub-team, 5–10% time) | Requests to qualify, agents to pilot, a stage to show what shipped | Intake, Champion hub, demo wall |
| **AI Engineer** (Enterprise AI, paired with the ATO) | A clear next item with a problem statement and reusable parts | Backlog (Now tier), skills, fleet |
| **Exec sponsor / Director, Enterprise AI** | QBR-ready numbers: shipped, adoption, value | Overview |

## 3. Goals and non-goals

**Goals (v1)**
1. Every request gets triaged within seconds, with its reasoning visible: no black-box scores.
2. Every agent in the function has an owner, KPIs, an eval status and run health. Unowned agents can't hide.
3. Adoption is visible by sub-team, so coaching time goes where the gap is.
4. Skills are versioned, owned and shareable, with promotion to canonical gated by the handbook's five-question checklist.
5. It looks and feels like part of GitLab, so there's no new tool to learn.

**Non-goals (v1)**
- Building agents. Enterprise AI owns the *how*; this product owns the *what* and *why*.
- Replacing GitLab issues. In v2, intake creates real work items (see the [roadmap](roadmap-v2.md)).
- Auth, multi-tenant data or a backend. v1 is a static, open demo.

## 4. Modules and requirements

### 4.1 Intake portal
- **R1.** Anyone submits a pain point or idea in plain language. Required: one free-text field. Optional: summary, name, sub-team.
- **R2.** Inline guidance encourages numbers (people, cadence, hours) without requiring them.
- **R3.** Shows the submitter's Champion. If the sub-team has none, it says so.
- **R4.** One-click examples for first-time users, which serves the "entry point" problem.

### 4.2 Triage agent (core)
- **R5.** Extracts the workflow from a catalog of 19 Product & Design workflows, with a confidence level and the matched phrases quoted from the request.
- **R6.** Scores **100x potential = volume × frequency × pain** (each 1–5, so 1–125), normalized to 0–100. Each factor shows whether it came *from the request* or from a *labelled prior*.
- **R7.** Estimates effort (S/M/L/XL) with itemized adjustments: consume-before-build reuse of skills or agents, new integrations, sensitive data, autonomy level.
- **R8.** Groups the request into a theme, and the theme maps to one of this half's weighted outcomes.
- **R9.** Detects related requests (token similarity plus same workflow) and counts them as demand.
- **R10.** Ranks the backlog with `priority = potential × outcome weight × confidence × demand ÷ effort weight`, then assigns a tier (Now / Next / Later / Park).
- **R11.** Writes a **two-sentence rationale** an executive can read: what it costs today, and why it ranks where it does.
- **R12.** Shows the full **reasoning trace** (7 steps) per item. On intake, the trace animates step by step.
- **R13.** Routes platform problems (broken tool, access, licence) to the Enterprise AI Hub instead of the backlog, per the handbook routing rule.

### 4.3 Agent fleet registry
- **R14.** Lists every agent and flow: type, platform, semver version, owner, sub-team, workflow, skill, trigger, autonomy (Crawl/Walk/Run), permission tier.
- **R15.** KPIs with target versus current; eval status (passing / failing / stale over 30 days / none); last-run health with a 14-day sparkline.
- **R16.** **Unowned agents are flagged** with a red alert, a sidebar count and a row marker. The ATO can assign an owner from a ranked candidate list.

### 4.4 Champion hub
- **R17.** Roster by sub-team, grouped as Product Management, Upstream Studios and Product Operations. Shows builder level, time allocation, sync recency and backups. Vacant sub-teams are shown, not hidden.
- **R18.** Sync cadence from the handbook's operating rhythm, with computed next dates.
- **R19.** Adoption by sub-team: weekly AI use and the builder-spectrum mix.
- **R20.** Demo wall: what teams shipped, the headline metric, links to the agent and skill, and reactions.

### 4.5 Skills library
- **R21.** Versioned skill files (SKILL.md frontmatter in the AI Catalog skill format) in a blob viewer with line numbers.
- **R22.** Usage notes, version history, owner and scope, and which agents and sub-teams use each skill.
- **R23.** Five-question promotion checklist. Prototype or canonical status follows from the answers.
- **R24.** Copy, link and download, so a skill can be shared across the function.

## 5. Success metrics

Full detail is in [metrics.md](metrics.md). Headline numbers:
- **North star:** hours a month returned to Product & Design by shipped agents. Target: 1,000 by the end of FY27-Q4.
- Time from raise to triage decision: under 1 business day (the agent is instant; the ATO reviews within a day).
- Unowned agents: 0 for more than 14 days.
- Weekly AI use: every sub-team at 50% or more, function average at 70% or more.

## 6. Assumptions and risks

| Risk | Mitigation |
|---|---|
| Rule-based scoring feels mechanical or wrong | Every factor shows its evidence and source, the ATO reviews the call, and the catalog and priors are editable data. See [decisions](decisions.md) #3. |
| Gaming: people inflate numbers | First-person requests are sized at a quarter of the usual reach until corroborated, and related requests are counted as demand, not trusted blindly. |
| Becoming a parallel tracker | v2 writes to GitLab work items. Issues stay the single source of truth. |
| Owners assigned but not engaged | Owners carry KPIs and eval status. A stale eval shows as a warning. |

## 7. Release

- v1: static SPA on Cloudflare, open link, no sign-in. Seeded with a realistic 117-person org.
- v2 is scoped in [roadmap-v2.md](roadmap-v2.md).
