import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sprout, Trees, LayoutDashboard, MapPinned, ClipboardList, Settings, Search, Plus,
  Bell, ChevronDown, Download, MoreHorizontal, ArrowUpRight, Leaf, HeartPulse,
  AlertTriangle, Skull, CheckCircle2, Clock3, MapPin, CalendarDays, UserRound,
  Pencil, Trash2, X, LogOut, LockKeyhole, Mail, Eye, EyeOff, RefreshCw,
  Filter, Activity, ShieldCheck, Menu, CircleHelp
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATUS = {
  alive: { label: 'Healthy', className: 'status-alive' },
  needs_attention: { label: 'Needs care', className: 'status-care' },
  dead: { label: 'Did not survive', className: 'status-dead' },
  replaced: { label: 'Replanted', className: 'status-replaced' },
  unverified: { label: 'Not checked', className: 'status-unverified' }
};
const emptyForm = { species: '', locationName: '', plantedAt: new Date().toISOString().slice(0, 10), plantedBy: '', status: 'unverified', latitude: '', longitude: '', notes: '' };

async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload;
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function initial(name = '') { return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() || 'GT'; }
function exportCSV(trees) {
  const columns = ['treeId', 'species', 'locationName', 'plantedAt', 'plantedBy', 'status', 'lastInspectedAt', 'notes'];
  const esc = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns.join(','), ...trees.map(tree => columns.map(key => esc(tree[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = `greentrack-trees-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
}

function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: 'admin@greentrack.demo', password: 'GreenTrack123!' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [showPass, setShowPass] = useState(false);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(form) });
      onLogin(data);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="login-shell">
    <div className="login-art"><div className="brand brand-light"><div className="brand-mark"><Sprout size={24}/></div><div><span>green</span>track</div></div>
      <div className="art-copy"><span className="eyebrow light-eyebrow">GROW A GREENER TOMORROW</span><h1>Small roots.<br/><em>Lasting impact.</em></h1><p>A living record of every tree planted, every volunteer involved, and every future protected.</p>
      <div className="art-stats"><div><strong>1 tree</strong><span>at a time</span></div><div className="art-stat-divider"/><div><strong>1 planet</strong><span>to protect</span></div></div></div>
      <div className="leaf-orbit orbit-one"/><div className="leaf-orbit orbit-two"/><div className="plant-art"><div className="plant-stem"/><div className="plant-leaf leaf-a"/><div className="plant-leaf leaf-b"/><div className="plant-leaf leaf-c"/><div className="plant-leaf leaf-d"/><div className="plant-soil"/></div>
      <span className="art-footnote"><Leaf size={14}/> Thoughtfully tracking our green footprint</span>
    </div>
    <div className="login-form-side"><div className="login-form-wrap"><div className="mobile-brand brand"><div className="brand-mark"><Sprout size={23}/></div><div><span>green</span>track</div></div>
      <div className="form-heading"><span className="eyebrow">YOUR IMPACT STARTS HERE</span><h2>{register ? 'Join the green movement' : 'Welcome back'}</h2><p>{register ? 'Create a volunteer account to start tracking trees.' : 'Sign in to your plantation dashboard.'}</p></div>
      <form onSubmit={submit} className="auth-form">
        {register && <label>Full name<div className="input-wrap"><UserRound size={18}/><input required minLength="2" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></div></label>}
        <label>Email address<div className="input-wrap"><Mail size={18}/><input required type="email" placeholder="you@example.com" autoComplete="username" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={18}/><input required minLength={register ? 8 : 1} type={showPass ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/><button type="button" className="show-password" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility">{showPass ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
        {error && <div className="error-message">{error}</div>}
        <button className="primary-btn auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} <ArrowUpRight size={18}/></button>
      </form>
      {!register && <div className="demo-login"><div className="demo-lock"><ShieldCheck size={17}/></div><div><strong>Hackathon demo access</strong><span>Admin credentials are prefilled for you.</span></div><button onClick={() => setForm({ ...form, email: 'volunteer@greentrack.demo', password: 'Volunteer123!' })} type="button">Use volunteer</button></div>}
      <p className="switch-auth">{register ? 'Already have an account?' : 'New to GreenTrack?'} <button type="button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Sign in' : 'Create an account'}</button></p>
      <p className="login-legal">By continuing, you help build a more accountable green future.</p>
    </div></div>
  </div>;
}

function TreeModal({ tree, onClose, onSave, saving }) {
  const [form, setForm] = useState(tree ? { ...emptyForm, ...tree, plantedAt: tree.plantedAt ? new Date(tree.plantedAt).toISOString().slice(0, 10) : emptyForm.plantedAt, latitude: tree.latitude ?? '', longitude: tree.longitude ?? '' } : emptyForm);
  const [error, setError] = useState('');
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async e => { e.preventDefault(); setError(''); try { await onSave({ ...form, latitude: form.latitude === '' ? null : Number(form.latitude), longitude: form.longitude === '' ? null : Number(form.longitude) }); } catch (err) { setError(err.message); } };
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="tree-modal-title">
    <div className="modal-header"><div><span className="eyebrow">TREE REGISTRY</span><h2 id="tree-modal-title">{tree ? 'Update tree record' : 'Register a new tree'}</h2><p>{tree ? `Editing ${tree.treeId || 'tree record'}` : 'Add a newly planted tree to your impact record.'}</p></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>
    <form onSubmit={submit} className="tree-form">
      <div className="form-grid"><label>Tree species <span>*</span><input required maxLength="100" placeholder="e.g. Neem" value={form.species} onChange={e => update('species', e.target.value)}/></label><label>Planting date <span>*</span><input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.plantedAt} onChange={e => update('plantedAt', e.target.value)}/></label>
      <label className="full-field">Plantation location <span>*</span><input required maxLength="180" placeholder="Park, campus, village or landmark" value={form.locationName} onChange={e => update('locationName', e.target.value)}/></label>
      <label>Planted by <span>*</span><input required maxLength="100" placeholder="Volunteer or organization" value={form.plantedBy} onChange={e => update('plantedBy', e.target.value)}/></label><label>Current status<select value={form.status} onChange={e => update('status', e.target.value)}>{Object.entries(STATUS).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></label>
      <label>Latitude <input type="number" min="-90" max="90" step="any" placeholder="Optional" value={form.latitude} onChange={e => update('latitude', e.target.value)}/></label><label>Longitude <input type="number" min="-180" max="180" step="any" placeholder="Optional" value={form.longitude} onChange={e => update('longitude', e.target.value)}/></label>
      <label className="full-field">Notes <textarea maxLength="1000" rows="3" placeholder="Condition, watering needs or inspection notes…" value={form.notes || ''} onChange={e => update('notes', e.target.value)}/></label></div>
      {error && <div className="error-message">{error}</div>}
      <div className="modal-footer"><p><span>*</span> Required fields</p><div><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button disabled={saving} className="primary-btn">{saving ? 'Saving…' : tree ? 'Save changes' : 'Add tree'} <ArrowUpRight size={17}/></button></div></div>
    </form>
  </div></div>;
}

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('greentrack-session') || 'null'); } catch { return null; }
  });
  const [trees, setTrees] = useState([]); const [stats, setStats] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [toast, setToast] = useState('');
  const [search, setSearch] = useState(''); const [statusFilter, setStatusFilter] = useState('all'); const [view, setView] = useState('overview'); const [modalTree, setModalTree] = useState(undefined); const [saving, setSaving] = useState(false); const [mobileNav, setMobileNav] = useState(false);
  const token = session?.token; const user = session?.user;

  const notify = message => { setToast(message); window.setTimeout(() => setToast(''), 3000); };
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try {
      const [treeData, statsData] = await Promise.all([api('/trees?limit=100', { token }), api('/trees/stats/summary', { token })]);
      setTrees(treeData.trees); setStats(statsData);
    } catch (err) { setError(err.message); if (/session|sign in|expired/i.test(err.message)) logout(); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) loadData(); }, [token, loadData]);
  useEffect(() => { if (session) localStorage.setItem('greentrack-session', JSON.stringify(session)); else localStorage.removeItem('greentrack-session'); }, [session]);

  const logout = () => { setSession(null); setTrees([]); setStats(null); };
  const filteredTrees = useMemo(() => trees.filter(tree => {
    const q = search.toLowerCase(); const matchSearch = !q || [tree.treeId, tree.species, tree.locationName, tree.plantedBy].some(value => String(value || '').toLowerCase().includes(q));
    return matchSearch && (statusFilter === 'all' || tree.status === statusFilter);
  }), [trees, search, statusFilter]);
  const recentTrees = useMemo(() => [...trees].sort((a,b) => new Date(b.createdAt || b.plantedAt) - new Date(a.createdAt || a.plantedAt)).slice(0, 5), [trees]);

  async function saveTree(form) {
    setSaving(true);
    try {
      const editing = modalTree && modalTree !== 'new';
      await api(editing ? `/trees/${modalTree._id}` : '/trees', { token, method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setModalTree(undefined); await loadData(); notify(editing ? 'Tree record updated successfully.' : 'New tree added to your registry.');
    } finally { setSaving(false); }
  }
  async function deleteTree(tree) {
    if (!window.confirm(`Delete ${tree.treeId} (${tree.species})? This cannot be undone.`)) return;
    try { await api(`/trees/${tree._id}`, { token, method: 'DELETE' }); await loadData(); notify('Tree record deleted.'); }
    catch (err) { notify(err.message); }
  }
  async function quickStatus(tree, status) {
    try { await api(`/trees/${tree._id}/inspections`, { token, method: 'POST', body: JSON.stringify({ status, notes: tree.notes || '' }) }); await loadData(); notify('Inspection status recorded.'); }
    catch (err) { notify(err.message); }
  }

  if (!session) return <Login onLogin={data => setSession(data)}/>;
  const cards = [
    { label: 'Trees registered', value: stats?.total ?? '—', foot: 'Across all plantation sites', icon: Trees, kind: 'forest', accent: 'green' },
    { label: 'Confirmed healthy', value: stats?.alive ?? '—', foot: 'Currently marked as alive', icon: HeartPulse, kind: 'health', accent: 'mint' },
    { label: 'Need attention', value: stats?.needsAttention ?? '—', foot: 'Follow-up care is needed', icon: AlertTriangle, kind: 'attention', accent: 'amber' },
    { label: 'Survival rate', value: stats?.survivalRate == null ? '—' : `${stats.survivalRate}%`, foot: 'Alive ÷ (alive + did not survive)', icon: Activity, kind: 'rate', accent: 'blue' }
  ];
  const navItems = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'trees', label: 'Tree registry', icon: Trees }, { id: 'locations', label: 'Plantation sites', icon: MapPinned }];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><Sprout size={23}/></div><div className="brand-name"><span>green</span>track<small>PLANTATION INTELLIGENCE</small></div><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)}><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div><nav>{navItems.map(item => <button key={item.id} className={`nav-item ${view === item.id ? 'nav-active' : ''}`} onClick={() => { setView(item.id); setMobileNav(false); }}><item.icon size={19}/><span>{item.label}</span>{item.id === 'trees' && <span className="nav-count">{trees.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-promo"><div className="promo-icon"><Leaf size={19}/></div><strong>Every tree counts.</strong><p>Track the progress. Protect the future.</p><div className="promo-lines"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div><button className="nav-item muted-nav" onClick={() => notify('GreenTrack · Hackathon demo build')}><CircleHelp size={18}/><span>Help & information</span></button>
        <div className="sidebar-user"><div className="avatar">{initial(user?.name)}</div><div className="sidebar-user-info"><strong>{user?.name}</strong><span>{user?.role === 'admin' ? 'Administrator' : 'Volunteer'}</span></div><button className="logout-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div>
      </div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-btn" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{view === 'overview' ? 'Overview' : view === 'trees' ? 'Tree registry' : 'Plantation sites'}</strong></div></div><div className="topbar-right"><div className="date-chip"><CalendarDays size={16}/>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div><span className="topbar-divider"/><button className="notification-btn" onClick={() => notify(`${stats?.needsAttention || 0} tree(s) currently need attention.`)} aria-label="Notifications"><Bell size={19}/>{(stats?.needsAttention || 0) > 0 && <i/>}</button><button className="profile-chip" onClick={() => notify(`${user?.name} · ${user?.role}`)}><div className="avatar avatar-small">{initial(user?.name)}</div><ChevronDown size={15}/></button></div></header>
      <div className="page-content">
        {error && <div className="page-error"><AlertTriangle size={18}/><span>{error}</span><button onClick={loadData}><RefreshCw size={15}/> Retry</button></div>}
        {view === 'overview' && <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> YOUR GREEN IMPACT, AT A GLANCE</div><h1>Good morning, {user?.name?.split(' ')[0] || 'there'}<span className="heading-leaf">✳</span></h1><p>Healthy trees start with thoughtful tracking. Here's how your green mission is growing.</p></div><div className="welcome-actions"><button className="secondary-btn" onClick={() => exportCSV(trees)}><Download size={17}/> Export report</button><button className="primary-btn" onClick={() => setModalTree('new')}><Plus size={18}/> Register a tree</button></div></section>
          <section className="stats-grid">{cards.map(card => <div className={`stat-card stat-${card.accent}`} key={card.label}><div className="stat-top"><span>{card.label}</span><div className="stat-icon"><card.icon size={19}/></div></div><div className="stat-value">{card.value}</div><div className="stat-foot"><span>{card.foot}</span></div>{card.kind === 'rate' && <div className="rate-track"><div style={{ width: `${stats?.survivalRate || 0}%` }}/></div>}</div>)}</section>
          <section className="dashboard-grid"><div className="panel registry-panel"><div className="panel-header"><div><h2>Recently registered</h2><p>Your latest additions to the registry</p></div><button className="text-link" onClick={() => setView('trees')}>View all <ArrowUpRight size={16}/></button></div><TreeTable trees={recentTrees} role={user?.role} onEdit={tree => setModalTree(tree)} onDelete={deleteTree} onStatus={quickStatus} compact empty={loading}/></div>
            <div className="panel health-panel"><div className="panel-header"><div><h2>Tree health</h2><p>Current status breakdown</p></div><div className="panel-head-icon"><HeartPulse size={18}/></div></div><HealthBreakdown stats={stats}/><div className="health-note"><div className="note-icon"><Sprout size={17}/></div><p><strong>Keep the momentum growing</strong><span>Regular site visits help turn planting counts into lasting impact.</span></p></div><button className="full-outline-btn" onClick={() => { setView('trees'); setStatusFilter('needs_attention'); }}>Review trees needing care <ArrowUpRight size={16}/></button></div></section>
          <section className="bottom-grid"><div className="panel trend-panel"><div className="panel-header"><div><h2>Planting activity</h2><p>Recent planting records by month</p></div><span className="period-label">LAST 6 MONTHS</span></div><MonthlyChart stats={stats}/></div><div className="impact-banner"><div className="impact-content"><span className="eyebrow light-eyebrow">ONE PLANET. SHARED RESPONSIBILITY.</span><h2>Growing a greener<br/>tomorrow, together.</h2><p>Every recorded tree tells a story of care, community, and a more sustainable future.</p><button onClick={() => setView('trees')}>Explore tree registry <ArrowUpRight size={16}/></button></div><div className="impact-deco"><div className="impact-sun"/><div className="impact-hill hill-one"/><div className="impact-hill hill-two"/><div className="impact-tree tree-one"><i/><b/></div><div className="impact-tree tree-two"><i/><b/></div><div className="impact-tree tree-three"><i/><b/></div></div></div></section>
        </>}
        {view === 'trees' && <><section className="welcome-row registry-title-row"><div><div className="eyebrow"><span className="live-dot"/> THE LIVING RECORD</div><h1>Tree registry<span className="heading-leaf">✳</span></h1><p>Every tree has a place in the bigger picture. Manage your records here.</p></div><div className="welcome-actions"><button className="secondary-btn" onClick={() => exportCSV(filteredTrees)}><Download size={17}/> Export CSV</button><button className="primary-btn" onClick={() => setModalTree('new')}><Plus size={18}/> Register a tree</button></div></section>
          <section className="registry-tools"><div className="search-box"><Search size={18}/><input placeholder="Search tree, species, location or planter…" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button onClick={() => setSearch('')}><X size={15}/></button>}</div><div className="filter-select"><Filter size={16}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{Object.entries(STATUS).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select><ChevronDown size={15}/></div><span className="result-count">{filteredTrees.length} record{filteredTrees.length === 1 ? '' : 's'}</span></section>
          <section className="panel full-registry-panel"><TreeTable trees={filteredTrees} role={user?.role} onEdit={tree => setModalTree(tree)} onDelete={deleteTree} onStatus={quickStatus} empty={loading}/>{!loading && filteredTrees.length === 0 && <div className="no-results"><div><Trees size={25}/></div><h3>{trees.length ? 'No matching trees' : 'Your first tree starts here'}</h3><p>{trees.length ? 'Try adjusting the search or selected status.' : 'Add a plantation record to start tracking your green impact.'}</p>{!trees.length && <button className="primary-btn" onClick={() => setModalTree('new')}><Plus size={17}/> Register first tree</button>}</div>}</section>
          <div className="registry-footnote"><ShieldCheck size={16}/><span>Records are stored in MongoDB. {user?.role === 'admin' ? 'Administrator access: you can edit and delete records.' : 'Volunteer access: you can add and update records; deletion is restricted to administrators.'}</span></div>
        </>}
        {view === 'locations' && <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot"/> ROOTED IN THE COMMUNITY</div><h1>Plantation sites<span className="heading-leaf">✳</span></h1><p>Explore the places where your community's green footprint is taking root.</p></div><button className="primary-btn" onClick={() => setModalTree('new')}><Plus size={18}/> Register a tree</button></section><section className="location-grid">{Object.entries(trees.reduce((map, tree) => { const key = tree.locationName || 'Unspecified location'; (map[key] ||= []).push(tree); return map; }, {})).sort((a,b) => b[1].length-a[1].length).map(([location, records], index) => <div className="location-card" key={location}><div className={`location-art location-art-${index % 4}`}><MapPin size={23}/><span className="location-art-number">SITE {String(index + 1).padStart(2, '0')}</span></div><div className="location-body"><div className="location-title-row"><h3>{location}</h3><span className="site-count">{records.length} {records.length === 1 ? 'tree' : 'trees'}</span></div><p><Trees size={15}/>{[...new Set(records.map(t => t.species))].slice(0, 3).join(' · ')}{new Set(records.map(t => t.species)).size > 3 ? ' +' : ''}</p><div className="location-progress"><div><span>Healthy trees</span><strong>{records.filter(t => t.status === 'alive').length}/{records.length}</strong></div><div className="progress-track"><i style={{ width: `${records.length ? records.filter(t => t.status === 'alive').length / records.length * 100 : 0}%` }}/></div></div><button className="text-link" onClick={() => { setSearch(location); setStatusFilter('all'); setView('trees'); }}>View site records <ArrowUpRight size={15}/></button></div></div>)}{trees.length === 0 && <div className="empty-locations"><MapPinned size={28}/><h3>No plantation sites yet</h3><p>Register your first tree to create a location.</p><button className="primary-btn" onClick={() => setModalTree('new')}><Plus size={17}/> Register a tree</button></div>}</section></>}
        <footer className="page-footer"><span>© 2026 GreenTrack <i/> Building a greener tomorrow.</span><span><span className="footer-status"/> API-connected environmental tracker</span></footer>
      </div>
    </main>
    {modalTree !== undefined && <TreeModal tree={modalTree === 'new' ? null : modalTree} onClose={() => setModalTree(undefined)} onSave={saveTree} saving={saving}/>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={() => setToast('')}><X size={15}/></button></div>}
  </div>;
}

function HealthBreakdown({ stats }) {
  const rows = [ ['alive', 'Healthy', stats?.alive || 0], ['needs_attention', 'Needs care', stats?.needsAttention || 0], ['dead', 'Did not survive', stats?.dead || 0], ['unverified', 'Not checked', stats?.unverified || 0], ['replaced', 'Replanted', stats?.replaced || 0] ];
  const total = stats?.total || 0;
  return <div className="health-breakdown">{rows.map(([status, label, count]) => <div className="health-row" key={status}><div className="health-row-label"><span className={`legend-dot dot-${status}`}/><span>{label}</span><strong>{count}</strong></div><div className="health-track"><i className={`bar-${status}`} style={{ width: `${total ? count / total * 100 : 0}%` }}/></div></div>)}</div>;
}

function MonthlyChart({ stats }) {
  const months = useMemo(() => {
    const now = new Date(); const lookup = new Map((stats?.monthly || []).map(item => [`${item.year}-${item.month}`, item.count]));
    return Array.from({ length: 6 }, (_, index) => { const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1); const key = `${date.getFullYear()}-${date.getMonth() + 1}`; return { label: date.toLocaleDateString('en-IN', { month: 'short' }), count: lookup.get(key) || 0 }; });
  }, [stats]);
  const max = Math.max(4, ...months.map(item => item.count));
  return <div className="chart-area"><div className="chart-y-labels"><span>{max}</span><span>{Math.round(max/2)}</span><span>0</span></div><div className="chart-columns"><div className="chart-guides"><i/><i/><i/></div>{months.map((item, index) => <div className="chart-col" key={`${item.label}-${index}`}><div className="chart-bar-wrap"><div className={`chart-bar ${index === months.length - 1 ? 'chart-bar-current' : ''}`} style={{ height: `${Math.max(3, item.count / max * 100)}%` }} title={`${item.count} trees`}><span>{item.count}</span></div></div><span className="chart-month">{item.label}</span></div>)}</div></div>;
}

function TreeTable({ trees, role, onEdit, onDelete, onStatus, compact = false, empty = false }) {
  if (!trees.length && empty) return <div className="table-loading"><RefreshCw size={17}/> Loading tree records…</div>;
  if (!trees.length) return null;
  return <div className="table-scroll"><table className={`tree-table ${compact ? 'compact-table' : ''}`}><thead><tr><th>TREE</th><th>PLANTATION SITE</th><th>PLANTED BY</th><th>PLANTED ON</th><th>STATUS</th><th className="action-heading">ACTION</th></tr></thead><tbody>{trees.map(tree => { const status = STATUS[tree.status] || STATUS.unverified; return <tr key={tree._id}><td><div className="tree-identity"><div className={`tree-thumb tree-thumb-${(tree.species || 'tree').charCodeAt(0) % 4}`}><Sprout size={18}/></div><div><strong>{tree.species}</strong><span>{tree.treeId || 'TREE-PENDING'}</span></div></div></td><td><div className="site-cell"><MapPin size={15}/><span>{tree.locationName}</span></div></td><td><div className="planter-cell"><span className="mini-avatar">{initial(tree.plantedBy)}</span>{tree.plantedBy}</div></td><td className="date-cell">{formatDate(tree.plantedAt)}</td><td><div className="status-cell"><span className={`status-pill ${status.className}`}><i/>{status.label}</span><select className="quick-status" title="Record inspection status" aria-label={`Update status for ${tree.treeId}`} value={tree.status} onChange={e => onStatus(tree, e.target.value)}><option value="alive">Mark healthy</option><option value="needs_attention">Needs care</option><option value="dead">Did not survive</option><option value="replaced">Replanted</option><option value="unverified">Not checked</option></select></div></td><td><div className="row-actions"><button className="row-action" title="Edit record" onClick={() => onEdit(tree)}><Pencil size={15}/></button>{role === 'admin' && <button className="row-action danger-action" title="Delete record" onClick={() => onDelete(tree)}><Trash2 size={15}/></button>}<button className="row-action more-action" title="Edit tree" onClick={() => onEdit(tree)}><MoreHorizontal size={17}/></button></div></td></tr>; })}</tbody></table></div>;
}

export default App;
