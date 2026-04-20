import React, { useState } from 'react';
import HostApp from './HostApp.jsx';
import PlayerApp from './PlayerApp.jsx';
import { Logo, Btn } from './ui-primitives.jsx';
import { ROOM_CODE } from './constants.js';

const STORAGE_KEY = 'steave-player-v2';

// ─── Home page ────────────────────────────────────────────────────────────────

function HomePage({ onJoin, initialError }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleJoin = () => {
    if (!code.trim() || !name.trim()) return;
    onJoin(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      backgroundImage: 'var(--bg-layer)',
      backgroundAttachment: 'fixed',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <Logo size="lg" />
          <div className="mono" style={{ color: 'var(--muted)', fontSize: '.72rem', letterSpacing: 3, textTransform: 'uppercase', marginTop: 10 }}>
            Steve&rsquo;s 40th Faceoff
          </div>
        </div>

        {/* Host card */}
        <div style={{ padding: '18px 20px', background: 'rgba(255,255,255,.03)', border: '1px solid var(--border-2)', borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 2.5, textTransform: 'uppercase' }}>Running the show?</div>
          <Btn kind="outline" size="md" full onClick={() => { window.location.href = '/?host'; }} icon="ic-crown">
            I&rsquo;m the Host
          </Btn>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '.8rem', whiteSpace: 'nowrap' }}>or join as a player</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
        </div>

        {/* Join form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Room Code</div>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleJoin()}
              placeholder="Ask your host"
              maxLength={6}
              autoCapitalize="characters"
              style={{
                width: '100%', padding: '14px', letterSpacing: '0.25em',
                background: 'rgba(255,255,255,.05)', border: '1.5px solid var(--border-2)',
                borderRadius: 14, color: 'var(--text)', fontSize: '1.6rem', fontWeight: 800,
                outline: 'none', fontFamily: 'var(--font-body)', textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, 20))}
              onKeyDown={e => e.key === 'Enter' && code.trim() && handleJoin()}
              placeholder="What do people call you?"
              maxLength={20}
              autoComplete="name"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,.04)', border: '1.5px solid var(--border-2)',
                borderRadius: 14, color: 'var(--text)', fontSize: '1rem',
                outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
              }}
            />
          </div>

          {initialError && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,59,97,.1)', border: '1px solid rgba(255,59,97,.3)', borderRadius: 10, color: '#ff3b61', fontSize: '.85rem', textAlign: 'center', animation: 'float-up .3s ease-out' }}>
              {initialError}
            </div>
          )}

          <Btn kind="primary" size="lg" full onClick={handleJoin} disabled={!code.trim() || !name.trim()} icon="ic-arrow-right">
            Join the Party
          </Btn>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: '.7rem' }}>
          {window.location.host}
        </div>
      </div>
    </div>
  );
}

// ─── QR scan join (name only, code pre-filled from URL) ──────────────────────

function QuickJoinPage({ onJoin, initialError }) {
  const [name, setName] = useState('');

  const handleJoin = () => {
    if (!name.trim()) return;
    onJoin(name.trim(), null); // room code fetched live from server
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      backgroundImage: 'var(--bg-layer)',
      backgroundAttachment: 'fixed',
      padding: '24px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <Logo size="lg" />
          <div className="mono" style={{ color: 'var(--muted)', fontSize: '.72rem', letterSpacing: 3, textTransform: 'uppercase', marginTop: 10 }}>
            Steve&rsquo;s 40th Faceoff
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(0,230,118,.06)', border: '1px solid rgba(0,230,118,.25)', borderRadius: 14 }}>
          <div className="mono" style={{ fontSize: '.65rem', color: '#00e676', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>You&rsquo;re in the right place</div>
          <div style={{ color: 'var(--text-2)', fontSize: '.88rem' }}>Just enter your name to join the party</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, 20))}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="What do people call you?"
              maxLength={20}
              autoFocus
              autoComplete="name"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,.04)', border: '1.5px solid var(--border-2)',
                borderRadius: 14, color: 'var(--text)', fontSize: '1rem',
                outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
              }}
            />
          </div>

          {initialError && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,59,97,.1)', border: '1px solid rgba(255,59,97,.3)', borderRadius: 10, color: '#ff3b61', fontSize: '.85rem', textAlign: 'center', animation: 'float-up .3s ease-out' }}>
              {initialError}
            </div>
          )}

          <Btn kind="primary" size="lg" full onClick={handleJoin} disabled={!name.trim()} icon="ic-arrow-right">
            Join the Party
          </Btn>

          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ color: 'var(--dim)', fontSize: '.75rem', textDecoration: 'none' }}>
              Have a room code instead? →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Routing ──────────────────────────────────────────────────────────────────

function PlayerOrHome() {
  const params = new URLSearchParams(window.location.search);
  const isQRJoin = params.has('join'); // presence of ?join = scanned QR

  const [init, setInit] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      // Only restore session if it has both required fields (guards against old format)
      if (data?.name && data?.roomCode) return data;
      return null;
    } catch { return null; }
  });
  const [joinError, setJoinError] = useState('');

  const handleJoin = (name, roomCode) => {
    const data = { name, roomCode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setJoinError('');
    setInit(data);
  };

  const handleReset = (error = '') => {
    localStorage.removeItem(STORAGE_KEY);
    setJoinError(error);
    setInit(null);
  };

  if (init) return <PlayerApp init={init} onReset={handleReset} />;
  if (isQRJoin) return <QuickJoinPage onJoin={handleJoin} initialError={joinError} />;
  return <HomePage onJoin={handleJoin} initialError={joinError} />;
}

export default function App() {
  const isHost = new URLSearchParams(window.location.search).has('host');
  return isHost ? <HostApp /> : <PlayerOrHome />;
}
