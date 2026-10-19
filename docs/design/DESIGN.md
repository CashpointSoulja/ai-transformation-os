# DESIGN.md — AI Transformation OS · Product & Design

I wrote this before writing any production code. The product has to look and behave like a native part of GitLab, so I started from GitLab's own sources instead of eyeballing screenshots.

Visual companion: [`brand-guide.html`](./brand-guide.html). Open it in a browser to see swatches, type, the logo and components rendered.

---

## 1. Sources I used, and how I got them

| Source | What I took from it | How I accessed it |
|---|---|---|
| Pajamas design system source (`gitlab-org/gitlab-services/design.gitlab.com`, `contents/brand-*`) | Brand colour palette with hex values, typography rules, logo and logomark rules, brand voice, core visual elements | Read the raw Markdown through the public gitlab.com API. This is the source behind design.gitlab.com. |
| GitLab handbook source (`gitlab-com/content-sites/handbook`) | Brand Experience pages, trademark guidelines, Canva brand-kit rules (Inter fallback, white or Charcoal text) | Read the raw Markdown through the gitlab.com API, plus a sparse git clone |
| `@gitlab/svgs` 3.168.0 (npm, MIT) | The official tanuki logomark SVG (`illustrations/gitlab_logo.svg`) and product icons (`sprite_icons/*`) | `npm pack` |
| `@gitlab/fonts` 1.3.1 (npm, OFL-1.1) | GitLab Sans (variable) and GitLab Mono `.woff2` files, self-hosted under `public/fonts/` | `npm pack` |
| `@gitlab/ui` 138.6.1 (npm, MIT) | Product design tokens (`src/tokens/build/css/tokens.css`): neutral, blue, green, orange, red and purple ramps; text, border and background semantics; badge and feedback colours; radii; shadows | `npm pack` |
| gitlab.com product UI (Work items list, Issue boards), visited as an anonymous user | Layout measurements: 48px top bar, 240px super sidebar on a grey canvas, white rounded content panel, 28px nav items with an 8px radius, scoped labels, 32px charcoal confirm buttons | Headless browser, `getComputedStyle` on live elements, plus screenshots in `assets/` |

`about.gitlab.com` and `handbook.gitlab.com` were blocked by my build environment's network policy. Their source repositories on gitlab.com were not, so everything above comes from the same primary material those sites are built from.

---

## 2. The two registers: brand and product

GitLab speaks in two visual registers, and the product uses both on purpose:

1. **Brand register** (about.gitlab.com, marketing): Charcoal `#171321`, white, the orange family, Purple `#7759C2`, gradients, big bold GitLab Sans headlines with tight leading.
2. **Product register** (gitlab.com app, Pajamas): a neutral grey canvas, a white content panel, small 14px type, scoped labels, quiet chrome. The brand colours appear only in the logo and in accents.

**Where each register goes:**

- The **landing statement** (the three-part "I read the job description…" opener) is a brand moment, so it uses the brand register: Charcoal background, GitLab Sans Bold headline, and the **AI gradient** (Orange 01p → Purple 01p), which Pajamas reserves for AI-focused content. This product is AI-focused content.
- Everything after the statement, which is the actual product, uses the **product register**. It should feel like a GitLab group page that already exists.

---

## 3. Logo

- **Asset:** the official full-colour tanuki logomark from `@gitlab/svgs`, unmodified (`public/brand/tanuki.svg`). Fills are `#E24329`, `#FC6D26` and `#FCA326`.
- **Placement:** top-left of the top bar, exactly as on gitlab.com. Pajamas: *"Left-aligned placement should be the default."*
- **Size:** 24px tall in the 48px top bar, inside a 32px hit area, matching the live product. The digital minimum is 20px.
- **Clear space:** at least the x-height of the wordmark's "a". In the bar I keep 8px or more on every side.
- **Never:** recolour, outline, rotate, add a drop shadow, animate, or turn the tanuki into a mascot. The handbook is explicit that the tanuki is not to be altered. The "triage agent" is never drawn as a tanuki character; it uses the product's own `tanuki-ai` and `agent-ai` icons, which are standard product iconography.
- **Trademark:** GitLab's trademark guidelines restrict logo use. This is an independent concept made for a job application to GitLab itself. The footer carries one line stating that GITLAB and the tanuki are GitLab Inc. trademarks and that the concept is independent. Nowhere else does it imply affiliation.

---

## 4. Colour

### 4.1 Brand palette (Pajamas → `contents/brand-design/color.md`)

| Token | Hex | Use in this product |
|---|---|---|
| Charcoal | `#171321` | Landing statement background; strongest text |
| White | `#FFFFFF` | Panel background; text on Charcoal |
| Orange 01p | `#FCA326` | AI gradient start; logo |
| **Orange 02p** | **`#FC6D26`** | Logo; the "100x" score meter fill; focus accents in the statement |
| Orange 03p | `#E24329` | Logo |
| Purple 01p | `#A989F5` | AI gradient end; links on Charcoal |
| **Purple 02p** | **`#7759C2`** | Links and highlights in the brand register; the triage-agent accent (AI = purple in the product too: the `tier`/Duo badge uses purple) |
| Purple 04s | `#232150` | Dark gradient base fill |
| Teal 02s | `#6FDAC9` | Positive data points in the statement ("working, today") |
| Gray 01–05 | `#D1D0D3` → `#2B2838` | Secondary text in the brand register |

