import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ditLogo from './assets/dit_logo.png';

const API = {
  users:        'http://localhost:8000/api/users/',
  books:        'http://localhost:8001/api/books/',
  borrowings:   'http://localhost:8002/api/borrowings/',
  borrow:       'http://localhost:8002/api/borrowings/borrow/',
  resetPassword:'http://localhost:8000/api/users/reset-password/',
};

const USER_TYPES = [
  { value: 'STUDENT',   label: 'Étudiant' },
  { value: 'PROFESSOR', label: 'Professeur' },
  { value: 'ADMIN',     label: 'Personnel administratif' },
];

/* ═══════════════════════════════ ICONS ═══════════════════════════════ */
const Ico = {
  Book:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Users:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Grid:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  BookOpen:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  LogOut:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:         () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Refresh:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Return:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="15" height="15"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  Mail:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Lock:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  User:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Alert:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Shield:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Check:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ═══════════════════════════════ UTILITAIRES ═══════════════════════════════ */
const S = {
  primary: { display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg,#1e40af,#4f46e5)', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 },
  ghost:   { display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:'white', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:14 },
  danger:  { display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:14 },
};

function typeLabel(type) {
  return { STUDENT:'Étudiant', PROFESSOR:'Professeur', ADMIN:'Personnel administratif' }[type] || type;
}
function typeBadgeStyle(type) {
  return { STUDENT:['#eff6ff','#1d4ed8'], PROFESSOR:['#fdf4ff','#7e22ce'], ADMIN:['#fff7ed','#c2410c'] }[type] || ['#f1f5f9','#64748b'];
}

function Badge({ type }) {
  const [bg, color] = typeBadgeStyle(type);
  return <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:bg, color, fontWeight:700 }}>{typeLabel(type)}</span>;
}

