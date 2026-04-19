// sTEAve — App Shell + Navigator + Tweaks
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════════
// ICON SPRITE — all icons referenced via <use href="#ic-..."/>
// ═══════════════════════════════════════════
function IconSprite() {
  return (
    <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
      <defs>
        <symbol id="ic-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></symbol>
        <symbol id="ic-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></symbol>
        <symbol id="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4L19 6"/></symbol>
        <symbol id="ic-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></symbol>
        <symbol id="ic-crown" viewBox="0 0 24 24" fill="currentColor"><path d="M2 18h20v3H2v-3zM2 7l5 4 5-7 5 7 5-4-2 10H4L2 7z"/></symbol>
        <symbol id="ic-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
        <symbol id="ic-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08A3 3 0 0 1 2.17 13 3 3 0 0 1 4 7.5a2.5 2.5 0 0 1 2.5-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08A3 3 0 0 0 21.83 13 3 3 0 0 0 20 7.5a2.5 2.5 0 0 0-2.5-3 2.5 2.5 0 0 0-3-2.5z"/></symbol>
        <symbol id="ic-rainbow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 17a10 10 0 0 0-20 0"/><path d="M18.5 17a6.5 6.5 0 0 0-13 0"/><path d="M15 17a3 3 0 0 0-6 0"/></symbol>
        <symbol id="ic-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v4M8 23h8"/></symbol>
        <symbol id="ic-music" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></symbol>
        <symbol id="ic-trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></symbol>
        <symbol id="ic-sparkle" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"/></symbol>
        <symbol id="ic-bolt" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></symbol>
        <symbol id="ic-cake" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s1-1 4-1 5 2 8 2 4-1 4-1M2 21h20M7 8v2M12 8v2M17 8v2M7 3c0 1.1.9 2 2 2h.5c0-1.1-.9-2-2-2H7zM12 3c0 1.1.9 2 2 2h.5c0-1.1-.9-2-2-2H12zM17 3c0 1.1.9 2 2 2h.5c0-1.1-.9-2-2-2H17z"/></symbol>
        <symbol id="ic-flame" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s6 6 6 12a6 6 0 0 1-12 0c0-2 1-4 3-5 0 3 2 3 2 3s-1-4 1-7 0-3 0-3z"/></symbol>
        <symbol id="ic-star-burst" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 1-4.5 4 1.5 7-5-3.5L7 20l1.5-7L4 9l6-1 2-6z"/></symbol>
        <symbol id="ic-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></symbol>
        <symbol id="ic-shape-tri" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l11 18H1z"/></symbol>
        <symbol id="ic-shape-dia" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l10 10-10 10L2 12z"/></symbol>
        <symbol id="ic-shape-circ" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></symbol>
        <symbol id="ic-shape-sq" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></symbol>
        <symbol id="ic-sliders" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></symbol>
        <symbol id="ic-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></symbol>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════
// SCREEN NAVIGATOR — bottom strip
// ═══════════════════════════════════════════
const SCREENS = [
  { id:'landing', label:'Landing',     group:'Entry' },
  { id:'hub',     label:'Host Hub',    group:'Entry' },
  { id:'trivia',  label:'Trivia',      group:'Games' },
  { id:'twink',   label:'Twink/Lesbian',group:'Games' },
  { id:'lipsync', label:'Lipsync',     group:'Games' },
  { id:'songpop', label:'Songpop',     group:'Games' },
  { id:'finale',  label:'Finale',      group:'Reveal' },
  { id:'m-join',  label:'📱 Join',     group:'Player View' },
  { id:'m-lobby', label:'📱 Lobby',    group:'Player View' },
  { id:'m-trivia',label:'📱 Trivia',   group:'Player View' },
  { id:'m-twink', label:'📱 Twink/L',  group:'Player View' },
  { id:'m-lipsync',label:'📱 Judging', group:'Player View' },
  { id:'m-waiting',label:'📱 Standby', group:'Player View' },
];

function Navigator({ screen, setScreen }) {
  const groups = {};
  SCREENS.forEach(s => { (groups[s.group] ||= []).push(s); });

  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:1000,
      padding:'10px 14px',
      background:'rgba(10,8,18,.88)',
      backdropFilter:'blur(24px)',
      WebkitBackdropFilter:'blur(24px)',
      borderTop:'1px solid var(--border-2)',
      display:'flex', gap:16, alignItems:'center', overflowX:'auto',
      fontFamily:'var(--font-body)',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8, color:'var(--muted)', fontSize:'.7rem', letterSpacing:2, textTransform:'uppercase', flexShrink:0}}>
        <svg width="14" height="14"><use href="#ic-sparkle"/></svg> Preview
      </div>
      {Object.entries(groups).map(([group, screens]) => (
        <div key={group} style={{display:'flex', alignItems:'center', gap:6}}>
          <span style={{fontSize:'.65rem', color:'var(--dim)', letterSpacing:2, textTransform:'uppercase', marginRight:4}}>{group}</span>
          {screens.map(s => (
            <button key={s.id} onClick={()=>setScreen(s.id)} style={{
              padding:'7px 12px', borderRadius:999,
              background: screen===s.id ? 'var(--accent-1)' : 'rgba(255,255,255,.04)',
              border:`1px solid ${screen===s.id ? 'var(--accent-1)' : 'var(--border-2)'}`,
              color: screen===s.id ? '#fff' : 'var(--text-2)',
              fontSize:'.78rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
              transition:'all .15s',
            }}>{s.label}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// TWEAKS PANEL
// ═══════════════════════════════════════════
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "arcade",
  "motion": "normal",
  "density": "normal",
  "showGrain": true,
  "showPlayerPOV": true
}/*EDITMODE-END*/;

function TweaksPanel({ open, onClose, values, setValues }) {
  const set = (k, v) => {
    const next = { ...values, [k]: v };
    setValues(next);
    try { window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[k]:v}}, '*'); } catch(e){}
  };

  if (!open) return null;
  return (
    <div style={{
      position:'fixed', bottom:80, right:20, zIndex:1200,
      width:320, maxHeight:'70vh', overflow:'auto',
      background:'rgba(14,10,26,.96)',
      backdropFilter:'blur(30px)',
      border:'1px solid var(--border-2)',
      borderRadius:'var(--r-lg)',
      boxShadow:'0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(255,59,97,.2)',
      padding:18,
      animation:'float-up .25s ease-out',
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <svg width="16" height="16" style={{color:'var(--accent-1)'}}><use href="#ic-sliders"/></svg>
          <h3 className="display" style={{fontSize:'1.1rem'}}>Tweaks</h3>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', color:'var(--muted)', cursor:'pointer', display:'flex'}}>
          <svg width="18" height="18"><use href="#ic-x"/></svg>
        </button>
      </div>

      <TweakGroup label="Aesthetic">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
          {[
            { id:'arcade', label:'Arcade', c:'#ff3b61' },
            { id:'salon',  label:'Salon',  c:'#e5603d' },
            { id:'rave',   label:'Rave',   c:'#00ff9d' },
          ].map(t => (
            <button key={t.id} onClick={()=>set('theme', t.id)} style={{
              padding:'10px 6px', borderRadius:10,
              background: values.theme===t.id ? `color-mix(in oklab, ${t.c} 20%, transparent)` : 'rgba(255,255,255,.03)',
              border:`1.5px solid ${values.theme===t.id ? t.c : 'var(--border-2)'}`,
              color: values.theme===t.id ? t.c : 'var(--text-2)',
              fontSize:'.8rem', fontWeight:800, cursor:'pointer',
            }}>{t.label}</button>
          ))}
        </div>
      </TweakGroup>

      <TweakGroup label="Motion">
        <Seg value={values.motion} onChange={v=>set('motion', v)} options={[['normal','Full'],['low','Reduced']]}/>
      </TweakGroup>

      <TweakGroup label="Density">
        <Seg value={values.density} onChange={v=>set('density', v)} options={[['cozy','Cozy'],['normal','Normal'],['roomy','Roomy']]}/>
      </TweakGroup>

      <TweakGroup label="Visuals">
        <Toggle label="Film grain"    on={values.showGrain}    onChange={v=>set('showGrain', v)}/>
        <Toggle label="Player phone"  on={values.showPlayerPOV} onChange={v=>set('showPlayerPOV', v)}/>
      </TweakGroup>

      <div style={{marginTop:14, padding:10, background:'rgba(255,214,0,.06)', border:'1px solid rgba(255,214,0,.2)', borderRadius:8, fontSize:'.72rem', color:'var(--muted)', lineHeight:1.4}}>
        Tweak the look on the fly. Each theme reframes the whole night — arcade is buzzy, salon is editorial, rave is club.
      </div>
    </div>
  );
}

function TweakGroup({ label, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div className="mono" style={{fontSize:'.65rem', color:'var(--muted)', letterSpacing:2, textTransform:'uppercase', marginBottom:6}}>{label}</div>
      {children}
    </div>
  );
}
function Seg({ value, onChange, options }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:`repeat(${options.length},1fr)`, gap:4, padding:3, background:'rgba(255,255,255,.03)', border:'1px solid var(--border-2)', borderRadius:10}}>
      {options.map(([v,l]) => (
        <button key={v} onClick={()=>onChange(v)} style={{
          padding:'7px', borderRadius:7,
          background: value===v ? 'var(--accent-1)' : 'transparent',
          border:'none', color: value===v ? '#fff' : 'var(--text-2)',
          fontSize:'.78rem', fontWeight:700, cursor:'pointer',
        }}>{l}</button>
      ))}
    </div>
  );
}
function Toggle({ label, on, onChange }) {
  return (
    <label style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', cursor:'pointer', borderRadius:8, background:'rgba(255,255,255,.02)', marginBottom:4}}>
      <span style={{fontSize:'.85rem', color:'var(--text-2)'}}>{label}</span>
      <button onClick={()=>onChange(!on)} style={{
        width:40, height:22, borderRadius:999,
        background: on ? 'var(--accent-1)' : 'rgba(255,255,255,.1)',
        border:'none', cursor:'pointer', position:'relative',
        transition:'background .2s',
      }}>
        <span style={{
          position:'absolute', top:2, left: on ? 20 : 2,
          width:18, height:18, borderRadius:'50%', background:'#fff',
          transition:'left .2s',
        }}/>
      </button>
    </label>
  );
}

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════
function App() {
  const [screen, setScreen] = useState(() => localStorage.getItem('steave-screen') || 'landing');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [values, setValues] = useState(DEFAULTS);

  useEffect(() => { localStorage.setItem('steave-screen', screen); }, [screen]);

  // Apply theme + motion to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', values.theme);
    document.documentElement.setAttribute('data-motion', values.motion);
    document.documentElement.setAttribute('data-density', values.density);
    document.body.style.setProperty('--grain-opacity', values.showGrain ? '0.35' : '0');
  }, [values]);

  // Edit mode protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(e){}
    return () => window.removeEventListener('message', handler);
  }, []);

  // Route
  const renderScreen = () => {
    const go = (id) => setScreen(id);
    const nextGame = { trivia:'twink', twink:'lipsync', lipsync:'songpop', songpop:'finale' };
    switch (screen) {
      case 'landing': return <LandingScreen onHost={()=>go('hub')} onJoin={()=>go('m-lobby')}/>;
      case 'hub':     return <HostHub onGame={go} onEndGame={()=>go('finale')}/>;
      case 'trivia':  return <TriviaScreen  onBack={()=>go('hub')} onNextGame={()=>go(nextGame.trivia)}/>;
      case 'twink':   return <TwinkLesbianScreen onBack={()=>go('hub')} onNextGame={()=>go(nextGame.twink)}/>;
      case 'lipsync': return <LipsyncScreen onBack={()=>go('hub')} onNextGame={()=>go(nextGame.lipsync)}/>;
      case 'songpop': return <SongpopScreen onBack={()=>go('hub')} onNextGame={()=>go(nextGame.songpop)}/>;
      case 'finale':  return <FinaleScreen onBack={()=>go('hub')}/>;
      case 'm-join':   return <PlayerMobile mode="join"/>;
      case 'm-lobby':  return <PlayerMobile mode="lobby"/>;
      case 'm-trivia': return <PlayerMobile mode="trivia"/>;
      case 'm-twink':  return <PlayerMobile mode="twink"/>;
      case 'm-lipsync':return <PlayerMobile mode="lipsync"/>;
      case 'm-waiting':return <PlayerMobile mode="waiting"/>;
      default:        return <LandingScreen onHost={()=>go('hub')} onJoin={()=>go('m-lobby')}/>;
    }
  };

  return (
    <div data-screen-label={SCREENS.find(s=>s.id===screen)?.label || screen} style={{
      position:'absolute', inset:0,
      display:'flex', flexDirection:'column',
      paddingBottom:58, // leave space for navigator
    }}>
      <IconSprite/>
      <div style={{flex:1, minHeight:0, position:'relative'}}>
        {renderScreen()}
      </div>

      {/* Tweaks toggle button */}
      <button
        onClick={()=>setTweaksOpen(!tweaksOpen)}
        style={{
          position:'fixed', bottom:72, right:20, zIndex:1100,
          width:44, height:44, borderRadius:'50%',
          background: tweaksOpen ? 'var(--accent-1)' : 'rgba(14,10,26,.9)',
          border:'1px solid var(--border-2)',
          color: tweaksOpen ? '#fff' : 'var(--text)',
          cursor:'pointer',
          boxShadow:'0 8px 24px rgba(0,0,0,.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
        title="Tweaks"
      >
        <svg width="18" height="18"><use href="#ic-sliders"/></svg>
      </button>

      <TweaksPanel open={tweaksOpen} onClose={()=>setTweaksOpen(false)} values={values} setValues={setValues}/>

      <Navigator screen={screen} setScreen={setScreen}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
