import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons';
import { tanuki } from './components';
import { go, useRoute, useStore } from './store';
import { SKILLS } from './data/skills';
import Overview from './pages/Overview';
import Intake from './pages/Intake';
import Backlog from './pages/Backlog';
import Fleet from './pages/Fleet';
import Champions from './pages/Champions';
import Skills from './pages/Skills';

const NAV = [
  { path: '', label: 'Overview', icon: 'overview' },
  { path: 'intake', label: 'Intake', icon: 'paper-airplane' },
  { path: 'backlog', label: 'Triage backlog', icon: 'list-bulleted' },
  { path: 'fleet', label: 'Agent fleet', icon: 'tanuki-ai' },
  { path: 'champions', label: 'Champions', icon: 'users' },
  { path: 'skills', label: 'Skills library', icon: 'book' },
];

function Search() {
  const { entries, agents } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const r: { group: string; label: string; sub: string; href: string; icon: string }[] = [];
    entries
      .filter((e) => `${e.sub.id} ${e.triage.title} ${e.sub.text}`.toLowerCase().includes(s))
      .slice(0, 6)
      .forEach((e) => r.push({ group: 'Requests', label: e.triage.title, sub: `#${e.sub.id}`, href: `/backlog/${e.sub.id}`, icon: 'work-item-issue' }));
    agents
      .filter((a) => `${a.name} ${a.description} ${a.owner ?? 'unowned'}`.toLowerCase().includes(s))
      .slice(0, 5)
      .forEach((a) => r.push({ group: 'Agents', label: a.name, sub: a.owner ?? 'No owner', href: `/fleet/${a.id}`, icon: 'tanuki-ai' }));
    SKILLS.filter((k) => `${k.name} ${k.description}`.toLowerCase().includes(s))
      .slice(0, 4)
      .forEach((k) => r.push({ group: 'Skills', label: k.name, sub: `v${k.version}`, href: `/skills/${k.id}`, icon: 'book' }));
    return r;
  }, [q, entries, agents]);

  const choose = (href: string) => {
    go(href);
    setQ('');
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className="topbar-search" onClick={() => input.current?.focus()}>
      <Icon name="search" />
      <input
        ref={input}
        value={q}
        placeholder="Search or go to…"
        aria-label="Search requests, agents and skills"
        onChange={(e) => {
          setQ(e.target.value);
          setSel(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') setSel((s) => Math.min(s + 1, results.length - 1));
          if (e.key === 'ArrowUp') setSel((s) => Math.max(s - 1, 0));
          if (e.key === 'Enter' && results[sel]) choose(results[sel].href);
          if (e.key === 'Escape') input.current?.blur();
        }}
      />
      <span className="kbd">/</span>
      {open && results.length > 0 && (
        <div className="search-results" role="listbox">
          {results.map((r, i) => (
            <div key={r.href}>
              {(i === 0 || results[i - 1].group !== r.group) && <div className="group-title">{r.group}</div>}
              <button role="option" aria-selected={i === sel} onMouseDown={() => choose(r.href)}>
                <Icon name={r.icon} />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                <span className="subtle mono" style={{ fontSize: 12 }}>{r.sub}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { path } = useRoute();
  const { agents, backlog, reset, addedCount } = useStore();
  const [navOpen, setNavOpen] = useState(false);
  const section = path[0] ?? '';
  const unowned = agents.filter((a) => !a.owner).length;
  const raised = backlog.length;

  useEffect(() => {
    setNavOpen(false);
    if (!path[1]) window.scrollTo({ top: 0 });
  }, [section, path]);

  useEffect(() => {
    const label = NAV.find((n) => n.path === section)?.label ?? 'Overview';
    document.title = `${label} · AI Transformation · Product & Design · GitLab`;
  }, [section]);

  let page;
  switch (section) {
    case 'intake': page = <Intake />; break;
    case 'backlog': page = <Backlog />; break;
    case 'fleet': page = <Fleet />; break;
    case 'champions': page = <Champions />; break;
    case 'skills': page = <Skills />; break;
    default: page = <Overview />;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          <button className="btn btn-tertiary btn-icon mobile-only" aria-label="Toggle navigation" onClick={() => setNavOpen((o) => !o)}>
            <Icon name="sidebar" />
          </button>
          <a className="tanuki-link" href="#/" aria-label="GitLab">
            <img src={tanuki} alt="GitLab" />
          </a>
          <span className="topbar-context">Product &amp; Design</span>
        </div>
        <Search />
        <div className="topbar-actions">
          <a className="btn btn-confirm" href="#/intake">
            <Icon name="plus" />
            <span className="hide-sm">New request</span>
          </a>
        </div>
      </header>
      <div className="layout">
        <aside className={`sidebar${navOpen ? ' open' : ''}`} aria-label="AI Transformation navigation">
          <div className="sidebar-section-title">Group</div>
          <div className="sidebar-context">
            <span className="avatar" style={{ background: '#7759C2', borderRadius: 6 }}>AI</span>
            AI Transformation
          </div>
          {NAV.map((n) => (
            <a key={n.path} href={`#/${n.path}`} className="nav-item" aria-current={section === n.path ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
              {n.path === 'backlog' && <span className="nav-count">{raised}</span>}
              {n.path === 'fleet' && unowned > 0 && <span className="nav-count danger" title={`${unowned} agents without an owner`}>{unowned}</span>}
            </a>
          ))}
          <div className="sidebar-foot">
            <a className="nav-item" href="https://handbook.gitlab.com/handbook/eta/ai/strategy/hub-and-spoke/" target="_blank" rel="noreferrer">
              <Icon name="question-o" />
              Operating model
              <Icon name="external-link" size={12} />
            </a>
            {addedCount > 0 && (
              <button className="nav-item" style={{ border: 0, background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} onClick={() => { reset(); go('/'); }}>
                <Icon name="retry" />
                Clear my requests
              </button>
            )}
          </div>
        </aside>
        <main className="panel" id="main">
          <div className="panel-inner">{page}</div>
          <footer className="footer">
            <span>An independent concept for GitLab's AI Transformation Owner, Product &amp; Design role.</span>
            <span>GITLAB and the tanuki are trademarks of GitLab Inc.</span>
          </footer>
        </main>
      </div>
    </>
  );
}
