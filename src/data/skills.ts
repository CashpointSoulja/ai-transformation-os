import type { TeamId } from './org';

// Skills follow GitLab's "Prompts are Process" rules: shared, versioned, owned.
// Frontmatter follows the Agent Skills format the AI Catalog uses for skill items
// (name ≤ 64 chars kebab-case, description ≤ 1024 chars).

export type SkillScope = 'function' | 'repo' | 'company';
export type SkillStatus = 'canonical' | 'prototype' | 'deprecated';

export interface Skill {
  id: string;
  name: string;
  version: string;
  scope: SkillScope;
  status: SkillStatus;
  owner: string;
  ownerTeam: TeamId;
  workflows: string[];
  description: string;
  usageNotes: string[];
  teamsUsing: TeamId[];
  /** Answers to the five-question promotion checklist, in order. */
  checklist: [boolean, boolean, boolean, boolean, boolean];
  changelog: { version: string; daysAgo: number; note: string; author: string }[];
  content: string;
}

export const PROMOTION_CHECKLIST = [
  'Whose process does this encode?',
  "What's the right scope?",
  'Is the owner identified and ready?',
  'Is it versioned and reviewable?',
  'Does the owner want this to be how their domain operates?',
];

const fm = (name: string, description: string, version: string, owner: string, tools: string) =>
  `---\nname: ${name}\ndescription: >-\n  ${description}\nlicense: internal\nallowed-tools: ${tools}\nmetadata:\n  version: ${version}\n  owner: ${owner}\n  scope: function/product-design\n---\n`;

