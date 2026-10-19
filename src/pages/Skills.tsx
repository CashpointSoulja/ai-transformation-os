import { useState, type ReactNode } from 'react';
import { Icon } from '../icons';
import { Avatar, Breadcrumb, PageHead, Toast } from '../components';
import { ago, go, useRoute, useStore } from '../store';
import { PROMOTION_CHECKLIST, SKILLS, SKILL_BY_ID, type Skill } from '../data/skills';
import { TEAM_BY_ID } from '../data/org';
import { WORKFLOW_BY_ID } from '../data/workflows';

type Tab = 'file' | 'notes' | 'history' | 'checklist';

function highlight(line: string, inFm: boolean): ReactNode {
  if (line === '---') return <span className="tok-fm">{line}</span>;
  if (inFm) {
    const m = /^(\s*)([\w-]+)(:)(.*)$/.exec(line);
    if (m) return <>{m[1]}<span className="tok-key">{m[2]}</span>{m[3]}{m[4]}</>;
    return line;
  }
  if (/^#{1,6}\s/.test(line)) return <span className="tok-head">{line}</span>;
  if (/^\s*>/.test(line) || /^\s*#\s/.test(line)) return <span className="tok-com">{line}</span>;
  return line;
}

function BlobView({ skill, onToast }: { skill: Skill; onToast: (m: string) => void }) {
  const lines = skill.content.trimEnd().split('\n');
  let fmCount = 0;
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast(msg);
    } catch {
      onToast('Copy is blocked in this browser. Select the text instead.');
    }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([skill.content], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name}-v${skill.version}.SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="blob">
      <div className="blob-head">
        <span className="path"><Icon name="doc-text" />skills/{skill.name}/SKILL.md</span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn btn-default btn-sm" onClick={() => copy(skill.content, 'Skill file copied')}><Icon name="copy-to-clipboard" size={12} />Copy file</button>
          <button className="btn btn-default btn-sm" onClick={() => copy(`${location.origin}${location.pathname}#/skills/${skill.id}`, 'Link copied. Anyone in the function can open it')}><Icon name="share" size={12} />Copy link</button>
          <button className="btn btn-default btn-sm" onClick={download}><Icon name="download" size={12} />Download</button>
        </span>
      </div>
      <div className="blob-code" role="region" aria-label={`${skill.name} skill file`} tabIndex={0}>
        <div className="ln">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre>
          {lines.map((l, i) => {
            if (l === '---') fmCount++;
            const inFm = fmCount === 1 && l !== '---';
            return <div key={i}>{highlight(l, inFm) || ' '}</div>;
          })}
        </pre>
      </div>
    </div>
  );
}

