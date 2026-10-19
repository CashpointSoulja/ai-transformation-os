# v2 roadmap

v1 proves the operating model end to end in a browser. v2 makes it real inside GitLab. Each item is sized as an MVC, the smallest change that delivers value on its own.

## Now (first milestone)

| # | Item | Why | MVC |
|---|---|---|---|
| 1 | **Intake creates a GitLab work item** | Issues are the single source of truth. The product shouldn't become a parallel tracker. | On submit, open a work item in an `ai-transformation` project with the agent's labels (`tier::`, `theme::`, `effort::`) and its rationale as the first comment |
| 2 | **ATO review step: accept or override** | The agent proposes and the ATO decides. Every override becomes a labelled example. | Accept/override buttons in the drawer, with the override reason stored as a comment |
| 3 | **Fleet registry reads the AI Catalog** | One source for agents, not two | Sync name, type, version, visibility and triggers from AI Catalog items enabled in Product & Design groups; owner and KPIs stay in this product |
| 4 | **Real Champion roster** | Coverage should come from data, not a spreadsheet | Import from a YAML file in the handbook (one Champion per sub-team), reviewed by MR |

## Next

| # | Item | Why |
|---|---|---|
| 5 | **Triage agent v2 as a Duo Agent Platform flow** | Replace the rules engine with a model-backed flow that keeps the same output contract (workflow, V/F/P with evidence, effort adjustments, rationale). The rules engine becomes its eval baseline and fallback. Customer Zero for GitLab's own platform. |
| 6 | **Eval harness for the triage agent** | Labelled set from override history, with pass bars on workflow accuracy (≥ 90%) and two-sentence rationale compliance (100%). Wired into CI. |
| 7 | **Confirmed hours** | After 30 days in production, the owner confirms actual hours returned. Predicted versus confirmed drives quarterly prior calibration. |
| 8 | **Hub routing into Compass** | Routed items open a Compass ticket automatically and mirror its status back to the requester |
| 9 | **Slack intake** | `/ai-request` in a channel posts into the same intake. Champions forward threads with one click. |

## Later

| # | Item | Why |
|---|---|---|
| 10 | **Skills library backed by a repo** | Skills live in a repo, versioned by tags, with promotion as an MR that must answer the five-question checklist in its template |
| 11 | **Multi-function** | Another ATO swaps in their workflow catalog and org model. Portfolios become comparable in the ATO Council. |
| 12 | **Adoption from usage data** | Replace self-assessment with tool-usage signals where privacy review allows, keeping the builder spectrum as the qualitative layer |
| 13 | **QBR export** | Generate the two-or-three-slide QBR straight from the Overview |
| 14 | **Autonomy promotion workflow** | An agent moves Crawl → Walk → Run only when its eval and its approved-without-modification rate cross agreed thresholds. The registry enforces it. |

## Explicitly not planned

- Building agents inside this product. Enterprise AI owns the *how*.
- Ranking people, or showing individual-level AI usage. Adoption stays at sub-team level.
- Auto-approving requests. The ATO stays the decision-maker; the agent proposes.
