# Using GitLab: what I learned, and what changed in the product because of it

I wanted the product to feel like it had always been part of GitLab, so I used GitLab itself as the reference: the live product on gitlab.com, the handbook source, and the docs source. Raw source notes with citations are in [`gitlab-source-research.md`](gitlab-source-research.md).

## 1. What I did on gitlab.com

- I worked through the `gitlab-org/gitlab` **Work items** list and **Issue boards** as a visitor. I measured the layout with the browser's computed styles (48px top bar, 240px sidebar on a `#ECECEF` canvas, white panel, 28px nav items, scoped labels at 20px with a 2px inset border, 32px charcoal confirm buttons). Screenshots are in [`../design/assets/`](../design/assets/).
- I pulled the 300 most recent `gitlab-org/gitlab` issues through the public API to see the label taxonomy as it's actually used:
  - `type::feature` 112, `type::maintenance` 95, `type::bug` 71
  - `section::ai` is the largest section (57)
  - **`automation:ml` appears on 104 and `automation:quick-win-judged` on 134**, so AI-assisted triage is already running in production at GitLab
- I read the **triage-ops** project's policies, including "Triage new and updated untriaged issues using AI" and the SLO hygiene policies. Every bot comment links back to the policy that generated it.
- I read the **AI Catalog** and **AI agent registry** design documents and the catalog's database models in the `gitlab-org/gitlab` source, to learn what an "agent" record actually looks like inside GitLab.

## 2. What changed in the product because of it

| What I saw in GitLab | What I changed |
|---|---|
| Scoped labels are how GitLab people classify work at a glance | Triage output is scoped labels: `tier::`, `theme::`, `effort::`, `team::`, `reuse::` |
| `workflow::*` labels were replaced by work item statuses (unsupported since 2026-02-27) | Request lifecycle is a status pill, not a label |
| The current UI is "paneled": sidebar on a grey canvas, content in a rounded white panel, charcoal primary buttons | Matched exactly, so it doesn't look a version behind |
| AI triage runs in production, and its comments explain themselves and link to their policy | The triage agent shows a 7-step reasoning trace with quoted evidence and sources, plus a provenance note on every item |
| The bot infers group labels only above a 50% match, and says so | Confidence levels; low-confidence items are marked "needs an intake call" instead of being guessed |
| AI Catalog items have type, semver, visibility, triggers and verification | The fleet registry uses the same fields, plus owner, KPIs, eval and health |
| Catalog UX principle: "Transparency over polish"; show runs and success rate | The fleet shows a 14-day run sparkline, success rate and last run on every row |
| Skills use frontmatter with `name` ≤ 64 chars kebab-case and `description` ≤ 1024 | Every skill file in the library follows that format |
| Release notes now live in the docs repo: PM-owned MR, 125 words or fewer, merged by the Friday before release | The release-note skill, the agent KPIs and the seed requests reflect the real process |
| Design reviews are async with a 2-business-day norm; critiques have a code of conduct | The critique pre-read skill is built around both |

## 3. What the handbook taught me about the job itself

The handbook documents the ATO role directly (Enterprise AI → Hub & Spoke & Hub → ATO, plus the operating rhythm and Prompts are Process). The product follows it:
- **Raise → Triage → Scout → Deliver → Share** is the request lifecycle.
- **Consume before build** is an explicit triage step that lowers effort when a skill or agent can be reused.
- **Routing rule:** use cases go to the ATO, platform problems go to the Hub. The triage agent routes them automatically.
- **Cadence:** fortnightly Champion ↔ ATO sync, alternating fortnightly office hours, monthly Champion demo, weekly ATO Council, quarterly QBR.
- **Builder spectrum** (Consumer → Configurer → Builder → Contributor) and **Crawl → Walk → Run** autonomy run through the Champion hub and the fleet.
- **Upstream Studios** (Product Studios, Experience Research, Design Expression for Pajamas, Design Strategy) shapes the org model alongside PM by section.

## 4. GitLab Free tier

What Free includes on GitLab.com, from the docs source:
- 5 users per private top-level namespace
- 400 compute minutes a month
- 10 GiB of storage per project
- Duo Agent Platform features only with purchased GitLab Credits (18.10 and later)

That's why v1 assumes no Duo, and the triage agent runs in the browser. v2 moves it onto a Duo Agent Platform flow.

**Status: the Free-tier account walkthrough is still to do.** Creating an account needs a real person's email verification, so it wasn't done in this build. The product notes above come from using gitlab.com as a visitor and from GitLab's own source. When the account exists, this is the 30-minute checklist I'd run and fold back into this file:

1. Create a group `ai-transformation-pd` and a project `intake`.
2. Create the scoped labels `tier::now|next|later|park`, `theme::*` and `effort::S|M|L|XL`, and check how they render against the product's labels.
3. Add an issue template `AI request.md` with the same plain-language prompt as the intake form.
4. Build an issue board with `tier::` lists and compare it to the product's board view.
5. Configure work item statuses to Raise / Triage / Scout / Deliver / Share and note any limits on Free.
6. Note which parts of the v2 write-back (roadmap item 1) work on Free and which need Premium.