export const SKILLS: Skill[] = [
  {
    id: 'research-synthesis',
    name: 'research-synthesis',
    version: '2.1.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Priya Raman',
    ownerTeam: 'exp-research',
    workflows: ['research-synthesis'],
    description: 'Turns a batch of usability or interview session notes into tagged insight cards with evidence quotes, ready for Dovetail and linked to the study issue.',
    usageNotes: [
      'Feed it one study at a time. Mixing studies blurs the themes.',
      'It never invents participant quotes. Every insight must cite a note ID, and the eval fails any card without one.',
      'Researchers review every card before it goes to Dovetail. This skill drafts; the study DRI decides.',
      'v2 added problem/solution validation tagging so cards land in the right Dovetail folder.',
    ],
    teamsUsing: ['exp-research', 'studio-core', 'studio-ai', 'pm-ai', 'pm-dev'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '2.1.0', daysAgo: 9, note: 'Adds "confidence" per insight (number of participants who showed it).', author: 'Priya Raman' },
      { version: '2.0.0', daysAgo: 41, note: 'Breaking: output schema now matches Dovetail tags (UX Problem Validation / UX Solution Validation / CM Scorecard).', author: 'Hana Okafor' },
      { version: '1.3.0', daysAgo: 88, note: 'Quotes must cite a note ID; uncited quotes are dropped.', author: 'Priya Raman' },
      { version: '1.0.0', daysAgo: 140, note: 'Promoted from a personal prompt after the promotion checklist review.', author: 'Priya Raman' },
    ],
    content: `${fm('research-synthesis', 'Synthesize one research study (usability sessions or interviews) into tagged insight cards with cited evidence. Use when a study DRI has finished sessions and needs a first-pass synthesis for review.', '2.1.0', '@priya.raman', 'read_issue, read_files, create_note')}
# Research synthesis

## When to use
- A study has 3–12 sessions with notes or transcripts attached to the study issue.
- The DRI wants a first pass before an affinity session, not a final readout.

## Inputs
1. Study issue (goal, research questions, JTBD main job)
2. Session notes, one file per participant, each line prefixed with a note ID (\`P3-14\`)
3. Validation type: \`problem\` or \`solution\`

## Steps
1. Restate the research questions in one line each. Don't add new ones.
2. Read every session. Pull observations that answer a research question.
3. Cluster the observations into insights. An insight needs **2 or more participants**.
4. For each insight, write a one-sentence finding, then 1–3 evidence quotes with note IDs.
5. Score confidence = participants showing it ÷ total participants.
6. Flag contradictions explicitly. Don't average them away.
7. Map each insight to the JTBD small job it affects.

## Output format
\`\`\`yaml
- insight: "Users can't tell which pipeline failed first"
  research_question: RQ2
  jtbd: "Diagnose a failed pipeline"
  confidence: 0.67   # 4 of 6
  evidence:
    - "I just open them all until I find red" (P2-08)
    - "Which one broke it? No idea." (P5-21)
  tag: UX Problem Validation
\`\`\`

## Guardrails
- Never invent or paraphrase inside quote marks.
- Never name participants; use P-numbers only.
- If fewer than 3 sessions, stop and say the sample is too small.

## Eval
48 cases in \`evals/research-synthesis/\`. Pass bar: 90% of cards cite real note IDs; 0 fabricated quotes.
`,
  },
  {
    id: 'release-note-drafter',
    name: 'release-note-drafter',
    version: '1.4.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Tomás Herrera',
    ownerTeam: 'product-ops',
    workflows: ['release-notes'],
    description: 'Drafts a release note (≤125 words) from a feature issue and its merged MRs, in the "In previous versions of GitLab, you couldn\'t… Now you can…" pattern, with complete metadata.',
    usageNotes: [
      'The PM still owns the Release Notes Item MR. The skill drafts the YAML and the PM edits it.',
      'Run it by the 12th so there\'s time for EM and Technical Writer review before the Friday-before-release merge deadline.',
      'It reads the issue description as the single source of truth. If the description is stale, the note will be too.',
    ],
    teamsUsing: ['pm-dev', 'pm-cicd', 'pm-sec', 'pm-ai', 'product-ops'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '1.4.0', daysAgo: 6, note: 'Adds the co_create and level (primary/secondary) metadata fields.', author: 'Tomás Herrera' },
      { version: '1.3.0', daysAgo: 37, note: 'Enforces the 125-word ceiling; truncation is flagged rather than silent.', author: 'Kenji Watanabe' },
      { version: '1.0.0', daysAgo: 120, note: 'Promoted after 3 milestones of pilot use in PM AI.', author: 'Tomás Herrera' },
    ],
    content: `${fm('release-note-drafter', 'Draft a GitLab release note (125 words or fewer) and its metadata from a feature issue and merged MRs. Use when a Deliverable has merged and the PM needs a first draft of the Release Notes Item MR.', '1.4.0', '@tomas.herrera', 'read_issue, read_merge_request, read_files')}
# Release note drafter

## Inputs
- Feature issue (the description is the SSOT) and linked merged MRs
- Tier, offering, stage, categories, documentation link

## Steps
1. Find the user problem in the issue. If you can't, stop and ask the PM.
2. Write the title as an outcome ("Filter pipelines by failure reason"), not a feature name.
3. Body: "In previous versions of GitLab, you couldn't … Now you can …", then the benefit in one sentence.
4. Keep it to 125 words or fewer. Count, don't estimate.
5. Fill the metadata: \`title, tier, offering, documentation_link, work_item, categories, stage, level, co_create, weight\`.

## Output
A YAML file for \`doc/releases/<major>/gitlab-<x>-<y>-released/\`.

## Guardrails
- No marketing superlatives ("revolutionary", "game-changing").
- Don't claim a tier the issue doesn't state.
- If the feature is behind a feature flag, say so.
`,
  },
  {
    id: 'issue-triage-assistant',
    name: 'issue-triage-assistant',
    version: '3.0.2',
    scope: 'function',
    status: 'canonical',
    owner: 'Daniela Ortiz',
    ownerTeam: 'pm-dev',
    workflows: ['issue-triage'],
    description: 'Proposes type, severity, group and backlog labels for untriaged issues and spots likely duplicates, following the product issue-triage handbook.',
    usageNotes: [
      'Propose-and-wait: it comments with suggested labels, and a human applies them with one quick action.',
      'It explains its inference in every comment and links back to this skill, the same transparency pattern triage-ops uses.',
      'Severity 1 and 2 suggestions always mention the group PM and EM. It never applies them silently.',
    ],
    teamsUsing: ['pm-dev', 'pm-cicd', 'pm-sec', 'pm-ai', 'studio-core'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '3.0.2', daysAgo: 4, note: 'Fix: no longer suggests workflow:: labels (replaced by issue statuses).', author: 'Daniela Ortiz' },
      { version: '3.0.0', daysAgo: 30, note: 'Breaking: adds backlog::prospective / backlog::no-commitment suggestion.', author: 'Daniela Ortiz' },
      { version: '2.2.0', daysAgo: 76, note: 'Duplicate detection against the last 90 days of issues in the group.', author: 'Marcus Lindqvist' },
    ],
    content: `${fm('issue-triage-assistant', 'Suggest triage labels (type, severity for bugs, group, backlog commitment) and likely duplicates for an untriaged issue. Use on new or updated issues without a type or group label.', '3.0.2', '@daniela.ortiz', 'read_issue, search_issues, create_note')}
# Issue triage assistant

## Steps (partial triage)
1. Spam or abuse? Stop and tell the human to report it. Never act on it yourself.
2. Support request? Suggest the canned response and \`~"awaiting feedback"\`.
3. Duplicate? Search the last 90 days. Suggest \`/duplicate #iid\` only if similarity is high and say why.
4. Suggest one \`type::\` label (and subtype).
5. Bugs: suggest \`severity::1-4\` with the handbook definition you matched.
6. Suggest a \`group::\` label (the bot fills in section and stage).
7. Suggest \`backlog::prospective\` or \`backlog::no-commitment\`.

## Comment format
> Suggested: ~"type::bug" ~"bug::functional" ~"severity::3" ~"group::pipeline execution"
> Why: the description shows a broken flow with a workaround ("re-run the job"), which matches severity 3.
> *Generated by the issue-triage-assistant skill v3.0.2. You're welcome to improve it.*

## Guardrails
- Propose and wait. Never apply labels without a human.
- Severity 1/2: always @-mention the group PM and EM.
`,
  },
  {
    id: 'design-critique-prep',
    name: 'design-critique-prep',
    version: '1.2.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Sofia Marchetti',
    ownerTeam: 'studio-core',
    workflows: ['design-critique', 'handoff-specs'],
    description: 'Prepares a design critique pre-read: context, the JTBD, what feedback the designer wants, and a heuristic first pass against Pajamas and usability heuristics.',
    usageNotes: [
      'This is a pre-read, not a verdict. The critique still happens with people, under the critique code of conduct.',
      'The heuristic pass flags candidates and the room decides. Designers report it cuts the context segment from 10 minutes to 3.',
      'Pair it with the 2-business-day async review norm. Post the pre-read when the review request goes up.',
    ],
    teamsUsing: ['studio-core', 'studio-ai', 'studio-security'],
    checklist: [true, true, true, true, false],
    changelog: [
      { version: '1.2.0', daysAgo: 33, note: 'Adds "what feedback I want" prompt so critiques stay focused.', author: 'Sofia Marchetti' },
      { version: '1.0.0', daysAgo: 97, note: 'Promoted from the Core studio pilot.', author: 'Sofia Marchetti' },
    ],
    content: `${fm('design-critique-prep', 'Prepare a design critique pre-read from a design issue and Figma frames: context, JTBD, requested feedback, and a heuristic first pass. Use 1-2 business days before a critique.', '1.2.0', '@sofia.marchetti', 'read_issue, read_files')}
# Design critique prep

## Output: the pre-read (keep it to one screen)
1. **Context** (3 lines): the problem, who it's for, the constraints.
2. **Main job**: Verb + Object + Clarifier.
3. **What I want feedback on**: the designer's own words. Required.
4. **Heuristic first pass**: up to 5 flags, each with the frame, the heuristic, and why.
5. **Pajamas check**: components used that aren't in Pajamas, and any deprecated patterns.

## Guardrails
- Focus on the design work, not the designer.
- Flags are questions, not verdicts ("Does the empty state explain the next step?").
- Don't rank alternatives. Designers propose a single validated solution.
`,
  },
  {
    id: 'pajamas-compliance-check',
    name: 'pajamas-compliance-check',
    version: '0.9.0',
    scope: 'repo',
    status: 'prototype',
    owner: 'Lena Fischer',
    ownerTeam: 'design-expression',
    workflows: ['pajamas-compliance', 'accessibility-audit'],
    description: 'Reviews a frontend merge request diff and screenshots for non-Pajamas components, hard-coded colours instead of design tokens, and basic accessibility misses.',
    usageNotes: [
      'Still a prototype. The false-positive rate on custom charts is too high (17% against a 10% target).',
      'It lives in the gitlab-ui repo (repo scope, CODEOWNERS review). It is not function canon yet.',
      'Promotion is blocked on question 5: Design Expression wants a lower false-positive rate first.',
    ],
    teamsUsing: ['design-expression', 'studio-core'],
    checklist: [true, true, true, true, false],
    changelog: [
      { version: '0.9.0', daysAgo: 12, note: 'Token check now reads @gitlab/ui tokens.json instead of a hand-kept list.', author: 'Noah Bergström' },
      { version: '0.5.0', daysAgo: 58, note: 'First version run as an MR reviewer on ~frontend MRs.', author: 'Lena Fischer' },
    ],
    content: `${fm('pajamas-compliance-check', 'Review a frontend MR for Pajamas compliance: non-system components, raw colours instead of tokens, missing accessible names. Use as a reviewer on MRs labelled frontend.', '0.9.0', '@lena.fischer', 'read_merge_request, read_files, create_note')}
# Pajamas compliance check (prototype)

## Checks
1. Raw hex or rgb values where a \`--gl-*\` token exists.
2. Custom buttons, dropdowns or modals where a GlButton, GlDisclosureDropdown or GlModal exists.
3. Icons not from @gitlab/svgs.
4. Interactive elements without an accessible name.
5. Text contrast below 4.5:1 against its token background.

## Output
One review comment with a table of findings: file, line, check, the suggested token or component.

## Known gaps
- Custom data visualisations produce false positives (charts legitimately use the data palette).
`,
  },
  {
    id: 'direction-page-refresh',
    name: 'direction-page-refresh',
    version: '1.1.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Marcus Lindqvist',
    ownerTeam: 'pm-cicd',
    workflows: ['roadmap-comms'],
    description: 'Proposes an update to a category direction page from the last 3 milestones of shipped, slipped and newly planned issues, so roadmap comms stay current without a quarterly rewrite.',
    usageNotes: [
      'It opens a draft MR against the direction page. It never merges.',
      'It changes only the "What\'s next", "What we recently completed" and "What we\'re not doing" sections, so strategy prose stays the PM\'s.',
      'Run it on the 12th, after the release scope is finalized.',
    ],
    teamsUsing: ['pm-cicd', 'pm-dev', 'pm-sec'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '1.1.0', daysAgo: 21, note: 'Adds "What we\'re not doing" from issues moved to backlog::no-commitment.', author: 'Marcus Lindqvist' },
      { version: '1.0.0', daysAgo: 66, note: 'Promoted after a CI/CD pilot across 9 direction pages.', author: 'Marcus Lindqvist' },
    ],
    content: `${fm('direction-page-refresh', 'Propose updates to a category direction page from recent milestones (shipped, slipped, planned). Use monthly after release scope is finalized.', '1.1.0', '@marcus.lindqvist', 'read_issue, search_issues, read_files, create_merge_request')}
# Direction page refresh

## Steps
1. Read the current direction page. Note its last-updated date.
2. Pull issues for the category from the last 3 milestones: closed, moved out, newly scheduled.
3. Draft three sections: What we recently completed / What's next / What we're not doing.
4. Link every claim to an issue. No issue, no claim.
5. Open a draft MR, assign the PM, and summarise the diff in one paragraph.

## Guardrails
- Don't touch vision or strategy paragraphs.
- No dates beyond the next milestone. Direction pages aren't commitments.
`,
  },
  {
    id: 'customer-signal-digest',
    name: 'customer-signal-digest',
    version: '2.0.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Aisha Bello',
    ownerTeam: 'pm-sec',
    workflows: ['customer-feedback'],
    description: 'Builds a weekly digest of customer signal per group: new "customer interest" issues, upvote movement and recurring themes in issue comments, each linked to source.',
    usageNotes: [
      'GitLab sources only (issues, comments, upvotes). Zendesk and Salesforce signal stays out until the data classification review closes.',
      'Every theme links to at least 3 source issues, so PMs can check the evidence in one click.',
    ],
    teamsUsing: ['pm-sec', 'pm-ai', 'pm-dev'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '2.0.0', daysAgo: 18, note: 'Breaking: grouped by group:: label instead of by category.', author: 'Aisha Bello' },
      { version: '1.2.0', daysAgo: 61, note: 'Adds upvote velocity (week over week).', author: 'Aisha Bello' },
    ],
    content: `${fm('customer-signal-digest', 'Summarize a week of customer signal for one product group from GitLab issues, comments and upvotes. Use weekly before the group sync.', '2.0.0', '@aisha.bello', 'search_issues, read_issue')}
# Customer signal digest

## Output (one issue comment per group, every Monday)
- **New customer-interest issues** (title, upvotes, link)
- **Biggest movers**: upvote velocity week over week
- **Recurring themes**: up to 3, each with 3+ linked source issues
- **One question for the PM**: the signal that most challenges the current plan

## Guardrails
- Only public or internal GitLab data. No CRM or support data in v2.
- Don't name customers unless the issue already does publicly.
`,
  },
  {
    id: 'kickoff-recap',
    name: 'kickoff-recap',
    version: '1.0.3',
    scope: 'function',
    status: 'canonical',
    owner: 'Amara Nwosu',
    ownerTeam: 'design-strategy',
    workflows: ['meeting-synthesis'],
    description: 'Turns a recorded kickoff, sync or retro transcript into an async recap: decisions, owners and dates, and open questions, posted to the planning issue.',
    usageNotes: [
      'Write things down: the recap goes on the issue, not in Slack.',
      'Decisions need a named DRI. If the transcript doesn\'t name one, the recap says "DRI needed" rather than guessing.',
    ],
    teamsUsing: ['design-strategy', 'pm-ai', 'studio-ai', 'product-ops', 'pm-dev'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '1.0.3', daysAgo: 14, note: 'Fix: keeps reversible vs irreversible decision tags from the AI section flow.', author: 'Amara Nwosu' },
      { version: '1.0.0', daysAgo: 52, note: 'Promoted from DesignOps.', author: 'Amara Nwosu' },
    ],
    content: `${fm('kickoff-recap', 'Create an async recap (decisions, DRIs, dates, open questions) from a meeting transcript and post it to the linked issue. Use after kickoffs, syncs and retros.', '1.0.3', '@amara.nwosu', 'read_files, create_note')}
# Kickoff recap

## Output
**Decisions** (each tagged reversible/irreversible, with a DRI)
**Action items**: owner, due date, linked issue
**Open questions**: who can answer them, by when
**Not decided**: anything discussed without a conclusion

## Guardrails
- No DRI in the transcript → "DRI needed". Never assign one yourself.
- Quote decisions verbatim when the wording matters.
`,
  },
  {
    id: 'ui-text-reviewer',
    name: 'ui-text-reviewer',
    version: '1.3.0',
    scope: 'function',
    status: 'canonical',
    owner: 'Noah Bergström',
    ownerTeam: 'design-expression',
    workflows: ['ux-writing'],
    description: 'Reviews UI strings in an MR or Figma frame against Pajamas voice and tone and UI text guidelines: sentence case, plain verbs, consistent terminology.',
    usageNotes: [
      'Best on empty states, error messages and confirmation modals, where most UI text drift happens.',
      'It suggests and the designer or engineer accepts. Terminology changes go to Design Expression.',
    ],
    teamsUsing: ['design-expression', 'studio-core', 'studio-security', 'studio-ai'],
    checklist: [true, true, true, true, true],
    changelog: [
      { version: '1.3.0', daysAgo: 25, note: 'Adds the "work item" terminology rules.', author: 'Noah Bergström' },
      { version: '1.0.0', daysAgo: 110, note: 'Promoted.', author: 'Noah Bergström' },
    ],
    content: `${fm('ui-text-reviewer', 'Review UI text (strings in an MR or a Figma frame) against Pajamas voice and tone. Use on empty states, errors and modals.', '1.3.0', '@noah.bergstrom', 'read_merge_request, read_files, create_note')}
# UI text reviewer

## Checks
- Sentence case everywhere. No title case in UI.
- Lead with the verb on buttons ("Create issue", not "Issue creation").
- Errors say what happened and what to do next.
- Terminology: work item, merge request, pipeline. No synonyms.

## Output
A suggestions table: current → proposed → rule.
`,
  },
  {
    id: 'survey-verbatim-coder',
    name: 'survey-verbatim-coder',
    version: '0.4.0',
    scope: 'function',
    status: 'prototype',
    owner: 'Hana Okafor',
    ownerTeam: 'exp-research',
    workflows: ['survey-analysis'],
    description: 'Codes open-ended survey responses against a codebook, proposes new codes for uncoded responses, and reports code frequencies with example verbatims.',
    usageNotes: [
      'Prototype. No eval harness yet, so treat its output as a draft codebook, not a result.',
      'Promotion question 4 (versioned and reviewable) is answered. Question 3 needs Hana\'s manager to agree 5% of her time for upkeep.',
    ],
    teamsUsing: ['exp-research'],
    checklist: [true, true, false, true, true],
    changelog: [{ version: '0.4.0', daysAgo: 16, note: 'Handles Qualtrics CSV export directly.', author: 'Hana Okafor' }],
    content: `${fm('survey-verbatim-coder', 'Code open-ended survey responses against a codebook and propose new codes. Use for SUS, USAT+ or NPS verbatims.', '0.4.0', '@hana.okafor', 'read_files')}
# Survey verbatim coder (prototype)

## Steps
1. Load the codebook (code, definition, example).
2. Code each response with 0–3 codes. Quote the phrase that justifies each one.
3. Group uncoded responses. Propose new codes with definitions.
4. Report frequencies, with 2 example verbatims per code.

## Guardrails
- Respondent IDs only, never emails.
- No sentiment scores. Codes only.
`,
  },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s])) as Record<string, Skill>;
