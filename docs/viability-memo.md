# Viability memo: why this is the AI Transformation Owner's job, as software

**To:** Hiring team, AI Transformation Owner, Product & Design
**Re:** What I'd run from day one, and why it's viable inside GitLab

## The role, as GitLab describes it

The posting frames the role as a product-management job whose product is the function's way of working: set and run an AI strategy for the function, prioritize high-impact opportunities, build and operate agents, and drive adoption and measurable outcomes with Enterprise AI and a paired AI Engineer.

The handbook fills in the operating model. The ATO is the spoke in a Hub & Spoke & Hub structure:
- They own the *what* and the *why*.
- They qualify use cases "against business outcomes and executive guidance".
- They gate in-function builds and run the Champion community.
- They report value to the exec sponsor.

The model's five-step flow is **Raise → Triage → Scout → Deliver → Share**, and its central rule is **consume before build**.

## What this product is, mapped to the job

| What the job asks | What I built |
|---|---|
| Intake of AI requests from the org ("Raise") | A plain-language intake portal, with the submitter's Champion in the loop |
| "The ATO prioritises against business outcomes" ("Triage") | A triage agent that scores 100x potential, weights by this half's outcomes, discounts by effort and confidence, and writes an executive rationale with its reasoning visible |
| Consume before build | Every triage checks the skills library and fleet first and lowers effort when it can reuse |
| Routing rules (use cases to the ATO, platform issues to the Hub) | Automatic Hub routing for broken tools, access and licence requests |
| A fleet of agents the ATO is accountable for | A registry with owners, KPIs, eval status and run health. Unowned agents flagged. |
| Champion community, office hours, demos | A Champion hub with the roster by sub-team, cadence from the operating rhythm, adoption by sub-team and a demo wall |
| "Prompts are Process: Shared, Versioned, Owned" | A skills library with semver, owners, scope, usage notes and the five-question promotion checklist |
| Quarterly Business Review | The Overview: pipeline, hours on the table, adoption, fleet health |

## Why it's viable

**1. It fits how GitLab already works.** It reads as a GitLab group page: scoped labels, work item statuses, a board by tier and the AI Catalog's data model for agents. In v2 every request becomes a real work item, so issues stay the single source of truth. I'm not proposing a parallel tool. I'm proposing a layer GitLab can build on GitLab.

**2. It's cheap to run.** v1 is a static site with a deterministic triage engine and no model calls, no backend and no data processing. v2 swaps the rules engine for a Duo Agent Platform flow behind the same interface (see the [roadmap](roadmap-v2.md)), which is GitLab being Customer Zero for its own product.

**3. It's explainable, so it survives scrutiny.** The handbook says "the ATO succeeds by being trusted, not by being right." Every score shows its evidence and its source, whether that's the request, a catalog prior, the library or the org model. A requester who disagrees can see exactly which number to argue with. That's how a prioritization model earns trust instead of spending it.

**4. It attacks the adoption gap directly.** GitLab's playbook names the problem: some teams find value fast and others never find an entry point. The product makes the gap visible by sub-team, aims Champion and office-hours time at the bottom rows, and gives lagging teams proven entry points through the demo wall and the skills library. "Close the AI fluency gap" is the highest-weighted outcome in the model on purpose: it's the outcome the role exists for.

**5. It scales to other functions.** The workflow catalog, org model, outcome weights and skills are data. Another ATO (CRO, Security, People) swaps the catalog and keeps the engine, and the ATO Council gets one shared language for comparing portfolios.

## What I'd do in the first 90 days with it

| Window | Focus | Outcome |
|---|---|---|
| Days 1–30 · **Learn** | Interview leads in every sub-team; seed the workflow catalog and priors with real numbers; inventory every agent in use, including the personal ones | A real fleet registry with no unknown agents; calibrated priors |
| Days 31–60 · **Earn** | Run intake through Champions; ship the top 2 Now items with the AI Engineer; fix ownership for every orphaned agent | 2 shipped use cases on the demo wall; 0 unowned agents |
| Days 61–90 · **Redesign** | Promote proven prompts to canonical skills; aim office hours at the 3 lowest-adoption sub-teams; first QBR from the Overview | Adoption spread narrowing; a QBR the exec sponsor can forward |

This follows the handbook's trust sequence, **Learn → Earn → Redesign**, in that order.

## Why me

I've done this job before under other names. At Corgi I ran product ops and built the internal systems the team worked from. Before that I founded my own company and built its whole operating system with AI agents. This product is the same instinct, pointed at GitLab's Product & Design org and built to GitLab's standards: give everyone one route in, judge requests the same way every time and show the working, give every agent an owner, and help the teams that are behind first.
