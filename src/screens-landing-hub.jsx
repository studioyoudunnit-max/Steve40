import React, { useState } from 'react';
import { TEAMS, DEMO_PLAYERS, DEMO_TEAM_SCORES, ROOM_CODE, JOIN_URL } from './constants.js';
import { Stage, MiniLogo, Logo, Btn, Card, TeamDot, BeatPulse, QRPlaceholder, Sparks } from './ui-primitives.jsx';

export function LandingScreen({ onHost, onJoin }) {
  const [code, setCode] = useState('');
  return (
    <Stage style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingBottom: 40, overflowY: 'auto' }}>
      <Sparks />
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center', animation: 'float-up .6s ease-out', margin: 'auto 0' }}>
        <div style={{ marginBottom: 30 }}>
          <div className="mono" style={{ fontSize: '.72rem', color: 'var(--muted)', letterSpacing: 4, marginBottom: 14, textTransform: 'uppercase' }}>
            ✦ Saturday · Live from the living room ✦
          </div>
          <Logo size="xl" />
        </div>

        <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', marginBottom: 32, lineHeight: 1.55, maxWidth: 420, marginInline: 'auto' }}>
          Happy 40th, Steve. A night of trivia, lipsync off's, and light gossip.
          <br />
          <span style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Eight teams. Four games. One champion.</span>
        </p>

        <Btn kind="primary" size="lg" full onClick={onHost} icon="ic-crown" style={{ marginBottom: 16 }}>
          Host a Game Night
        </Btn>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0', color: 'var(--dim)', fontSize: '.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
          or join the fun
          <div style={{ flex: 1, height: 1, background: 'var(--border-2)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER GAME CODE"
            maxLength={6}
            className="display"
            style={{
              width: '100%', padding: '18px 22px',
              background: 'rgba(255,255,255,.04)',
              border: '1.5px solid var(--border-2)',
              borderRadius: 16, color: 'var(--text)',
              textAlign: 'center', letterSpacing: '.4em',
              fontSize: '1.5rem', outline: 'none',
            }}
          />
          <Btn kind="outline" size="lg" full onClick={() => onJoin(code)} icon="ic-users">
            Join Game
          </Btn>
        </div>

        <div style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '.8rem' }}>
          <svg width="14" height="14" style={{ color: 'var(--accent-1)' }}><use href="#ic-cake" /></svg>
          <span className="mono" style={{ letterSpacing: 1 }}>APR 18 · 7PM · BRING A PLUS ONE</span>
        </div>
      </div>
    </Stage>
  );
}