export default function Skills() {
  const { path } = useRoute();
  const { agents } = useStore();
  const [tab, setTab] = useState<Tab>('file');
  const [show, setShow] = useState<'all' | 'canonical' | 'prototype'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const skill = SKILL_BY_ID[path[1] ?? ''] ?? SKILLS[0];
  const usedBy = agents.filter((a) => a.skill?.startsWith(`${skill.id}@`));
  const list = SKILLS.filter((s) => show === 'all' || s.status === show);
  const passed = skill.checklist.filter(Boolean).length;

  return (
    <>
      <Breadcrumb items={['Skills library', skill.name]} />
      <PageHead
        title="Skills library"
        sub="The instruction sets our agents run on. Prompts are process, so every skill is shared, versioned and owned. Anyone can build one. Promotion to canonical goes through the five-question checklist."
      />

      <div className="skills-layout">
        <div>
          <div className="segmented" style={{ marginBottom: 10 }} role="group" aria-label="Filter skills">
            {(['all', 'canonical', 'prototype'] as const).map((k) => (
              <button key={k} aria-pressed={show === k} onClick={() => setShow(k)}>
                {k === 'all' ? `All ${SKILLS.length}` : `${k[0].toUpperCase()}${k.slice(1)} ${SKILLS.filter((s) => s.status === k).length}`}
              </button>
            ))}
          </div>
          <div className="skill-list">
            {list.map((s) => (
              <button key={s.id} className="skill-item" aria-current={s.id === skill.id} onClick={() => { setTab('file'); go(`/skills/${s.id}`); }}>
                <div className="n">
                  <Icon name="book" size={14} />
                  {s.name}
                  <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>v{s.version}</span>
                </div>
                <div className="d">{s.description}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {s.status === 'prototype' ? <span className="badge badge-warning">prototype</span> : <span className="badge badge-success">canonical</span>}
                  <span className="badge badge-muted">{s.scope} scope</span>
                  <span className="cell-sub" style={{ alignSelf: 'center' }}>{s.teamsUsing.length} teams</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: 'var(--text-strong)' }} className="mono">{skill.name}</h2>
            <span className="badge badge-tier">v{skill.version}</span>
            {skill.status === 'prototype' ? <span className="badge badge-warning">prototype</span> : <span className="badge badge-success">canonical</span>}
          </div>
          <p style={{ margin: '0 0 12px' }}>{skill.description}</p>
          <dl className="kv" style={{ marginBottom: 14 }}>
            <dt>Owner</dt><dd><span className="person"><Avatar name={skill.owner} />{skill.owner} · {TEAM_BY_ID[skill.ownerTeam].short}</span></dd>
            <dt>Scope</dt><dd>{skill.scope === 'function' ? 'Function: Product & Design. The owner keeps the canonical version' : skill.scope === 'repo' ? 'Repo: reviewed through CODEOWNERS in the repo it lives in' : 'Company-wide'}</dd>
            <dt>Workflows</dt><dd>{skill.workflows.map((w) => WORKFLOW_BY_ID[w]?.name).join(', ')}</dd>
            <dt>Used by</dt><dd>{usedBy.length ? usedBy.map((a, i) => <span key={a.id}>{i > 0 && ', '}<a href={`#/fleet/${a.id}`}>{a.name}</a></span>) : <span className="subtle">No agents yet</span>} · {skill.teamsUsing.length} sub-teams: {skill.teamsUsing.map((t) => TEAM_BY_ID[t].short).join(', ')}</dd>
          </dl>

          <div className="tabs" role="tablist">
            <button className="tab" role="tab" aria-selected={tab === 'file'} onClick={() => setTab('file')}><Icon name="doc-text" />SKILL.md</button>
            <button className="tab" role="tab" aria-selected={tab === 'notes'} onClick={() => setTab('notes')}><Icon name="bulb" />Usage notes <span className="count">{skill.usageNotes.length}</span></button>
            <button className="tab" role="tab" aria-selected={tab === 'history'} onClick={() => setTab('history')}><Icon name="history" />Versions <span className="count">{skill.changelog.length}</span></button>
            <button className="tab" role="tab" aria-selected={tab === 'checklist'} onClick={() => setTab('checklist')}><Icon name="check-circle-filled" />Promotion <span className="count">{passed}/5</span></button>
          </div>

          {tab === 'file' && <BlobView skill={skill} onToast={setToast} />}
          {tab === 'notes' && (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {skill.usageNotes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
          {tab === 'history' && (
            <ul className="changelog">
              {skill.changelog.map((c) => (
                <li key={c.version}>
                  <span className="mono strong">v{c.version}</span> <span className="subtle">· {c.author} · {ago(c.daysAgo)}</span>
                  <div>{c.note}</div>
                </li>
              ))}
            </ul>
          )}
          {tab === 'checklist' && (
            <>
              <ul className="checklist">
                {PROMOTION_CHECKLIST.map((q, i) => (
                  <li key={q}>
                    <span className={skill.checklist[i] ? 'ok' : 'no'}><Icon name={skill.checklist[i] ? 'check-circle-filled' : 'error'} /></span>
                    {q}
                  </li>
                ))}
              </ul>
              <p className="subtle" style={{ fontSize: 13 }}>
                {passed === 5 ? 'All five answered, so this is canonical process for the function.' : 'Not every question has an answer yet, so this is still a prototype. The next step is a conversation, not a rollout.'}
              </p>
            </>
          )}
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