Rules I follow, taken straight from Pajamas:
- Headlines and body copy use **white or Charcoal only**. Colour never goes into sentences.
- Links use **Purple 01p on dark** and **Purple 02p on light** in the brand register.
- The **AI gradient** (Orange 01p → Purple 01p, linear) is used for exactly one element: the statement's accent rule and its "AI" eyebrow.

### 4.2 Product palette (`@gitlab/ui` tokens)

The product UI uses the real Pajamas semantic tokens. I copied the token values; no lookalikes.

| Semantic | Token | Value |
|---|---|---|
| Canvas behind panels | live gitlab.com body | `#ECECEF` |
| Panel / default background | `--gl-background-color-default` | `#FFFFFF` |
| Subtle background | `--gl-background-color-subtle` | `#F7F7F5` (neutral-10) |
| Default text | `--gl-text-color-default` | `#3A383D` (neutral-800) |
| Subtle text | `--gl-text-color-subtle` | `#646163` (neutral-600) |
| Strong text | `--gl-text-color-strong` | `#18171D` (neutral-950) |
| Link | `--gl-text-color-link` | `#27599F` (blue-700) |
| Default border | `--gl-border-color-default` | `#DCDBD9` (neutral-100) |
| Subtle border | `--gl-border-color-subtle` | `#ECEBEA` (neutral-50) |
| Confirm button | `--gl-button-confirm-primary-background-color-default` | `#3A383D` (neutral-800, charcoal button) |
| Nav item selected | live gitlab.com | `#DCDCDE`, 600 weight |

Status and feedback colours (badges, alerts):

| Meaning | Badge bg / text | Alert bg |
|---|---|---|
| Success (healthy, passing eval) | green-100 `#BEE6D0` / green-700 `#0B645A` | green-50 `#E6F5EA` |
| Warning (degraded, eval stale) | orange-100 `#FADA9C` / orange-700 `#9E3811` | orange-50 `#FDF0D5` |
| Danger (failing, unowned) | red-100 `#FFD3D7` / red-700 `#AC203A` | red-50 `#FEEEF0` |
| Info (new, in review) | blue-100 `#C8E0F9` / blue-700 `#27599F` | blue-50 `#E8F2FD` |
| Tier / AI | purple-100 `#E1DAF7` / purple-700 `#5B46B8` | purple-50 `#F4F0FC` |
| Neutral | neutral-100 `#DCDBD9` / neutral-700 `#4D4B4E` | neutral-50 `#ECEBEA` |

### 4.3 Scoped labels

GitLab's scoped labels (`key::value`) are the single most recognisable product pattern, and they map exactly onto triage output. Measured live:

- Height 20px, radius 12px (pill), 12px type, line-height 16px.
- Key segment: solid label colour, white or dark text depending on luminance, padding `2px 6px`.
- Value segment: white background, `#18171D` text, padding `2px 8px 2px 4px`.
- Border: `inset 0 0 0 2px <label colour>`.