export function HostHub({ onGame, onEndGame }) {
  const sortedTeams = TEAMS
    .map(t => ({ ...t, players: DEMO_PLAYERS.filter(p => p.team === t.id), score: DEMO_TEAM_SCORES[t.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const totalPlayers = DEMO_PLAYERS.length;
  const activeTeams = new Set(DEMO_PLAYERS.map(p => p.team)).size;

  const games = [
    { id: 'trivia',  title: 'Trivia Showdown',   sub: 'Steve facts · speed bonus', icon: 'ic-brain',   color: 'var(--accent-1)', q: '10 questions' },
    { id: 'twink',   title: 'Twink or Lesbian?', sub: 'Gut-check. Vote fast.',     icon: 'ic-rainbow', color: 'var(--accent-3)', q: '10 rounds' },
    { id: 'lipsync', title: 'Lipsync Off',        sub: 'Spin → perform → judge',   icon: 'ic-mic',     color: 'var(--accent-2)', q: '2 rounds' },
    { id: 'songpop', title: 'Songpop Duel',       sub: 'Pick your team rep',       icon: 'ic-music',   color: 'var(--accent-4)', q: 'IRL playoff' },
  ];

  return (
    <Stage pad={false}>
      <div style={{ padding: '16px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MiniLogo subtitle="Host Hub · 40th · Faceoff" />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(0,230,118,.1)', border: '1px solid rgba(0,230,118,.3)', fontSize: '.75rem', fontWeight: 700, color: '#00e676', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            <BeatPulse color="#00e676" /> Live
          </div>
          <Btn kind="danger" size="sm" onClick={onEndGame} icon="ic-trophy">End & Reveal</Btn>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
        gap: 16, padding: '8px 24px 20px', flex: 1, minHeight: 0, overflow: 'hidden',
      }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          {/* JOIN PANEL */}
          <Card glow style={{ padding: 18, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <QRPlaceholder size={150} />
              <span className="mono" style={{ fontSize: '.64rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Scan to join</span>
            </div>
            <div>
              <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8 }}>
                {JOIN_URL}
              </div>
              <div className="display" style={{
                fontSize: '4.2rem', lineHeight: 1, letterSpacing: '.15em',
                background: 'linear-gradient(135deg, var(--accent-2), var(--accent-1))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 24px color-mix(in oklab, var(--accent-2) 40%, transparent))',
                marginBottom: 6,
              }}>
                {ROOM_CODE}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Or enter the code at the URL above.</div>
            </div>
            <div style={{
              padding: '18px 22px', textAlign: 'center',
              background: 'color-mix(in oklab, var(--accent-1) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--accent-1) 30%, transparent)',
              borderRadius: 'var(--r-lg)', minWidth: 110,
            }}>
              <div className="display" style={{ fontSize: '2.6rem', lineHeight: 1, color: 'var(--text)' }}>{totalPlayers}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>
                players<br />online
              </div>
              <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', marginTop: 6, letterSpacing: 1 }}>
                {activeTeams} / 8 TEAMS
              </div>
            </div>
          </Card>

          {/* GAMES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
            {games.map((g, i) => (
              <Card
                key={g.id}
                accent={g.color}
                onClick={() => onGame(g.id)}
                style={{
                  padding: '20px 22px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  justifyContent: 'center',
                  transition: 'transform .2s, box-shadow .2s, border-color .2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `color-mix(in oklab, ${g.color} 18%, transparent)`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: g.color,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${g.color} 40%, transparent)`,
                  }}>
                    <svg width="22" height="22"><use href={`#${g.icon}`} /></svg>
                  </div>
                  <span className="mono" style={{ fontSize: '.68rem', color: 'var(--dim)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Game {i + 1} · {g.q}</span>
                </div>
                <h3 className="display" style={{ fontSize: '1.3rem', lineHeight: 1, marginBottom: 5, color: 'var(--text)' }}>{g.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: 10 }}>{g.sub}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.82rem', fontWeight: 700, color: g.color }}>
                  <svg width="13" height="13"><use href="#ic-play" /></svg> Launch
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT — Live Standings */}
        <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" style={{ color: 'var(--muted)' }}><use href="#ic-users" /></svg>
              <h3 className="display" style={{ fontSize: '1.1rem' }}>Live Standings</h3>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(255,59,97,.12)', border: '1px solid rgba(255,59,97,.3)', fontSize: '.68rem', color: '#ff3b61', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, background: '#ff3b61', borderRadius: '50%', animation: 'pulse 1.2s infinite' }} />
              Live
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sortedTeams.map((t, rank) => (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '28px auto 1fr auto', gap: 12, alignItems: 'center',
                padding: '10px 14px',
                background: `linear-gradient(90deg, color-mix(in oklab, ${t.color} 10%, transparent), transparent)`,
                border: `1px solid color-mix(in oklab, ${t.color} 20%, transparent)`,
                borderLeft: `3px solid ${t.color}`,
                borderRadius: 12,
              }}>
                <div className="display" style={{
                  fontSize: rank === 0 ? '1.3rem' : '1.1rem',
                  color: rank === 0 ? 'var(--accent-4)' : 'var(--muted)',
                  textShadow: rank === 0 ? '0 0 12px var(--accent-4)' : 'none',
                  textAlign: 'center',
                }}>
                  {rank === 0 ? '★' : rank + 1}
                </div>
                <TeamDot team={t} size={16} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '.95rem', color: t.color, letterSpacing: '.02em' }}>{t.name} Team</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: '.72rem', color: 'var(--muted)', marginTop: 2 }}>
                    {t.players.length === 0
                      ? <span style={{ opacity: .4, fontStyle: 'italic' }}>Empty — waiting</span>
                      : t.players.map(p => <span key={p.id}>{p.name}</span>).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={'d' + i} style={{ opacity: .3 }}>·</span>, el], [])
                    }
                  </div>
                </div>
                <div className="display mono" style={{ fontSize: '1.25rem', color: 'var(--text)' }}>
                  {t.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Stage>
  );
}
