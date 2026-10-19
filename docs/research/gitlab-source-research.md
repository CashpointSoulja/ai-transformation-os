# GitLab public-source research: AI Transformation OS

Sources: GitLab handbook source repo (`gitlab-com/content-sites/handbook`, HEAD `4684d72f`, committed 2026-10-16), plus anonymous reads of gitlab.com (raw files and public REST API). Handbook paths are given as published URLs (`content/handbook/X/_index.md` becomes `https://handbook.gitlab.com/handbook/X/`). People's names are left out on purpose. Researched 2026-10-19.

---

## 1. Internal AI adoption: Enterprise AI, ATOs, Champions

### 1.1 Enterprise AI (the "Hub")
Source: https://handbook.gitlab.com/handbook/eta/ai/
- "GitLab is becoming an AI-first company. Enterprise AI is the AI backbone of that transition internally."
- Goal: "friction removal… Institutional memory becomes queryable. Repeatable work becomes an agent's job. Humans direct, agents handle the parts that do not need judgement."
- "Enterprise AI is GitLab being Customer Zero for the patterns we want our customers to feel."
- Owns the AI platform: **Glean** (personal AI / knowledge), a **desktop AI assistant** (drafting, reasoning, code, agentic tasks), **Relevance.ai** (company-wide autonomous agents). Leads with **GitLab + Duo Agent Platform** "wherever they fit". It is the "single interface to CorpSec, Legal, and Privacy for AI tooling".
- Intake: Slack `#enterprise-ai-collab` and an **"Enterprise AI Intake Request"** (an epic work item in `gitlab-com/eta/ent-ai`, which is private).
- Org placement: part of Enterprise Technology and AI (ETA), under the CIO.
- Relevance.ai "is not self-service today. Use cases come through Enterprise AI or your function's AI Transformation Owner (ATO)" (https://handbook.gitlab.com/handbook/eta/ai/tools/relevance-ai/).

### 1.2 Hub & Spoke & Hub operating model (the federated model)
Source: https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/
- "Two hubs joined by a spoke. The platform Hub (Enterprise AI) owns the AI capability… Each function has an embedded spoke, the AI Transformation Owner (ATO), paired with an AI Engineer from Enterprise AI. The in-function Hub is the Champion community."
- Problems it solves: governance that doesn't scale, uneven AI capability across functions, central teams too far from business context, "siloed individual experimentation with no clear arbiter".
- **Work flow (5 steps, good fit for the intake → triage pipeline):**
  1. **Raise**: "Team members surface ideas through their function rather than building independently."
  2. **Triage**: "The ATO prioritises against business outcomes and executive guidance."
  3. **Scout**: "The embedded AI Engineer explores, prototypes, and proves what works."
  4. **Deliver**: a small team ships it (the AI Engineer, the function's engineers, or Champions/builders). "Enterprise AI owns the *how*… the ATO gates in-function builds."
  5. **Share**: "Successful solutions, patterns, and lessons feed back through the Hub for reuse."
- **Consume before build**: "In a federated model the largest risk is every function quietly rebuilding the same capability. Reaching for existing patterns first is what makes the shared library compound rather than fragment."
- Worked example: a Champion spots about 6 hrs/week of email reformatting. The ATO prioritises it without an approval meeting because it is on-strategy. The ATO drafts the "input/output contract and the first cut of the prompt". The AI Engineer refines it, adds an **eval harness** and tunes edge cases. The skill ships in the function's **role-based plugin**, so "update once, and everyone benefits the same day". "Two iterations in a week."
- **Decision rights:**

| Decision | Owner |
|---|---|
| Use-case prioritisation in a function | ATO (escalate larger/cross-functional calls to Exec Sponsor) |
| How a solution is built | Enterprise AI, partnering with ATO |
| Platform & tooling choices | Enterprise AI |
| Security, data, governance review | Enterprise AI ("accountable platform reviewer with published SLAs") |
| Success metrics in a function | Function's own business metrics; ATO moves them; Hub aggregates |
| In-function builds (Champion/IC) | ATO gates for alignment |
| Champion selection | ATO, with sub-team manager sign-off |

### 1.3 The AI Transformation Owner role
Source: https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/ato/
- "The ATO owns the *what* and the *why* of AI inside their function." The ATO:
  1. Owns the function's AI roadmap and qualifies use cases against business outcomes.
  2. Brings problem statements to Enterprise AI, which owns the *how*.
  3. "Composes small, focused delivery teams" (AI Engineer + function engineers + Champions).
  4. "Gates work built inside the function."
  5. "Reports value back to the function's exec sponsor against the function's own business metrics."
- Operating mode: **"influence, not authority"**. "The ATO succeeds by being trusted, not by being right." Trust sequence: **Learn the process → Earn the leader's buy-in → Redesign the process.** "Skipping step two is the most common way the role fails at step three."
- "The ATO is a power user, not a software engineer… ability to prototype at the no-code and low-code layer." The role is "Not a build-everything role… Not a top-down enforcement role."
- Attributes: trust-builder, tenacity, reimagination capacity, consume-before-build instinct, "curiosity and hands-on AI fluency… built a skill, rather than only read about them", systems thinking, cross-functional orientation.
- Profile: a blend of **programme/operations** (rituals, cadence, change management, Champion community) and **domain depth plus hands-on AI**.
- Hiring loop (5 steps): TA screen → dual gate (Director, Enterprise AI + function Hiring Manager) → Enterprise AI Engineer (hands-on fluency) → Peer ATO → Exec Sponsor.
- Prompts are Process (https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/): the ATO "Maintains the canonical skills, prompts, and agents used by the function… Reviews proposals from individuals who have built something useful and want it adopted more widely."

### 1.4 Operating rhythm (cadences to model in the Champion Hub)
Source: https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/operating-rhythm/
- Slack channels: `#enterprise-ai-collab` (public, all team members; questions/intake), `#enterprise-ai` (private Hub), `#ent-ai-ato` (Hub + all ATOs, "Default mode for async"), `#ent-ai-champions` (cross-spoke Champions; "Learning and consistency, not work intake").
- **Daily**: async-first in `#ent-ai-ato`; "No mandatory standups."
- **Weekly**: **ATO Council** (60 min, mandatory, "the de-siloing forum"); **AI Engineer ↔ ATO sync** (at least weekly, 2–3×/week during a build, daily in a production push); ATO joins the function leadership meeting.
- **Every two weeks**: ATO ↔ exec sponsor; **Champion ↔ ATO sync** (30 min, in-function intake and coaching); **Function AI office hours** (45 min, mandatory for every ATO, open to the whole function, AI Engineer present, "no agenda"). Office hours alternate weeks with the Champion sync. "The questions people bring are unqualified use cases, and the ones that recur are the ones worth taking to the roadmap."
- **Monthly**: Champion demo / share-out across the function.
- **Quarterly**: **Quarterly Business Review** (Director Enterprise AI + ATO + exec sponsor, 30 min, "two or three slides": Backwards = use cases shipped, adoption, value; Forwards = planned use cases, dependencies, resourcing; Other = asks). Also a cross-spoke Champion show-and-tell.
- **Champions**: "one per sub-team or squad. 5 to 10% time, formally agreed with the manager." They "Identify and qualify use cases… Pilot agents and workflows… Coach teammates… Surface friction and feedback." They do not report to the ATO.
- **Routing rules**: use cases go Champion → ATO ("Never direct to Hub"). Bugs, security issues and platform feedback go Champion → Hub directly (via `#ent-ai-champions` or **Serval**). "The routing rule is about where work is triaged, not about who is allowed to raise it."
- Escalation: ATO raises via **Serval** → notification in `#enterprise-ai` → Hub on-call triages → feeds back to the originating channel. (Serval is a third-party AI-native ITSM, branded internally as "Compass".)
- Resourcing: one AI Engineer pairs with up to 2 ATOs (1:2 ceiling), and closer to 1:1 in a spoke's first quarter.

### 1.5 A live spoke: Security Division ATO program plan (good seed-data template)
Source: https://handbook.gitlab.com/handbook/security/ai/ato-program-plan/
- Program parts: AI Champions ("up to 10 people"), **AI office hours** every two weeks, an **"AI patterns library"**, and reporting (a weekly update to the ATO Council).
- Proposed pillars, with measures: **Unify** ("Patterns in the library are used by more than one team"), **Reduce toil** ("An agreed definition of toil, a baseline, and tracked reductions"), **Enable** ("Office hours held on schedule; AI Champions active across teams").
- Roles: ATO, Program Coordinator, AI Champions, Backups (one per team), Security leaders (nominate), Enterprise AI, Assigned AI Engineer, Exec sponsor.
- Champion selection: each leader nominates up to 3; group capped at 10; manager approves. Champions take turns leading the weekly meeting.
- Timeline: kickoff the week of **2026-10-19**; first office hours the week of 2026-11-02; **FY27-Q4 = 2026-11-01 to 2027-01-31**; roadmap agreed 2026-11-02 to 2026-12-04. (GitLab fiscal year: FY27 ends 2027-01-31.)
- Guiding principle: "Before building something new, check what Enterprise AI and other teams have already delivered."

### 1.6 Guiding principles, autonomy ladder and builder ladder
Source: https://handbook.gitlab.com/handbook/eta/ai/strategy/guiding-principles/
- Five principles: (1) **Amplify human contribution, don't automate it away**; (2) **Redesign workflows, don't retrofit AI**; (3) **Empower builders, not just users**; (4) **Start small, build trust, scale what works** (Crawl-Walk-Run); (5) **Govern for speed, not just safety**.
- **Builder spectrum** (the closest thing to an "AI literacy ladder" in the handbook): **Consumers** ("Use AI tools as provided") → **Configurers** ("Adapt existing AI solutions") → **Builders** ("Create new AI workflows") → **Contributors** ("Share their solutions back to the organisation").
- **Crawl-Walk-Run autonomy**: Crawl = "AI suggests, humans decide and act" (metric: are suggestions useful?); Walk = "AI automates, humans validate and trigger" (metric: % approved without modification); Run = "AI acts autonomously, humans handle exceptions" (metric: are outcomes improving?). "Earning the right to progress": track accuracy, measure trust, define thresholds, "Build in reversibility."
- **Permission tiers for AI actions**: **Autonomous** / **Propose-and-wait** / **Escalate immediately**.
- Note: the handbook has no page titled "AI literacy" or "AI fluency ladder". "Hands-on AI fluency" appears only as an ATO hiring attribute. The builder spectrum plus Crawl-Walk-Run are the citable ladders.

### 1.7 Prompts are Process (skills-library governance)
Source: https://handbook.gitlab.com/handbook/eta/ai/strategy/prompts-are-process/ and `.../platform-mapping/`
- "A prompt is process. A collection of process is strategy. Strategy needs an owner."
- Process must be "**Shared, not siloed… Versioned, not improvised… Owned, not orphaned.**"
- Three ownership scopes: **Function-scoped** (owner = function exec, with the ATO maintaining the canonical version), **Repo-scoped** (CODEOWNERS; git), **Company-wide** (central function, with ETA as the interim home; "commit and iterate").
- Posture is **"guided creation"**: "Anyone can build, anyone can experiment… What is gated, on purpose, is the step from personal use to canonical, shared process."
- **5-question promotion checklist**: Whose process does this encode? What's the right scope? Is the owner identified and ready? Is it versioned and reviewable? Does the owner want this to be how their domain operates? "If you cannot, you have a prototype, and the next step is conversation rather than rollout."
- Platform mapping: Glean's **Department Agent Moderator** "is the closest platform analogue to the ATO". In the approved AI coding assistant, skills live in a repo skills folder and are reviewed by MR. Company-wide resources go in an "AI marketplace" (`gitlab-com/marketplace`, private). The desktop assistant's connectors and skill sharing are org-wide, so function scoping there is "an **ownership control, not a technical one**".

### 1.8 Upstream Studios (design org) AI usage
Source: https://handbook.gitlab.com/handbook/upstream-studios/how-we-work/ai-usage/
- Approved tools: the desktop AI assistant and its design and coding variants, Dovetail and Rally (transcription), FigJam, Figma Design, GitLab Duo. Figma Make is credit-limited.
- "What AI is not for": "Replacing real users", "Final designs without review", "Skipping Pajamas", "Production output without checking".
- Experience Research: "We build and use AI skills and agents across all our processes… set the guardrails and gate the quality." They run a weekly AI-generated summary and an "AI-powered research library" (https://handbook.gitlab.com/handbook/upstream-studios/experience-research/).

---

## 2. Product & Design org structure and processes

### 2.1 Sections → Stages → Groups (source of truth: `data/stages.yml`, `data/sections.yml`)
Source: https://gitlab.com/gitlab-com/www-gitlab-com/-/blob/master/data/stages.yml (rendered at https://handbook.gitlab.com/handbook/product/categories/)
- **Sections**: Dev, CI, CD, Sec, Data Science, AI, Analytics, Growth, Fulfillment, Monetization, Foundations, Tenant Scale, GitLab Delivery, SaaS Production Engineering, Developer Experience, Database Excellence, Primitives.
- Selected stages (groups):
  - Dev / **Plan**: work_items, portfolio_planning, planning_views, planner_intelligence, spec_driven_development
  - Dev / **Create**: source_code, repository_services, remote_development, …
  - CI / **Verify**: ci_platform, pipeline_execution, pipeline_authoring, mobile_devops. CI / **Package**: package_registry, container_registry
  - CD / **Deploy**: environments
  - Sec / **Security Factory**, **Security Governance** (incl. ai_governance, ai_control_plane), **Security Platform**, **Application Security Testing**
  - AI / **AI Coding** (code_review, dap_repository_flows, dap_events), **Agent Foundations** (agent_developer, agent_execution, **ai_catalog**), **AI Clients** (developer_clients, duo_chat, duo_client_sdk), **AI Platform** (ai_model_services, ai_core_infra)
  - Foundations / **Foundations**: design_system, accessibility
  - Analytics / Analytics, Orbit. Growth: engagement, acquisition, activation
- Labels follow the hierarchy: `section::ai`, `devops::agent foundations`, `group::ai catalog`, `Category:<Name>`.

### 2.2 Upstream Studios (the design org; replaces the old "UX Department")
Source: https://handbook.gitlab.com/handbook/upstream-studios/
- "Upstream Studios is the full-stack experience organization for GitLab… We imagine it, we design it, we document it, we ship it." Led by a Chief Design Officer.
- Five functions: **Design Strategy** (concept work, DesignOps), **Brand Experience**, **Design Expression** (owns the **Pajamas Design System** and accessibility), **Experience Research** (UX Research, Service Design, Research Operations; "Owns the validity layer, from JTBD to AI research guardrails"), **Product Design** (organised in **Product Studios**, "working upstream in trios with Product Management and Engineering").
- **Product Studios** (https://handbook.gitlab.com/handbook/upstream-studios/product-studios/): **Security**; **Core DevOps + Data** (Create, Plan, Verify, Package, Data); **Artificial Intelligence** ("AI-powered features and the Duo product suite"); **PLG/Monetization/Platform** (Growth, Fulfillment, Govern, platform-wide).
- Principles: Bias for shipping; Design with data, judge with experience; Question assumptions; Elevate craft; Default to collaboration; Stay curious. "We don't hand off. We ship." Slack: `#upstream-studios`.
- **Technical Writing** now sits under Marketing › Product & Technical Marketing (https://handbook.gitlab.com/handbook/marketing/product-and-technical-marketing/technical-writing/). TW optimises docs "using AI workflows, deterministic testing, and linting."
- **Pajamas** (https://handbook.gitlab.com/handbook/upstream-studios/design-expression/design-system/): "GitLab's shared foundation… design tokens, components, patterns, and guidance." Operating principles: speedy decision making, service-first mindset, scoped for delivery, shared ownership, proactive connection.
- "UX Paper Cuts": no current handbook page. The term only appears in passing ("a paper cut to fix") in the dark-mode rollout playbook, so treat it as legacy.

### 2.3 Design reviews and design critiques
Source: https://handbook.gitlab.com/handbook/upstream-studios/product-design/workflow/
- **Design reviews**: async-first. Post in the `#ux-coworking` Slack channel, record a video to GitLab Unfiltered, "Capture feedback in issues", and give a due date. "We recommend using **2 business days** when asking for design feedback from stage group stakeholders." Broad-impact changes (navigation, Pajamas patterns) need a UX Department review (`@gitlab-com/gitlab-ux/designers`).
- **Design critiques**: "rigorous, constructive feedback… beyond standard design reviews", built on radical candor. Structure: context (5 min) → present (10 min) → critique (bulk) → takeaways (5–10 min). Document the outcome in the issue/epic. The 8-point **Code of conduct** starts with "Focus on the design work, not the designer."
- Designers "propose a single validated solution rather than multiple options" to avoid design-by-committee. "Keep the SSOT updated."
- UX triage labels: designers triage `~UX`, `~Deferred UX`, `~UI polish`. `Deferred UX` marks work shipped below UX standards. Issues labelled `Deliverable` that need UX are assigned a designer "by the kickoff" (https://handbook.gitlab.com/handbook/upstream-studios/product-design/operations/).

### 2.4 UX Research process and synthesis
- Research tools (https://handbook.gitlab.com/handbook/upstream-studios/experience-research/research-tools/): **RallyUXR** (recruitment and panel; external panel via Respondent.io), User Interviews, **Qualtrics** (complex surveys, e.g. USAT+, screeners), **Dovetail** ("Data analysis, insights collaboration, and research repository"), Optimal Workshop, UserTesting.com, FigJam. Access requests go through **Lumos**. Slack: `#ux_research`.
- **Dovetail** (https://handbook.gitlab.com/handbook/product/ux/dovetail/): "used to document all the research insights". "At the end of each research study, the study's DRI is responsible for documenting the research in Dovetail." Projects sit in stage folders and link to the issue in the GitLab UX Research project, tagged `UX Problem Validation`, `UX Solution Validation` or `CM Scorecard`. "The goal of Dovetail is to make research findings searchable, concise, and easy to reference."
- Two validation types match the Product Development Flow phases: problem validation and solution validation.

### 2.5 UX Scorecards, Category Maturity Scorecards, JTBD
- **UX Scorecards** (https://handbook.gitlab.com/handbook/product/ux/ux-scorecards/): heuristic or formative evaluation of a main job. "Can be completed in 1-2 days." Refresh "every 6 months". Questions: SEQ (ease 1–5), Satisfaction (1–5), UMUX Lite "Useful" (1–5). Grades: **A** High Quality/Exceeds, **B** Meets Expectations, **C** Average, **D** Poor, **F** Terrible, **Unknown**. Scorecards are tracked in epic gitlab-org&1714.
- **Category Maturity** (https://handbook.gitlab.com/handbook/product/ux/category-maturity/): define JTBD → Competitor Comparison → plan gaps → run the CM Scorecard. Levels and bars (CM Scorecard page): **Minimal** = D, **Viable** = C (internal dogfooding users), **Competitive** = B (external users), **Complete** = A (external users). "Five participants from one set of user criteria." Issues use the `CM Scorecard` label (epic gitlab-org&6930).
- **JTBD** (https://handbook.gitlab.com/handbook/product/ux/jobs-to-be-done/): based on Jim Kalbach's *JTBD Playbook*. Hierarchy: **Main Job** ("Verb + Object + Clarifier") → **Small jobs** → **Micro-jobs**. Teams currently track JTBD work in FigJam. In the AI section, "The PM owns the problem, the JTBD… Design owns the experience."

### 2.6 Product Development Flow and the shift from workflow labels to statuses
Source: https://handbook.gitlab.com/handbook/product-development/how-we-work/product-development-flow/
- Validation track: Validation backlog → Problem validation → Ready for design → Design → Solution validation. Build track: Planning breakdown → (Refinement) → Ready for development → In dev → In review → Verification → Complete (plus Blocked and Awaiting security release).
- **Important:** "GitLab has transitioned from using scoped workflow labels (`workflow::*`) to using issue statuses… workflow labels… will be unsupported after **2026-02-27**." New statuses `Duplicate` and `Won't do` were added, and `workflow::scheduling` was removed. Recent gitlab-org/gitlab issues still carry `workflow::*` labels (see §4).
- "Issue descriptions shall always be maintained as the single source of truth."
- **AI Section Product Development Flow** (https://handbook.gitlab.com/handbook/product-development/how-we-work/ai-section-product-development-flow/):
  - Trio ownership: PM = problem/JTBD/success criteria; EM = delivery/architecture; Design = experience.
  - 15% of each milestone is reserved for design quality gaps and 15% for engineering maintenance.
  - 30-min trio design session per feature. `~Deliverable` marks committed scope.
  - Ship bar is the **Minimum Lovable Product**. Decisions are classified **reversible vs irreversible**, and teams "optimize for a decision, not consensus".
  - Say/do ratio measures predictability. PMs target "at least 10 customers per month". New features go to Customer Zero first.
  - Cadence: weekly 30-min sync, **monthly milestone kickoff (45 min)**, monthly retro (45 min). "We record the calls and use AI to take notes."
  - Prototypes: "Anyone can build a prototype. Each one starts with a named question and a named DRI." Two kinds: concept prototypes (Figma, AI-generated artifacts) and working prototypes (in-repo).
  - Customer outcomes: ship with higher quality and velocity; automate with confidence; expand capacity; build and compose; trust and operate. Value signals: Adoption, Retention, Time to value, Reliability.
- **R&D Interlock** (https://handbook.gitlab.com/handbook/product-development/how-we-work/r-and-d-interlock/): aligns PM, UX and Engineering on roadmap planning. It covers the Resource Allocation Framework, the Roadmap Structure and the R&D Alignment Process.

### 2.7 Issue triage (labels, SLOs)
Source: https://handbook.gitlab.com/handbook/product-development/how-we-work/issue-triage/
- "Any GitLab team-member can triage issues." Partial triage relies on "a combination of self and AI triage" for type and group labels.
- Partial triage checklist: spam → report, make confidential, post in `#abuse`. Support request → canned message + close, or `~"awaiting feedback"`. Duplicate → `/duplicate`. Then add a **type label**; bugs get a **severity** label (S1/S2 → mention the group PM/EM); add a **group label** (or a `devops::` stage label); add **`backlog::prospective`** (planned within 18 months) or **`backlog::no-commitment`**.
- Complete triage = partial triage + milestone + priority label on `type::bug`, `Deferred UX`, `backlog::triage`.
- **Priority**: `priority::1` Urgent (~30 days), `priority::2` High (60–90 days), `priority::3` Medium (90–120 days), `priority::4` Low (no timeline). DRI = PM or EM of the group, by work type.
- **Severity**: `severity::1` Blocker ("Broken feature with no workaround or any data-loss"), `severity::2` Critical, `severity::3` Major, `severity::4` Low. Bug subtypes: `bug::performance`, `bug::ux`, `bug::availability`, `bug::vulnerability`. Bug SLOs: S1 = current release + next deployment (within 30 days), S2 = next release (60 days), S3 = within 3 releases (~90 days), S4 = >120 days.
- "Assigning a group label allows `gitlab-bot` to automatically assign the right stage and section labels."

### 2.8 Releases, kickoffs, PM responsibilities
- Monthly release: "A GitLab version (XX.YY.0) published on the 3rd Thursday of every month". Patch releases twice monthly (https://handbook.gitlab.com/handbook/engineering/releases/).
- PM monthly dates (https://handbook.gitlab.com/handbook/product/product-management/product-manager-role/): **4th** = draft the issues for the next release; **12th** = "Release scope is finalized… Kickoff document is updated"; **15th** = "Group Kickoffs calls recorded and uploaded by the end of the day."
- PM role: "you're the person that has to kick-off new initiatives… you _are_ responsible for taking action and setting the direction." "As a PM you don't own the product." PMs are expected to be a "manager of one". Levels: PM / Senior / Principal → GMP / Director → Sr Director → VP → CPO. Slack: `#product`, `#release-post`.
- **Release posts are now "release notes" in the docs repo** (https://gitlab.com/gitlab-org/gitlab/-/blob/master/doc/development/documentation/release_notes.md): `doc/releases/<major>/gitlab-<x>-<y>-released/`. "The product manager is responsible for creating the MR and files for the feature release note." Notes must be 125 words or fewer, use the `Release Notes Item` MR template, are reviewed by the EM + Technical Writer, and must merge "by 23:59 UTC on the Friday before the release day". Metadata: `title`, `tier` (`[Free, Premium, Ultimate]`), `offering`, `documentation_link`, `work_item`, `categories`, `stage`, `level` (primary/secondary), `co_create`, `weight`. Suggested phrasing: "In previous versions of GitLab, you couldn't... Now you can..."

---

## 3. Values and working norms a GitLab tool should respect

Source: https://handbook.gitlab.com/handbook/values/
- **CREDIT**: Collaboration, Results for Customers, Efficiency, Diversity Inclusion & Belonging, Iteration, Transparency. "Together they spell the CREDIT we give each other by assuming good intent."
- **Write things down**: "the faintest pencil is better than the sharpest memory."
- **Boring solutions**: "Use the simplest and most boring solution for a problem."
- **Bias towards asynchronous communication**: use "GitLab Issues and Merge Requests rather than texts, calls, or Slack messages".
- **Minimal Valuable Change (MVC)**: "Always look to make the quickest change possible to improve the user's outcome." "If a task is not the smallest viable and valuable thing, cut the scope."
- **Make a proposal**: "make a concrete proposal instead of calling a meeting… Every meeting should be a review of a proposal."
- **Everything is in draft**; **Public by default**; **Single Source of Truth**; **Disagree, commit, and advocate**; **Have Ownership & Accountability**; **Operate with a bias for action**.
- Iteration: "Iteration is no substitute for planning"; "Feedback can come from internal users first" (dogfooding).
- **DRI** (https://handbook.gitlab.com/handbook/people-group/directly-responsible-individuals/): "The DRI has final decision-making power but should consult and collaborate."
- **Handbook-first** (https://handbook.gitlab.com/handbook/company/culture/all-remote/handbook-first/).
- Design implications: issue-first intake (every request becomes an issue or work item with an SSOT description); a named DRI on every record; async review windows with due dates (e.g. the 2-business-day design feedback norm); MVC-sized deliverables; public-by-default visibility with confidentiality as an exception.

---

## 4. gitlab.com as an anonymous visitor

- The labels API (`/projects/278964/labels`, `/groups/9970/labels`) returns **401 when anonymous**. The issues API works. Label frequencies below come from the 300 most recent `gitlab-org/gitlab` issues (fetched 2026-10-19):
  - `type::feature` 112, `type::maintenance` 95, `type::bug` 71. Subtypes: `feature::addition`, `feature::enhancement`, `maintenance::refactor`, `maintenance::test-gap`, `bug::functional`, `bug::performance`, `bug::ux`.
  - `section::ai` 57 (the largest section), `section::sec` 51, `section::dev` 45, `section::ci` 33.
  - `devops::plan` 36, `devops::agent foundations` 30, `devops::ai coding` 20.
  - `group::code review`, `group::agent execution`, `group::ai catalog`, `group::work items`.
  - `workflow::complete` / `in dev` / `ready for development` / `in review` / `blocked` / `solution validation` / `design` are still used alongside the new statuses.
  - `severity::1-4` and `priority::1-4` are present but sparse.
  - Common unscoped labels: `backend`, `frontend`, `documentation`, `feature flag`, `Deliverable`, `Technical Writing`, `Category:<Name>`.
  - **AI triage labels**: `automation:ml` (104/300) and `automation:quick-win-judged` (134/300); `automation:ml wrong` exists for feedback.
  - Issues API fields worth mirroring: `iid, title, description, state, labels, milestone, assignees, author, type/issue_type, weight, severity, health_status, epic, iteration, due_date, confidential, web_url, references`. Issue URLs now render as `/-/work_items/<iid>`.
- **triage-ops** (https://gitlab.com/gitlab-org/quality/triage-ops, project id 7776928): "Triage operations for `gitlab-org` and `gitlab-com` resources… powered by gitlab-triage and a custom reactive triage engine."
  - `policies/stages/report/untriaged-issues.yml`: rule **"Triage new and updated untriaged issues using AI"**. It targets open issues that are `untriaged? && part_of_product?`, updated in the last 6 hours and without `automation:ml`, and posts `#{issue_triage_ai_comment}`.
  - `policies/stages/hygiene/` includes `set-priority-from-severity.yml` (applies `priority_label_for_bug` on `type::bug`) and `comment-slo-breaching-bugs.yml` (S1–S3 bugs nearing breach get `SLO::Near Miss` + a due date and a ping to the responsible EM/PM; `SLO::Missed` after breach). Others: `ask-severity-for-bug-ux-issues.yml` (adds `automation:ux-missing-labels` and asks for severity), `close-stale-bugs.yml` (auto-closes `vintage`+`stale` bugs inactive about 372 days, with `auto closed`), `stage-and-group-labels-hygiene.yml`, `prompt-for-tier-labels.yml`, `label-missed-slo.yml`.
  - Bot comments end with "*This message was generated automatically. You're welcome to improve it*", linking to the policy file. That is a good transparency pattern for an AI triage agent.
- Triage Operations handbook (https://handbook.gitlab.com/handbook/engineering/infrastructure-platforms/developer-experience/triage-operations/): the bot infers group from Category labels only when "the highest group match… is > 50%". "The bot leaves a message that explains its inference logic." Opt-out label: `automation:devops-mapping-disable`. **Triage reports** are issues with checklists, auto-assigned per `stages.yml`.

### 4.1 AI Catalog / Duo Agent Platform data model (align the fleet registry to this)
Sources: https://handbook.gitlab.com/handbook/engineering/architecture/design-documents/ai_catalog/ ; https://handbook.gitlab.com/handbook/engineering/architecture/design-documents/ai_agent_registry/ ; gitlab-org/gitlab `ee/app/models/ai/catalog/item.rb`, `item_version.rb`, `app/validators/json_schemas/ai_catalog/*.json`, `app/models/namespaces/verified_namespace.rb`
- Terminology: "An Agent, is a system where LLMs dynamically direct its own processes and tool usage." "A Flow… orchestrates one or multiple agents, as well as predefined deterministic actions… Duo Agent Platform is an engine that runs Flows." Flow components: cyclic agent, one-off agent, **HiLT** (human-in-the-loop), deterministic step, plus routers, state, prompts and tools.
- **`ai_catalog_items`** (catalog record): `id, organization_id, project_id, item_type, name (3–255; skills ≤64 kebab-case), description (≤1024), visibility (private | restricted | public), verification_level, foundational_flow_reference, latest_version_id, latest_released_version_id, deleted_at` (soft delete).
  - `item_type`: 1 `agent`, 2 `flow`, 3 `third_party_flow` (external agent: Docker image + commands via CI), 4 `foundational_agent`, **5 `skill`**.
  - `verification_level`: `gitlab_maintained` 100, `gitlab_partner_maintained` 50, `verified_creator_maintained` 10, `verified_creator_self_managed` 1, `unverified` 0.
- **`ai_catalog_item_versions`**: `schema_version, version` (strict semver `MAJOR.MINOR.PATCH`), `definition` (jsonb), `release_date` (null = draft), `created_by_id`.
  - **agent_v1** definition: `system_prompt` (required), `tools` (required; built-in tool IDs), `user_prompt` (unused), `mcp_tools`, `mcp_servers`.
  - **flow_v2**: `components, routers, flow, prompts, yaml_definition`. **third_party_flow_v1**: `image, commands, variables, yaml_definition`.
  - **skill_v1**: `path, git_ref, blob_sha` (required), `commit_sha, author_name, license, compatibility, allowed_tools`. Skill frontmatter follows the Agent Skills spec (agentskills.io): `name` (kebab-case, ≤64, must equal the directory name), `description` (≤1024, "What the skill does and when to use it"), `license`, `compatibility`, `metadata`, `allowed-tools`.
- **`ai_catalog_item_consumers`** (enablement of an item in an org/group/project): `enabled, locked, pinned_version_prefix, service_account_id, parent_item_consumer_id`.
- **`ai_flow_triggers`**: event types `mention`, `assign`, `assign_reviewer`, `pipeline_hooks`. Flows run as a service account using **composite identity** (service account + initiating human; "the token only grants access to resources that both… can access").
- MCP servers live in their own tables: `ai_catalog_mcp_servers`, with per-user OAuth tokens and a per-namespace block "kill-switch".
- **AI Catalog UX principles** (https://handbook.gitlab.com/handbook/engineering/ai/ai-catalog/ux-principles/): four jobs, **Discover / Evaluate / Configure / Enable**. Principles: "Evaluation before enablement"; "Transparency over polish" ("System prompts, tool lists, and data access scope should be visible by default"; show "runs, success rate, scopes enabled"; show credit consumption); "Scope is always explicit"; "Shared accountability… Who built it, who manages it, where it is enabled, and what it can access"; "Building and maintaining agents is a team activity" (multiple named collaborators, visible version history). Terminology: never use "workflow" for Flows.
- Suggested fleet-registry fields that align with this: `name, description, item_type (agent|flow|external_agent|skill), visibility, verification_level, owner_scope (function|repo|company, per Prompts are Process), owners[], version (semver), released_at, definition{system_prompt, tools[], mcp_servers[]}, triggers[], consumers[{scope, enabled, pinned_version}], service_account, autonomy (crawl|walk|run), permission_tier (autonomous|propose-and-wait|escalate), runs, success_rate, last_run_at, credits_consumed`.

---

## 5. GitLab Free tier (GitLab.com)

Sources: gitlab-org/gitlab docs source: `doc/user/free_user_limit.md`, `doc/ci/pipelines/compute_minutes.md`, `doc/user/storage_usage_quotas.md`, `doc/user/duo_agent_platform/_index.md`, `doc/subscriptions/gitlab_credits.md` (docs.gitlab.com and about.gitlab.com/pricing were blocked, so these were read from the repo).
- **Users**: "You can add up to five users to newly created top-level namespaces with private visibility on GitLab.com." Over the limit, the namespace goes read-only. The limit does not apply to public top-level groups or personal namespaces.
- **Compute**: "Free tier namespaces receive 400 compute minutes per month" on GitLab-hosted instance runners.
- **Storage**: "Each project in a Free tier namespace on GitLab.com has 10 GiB of free storage" (repository + LFS). Premium/Ultimate get 500 GiB per project.
- **Duo on Free**: Duo Agent Platform is listed as Tier: Premium, Ultimate (GA in GitLab 18.8). However, "Users on the Free tier can purchase a monthly commitment pool of GitLab Credits… This provides access to a set of GitLab Duo Agent Platform features" (introduced 18.10 on GitLab.com).
  - Free-eligible features (with credits): Agentic Chat, Code Suggestions, **Custom agents**, **Custom flows**, Planner Agent, Data Analyst Agent, Developer Flow, Code Review Flow, Fix CI/CD Pipeline Flow, MCP clients/server.
  - Not on Free: External agents, Flow Creator Agent, Resolve merge conflicts, Security Analyst Agent, SAST flows.
  - Free on-demand usage is capped at $25,000/month. Beta/experimental features don't consume credits for Free users.
  - Without purchased credits, a Free namespace has no Duo Agent Platform access, so a portfolio product on Free should not assume Duo.

---

## Access notes
- Blocked: about.gitlab.com, handbook.gitlab.com, design.gitlab.com, docs.gitlab.com (proxy 403).
- Anonymous gitlab.com: raw files and the repository tree/issues APIs work. Labels, notes and search APIs return 401.
- Private (404 anonymous): `gitlab-com/eta/ent-ai` (intake epics), `gitlab-com/marketplace` (AI marketplace).