function Alert({ children, variant = 'error' }) {
  const styles = {
    error:   { bg:'#fef2f2', border:'#fca5a5', color:'#991b1b' },
    success: { bg:'#ecfdf5', border:'#6ee7b7', color:'#065f46' },
    warning: { bg:'#fffbeb', border:'#fcd34d', color:'#92400e' },
  }[variant];
  return (
    <div style={{ background:styles.bg, border:`1px solid ${styles.border}`, borderRadius:10, padding:'11px 14px', color:styles.color, fontSize:13, display:'flex', gap:8, alignItems:'center' }}>
      <Ico.Alert /> {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding:'48px', textAlign:'center', color:'#94a3b8' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
      <p style={{ margin:0, fontSize:14 }}>{text}</p>
    </div>
  );
}

function InputField({ icon, type='text', placeholder, value, onChange, required, style }) {
  return (
    <div style={{ position:'relative', ...style }}>
      {icon && <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', display:'flex', alignItems:'center' }}>{icon}</span>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{ width:'100%', padding:`13px 14px 13px ${icon?'44px':'14px'}`, border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#0f172a', background:'#f8fafc', outline:'none', boxSizing:'border-box' }}
        onFocus={e => e.target.style.borderColor='#1e40af'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
    </div>
  );
}

/* ═══════════════════════════════ PAGE AUTH ═══════════════════════════════ */
function AuthPage({ onLogin }) {
  // mode : 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email:'', password:'', first_name:'', last_name:'', password_confirm:'', user_type:'STUDENT' });
  const [reset, setReset] = useState({ email:'', new_password:'', confirm_password:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const upd  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updR = (k, v) => setReset(r => ({ ...r, [k]: v }));
  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await axios.post(`${API.users}login/`, { email: form.email, password: form.password });
      onLogin(res.data);
    } catch (err) {
      if (err.response?.status === 401) setError("Email ou mot de passe incorrect.");
      else setError("Impossible de joindre le serveur.");
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.password_confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await axios.post(API.users, { email:form.email, password:form.password, password_confirm:form.password_confirm, first_name:form.first_name, last_name:form.last_name, user_type:form.user_type });
      setSuccess("Compte créé avec succès ! Connectez-vous maintenant.");
      switchMode('login');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.email ? "Cet email est déjà utilisé." : "Erreur lors de la création du compte.");
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await axios.post(API.resetPassword, { email:reset.email, new_password:reset.new_password, confirm_password:reset.confirm_password });
      setSuccess("Mot de passe modifié avec succès ! Connectez-vous avec votre nouveau mot de passe.");
      setReset({ email:'', new_password:'', confirm_password:'' });
      switchMode('login');
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue.");
    } finally { setLoading(false); }
  };

  const panelTitles = { login:'Connexion', signup:'Créer un compte', forgot:'Mot de passe oublié' };
  const panelSubs   = { login:'Accédez à votre espace bibliothèque', signup:'Rejoignez la bibliothèque du DIT', forgot:'Réinitialisez votre mot de passe' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#312e81 100%)' }}>

      {/* ── Panneau gauche branding ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'60px 48px', color:'white' }}>
        {/* Logo DIT */}
        <div style={{ marginBottom:36, textAlign:'center' }}>
          <img src={ditLogo} alt="DIT Logo" style={{ width:220, borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }} />
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:8, textAlign:'center', opacity:0.95 }}>Bibliothèque Numérique</h2>
        <p style={{ fontSize:14, opacity:0.7, textAlign:'center', maxWidth:280, lineHeight:1.7, marginBottom:36 }}>
          Plateforme centralisée de gestion des ressources documentaires
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:11, width:'100%', maxWidth:290 }}>
          {[
            { icon:'🎓', text:'Étudiants : consultez et empruntez' },
            { icon:'👨‍🏫', text:'Professeurs : accès au catalogue' },
            { icon:'🛡️', text:'Administratifs : gestion complète' },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.09)', padding:'11px 16px', borderRadius:11, backdropFilter:'blur(6px)' }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>
              <span style={{ fontSize:13, opacity:0.9 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Formulaire ── */}
      <div style={{ width:'100%', maxWidth:500, background:'white', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', overflowY:'auto' }}>

        {/* En-tête formulaire */}
        <div style={{ marginBottom:26 }}>
          <img src={ditLogo} alt="DIT" style={{ height:40, borderRadius:6, marginBottom:16 }} />
          <h2 style={{ fontSize:23, fontWeight:800, color:'#0f172a', margin:0 }}>{panelTitles[mode]}</h2>
          <p style={{ color:'#64748b', fontSize:13, marginTop:4 }}>{panelSubs[mode]}</p>
        </div>

        {success && <div style={{ marginBottom:14 }}><Alert variant="success">{success}</Alert></div>}
        {error   && <div style={{ marginBottom:14 }}><Alert>{error}</Alert></div>}

        {/* ── CONNEXION ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <InputField icon={<Ico.Mail />} type="email" placeholder="Adresse email" value={form.email} onChange={v => upd('email', v)} required />
            <InputField icon={<Ico.Lock />} type="password" placeholder="Mot de passe" value={form.password} onChange={v => upd('password', v)} required />
            <div style={{ textAlign:'right', marginTop:-4 }}>
              <button type="button" onClick={() => switchMode('forgot')}
                style={{ background:'none', border:'none', color:'#1e40af', fontSize:13, cursor:'pointer', fontWeight:600 }}>
                Mot de passe oublié ?
              </button>
            </div>
            <button type="submit" disabled={loading}
              style={{ padding:'14px', background: loading?'#93c5fd':'linear-gradient(135deg,#1e40af,#4f46e5)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor: loading?'not-allowed':'pointer' }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        )}

        {/* ── INSCRIPTION ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <InputField icon={<Ico.User />} placeholder="Prénom" value={form.first_name} onChange={v => upd('first_name', v)} required />
              <InputField icon={<Ico.User />} placeholder="Nom" value={form.last_name} onChange={v => upd('last_name', v)} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Type de compte</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {USER_TYPES.map(ut => (
                  <button key={ut.value} type="button" onClick={() => upd('user_type', ut.value)}
                    style={{ padding:'10px 6px', border:`2px solid ${form.user_type===ut.value?'#1e40af':'#e2e8f0'}`, borderRadius:10, cursor:'pointer', background:form.user_type===ut.value?'#eff6ff':'white', color:form.user_type===ut.value?'#1e40af':'#475569', fontWeight:700, fontSize:11, textAlign:'center' }}>
                    <div style={{ fontSize:18 }}>{ut.value==='STUDENT'?'🎓':ut.value==='PROFESSOR'?'👨‍🏫':'🛡️'}</div>
                    <div style={{ marginTop:3 }}>{ut.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <InputField icon={<Ico.Mail />} type="email" placeholder="Adresse email" value={form.email} onChange={v => upd('email', v)} required />
            <InputField icon={<Ico.Lock />} type="password" placeholder="Mot de passe (8 min.)" value={form.password} onChange={v => upd('password', v)} required />
            <InputField icon={<Ico.Lock />} type="password" placeholder="Confirmer le mot de passe" value={form.password_confirm} onChange={v => upd('password_confirm', v)} required />
            <button type="submit" disabled={loading}
              style={{ padding:'14px', background:loading?'#93c5fd':'linear-gradient(135deg,#1e40af,#4f46e5)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
        )}

        {/* ── MOT DE PASSE OUBLIÉ ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleReset} style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#1e40af', lineHeight:1.6 }}>
              ℹ️ Renseignez votre email et choisissez un nouveau mot de passe. Si l'email existe dans notre base, le changement sera appliqué immédiatement.
            </div>
            <InputField icon={<Ico.Mail />} type="email" placeholder="Votre adresse email" value={reset.email} onChange={v => updR('email', v)} required />
            <InputField icon={<Ico.Lock />} type="password" placeholder="Nouveau mot de passe (8 min.)" value={reset.new_password} onChange={v => updR('new_password', v)} required />
            <InputField icon={<Ico.Lock />} type="password" placeholder="Confirmer le nouveau mot de passe" value={reset.confirm_password} onChange={v => updR('confirm_password', v)} required />
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" onClick={() => switchMode('login')}
                style={{ flex:1, padding:'13px', background:'white', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:12, fontWeight:600, fontSize:14, cursor:'pointer' }}>
                ← Retour
              </button>
              <button type="submit" disabled={loading}
                style={{ flex:2, padding:'13px', background:loading?'#93c5fd':'linear-gradient(135deg,#1e40af,#4f46e5)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:loading?'not-allowed':'pointer' }}>
                {loading ? 'Traitement…' : 'Réinitialiser le mot de passe'}
              </button>
            </div>
          </form>
        )}

        {/* Lien bas de page */}
        {mode !== 'forgot' && (
          <div style={{ marginTop:22, textAlign:'center', borderTop:'1px solid #f1f5f9', paddingTop:22 }}>
            <span style={{ color:'#64748b', fontSize:14 }}>{mode==='login'?"Pas encore de compte ? ":"Déjà inscrit ? "}</span>
            <button onClick={() => switchMode(mode==='login'?'signup':'login')}
              style={{ background:'none', border:'none', color:'#1e40af', fontWeight:700, fontSize:14, cursor:'pointer', textDecoration:'underline' }}>
              {mode==='login'?'Créer un compte':'Se connecter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════ SIDEBAR ═══════════════════════════════ */
function Sidebar({ navItems, activeTab, setActiveTab, user, onLogout }) {
  return (
    <aside style={{ width:260, background:'#0f172a', position:'fixed', height:'100vh', display:'flex', flexDirection:'column', zIndex:20 }}>
      <div style={{ padding:'26px 22px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <img src={ditLogo} alt="DIT" style={{ height:44, width:'auto', borderRadius:8, objectFit:'contain', flexShrink:0 }} />
        </div>
      </div>

      <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:3 }}>
        <p style={{ color:'#475569', fontSize:10, fontWeight:700, letterSpacing:'0.1em', padding:'4px 12px 6px', textTransform:'uppercase' }}>Navigation</p>
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', width:'100%', background: active ? 'rgba(96,165,250,0.12)':'transparent', color: active ? '#93c5fd':'#94a3b8', fontWeight: active?700:500, fontSize:14, position:'relative' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#e2e8f0'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; } }}>
              {active && <div style={{ position:'absolute', left:0, top:'18%', height:'64%', width:3, background:'#60a5fa', borderRadius:'0 4px 4px 0' }} />}
              {item.icon} {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:'14px 10px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.04)', marginBottom:8 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#1e40af,#6366f1)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:13, flexShrink:0 }}>
            {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ color:'#e2e8f0', fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}
            </div>
            <div style={{ marginTop:2 }}><Badge type={user?.user_type} /></div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 14px', borderRadius:10, border:'none', cursor:'pointer', background:'transparent', color:'#64748b', fontSize:13, fontWeight:600 }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; }}>
          <Ico.LogOut /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════ APP PRINCIPALE (DISPATCH) ═══════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <AuthPage onLogin={setUser} />;
  if (user.user_type === 'ADMIN') return <AdminApp user={user} onLogout={() => setUser(null)} />;
  return <MemberApp user={user} onLogout={() => setUser(null)} />;
}

/* ═══════════════════════════════ INTERFACE ADMIN ═══════════════════════════════ */
function AdminApp({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState({ users:[], books:[], borrowings:[] });
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [u, b, l] = await Promise.all([
        axios.get(API.users).catch(() => ({ data:[] })),
        axios.get(API.books).catch(() => ({ data:[] })),
        axios.get(API.borrowings).catch(() => ({ data:[] })),
      ]);
      setData({ users: u.data, books: b.data, borrowings: l.data });
    } finally { setDataLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredBooks = useMemo(() =>
    data.books.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn?.includes(search)
    ), [search, data.books]);

  const activeLoans = data.borrowings.filter(l => l.status === 'ACTIVE');
  const overdueLoans = data.borrowings.filter(l => l.status === 'ACTIVE' && new Date(l.due_date) < new Date());

  const nav = [
    { id:'dashboard', icon:<Ico.Grid />,     label:'Tableau de bord' },
    { id:'catalogue', icon:<Ico.Book />,     label:'Catalogue' },
    { id:'membres',   icon:<Ico.Users />,    label:'Membres' },
    { id:'emprunts',  icon:<Ico.BookOpen />, label:'Emprunts' },
  ];

  const headerActions = {
    catalogue: <button onClick={() => setModal('book')} style={S.primary}><Ico.Plus /> Nouveau livre</button>,
    membres:   <button onClick={() => setModal('user')} style={S.primary}><Ico.Plus /> Nouveau membre</button>,
    emprunts:  <button onClick={() => setModal('loan')} style={{ ...S.primary, background:'linear-gradient(135deg,#f59e0b,#d97706)' }}><Ico.Plus /> Nouvel emprunt</button>,
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f1f5f9' }}>
      <Sidebar navItems={nav} activeTab={tab} setActiveTab={setTab} user={user} onLogout={onLogout} />
      <div style={{ flex:1, marginLeft:260 }}>
        <Header title={{ dashboard:'Tableau de bord', catalogue:'Catalogue des livres', membres:'Gestion des membres', emprunts:'Gestion des emprunts' }[tab]}
          right={<div style={{ display:'flex', gap:10 }}>
            <button onClick={fetchData} disabled={dataLoading} style={S.ghost}><Ico.Refresh /> {dataLoading ? 'Chargement…' : 'Actualiser'}</button>
            {headerActions[tab]}
          </div>} />
        <main style={{ padding:32 }}>
          {tab === 'dashboard' && <AdminDashboard data={data} activeLoans={activeLoans} overdueLoans={overdueLoans} onAction={setModal} />}
          {tab === 'catalogue' && <Catalogue books={filteredBooks} allBooks={data.books} search={search} onSearch={setSearch} />}
          {tab === 'membres'   && <Members users={data.users} />}
          {tab === 'emprunts'  && <Emprunts borrowings={data.borrowings} onRefresh={fetchData} />}
        </main>
      </div>
      {modal && <AdminModal type={modal} books={data.books} users={data.users} onClose={() => setModal(null)} onSuccess={() => { setModal(null); fetchData(); }} loading={loading} setLoading={setLoading} />}
    </div>
  );
}

/* ═══════════════════════════════ INTERFACE MEMBRE (Étudiant / Professeur) ═══════════════════════════════ */
function MemberApp({ user, onLogout }) {
  const [tab, setTab] = useState('catalogue');
  const [books, setBooks] = useState([]);
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [search, setSearch] = useState('');
  const [borrowModal, setBorrowModal] = useState(null); // livre sélectionné
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchAll = async () => {
    try {
      const [b, l] = await Promise.all([
        axios.get(API.books).catch(() => ({ data:[] })),
        axios.get(`${API.borrowings}?user_id=${user.id}`).catch(() => ({ data:[] })),
      ]);
      setBooks(b.data);
      setMyBorrowings(l.data);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredBooks = useMemo(() =>
    books.filter(b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn?.includes(search)
    ), [search, books]);

  const handleBorrow = async (book, dueDate) => {
    setLoading(true);
    try {
      await axios.post(API.borrow, {
        book_id: book.id,
        user_id: user.id,
        user_email: user.email,
        due_date: dueDate || undefined,
      });
      setBorrowModal(null);
      setNotice(`"${book.title}" emprunté avec succès !`);
      fetchAll();
      setTimeout(() => setNotice(''), 4000);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'emprunt.");
    } finally { setLoading(false); }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Confirmer le retour de ce livre ?")) return;
    try {
      await axios.post(`${API.borrowings}${id}/return/`);
      setNotice("Livre retourné avec succès !");
      fetchAll();
      setTimeout(() => setNotice(''), 4000);
    } catch { alert("Erreur lors du retour."); }
  };

  const nav = [
    { id:'catalogue', icon:<Ico.Book />,     label:'Catalogue' },
    { id:'emprunts',  icon:<Ico.BookOpen />, label:'Mes emprunts' },
  ];

  const activeCount = myBorrowings.filter(l => l.status === 'ACTIVE').length;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f1f5f9' }}>
      <Sidebar navItems={nav} activeTab={tab} setActiveTab={setTab} user={user} onLogout={onLogout} />
      <div style={{ flex:1, marginLeft:260 }}>
        <Header
          title={tab === 'catalogue' ? 'Catalogue des livres' : 'Mes emprunts'}
          right={
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {activeCount > 0 && (
                <span style={{ fontSize:13, padding:'6px 12px', borderRadius:20, background:'#fffbeb', color:'#d97706', fontWeight:700, border:'1px solid #fcd34d' }}>
                  📚 {activeCount} emprunt{activeCount > 1 ? 's' : ''} en cours
                </span>
              )}
              <button onClick={fetchAll} style={S.ghost}><Ico.Refresh /> Actualiser</button>
            </div>
          } />

        {notice && (
          <div style={{ margin:'0 32px', marginBottom:-16 }}>
            <div style={{ background:'#ecfdf5', border:'1px solid #6ee7b7', borderRadius:10, padding:'11px 16px', color:'#065f46', fontSize:14, display:'flex', gap:8, alignItems:'center' }}>
              <Ico.Check /> {notice}
            </div>
          </div>
        )}

        <main style={{ padding:32 }}>
          {tab === 'catalogue' && (
            <MemberCatalogue books={filteredBooks} search={search} onSearch={setSearch} onBorrow={setBorrowModal} />
          )}
          {tab === 'emprunts' && (
            <MemberEmprunts borrowings={myBorrowings} onReturn={handleReturn} />
          )}
        </main>
      </div>

      {borrowModal && (
        <BorrowModal book={borrowModal} loading={loading} onConfirm={(dueDate) => handleBorrow(borrowModal, dueDate)} onClose={() => setBorrowModal(null)} />
      )}
    </div>
  );
}

/* ─── Catalogue vue membre ─── */
function MemberCatalogue({ books, search, onSearch, onBorrow }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:420 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', display:'flex' }}><Ico.Search /></span>
          <input type="text" placeholder="Rechercher par titre, auteur ou ISBN…" value={search} onChange={e => onSearch(e.target.value)}
            style={{ width:'100%', padding:'11px 14px 11px 42px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, background:'white', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ padding:'8px 14px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, color:'#64748b' }}>
          <strong style={{ color:'#0f172a' }}>{books.length}</strong> livre{books.length > 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
        {books.map(b => (
          <div key={b.id} style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.07)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
            <div style={{ height:90, background:`linear-gradient(135deg,hsl(${b.id*47%360},55%,88%),hsl(${(b.id*47+40)%360},55%,80%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>📖</div>
            <div style={{ padding:'14px 16px' }}>
              <h4 style={{ margin:'0 0 3px', fontSize:14, fontWeight:700, color:'#0f172a', lineHeight:1.3 }}>{b.title}</h4>
              <p style={{ margin:'0 0 12px', fontSize:12, color:'#64748b' }}>{b.author}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:11, color:'#94a3b8' }}>{b.isbn}</span>
                <span style={{ fontSize:12, padding:'3px 9px', borderRadius:20, fontWeight:700, background: b.available_copies > 0 ? '#ecfdf5':'#fef2f2', color: b.available_copies > 0 ? '#059669':'#dc2626' }}>
                  {b.available_copies > 0 ? `${b.available_copies} dispo.` : 'Épuisé'}
                </span>
              </div>
              <button
                onClick={() => b.available_copies > 0 && onBorrow(b)}
                disabled={b.available_copies === 0}
                style={{ width:'100%', padding:'9px', border:'none', borderRadius:9, fontWeight:700, fontSize:13, cursor: b.available_copies > 0 ? 'pointer':'not-allowed', background: b.available_copies > 0 ? 'linear-gradient(135deg,#1e40af,#4f46e5)':'#f1f5f9', color: b.available_copies > 0 ? 'white':'#94a3b8' }}>
                {b.available_copies > 0 ? '📥 Emprunter ce livre' : 'Indisponible'}
              </button>
            </div>
          </div>
        ))}
        {books.length === 0 && <div style={{ gridColumn:'1/-1' }}><EmptyState text="Aucun livre trouvé" /></div>}
      </div>
    </div>
  );
}

/* ─── Mes emprunts vue membre ─── */
function MemberEmprunts({ borrowings, onReturn }) {
  const active = borrowings.filter(l => l.status === 'ACTIVE');
  const history = borrowings.filter(l => l.status !== 'ACTIVE');

  const LoanRow = ({ l }) => {
    const overdue = l.status === 'ACTIVE' && new Date(l.due_date) < new Date();
    return (
      <div style={{ background:'white', borderRadius:12, border:`1.5px solid ${overdue ? '#fca5a5' : '#e2e8f0'}`, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:44, height:54, background:`hsl(${l.book_id*47%360},55%,90%)`, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>📗</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{l.book_title || `Livre #${l.book_id}`}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>
              Emprunté le {new Date(l.borrowed_at).toLocaleDateString('fr-FR')} · Retour prévu le <span style={{ color: overdue ? '#dc2626':'#374151', fontWeight: overdue?700:400 }}>{new Date(l.due_date).toLocaleDateString('fr-FR')}</span>
            </div>
            {overdue && <div style={{ fontSize:12, color:'#dc2626', fontWeight:700, marginTop:3 }}>⚠️ En retard de {Math.floor((new Date() - new Date(l.due_date)) / 86400000)} jour(s)</div>}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:12, padding:'4px 10px', borderRadius:20, fontWeight:700, background: l.status==='RETURNED'?'#ecfdf5': overdue?'#fef2f2':'#fffbeb', color: l.status==='RETURNED'?'#059669': overdue?'#dc2626':'#d97706' }}>
            {l.status === 'RETURNED' ? '✅ Rendu' : overdue ? '🔴 En retard' : '🟡 En cours'}
          </span>
          {l.status === 'ACTIVE' && (
            <button onClick={() => onReturn(l.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'1.5px solid #1e40af', borderRadius:9, background:'white', color:'#1e40af', cursor:'pointer', fontWeight:700, fontSize:13 }}>
              <Ico.Return /> Retourner
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <section>
        <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#0f172a' }}>En cours ({active.length})</h3>
        {active.length > 0
          ? <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{active.map(l => <LoanRow key={l.id} l={l} />)}</div>
          : <EmptyState text="Vous n'avez aucun emprunt en cours" />}
      </section>
      {history.length > 0 && (
        <section>
          <h3 style={{ margin:'0 0 14px', fontSize:15, fontWeight:700, color:'#0f172a' }}>Historique ({history.length})</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>{history.map(l => <LoanRow key={l.id} l={l} />)}</div>
        </section>
      )}
    </div>
  );
}

/* ─── Modal emprunt membre ─── */
function BorrowModal({ book, loading, onConfirm, onClose }) {
  const [dueDate, setDueDate] = useState('');
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const defaultReturn = new Date(); defaultReturn.setDate(defaultReturn.getDate() + 14);

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:440, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding:'22px 26px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:'#0f172a' }}>Confirmer l'emprunt</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}><Ico.X /></button>
        </div>
        <div style={{ padding:'22px 26px', display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'flex', gap:14, alignItems:'center', background:'#f8fafc', borderRadius:12, padding:'14px' }}>
            <div style={{ width:48, height:58, background:`hsl(${book.id*47%360},55%,90%)`, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>📖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{book.title}</div>
              <div style={{ fontSize:13, color:'#64748b', marginTop:2 }}>{book.author}</div>
              <div style={{ fontSize:12, color:'#059669', fontWeight:700, marginTop:4 }}>✅ {book.available_copies} exemplaire(s) disponible(s)</div>
            </div>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>
              Date de retour prévue <span style={{ color:'#94a3b8', fontWeight:400 }}>(défaut : 14 jours)</span>
            </label>
            <input type="date" value={dueDate} min={minDate.toISOString().split('T')[0]} onChange={e => setDueDate(e.target.value)}
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }} />
            {!dueDate && <p style={{ fontSize:12, color:'#94a3b8', marginTop:5 }}>Date par défaut : {defaultReturn.toLocaleDateString('fr-FR')}</p>}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ ...S.ghost, flex:1, justifyContent:'center' }}>Annuler</button>
            <button onClick={() => onConfirm(dueDate)} disabled={loading} style={{ ...S.primary, flex:2, justifyContent:'center', opacity: loading?0.7:1 }}>
              {loading ? 'Traitement…' : '📥 Confirmer l\'emprunt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ COMPOSANTS ADMIN PARTAGÉS ═══════════════════════════════ */
function Header({ title, right }) {
  return (
    <header style={{ background:'white', borderBottom:'1px solid #e2e8f0', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10 }}>
      <div>
        <h2 style={{ margin:0, fontSize:19, fontWeight:700, color:'#0f172a' }}>{title}</h2>
        <p style={{ margin:0, fontSize:12, color:'#94a3b8', marginTop:2 }}>{new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>
      {right}
    </header>
  );
}

function AdminDashboard({ data, activeLoans, overdueLoans, onAction }) {
  const stats = [
    { label:'Membres inscrits',      value:data.users.length,      color:'#1e40af', bg:'#eff6ff', icon:'👥' },
    { label:'Ouvrages au catalogue', value:data.books.length,      color:'#065f46', bg:'#ecfdf5', icon:'📚' },
    { label:'Emprunts en cours',     value:activeLoans.length,     color:'#92400e', bg:'#fffbeb', icon:'🔄' },
    { label:'Emprunts en retard',    value:overdueLoans.length,    color:'#991b1b', bg:'#fef2f2', icon:'⚠️' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:26 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18 }}>
        {stats.map((s,i) => (
          <div key={i} style={{ background:'white', borderRadius:14, padding:'22px', border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</span>
              <div style={{ width:34, height:34, background:s.bg, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize:34, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between' }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#0f172a' }}>📖 Derniers ajouts</h3>
            <span style={{ fontSize:12, color:'#94a3b8' }}>{data.books.length} livres</span>
          </div>
          <div>
            {data.books.slice(0,5).map(b => (
              <div key={b.id} style={{ padding:'11px 22px', display:'flex', alignItems:'center', gap:13, borderBottom:'1px solid #f8fafc' }}>
                <div style={{ width:32,height:40, background:`hsl(${b.id*47%360},55%,92%)`, borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>📗</div>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{b.title}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{b.author}</div>
                </div>
                <span style={{ marginLeft:'auto', fontSize:11, padding:'2px 7px', borderRadius:5, background: b.available_copies>0?'#ecfdf5':'#fef2f2', color: b.available_copies>0?'#059669':'#dc2626', fontWeight:700, flexShrink:0 }}>
                  {b.available_copies>0?`${b.available_copies} dispo.`:'Épuisé'}
                </span>
              </div>
            ))}
            {data.books.length === 0 && <EmptyState text="Aucun livre" />}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between' }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#0f172a' }}>🔄 Emprunts récents</h3>
            <span style={{ fontSize:12, color:'#94a3b8' }}>{activeLoans.length} actifs</span>
          </div>
          <div>
            {data.borrowings.slice(0,5).map(l => {
              const overdue = l.status==='ACTIVE' && new Date(l.due_date)<new Date();
              return (
                <div key={l.id} style={{ padding:'11px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f8fafc' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0f172a' }}>{l.book_title||`Livre #${l.book_id}`}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{l.user_email}</div>
                  </div>
                  <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, fontWeight:700, background: l.status==='RETURNED'?'#ecfdf5':overdue?'#fef2f2':'#fffbeb', color: l.status==='RETURNED'?'#059669':overdue?'#dc2626':'#d97706' }}>
                    {l.status==='RETURNED'?'Rendu':overdue?'En retard':'En cours'}
                  </span>
                </div>
              );
            })}
            {data.borrowings.length===0 && <EmptyState text="Aucun emprunt" />}
          </div>
        </div>
      </div>

      <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1e40af)', borderRadius:14, padding:'26px 30px', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h3 style={{ margin:0, fontSize:17, fontWeight:700 }}>Actions rapides</h3>
          <p style={{ margin:'5px 0 0', opacity:0.75, fontSize:13 }}>Gérez la bibliothèque efficacement</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => onAction('book')} style={{ padding:'9px 18px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, color:'white', cursor:'pointer', fontWeight:600, fontSize:13 }}>📚 Ajouter un livre</button>
          <button onClick={() => onAction('user')} style={{ padding:'9px 18px', background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, color:'white', cursor:'pointer', fontWeight:600, fontSize:13 }}>👤 Ajouter un membre</button>
          <button onClick={() => onAction('loan')} style={{ padding:'9px 18px', background:'white', border:'none', borderRadius:9, color:'#1e40af', cursor:'pointer', fontWeight:700, fontSize:13 }}>🔄 Enregistrer un emprunt</button>
        </div>
      </div>
    </div>
  );
}

function Catalogue({ books, allBooks, search, onSearch }) {
  const total = allBooks.reduce((s,b) => s+(b.available_copies||0), 0);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, maxWidth:400 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', display:'flex' }}><Ico.Search /></span>
          <input type="text" placeholder="Titre, auteur ou ISBN…" value={search} onChange={e => onSearch(e.target.value)}
            style={{ width:'100%', padding:'11px 14px 11px 42px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, background:'white', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ padding:'8px 14px', background:'white', border:'1px solid #e2e8f0', borderRadius:10, fontSize:13, color:'#64748b' }}>
          <strong style={{ color:'#0f172a' }}>{books.length}</strong> résultat{books.length>1?'s':''} · <strong style={{ color:'#059669' }}>{total}</strong> exemplaires disponibles
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:15 }}>
        {books.map(b => (
          <div key={b.id} style={{ background:'white', borderRadius:13, border:'1px solid #e2e8f0', overflow:'hidden' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.07)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
            <div style={{ height:90, background:`linear-gradient(135deg,hsl(${b.id*47%360},55%,88%),hsl(${(b.id*47+40)%360},55%,80%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>📖</div>
            <div style={{ padding:'14px 16px' }}>
              <h4 style={{ margin:'0 0 3px', fontSize:14, fontWeight:700, color:'#0f172a', lineHeight:1.3 }}>{b.title}</h4>
              <p style={{ margin:'0 0 10px', fontSize:12, color:'#64748b' }}>{b.author}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'#94a3b8' }}>{b.isbn}</span>
                <span style={{ fontSize:12, padding:'3px 9px', borderRadius:20, fontWeight:700, background: b.available_copies>0?'#ecfdf5':'#fef2f2', color: b.available_copies>0?'#059669':'#dc2626' }}>
                  {b.available_copies>0?`${b.available_copies}/${b.total_copies} dispo.`:'Épuisé'}
                </span>
              </div>
              {b.genre && <span style={{ display:'inline-block', marginTop:8, fontSize:11, padding:'2px 7px', borderRadius:5, background:'#f1f5f9', color:'#475569', fontWeight:600 }}>{b.genre}</span>}
            </div>
          </div>
        ))}
        {books.length===0 && <div style={{ gridColumn:'1/-1' }}><EmptyState text="Aucun livre trouvé" /></div>}
      </div>
    </div>
  );
}

function Members({ users }) {
  return (
    <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
      <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9' }}>
        <span style={{ fontSize:13, color:'#64748b' }}><strong style={{ color:'#0f172a' }}>{users.length}</strong> membre{users.length>1?'s':''} inscrit{users.length>1?'s':''}</span>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f8fafc' }}>
            {['Membre','Email','Type','N° Étudiant','Statut'].map(h => (
              <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderTop:'1px solid #f1f5f9' }}
              onMouseEnter={e => e.currentTarget.style.background='#fafafe'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <td style={{ padding:'13px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`hsl(${u.id*73%360},55%,90%)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:`hsl(${u.id*73%360},55%,35%)`, flexShrink:0 }}>
                    {(u.first_name?.[0]||'?').toUpperCase()}
                  </div>
                  <span style={{ fontWeight:600, fontSize:13, color:'#0f172a' }}>{u.first_name} {u.last_name}</span>
                </div>
              </td>
              <td style={{ padding:'13px 18px', fontSize:13, color:'#475569' }}>{u.email}</td>
              <td style={{ padding:'13px 18px' }}><Badge type={u.user_type} /></td>
              <td style={{ padding:'13px 18px', fontSize:12, color:'#64748b', fontFamily:'monospace' }}>{u.student_id||'—'}</td>
              <td style={{ padding:'13px 18px' }}>
                <span style={{ fontSize:12, padding:'3px 9px', borderRadius:20, background: u.is_active?'#ecfdf5':'#f1f5f9', color: u.is_active?'#059669':'#94a3b8', fontWeight:700 }}>
                  {u.is_active?'Actif':'Inactif'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length===0 && <EmptyState text="Aucun membre inscrit" />}
    </div>
  );
}

function Emprunts({ borrowings, onRefresh }) {
  const handleReturn = async (id) => {
    if (!window.confirm("Confirmer le retour de ce livre ?")) return;
    try { await axios.post(`${API.borrowings}${id}/return/`); onRefresh(); }
    catch { alert("Erreur lors du retour."); }
  };
  return (
    <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
      <div style={{ padding:'18px 22px', borderBottom:'1px solid #f1f5f9' }}>
        <span style={{ fontSize:13, color:'#64748b' }}><strong style={{ color:'#0f172a' }}>{borrowings.length}</strong> emprunt{borrowings.length>1?'s':''}</span>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f8fafc' }}>
            {['Livre','Emprunteur','Emprunté le','Retour prévu','Statut','Action'].map(h => (
              <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {borrowings.map(l => {
            const overdue = l.status==='ACTIVE' && new Date(l.due_date)<new Date();
            return (
              <tr key={l.id} style={{ borderTop:'1px solid #f1f5f9' }}
                onMouseEnter={e => e.currentTarget.style.background='#fafafe'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'13px 18px', fontWeight:600, fontSize:13, color:'#0f172a' }}>{l.book_title||`Livre #${l.book_id}`}</td>
                <td style={{ padding:'13px 18px', fontSize:12, color:'#475569' }}>{l.user_email||`User #${l.user_id}`}</td>
                <td style={{ padding:'13px 18px', fontSize:12, color:'#64748b' }}>{new Date(l.borrowed_at).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding:'13px 18px', fontSize:12, color: overdue?'#dc2626':'#64748b', fontWeight: overdue?700:400 }}>
                  {overdue&&'⚠️ '}{new Date(l.due_date).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding:'13px 18px' }}>
                  <span style={{ fontSize:12, padding:'3px 9px', borderRadius:20, fontWeight:700, background: l.status==='RETURNED'?'#ecfdf5':overdue?'#fef2f2':'#fffbeb', color: l.status==='RETURNED'?'#059669':overdue?'#dc2626':'#d97706' }}>
                    {l.status==='RETURNED'?'Rendu':overdue?'En retard':'En cours'}
                  </span>
                </td>
                <td style={{ padding:'13px 18px' }}>
                  {l.status==='ACTIVE' && (
                    <button onClick={() => handleReturn(l.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:'1px solid #e2e8f0', background:'white', color:'#1e40af', cursor:'pointer', fontSize:12, fontWeight:700 }}>
                      <Ico.Return /> Retour
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {borrowings.length===0 && <EmptyState text="Aucun emprunt enregistré" />}
    </div>
  );
}

/* ─── Modal Admin ─── */
function AdminModal({ type, books, users, onClose, onSuccess, loading, setLoading }) {
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', password_confirm:'', user_type:'STUDENT', title:'', author:'', isbn:'', total_copies:1, book_id:'', user_id:'', due_date:'' });
  const [error, setError] = useState('');
  const upd = (k,v) => setForm(f => ({...f,[k]:v}));
  const titles = { user:'Nouveau membre', book:'Nouveau livre', loan:'Nouvel emprunt' };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (type==='user') {
        if (form.password!==form.password_confirm) throw new Error("Les mots de passe ne correspondent pas.");
        await axios.post(API.users, { email:form.email, password:form.password, password_confirm:form.password_confirm, first_name:form.first_name, last_name:form.last_name, user_type:form.user_type });
      } else if (type==='book') {
        await axios.post(API.books, { title:form.title, author:form.author, isbn:form.isbn, total_copies:form.total_copies, available_copies:form.total_copies });
      } else if (type==='loan') {
        const selectedUser = users.find(u => u.id===parseInt(form.user_id));
        await axios.post(API.borrow, { book_id:parseInt(form.book_id), user_id:parseInt(form.user_id), user_email:selectedUser?.email||'', due_date:form.due_date||undefined });
      }
      onSuccess();
    } catch (err) {
      const msg = err.message || err.response?.data?.detail || Object.values(err.response?.data||{})?.[0]?.[0] || "Une erreur est survenue.";
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }}>
      <div style={{ background:'white', borderRadius:18, width:'100%', maxWidth:500, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ padding:'22px 26px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white' }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:'#0f172a' }}>{titles[type]}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8' }}><Ico.X /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding:'22px 26px', display:'flex', flexDirection:'column', gap:13 }}>
          {error && <Alert>{error}</Alert>}

          {type==='user' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <ModalInput placeholder="Prénom" value={form.first_name} onChange={v => upd('first_name',v)} required />
                <ModalInput placeholder="Nom" value={form.last_name} onChange={v => upd('last_name',v)} required />
              </div>
              <ModalInput type="email" placeholder="Email" value={form.email} onChange={v => upd('email',v)} required />
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Type de compte</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {USER_TYPES.map(ut => (
                    <button key={ut.value} type="button" onClick={() => upd('user_type', ut.value)}
                      style={{ padding:'9px 6px', border:`2px solid ${form.user_type===ut.value?'#1e40af':'#e2e8f0'}`, borderRadius:9, cursor:'pointer', background: form.user_type===ut.value?'#eff6ff':'white', color: form.user_type===ut.value?'#1e40af':'#475569', fontWeight:700, fontSize:11, textAlign:'center' }}>
                      {ut.value==='STUDENT'?'🎓':ut.value==='PROFESSOR'?'👨‍🏫':'🛡️'}<div style={{ marginTop:3 }}>{ut.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <ModalInput type="password" placeholder="Mot de passe (8 min.)" value={form.password} onChange={v => upd('password',v)} required />
              <ModalInput type="password" placeholder="Confirmer le mot de passe" value={form.password_confirm} onChange={v => upd('password_confirm',v)} required />
            </>
          )}

          {type==='book' && (
            <>
              <ModalInput placeholder="Titre du livre" value={form.title} onChange={v => upd('title',v)} required />
              <ModalInput placeholder="Auteur" value={form.author} onChange={v => upd('author',v)} required />
              <ModalInput placeholder="ISBN (10 ou 13 chiffres)" value={form.isbn} onChange={v => upd('isbn',v)} required />
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Nombre d'exemplaires</label>
                <input type="number" min="1" value={form.total_copies} onChange={e => upd('total_copies',parseInt(e.target.value))} required
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
            </>
          )}

          {type==='loan' && (
            <>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Membre emprunteur <span style={{ color:'#dc2626' }}>*</span></label>
                <select value={form.user_id} onChange={e => upd('user_id',e.target.value)} required
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', background:'white', boxSizing:'border-box' }}>
                  <option value="">— Choisir un membre (étudiant / professeur) —</option>
                  {users.filter(u => u.user_type==='STUDENT'||u.user_type==='PROFESSOR').map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({typeLabel(u.user_type)}) — {u.email}</option>
                  ))}
                </select>
                {users.filter(u => u.user_type==='STUDENT'||u.user_type==='PROFESSOR').length===0 && (
                  <p style={{ fontSize:12, color:'#f59e0b', marginTop:5 }}>⚠️ Aucun étudiant ou professeur inscrit.</p>
                )}
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Livre à emprunter <span style={{ color:'#dc2626' }}>*</span></label>
                <select value={form.book_id} onChange={e => upd('book_id',e.target.value)} required
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', background:'white', boxSizing:'border-box' }}>
                  <option value="">— Choisir un livre disponible —</option>
                  {books.filter(b => b.available_copies>0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.available_copies} dispo.)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Date de retour prévue</label>
                <input type="date" value={form.due_date} onChange={e => upd('due_date',e.target.value)}
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
            </>
          )}

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ ...S.ghost, flex:1, justifyContent:'center' }}>Annuler</button>
            <button type="submit" disabled={loading} style={{ ...S.primary, flex:2, justifyContent:'center', opacity:loading?0.7:1 }}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalInput({ type='text', placeholder, value, onChange, required }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} required={required}
      style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#0f172a', outline:'none', boxSizing:'border-box', background:'#f8fafc' }}
      onFocus={e => e.target.style.borderColor='#1e40af'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
  );
}
