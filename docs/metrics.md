# Metrics

These metrics map to the handbook's view that the ATO "moves" the function's own business metrics while the Hub aggregates them. They're grouped the way a QBR is: backwards (value, adoption) and forwards (pipeline health).

## North star

**Hours a month returned to Product & Design by shipped agents.**
- Definition: for each shipped agent, the sum of (people × occurrences a month × hours each × automatable share), confirmed by the owner's KPI after 30 days in production.
- Why this one: it's what the 100x score predicts, so it closes the loop between triage and reality. If predicted and confirmed hours diverge, the scoring priors get recalibrated.
- Target: 1,000 hours a month by the end of FY27-Q4. In v1 the Overview shows the **predicted** hours for the Now tier.

## Value (backwards)

| Metric | Definition | Target | Shown in |
|---|---|---|---|
| Use cases shipped | Requests in Share status this quarter | 6 per quarter | Overview pipeline |
| Predicted versus confirmed hours | Confirmed ÷ predicted for shipped agents | 0.7–1.3 | v2 |
| Agent KPI attainment | Share of agent KPIs at target | ≥ 75% | Fleet |

## Adoption (backwards)

| Metric | Definition | Target | Shown in |
|---|---|---|---|
| Weekly AI use | Share of each sub-team with at least one AI workflow a week (Champion-led self-assessment) | Function ≥ 70%; every sub-team ≥ 50% | Overview, Champions |
| Adoption spread | Highest minus lowest sub-team weekly use | Under 30 points (today: 66) | Overview tile footer |
| Builder-spectrum shift | Share of people at Configurer or above | +10 points a quarter | Champions |
| Champion coverage | Sub-teams with an active Champion | 12/12 | Champions |
| Champion sync attendance | Champions synced in the last 14 days | ≥ 90% | Roster badges |

## Portfolio health (forwards)

| Metric | Definition | Target | Shown in |
|---|---|---|---|
| Raise → triage decision | Time from submission to the ATO accepting or overriding the agent's call | Under 1 business day | v2 (agent call is instant in v1) |
| Override rate | Share of agent calls the ATO changes | 10–25%. Lower means rubber-stamping; higher means bad priors | v2 |
| Unowned agents | Agents with no owner | 0 for more than 14 days | Fleet alert, sidebar count |
| Eval coverage | Agents with a passing eval in the last 30 days | 100% of production agents | Fleet |
| Reuse rate | Share of new builds that reuse a library skill or extend a fleet agent | ≥ 50% | Triage effort adjustments |
| Hub routing accuracy | Share of routed items the Hub agrees were platform issues | ≥ 90% | v2 |

## Guardrail metrics

- **Requester trust:** share of requesters who'd raise another request (one-question pulse after triage). Target ≥ 80%.
- **Autonomy creep:** agents at Run level without an eval. Target 0. The Stale UX Issue Closer is today's example.
- **Low-confidence backlog:** low-confidence items older than 14 days without an intake call. Target 0.

## How the triage score itself is measured

The triage agent is a model, so it needs its own eval:
1. **Unit tests** pin its behaviour on known phrasings (29 tests, see the [test plan](test-plan.md)).
2. **Calibration review** each quarter: compare predicted hours with confirmed hours for shipped items, then adjust the workflow priors (`src/data/workflows.ts`).
3. **Override log** (v2): every ATO override is a labelled example for the next calibration.