The label set I use (colours follow GitLab's own label conventions where they exist):

| Scope | Values | Colour |
|---|---|---|
| `workflow::` | new, triaged, in build, shipped, declined | `#428BCA` (GitLab's workflow blue) |
| `tier::` | now, next, later, park | now `#E24329`, next `#FC6D26`, later `#7759C2`, park `#74717A` |
| `theme::` | research-ops, design-quality, release-comms, triage-planning, stakeholder-comms, docs-content, data-insight | `#6699CC`-style category blue family |
| `effort::` | S, M, L, XL | `#330066` (GitLab's type-label purple) |
| `team::` | product-design, ux-research, pm-dev, … | `#F0AD4E` (GitLab's section amber) |

---

## 5. Typography

| Role | Face | Spec |
|---|---|---|
| Everything | **GitLab Sans** (self-hosted variable woff2) | Fallback stack copied from gitlab.com: `"GitLab Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif` |
| Code, scores, skill files, IDs | **GitLab Mono** (self-hosted) | Regular only. Never inside a GitLab Sans sentence. |
| Statement headline (brand register) | GitLab Sans **Bold** | 105% leading, −4.5% tracking (Pajamas headline spec) |
| Statement body | GitLab Sans Regular | 135% leading, 0 tracking |
| Product body | GitLab Sans 14px | line-height 21px, weight 400 (`--gl-font-size-300`) |
| Product meta | 12px | `--gl-font-size-100`, subtle text colour |
| Product page title (h1) | 24px fixed (`--gl-font-size-700-fixed`), weight 600 | |
| Section title (h2) | 18px (`--gl-font-size-500-fixed`), weight 600 | |
| Buttons | GitLab Sans, 14px; the brand register uses SemiBold | |

Pajamas rules I apply: left-align everything, sentence case everywhere (no all-caps headings), ligatures on, no hyphenation.

---

## 6. Layout: mirroring the gitlab.com shell

Measured on live gitlab.com at 1440×900:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [tanuki]  Product & Design / AI Transformation   [Search or go to… /] │  48px top bar, transparent on canvas #ECECEF
├────────────┬─────────────────────────────────────────────────────────┤
│ Group      │ ┌─────────────────────────────────────────────────────┐ │
│ ▣ P&D AI   │ │ breadcrumb (12px)                                   │ │
│            │ │ Page title                          [Primary btn]   │ │  white panel, radius 12px,
│ Overview   │ │ ─────────────────────────────────────────────────── │ │  8px gutter to canvas edge
│ Intake     │ │ content                                             │ │
│ Triage     │ │                                                     │ │
│ Fleet      │ │                                                     │ │
│ Champions  │ │                                                     │ │
│ Skills     │ └─────────────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────────────┘
   240px super sidebar, 28px nav items, radius 8px, selected = #DCDCDE + 600 weight
```

- **List rows** follow the Work items list: 64px-ish rows with `10px 16px` padding, the title in 14px/600 strong text, a meta line in 12px subtle text with the reference (`&12`-style IDs, I use `#AI-104`), then labels. The right column holds status and "updated x ago".
- **Boards** follow Issue boards: column header with a scoped label and counts, white cards with `--gl-shadow-sm`, radius 8px.
- **Drawers**: the triage reasoning opens in a right-side drawer, like GitLab's work-item drawer.
- **Responsive:** below 1024px the sidebar collapses behind a toggle, as gitlab.com does. Below 640px, lists stack.

---

## 7. Components

| Component | Pajamas reference | Notes |
|---|---|---|
| Button, confirm | `btn-confirm` | `#3A383D` bg, white, 32px, radius 8px, padding `0 12px` |
| Button, default | `btn-default` | white bg, `#DCDBD9` 1px inset border, `#28272D` text |
| Badge | `gl-badge` | pill, 12px, `2px 6px`, semantic colours from §4.2 |
| Label / scoped label | `gl-label` | §4.3 |
| Alert | `gl-alert` | 4px radius left bar plus feedback background. Used for "3 agents have no owner". |
| Tabs | `gl-tabs` | 2px bottom indicator in `#3A383D`, 600 weight on active |
| Form inputs | `gl-form-input` | 32px, 1px `#8A8888` inset border, radius 4px; focus ring `0 0 0 1px #fff, 0 0 0 3px #428fdc` |
| Segmented control | `gl-segmented-control` | Board / list toggle |
| Skeleton / progress | `gl-skeleton-loader` | Used while the triage agent reasons |
| Avatar | `gl-avatar` | Initial-letter avatars with GitLab's identicon background set |

---

## 8. Motion

Pajamas motion is functional, never decorative. The one deliberate animation is the **triage agent's reasoning trace**: each step (extract workflow → score → estimate effort → theme → rank → write rationale) reveals in sequence at about 350ms per step, so a viewer can follow the agent's thinking. It respects `prefers-reduced-motion` by revealing every step at once.

---

## 9. Voice

GitLab's brand voice is **visionary, empathetic, intentional**. In the UI:

- Plain, direct sentences. "3 agents have no owner. You're accountable for them." Not "⚠️ Attention required!!!"
- Transparent about limits. The triage agent shows its evidence and its confidence, so the score is never a black box.
- Sentence case everywhere. No exclamation marks in product chrome.
- The landing statement is in my first-person voice. It is the only place the product speaks as me.

---

## 10. What I learned from using GitLab itself, and what changed because of it

I explored gitlab.com as an anonymous visitor: the `gitlab-org/gitlab` Work items list and Issue boards, the label taxonomy, and the triage-ops policies. Section 4 of [`../research/gitlab-product-notes.md`](../research/gitlab-product-notes.md) covers why I didn't sign up for a Free account myself. These are the design decisions that came out of it:

1. **Scoped labels are the triage output format.** GitLab already teaches its people to read `workflow::`, `type::`, `devops::` and `section::` at a glance. So the triage agent emits `tier::now`, `theme::research-ops`, `effort::M`. There's nothing new to learn.
2. **Work items list, not a bespoke dashboard.** The backlog reads like a GitLab list, sortable and filterable, with the reference ID in the meta line. A GitLab PM would know how to use it without training.
3. **Boards for themes.** GitLab plans on boards with scoped-label columns. The backlog's board view uses `tier::` columns.
4. **Grey canvas plus white panel.** The 2025–26 "paneled" UI puts the sidebar directly on a `#ECECEF` canvas and content in a rounded white panel. I matched it exactly so the product doesn't look a version behind.
5. **Charcoal confirm buttons.** The current product uses neutral-800 for primary actions, not the older blue. I followed the current product.
