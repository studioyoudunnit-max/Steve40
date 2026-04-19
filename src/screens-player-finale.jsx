import React, { useState, useEffect } from 'react';
import { TEAMS, DEMO_PLAYERS, DEMO_TEAM_SCORES, ROOM_CODE } from './constants.js';
import { Stage, Logo, MiniLogo, Btn, Card, TeamChip, TeamDot, Confetti } from './ui-primitives.jsx';

// ─── PLAYER MOBILE ────────────────────────────────────────────────────────────

export function PlayerMobile({ mode = 'trivia' }) {
  const me = DEMO_PLAYERS[0];
  const team = TEAMS.find(t => t.id === me.team);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: 'radial-gradient(circle at 50% 30%, rgba(255,59,97,.08), transparent 60%)',
    }}>
      <div style={{
        width: 380, height: 'min(820px, calc(100% - 40px))', maxHeight: 820,
        borderRadius: 42, padding: 10,
        background: 'linear-gradient(180deg, #1a1525, #0a0a12)',
        border: '1px solid var(--border-2)',
        boxShadow: '0 40px 120px rgba(0,0,0,.6), 0 0 60px rgba(255,59,97,.15)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 26, borderRadius: 16, background: '#000', zIndex: 10,
        }} />
        <div style={{
          width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden',
          background: 'var(--bg-deep)', position: 'relative',
        }}>
          <div style={{
            padding: '14px 26px 8px', display: 'flex', justifyContent: 'space-between',
            fontSize: '.75rem', color: 'var(--text)', fontWeight: 700,
          }}>
            <span>9:41</span>
            <span className="mono" style={{ color: 'var(--muted)' }}>●●●●</span>
          </div>

          <div style={{ padding: '18px 20px 20px', height: 'calc(100% - 38px)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PlayerContent mode={mode} me={me} team={team} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerContent({ mode, me, team }) {
  const TRIVIA_QS_SAMPLE = {
    text: "What was Steve's very first concert?",
    answers: ["Spice Girls (age 8)", "Nickelback (age 13)", "Green Day (age 15)", "Shania Twain (age 11)"],
  };
  const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-4)', 'var(--accent-3)'];
  const shapes = ['ic-shape-tri', 'ic-shape-dia', 'ic-shape-circ', 'ic-shape-sq'];

  switch (mode) {
    case 'join': return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <Logo size="lg" />
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', margin: '20px 0 4px' }}>Enter the room code from the TV</p>
        <div style={{
          width: '100%', padding: '20px 16px',
          background: 'rgba(255,255,255,.04)', border: '1.5px solid var(--accent-1)',
          borderRadius: 16, textAlign: 'center',
          fontFamily: 'var(--font-display)', fontSize: '2.4rem', letterSpacing: '.35em',
          color: 'var(--accent-1)', textShadow: '0 0 16px var(--accent-1)',
        }}>
          {ROOM_CODE}
        </div>
        <Btn kind="primary" size="lg" full icon="ic-arrow-right">Join the Party</Btn>
      </div>
    );

    case 'lobby': return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MiniLogo />
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>WAITING</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 96, height: 96, margin: '0 auto 14px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${team.color}, var(--accent-1))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.6rem', fontFamily: 'var(--font-display)', color: '#fff',
            boxShadow: `0 0 40px ${team.color}`,
          }}>{me.name[0]}</div>
          <div className="display" style={{ fontSize: '1.8rem', color: 'var(--text)', lineHeight: 1.1, marginBottom: 4 }}>
            You're in, {me.name}.
          </div>
          <TeamChip team={team} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div className="mono" style={{ fontSize: '.68rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Your Team</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_PLAYERS.filter(p => p.team === team.id).map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: 'rgba(255,255,255,.03)', borderRadius: 10, fontSize: '.85rem',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#fff' }}>{p.name[0]}</div>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{p.flair}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 'auto', padding: '14px', background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.25)', borderRadius: 12, textAlign: 'center', fontSize: '.85rem', color: 'var(--accent-4)' }}>
          <svg width="14" height="14" style={{ verticalAlign: -2, marginRight: 6 }}><use href="#ic-bolt" /></svg>
          First game starts when Steve hits "go"
        </div>
      </>
    );

    case 'trivia': return (
      <>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeamChip team={team} />
          <div className="display" style={{ color: 'var(--accent-1)', fontSize: '1.3rem', textShadow: '0 0 10px var(--accent-1)' }}>07</div>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ width: '47%', height: '100%', background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))', boxShadow: '0 0 10px var(--accent-1)' }} />
        </div>
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>Q1 · Tap an answer</div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 20, color: 'var(--text)', lineHeight: 1.3, textAlign: 'center' }}>
          {TRIVIA_QS_SAMPLE.text}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
          {TRIVIA_QS_SAMPLE.answers.map((_, i) => (
            <button key={i} style={{
              background: `linear-gradient(135deg, ${colors[i]}, color-mix(in oklab, ${colors[i]} 60%, #000))`,
              border: 'none', borderRadius: 16, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 110, cursor: 'pointer',
              boxShadow: `0 6px 20px color-mix(in oklab, ${colors[i]} 40%, transparent)`,
            }}>
              <svg width="40" height="40"><use href={`#${shapes[i]}`} /></svg>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: '.72rem', color: 'var(--muted)' }}>
          Faster answers = more points
        </div>
      </>
    );

    case 'twink': return (
      <>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeamChip team={team} />
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>R3 / 10</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            width: 110, height: 110, margin: '0 auto 10px', borderRadius: '50%',
            background: 'conic-gradient(from 0deg, var(--accent-1), var(--accent-3), var(--accent-2), var(--accent-4), var(--accent-1))',
            padding: 3,
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3d4a7a, #0a0a12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.4rem', fontFamily: 'var(--font-display)', color: '#fff',
            }}>TC</div>
          </div>
          <div className="display" style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: 4 }}>Timothée Chalamet</div>
          <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Dune. Wonka. The cheekbones.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10, flex: 1 }}>
          <button style={{
            background: 'linear-gradient(135deg, #3d8eff, #c84bff)', border: 'none',
            borderRadius: 16, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(61,142,255,.3)',
          }}>
            <svg width="32" height="32"><use href="#ic-star-burst" /></svg>
            <span className="display" style={{ fontSize: '1.8rem' }}>Twink</span>
          </button>
          <button style={{
            background: 'rgba(255,60,172,.08)', border: '2px solid color-mix(in oklab, #ff3cac 50%, transparent)',
            borderRadius: 16, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            cursor: 'pointer',
          }}>
            <svg width="32" height="32" style={{ color: '#ff3cac' }}><use href="#ic-flame" /></svg>
            <span className="display" style={{ fontSize: '1.8rem' }}>Lesbian</span>
          </button>
        </div>
      </>
    );

    case 'lipsync': return (
      <>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeamChip team={team} />
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-2)', letterSpacing: 1.5, animation: 'pulse 1.2s infinite' }}>JUDGING</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Now Performing</div>
          <div className="display" style={{ fontSize: '1.5rem', color: 'var(--text)', lineHeight: 1.1 }}>Red Team</div>
          <div style={{ color: 'var(--accent-1)', fontWeight: 700, fontSize: '.85rem', marginTop: 4 }}>Padam Padam — Kylie Minogue</div>
        </div>
        <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>Rate the performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { v: 1, label: 'Meh',    c: '#6b6b8a' },
            { v: 2, label: 'Decent', c: 'var(--accent-2)' },
            { v: 3, label: 'Serving', c: 'var(--accent-4)' },
          ].map(r => (
            <button key={r.v} style={{
              padding: '18px 8px', borderRadius: 14,
              background: r.v === 3 ? `linear-gradient(135deg, ${r.c}, var(--accent-1))` : 'rgba(255,255,255,.04)',
              border: `1.5px solid ${r.v === 3 ? r.c : 'var(--border-2)'}`,
              color: 'var(--text)', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div className="display" style={{ fontSize: '1.6rem', color: r.v === 3 ? '#fff' : r.c }}>{'★'.repeat(r.v)}</div>
              <span style={{ fontSize: '.75rem', fontWeight: 700 }}>{r.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: 12, background: 'rgba(0,230,118,.08)', border: '1px solid rgba(0,230,118,.3)', borderRadius: 10, fontSize: '.78rem', color: '#00e676', textAlign: 'center' }}>
          ✓ Vote locked for this round
        </div>
        <div style={{ marginTop: 'auto', padding: 12, background: 'rgba(255,255,255,.03)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Your team score</span>
          <span className="display mono" style={{ fontSize: '1.2rem', color: 'var(--accent-1)' }}>4,280</span>
        </div>
      </>
    );

    case 'waiting': return (
      <>
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TeamChip team={team} />
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>STANDBY</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-1)', animation: 'pulse 2s ease-in-out infinite',
          }}>
            <svg width="30" height="30"><use href="#ic-bolt" /></svg>
          </div>
          <div>
            <div className="display" style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: 6 }}>Hang tight…</div>
            <div style={{ color: 'var(--muted)', fontSize: '.9rem', maxWidth: 260, lineHeight: 1.4 }}>
              Steve's queuing up the next round. Watch the TV.
            </div>
          </div>
        </div>
        <div style={{ padding: 12, background: 'rgba(255,255,255,.03)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Your rank</span>
          <span className="display mono" style={{ fontSize: '1.2rem', color: 'var(--accent-4)' }}>#2 · 4,280</span>
        </div>
      </>
    );

    default: return null;
  }
}

