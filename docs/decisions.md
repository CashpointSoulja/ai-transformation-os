# Build decisions

These are the calls I made while building this, and why. Newest thinking is at the bottom of each entry.

## 1. Brand first, from primary sources

I wrote [`design/DESIGN.md`](design/DESIGN.md) and the visual brand guide before any production code. `about.gitlab.com` and `handbook.gitlab.com` were blocked in my build environment, so I went to the sources behind them:
- the Pajamas design-system repo on gitlab.com for brand colours, type and logo rules
- `@gitlab/ui` for the product design tokens
- `@gitlab/svgs` for the official tanuki
- `@gitlab/fonts` for GitLab Sans and GitLab Mono

I also measured the live gitlab.com UI with `getComputedStyle`. Every colour in the product is a real Pajamas token, not a lookalike.

## 2. Two visual registers

The opening statement uses GitLab's **brand** register: Charcoal, a bold GitLab Sans headline, and the AI gradient Pajamas reserves for AI content. Everything after it uses the **product** register: grey canvas, white panel, scoped labels. That split is how GitLab itself works (marketing site versus app), and it makes the statement read as a statement and the product read as a product.

## 3. A deterministic triage engine, not a model call

This was the biggest call. A live model call from a public, no-sign-in static site would mean either exposing a key or running a backend, and the scores would be non-reproducible. Instead the triage agent is a transparent rules engine:
- a workflow catalog
- weighted phrase matching
- explicit V × F × P parsing
- labelled priors when the request doesn't say
- itemized effort adjustments

What I gain:
- It's **instant** and **deterministic**: the same request always gets the same score, and 29 unit tests pin that.
- Every number is **explainable**. The trace shows whether each factor came from the request or from a named prior.
- It doubles as the **eval baseline** for the model-backed v2 flow.

What I give up: it can't understand a request phrased far from the catalog vocabulary. It handles that honestly, with low confidence, "needs an intake call", and parking until sized.

## 4. Score = volume × frequency × pain, but priority is more than the score

The brief asked for a 100x potential score of volume × frequency × pain. I kept that pure (1–125, shown as 0–100) and put everything else into **priority**: outcome weight, confidence, demand from related requests, and effort.

That separation matters. A big opportunity that's XL effort with customer data, like AI-122 (Zendesk and Gong), keeps its high potential (48) but sits in Later, and the rationale says why. Mixing the two would hide that trade.

## 5. Calibration fixes I made after seeing real output

My first pass over the seed data gave obviously wrong answers, so I fixed the model rather than the data:
- A one-person weekly status update scored as 50 people. **Fix:** first-person requests are sized at a quarter of the usual reach until other requests corroborate them.
- "Every PM in Sec" counted all 48 PMs. **Fix:** group phrases are scoped to the section or studio the request names.
- One hour a day scored as low pain. **Fix:** pain takes the higher of per-occurrence severity and monthly burden (hours × frequency).
- "Auto-close duplicates" ranked #1. **Fix:** Run-level autonomy adds a full effort step, and the rationale says it ships as propose-and-wait first (Crawl → Walk → Run).
- A request about an orphaned in-function agent was routed to the Hub. **Fix:** Hub routing needs a platform term (Glean, Duo, connector, licence, SSO), not just the word "agent".

## 6. Follow the handbook's operating model, literally

GitLab's handbook documents this exact job (Hub & Spoke & Hub, the ATO page, the operating rhythm, Prompts are Process), so I built on it rather than inventing my own:
- The status lifecycle is **Raise → Triage → Scout → Deliver → Share**.
- Platform problems route to the Hub.
- Cadences match the operating rhythm: fortnightly Champion sync, alternating office hours, monthly demo, weekly ATO Council, QBR.
- Champions sit on the **builder spectrum** (Consumer → Configurer → Builder → Contributor).
- Skills carry the **five-question promotion checklist**.

The handbook has no "AI literacy ladder" page, so I didn't invent levels and attribute them to GitLab.

## 7. Statuses, not `workflow::` labels

GitLab moved from `workflow::*` scoped labels to work item statuses in 2026. My design doc originally used `workflow::` labels. I switched to status pills (Raised, Triaged, Scouting, Delivering, Shared, Won't do, Routed to Hub) styled like the current work item status badges, and kept scoped labels for what GitLab still uses them for: classification (`tier::`, `theme::`, `effort::`, `team::`).

## 8. Fleet fields follow the AI Catalog model

Agent records use the AI Catalog vocabulary: item type (agent or flow), strict semver, visibility, trigger types. I added what the ATO is accountable for: owner, KPIs, an eval harness, run health, autonomy and permission tier. That keeps v2 (syncing from the real catalog) a mapping exercise, not a redesign.

## 9. Busy, realistic seed data, with one line of disclosure

I seeded 38 requests, 15 agents, 10 Champions plus 2 vacancies, 10 skills and 8 demos, all written the way people actually write: some precise, some vague, some wrong. Every request goes through the same triage engine at load time, so nothing on screen is hand-scored.

There's one short sample-data line under the statement and no banners anywhere else. People are fictional, and no real GitLab team member is named.

## 10. Static, hash-routed, no sign-in

The link has to open for anyone, with nothing to log into. It's a Vite + React SPA with hash routing. Visitor submissions persist in `localStorage`, and "Clear my requests" resets them. For Cloudflare I build a single-file bundle and serve it from a Worker, which avoids a separate asset upload step.

## 11. Trademark care

The tanuki is used unmodified, at the size and position gitlab.com uses. It's never recoloured or animated, and it's never turned into a mascot. The triage agent uses the product's `tanuki-ai` icon, not a character. The footer carries one line saying GITLAB and the tanuki are GitLab Inc. trademarks and that this is an independent concept for the role.

## 12. Accessibility

- Text uses Pajamas text tokens, never series colours.
- Status is never colour-only: badges carry icons and words.
- The reasoning-trace animation respects `prefers-reduced-motion`.
- Drawers trap Escape.
- The layout has no horizontal scroll at 390px wide (checked by an end-to-end test).