// ─── FINALE ───────────────────────────────────────────────────────────────────

export function FinaleScreen({ onBack }) {
  const [reveal, setReveal] = useState(false);
  const [fire, setFire] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setReveal(true); setFire(f => f + 1); }, 1200);
    return () => clearTimeout(t);
  }, []);

  const sorted = TEAMS
    .map(t => ({ ...t, score: DEMO_TEAM_SCORES[t.id] || 0 }))
    .sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const podium = sorted.slice(0, 3);

  return (
    <Stage>
      <Confetti trigger={fire} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Btn kind="ghost" size="sm" onClick={onBack} icon="ic-back">Back to Hub</Btn>
        <MiniLogo subtitle="Final Results" />
        <Btn kind="outline" size="sm" onClick={() => setFire(f => f + 1)} icon="ic-sparkle">Replay</Btn>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {!reveal ? (
          <div style={{ textAlign: 'center', animation: 'pulse 1.2s ease-in-out infinite' }}>
            <div className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--muted)' }}>Counting the votes…</div>
          </div>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'float-up .5s ease-out', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '.85rem', color: 'var(--accent-4)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>
                ★ Steve's 40th Champion ★
              </div>
              <div className="display" style={{
                fontSize: 'clamp(4rem, 12vw, 9rem)', lineHeight: 1,
                background: `linear-gradient(135deg, ${winner.color}, var(--accent-4), var(--accent-1))`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 30px ${winner.color})`,
                marginBottom: 8,
              }}>
                {winner.name.toUpperCase()}
              </div>
              <div className="display mono" style={{ fontSize: '2.4rem', color: 'var(--text)' }}>
                {winner.score.toLocaleString()} pts
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: 14, alignItems: 'end',
              width: '100%', maxWidth: 720,
            }}>
              {[1, 0, 2].map(i => {
                const p = podium[i]; if (!p) return null;
                const height = i === 0 ? 180 : i === 1 ? 130 : 110;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <TeamDot team={p} size={20} />
                    <div style={{ fontWeight: 800, color: p.color, fontSize: '1.05rem' }}>{p.name} Team</div>
                    <div className="display mono" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{p.score.toLocaleString()}</div>
                    <div style={{
                      width: '100%', height, borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
                      background: `linear-gradient(180deg, ${p.color}, color-mix(in oklab, ${p.color} 40%, #0a0a12))`,
                      boxShadow: `0 0 40px color-mix(in oklab, ${p.color} 50%, transparent), inset 0 0 40px rgba(0,0,0,.3)`,
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 14,
                      fontSize: '2rem',
                    }}>
                      {medal}
                    </div>
                  </div>
                );
              })}
            </div>

            <Btn kind="outline" size="lg" icon="ic-sparkle">
              Send highlights to everyone
            </Btn>
          </div>
        )}
      </div>
    </Stage>
  );
}
