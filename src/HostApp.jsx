import React, { useState, useEffect, useRef } from 'react';
import { play } from './sounds.js';
import { useGame } from './useGame.js';
import { TEAMS, TRIVIA_QS, CELEB_ROUNDS, LIPSYNC_SONGS } from './constants.js';
import {
  Logo, MiniLogo, Btn, Card, Stage, GameHeader,
  TimerBar, Confetti, PointsPop, TeamDot, TeamChip, TeamOrb, BeatPulse, QRPlaceholder,
} from './ui-primitives.jsx';

// ─── helpers ─────────────────────────────────────────────────────────────────

function teamScores(players) {
  return TEAMS.map(t => ({
    ...t,
    members: Object.values(players).filter(p => p.team === t.id),
    score: Object.values(players).filter(p => p.team === t.id).reduce((s, p) => s + (p.score || 0), 0),
  })).sort((a, b) => b.score - a.score);
}

// ─── Connecting splash ────────────────────────────────────────────────────────

function Connecting() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <Logo size="lg" />
      <div className="mono" style={{ color: 'var(--muted)', letterSpacing: 3, fontSize: '.8rem', animation: 'pulse 1.5s infinite' }}>
        CONNECTING TO GAME SERVER…
      </div>
    </div>
  );
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

function HostLobby({ state, send }) {
  const players = Object.values(state.players);
  const online  = players.filter(p => p.connected !== false);
  const sorted  = teamScores(state.players);
  const activeTeams = new Set(players.map(p => p.team)).size;
  const completed = state.completedGames || [];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const roomCode = state.roomCode || '????';
  const joinUrl = window.location.host;

  const games = [
    { label: 'Trivia Showdown',   sub: `${TRIVIA_QS.length} questions · speed bonus`,  color: 'var(--accent-1)', icon: 'ic-brain',   cmd: 'host_start_trivia',  key: 'trivia'  },
    { label: 'Twink or Lesbian?', sub: `${CELEB_ROUNDS.length} rounds · 500 pts each`, color: 'var(--accent-3)', icon: 'ic-rainbow', cmd: 'host_start_twink',   key: 'twink'   },
    { label: 'Lipsync Off',       sub: 'Spin → perform → judge',                       color: 'var(--accent-2)', icon: 'ic-mic',     cmd: 'host_start_lipsync', key: 'lipsync' },
    { label: 'Songpop Duel',      sub: 'Pick your team rep · IRL playoff',             color: 'var(--accent-4)', icon: 'ic-music',   cmd: 'host_start_songpop', key: 'songpop' },
  ];

  return (
    <Stage pad={false}>
      <div style={{ padding: '16px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MiniLogo subtitle="Host Hub · 40th · Faceoff" />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(0,230,118,.1)', border: '1px solid rgba(0,230,118,.3)', fontSize: '.75rem', fontWeight: 700, color: '#00e676', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            <BeatPulse color="#00e676" /> Live
          </div>
          <Btn kind="outline" size="sm" onClick={() => setSettingsOpen(true)} icon="ic-sliders">
            Players
          </Btn>
          <Btn kind="outline" size="sm" onClick={() => send({ type: 'host_finale' })} icon="ic-crown">
            Crown Champions
          </Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 16, padding: '8px 24px 20px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
          {/* JOIN PANEL */}
          <Card glow style={{ padding: 18, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
              <QRPlaceholder size={150} />
              <span className="mono" style={{ fontSize: '.64rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Scan to join</span>
            </div>
            <div>
              <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 8 }}>{joinUrl}</div>
              <div className="display" style={{
                fontSize: '4.2rem', lineHeight: 1, letterSpacing: '.15em',
                background: 'linear-gradient(135deg, var(--accent-2), var(--accent-1))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 24px color-mix(in oklab, var(--accent-2) 40%, transparent))',
                marginBottom: 6,
              }}>{roomCode}</div>
              <div style={{ color: 'var(--muted)', fontSize: '.88rem' }}>Or enter the code at the URL above.</div>
            </div>
            <div style={{ padding: '18px 22px', textAlign: 'center', background: 'color-mix(in oklab, var(--accent-1) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--accent-1) 30%, transparent)', borderRadius: 'var(--r-lg)', minWidth: 110 }}>
              <div className="display" style={{ fontSize: '2.6rem', lineHeight: 1, color: 'var(--text)' }}>{online.length}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>players<br />online</div>
              <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', marginTop: 6, letterSpacing: 1 }}>{activeTeams} / {TEAMS.length} TEAMS</div>
            </div>
          </Card>

          {/* game launch tiles */}
          <Card style={{ padding: '18px 22px', flex: 1 }}>
            <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Tonight's lineup</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {games.map((g) => {
                const done = completed.includes(g.key);
                return (
                  <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: done ? `color-mix(in oklab, ${g.color} 6%, transparent)` : `color-mix(in oklab, ${g.color} 8%, transparent)`, border: `1px solid color-mix(in oklab, ${g.color} 20%, transparent)`, borderRadius: 12, opacity: done ? 0.7 : 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklab, ${g.color} 18%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#00e676' : g.color, flexShrink: 0 }}>
                      <svg width="18" height="18"><use href={done ? '#ic-check' : `#${g.icon}`} /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '.95rem', color: done ? 'var(--muted)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {g.label}
                        {done && <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#00e676', background: 'rgba(0,230,118,.12)', padding: '2px 8px', borderRadius: 999 }}>Done</span>}
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{g.sub}</div>
                    </div>
                    <Btn kind={done ? 'ghost' : 'primary'} size="sm" onClick={() => send({ type: g.cmd })} disabled={online.length === 0} icon={done ? 'ic-arrow-right' : 'ic-play'}>
                      {done ? 'Replay' : 'Start'}
                    </Btn>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT — live player list */}
        <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" style={{ color: 'var(--muted)' }}><use href="#ic-crown" /></svg>
              <h3 className="display" style={{ fontSize: '1.1rem' }}>Standings</h3>
            </div>
            <span className="mono" style={{ fontSize: '.72rem', color: 'var(--muted)', letterSpacing: 1.5 }}>{online.length} online</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sorted.map((t, rank) => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '28px auto 1fr auto', gap: 10, alignItems: 'center', padding: '9px 13px', background: `linear-gradient(90deg, color-mix(in oklab, ${t.color} ${t.members.length > 0 ? 10 : 4}%, transparent), transparent)`, border: `1px solid color-mix(in oklab, ${t.color} ${t.members.length > 0 ? 20 : 10}%, transparent)`, borderLeft: `3px solid ${t.members.length > 0 ? t.color : 'var(--border-2)'}`, borderRadius: 11, opacity: t.members.length === 0 ? 0.5 : 1 }}>
                <div className="display" style={{ fontSize: '1rem', color: rank === 0 && t.score > 0 ? 'var(--accent-4)' : 'var(--muted)', textAlign: 'center' }}>{rank + 1}</div>
                <TeamDot team={t} size={13} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '.88rem', color: t.color }}>{t.name} Team</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 1 }}>
                    {t.members.length > 0
                      ? t.members.map((p, i) => <span key={p.id} style={{ opacity: p.connected === false ? 0.4 : 1 }}>{p.name}{i < t.members.length - 1 ? ' · ' : ''}</span>)
                      : <span style={{ fontStyle: 'italic' }}>no players</span>}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '.82rem', fontWeight: 700, color: t.score > 0 ? t.color : 'var(--dim)', textAlign: 'right' }}>
                  {t.score > 0 ? t.score.toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Settings / Player Management Modal */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border-2)', borderRadius: 22, padding: 28, width: '100%', maxWidth: 460, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h3 className="display" style={{ fontSize: '1.3rem', color: 'var(--text)' }}>Player Management</h3>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>✕</button>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '.82rem', flexShrink: 0 }}>
              {online.length} player{online.length !== 1 ? 's' : ''} online across {activeTeams} team{activeTeams !== 1 ? 's' : ''}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {online.length === 0 && (
                <div style={{ color: 'var(--muted)', fontSize: '.88rem', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>No players connected yet</div>
              )}
              {online.map(p => {
                const team = TEAMS.find(t => t.id === p.team);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: `color-mix(in oklab, ${team.color} 8%, transparent)`, border: `1px solid color-mix(in oklab, ${team.color} 22%, transparent)`, borderRadius: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{p.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '.75rem', color: team.color }}>{team.name} Team</div>
                    </div>
                    <button onClick={() => { send({ type: 'kick_player', playerId: p.id }); }} style={{
                      padding: '6px 12px', borderRadius: 8, background: 'rgba(255,59,97,.1)',
                      border: '1px solid rgba(255,59,97,.3)', color: '#ff3b61',
                      fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      transition: 'all .15s',
                    }}>
                      Kick
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Stage>
  );
}

// ─── Trivia (host) ────────────────────────────────────────────────────────────

function HostTrivia({ state, send }) {
  const { trivia } = state;
  const q = TRIVIA_QS[trivia.questionIdx];
  const players = Object.values(state.players);
  const answeredCount = Object.keys(trivia.answers).length;
  const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-4)', 'var(--accent-3)'];
  const shapes = ['ic-shape-tri', 'ic-shape-dia', 'ic-shape-circ', 'ic-shape-sq'];
  const isLast = trivia.questionIdx === TRIVIA_QS.length - 1;

  useEffect(() => {
    if (trivia.timerLeft === 3 && !trivia.revealed) play('tick');
  }, [trivia.timerLeft]);

  useEffect(() => {
    if (!trivia.revealed) return;
    const anyCorrect = Object.values(trivia.answers).some(a => a.answerIdx === q.correct);
    play(anyCorrect ? 'correct' : 'wrong');
  }, [trivia.revealed]);

  return (
    <Stage>
      <GameHeader
        title="Trivia Showdown"
        subtitle={`Question ${trivia.questionIdx + 1} of ${TRIVIA_QS.length}`}
        accent="var(--accent-1)"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 32, marginTop: 12 }}>
          <TimerBar value={trivia.timerLeft} max={15} accent="var(--accent-1)" big />
        </div>

        <Card style={{ padding: '32px 40px', marginBottom: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }} glow>
          <div style={{ position: 'absolute', top: -20, left: -20, fontSize: '10rem', fontFamily: 'var(--font-display)', color: 'var(--accent-1)', opacity: .05, lineHeight: 1 }}>
            Q{trivia.questionIdx + 1}
          </div>
          <div className="mono" style={{ fontSize: '.72rem', color: 'var(--accent-1)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
            {q.category} · {q.worth} pts
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.8rem)', lineHeight: 1.15, color: 'var(--text)' }}>
            {q.text}
          </h2>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
          {q.answers.map((a, i) => {
            const isCorrect = trivia.revealed && i === q.correct;
            const isDim = trivia.revealed && i !== q.correct;
            const voteCount = trivia.revealed
              ? Object.values(trivia.answers).filter(ans => ans.answerIdx === i).length
              : null;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '22px 26px', minHeight: 90,
                background: isCorrect
                  ? 'linear-gradient(135deg, #00e676, var(--accent-2))'
                  : `color-mix(in oklab, ${colors[i]} 14%, transparent)`,
                border: `2px solid ${isCorrect ? '#00e676' : `color-mix(in oklab, ${colors[i]} 45%, transparent)`}`,
                borderRadius: 'var(--r-lg)',
                color: isCorrect ? '#fff' : 'var(--text)',
                opacity: isDim ? .35 : 1,
                transition: 'opacity .3s, background .3s',
                boxShadow: isCorrect ? '0 0 40px #00e676' : 'none',
              }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: isCorrect ? 'rgba(255,255,255,.18)' : colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <svg width="20" height="20"><use href={`#${shapes[i]}`} /></svg>
                </div>
                <div style={{ flex: 1, fontSize: '1.1rem', fontWeight: 600 }}>{a}</div>
                {voteCount !== null && (
                  <div className="display" style={{ fontSize: '1.4rem', color: isCorrect ? '#fff' : 'var(--muted)', minWidth: 32, textAlign: 'right' }}>{voteCount}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* status bar */}
        <div style={{ marginTop: 20, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: trivia.revealed ? 'rgba(0,230,118,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${trivia.revealed ? 'rgba(0,230,118,.3)' : 'var(--border-2)'}`, borderRadius: 'var(--r-lg)', animation: trivia.revealed ? 'float-up .3s ease-out' : 'none' }}>
          {trivia.revealed ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: '.72rem', color: '#00e676', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>The Answer</div>
              <div style={{ fontSize: '1rem', color: 'var(--text)' }}>
                <strong>{q.answers[q.correct]}</strong>
                {q.fact && <span style={{ color: 'var(--text-2)' }}> — {q.fact}</span>}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, color: 'var(--muted)', fontSize: '.9rem' }}>
              <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{answeredCount}</strong> / {players.length} answered
            </div>
          )}
          {trivia.revealed
            ? <Btn kind="success" size="sm" onClick={() => send({ type: 'host_next_trivia' })} icon="ic-arrow-right">
                {isLast ? 'Back to Hub →' : 'Next Question →'}
              </Btn>
            : <Btn kind="primary" size="sm" onClick={() => send({ type: 'host_reveal_trivia' })} icon="ic-check">
                Reveal Answer
              </Btn>
          }
        </div>
      </div>
    </Stage>
  );
}

// ─── Twink or Lesbian (host) ──────────────────────────────────────────────────

function HostTwink({ state, send }) {
  const { twink } = state;
  const r = CELEB_ROUNDS[twink.roundIdx];
  const players = Object.values(state.players);
  const isLast = twink.roundIdx === CELEB_ROUNDS.length - 1;

  const totalVotes = Object.keys(twink.votes).length;
  const twinkCount  = Object.values(twink.votes).filter(v => v === 'twink').length;
  const lesbCount   = Object.values(twink.votes).filter(v => v === 'lesbian').length;
  const twinkPct = totalVotes ? (twinkCount / totalVotes) * 100 : 0;
  const lesbPct  = totalVotes ? (lesbCount / totalVotes) * 100 : 0;

  return (
    <Stage>
      <GameHeader
        title="Twink or Lesbian?"
        subtitle={`Round ${twink.roundIdx + 1} of ${CELEB_ROUNDS.length}`}
        accent="var(--accent-3)"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card glow style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'conic-gradient(from 0deg, var(--accent-1), var(--accent-3), var(--accent-2), var(--accent-4), var(--accent-1))', padding: 5 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: `linear-gradient(135deg, color-mix(in oklab, ${r.hue} 40%, #1a1530), #0a0a12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
              {r.initials}
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: '.72rem', color: 'var(--accent-3)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>The Subject</div>
            <h2 className="display" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1, color: 'var(--text)', marginBottom: 10 }}>{r.name}</h2>
            <div style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: 14 }}>{r.hint}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {r.tags.map(tag => (
                <span key={tag} style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,.05)', border: '1px solid var(--border-2)', fontSize: '.78rem', color: 'var(--muted)' }}>{tag}</span>
              ))}
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
          {[
            { key: 'twink',   label: 'Twink',   icon: 'ic-star-burst', color: '#3d8eff', grad: 'linear-gradient(135deg, #3d8eff, #c84bff)', pct: twinkPct },
            { key: 'lesbian', label: 'Lesbian', icon: 'ic-flame',      color: '#ff3cac', grad: 'linear-gradient(135deg, #ff3cac, #ff7c00)', pct: lesbPct  },
          ].map(opt => {
            const isCorrect = twink.revealed && r.answer === opt.key;
            return (
              <div key={opt.key} style={{ position: 'relative', overflow: 'hidden', padding: '30px 28px', minHeight: 180, background: isCorrect ? opt.grad : 'rgba(255,255,255,.04)', border: `2px solid ${isCorrect ? '#fff' : `color-mix(in oklab, ${opt.color} 40%, transparent)`}`, borderRadius: 'var(--r-lg)', opacity: twink.revealed && !isCorrect ? .4 : 1, transition: 'all .3s' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(90deg, color-mix(in oklab, ${opt.color} 16%, transparent) ${opt.pct}%, transparent ${opt.pct}%)`, transition: 'background .4s' }} />
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <svg width="44" height="44" style={{ color: isCorrect ? '#fff' : opt.color, filter: `drop-shadow(0 0 12px ${opt.color})` }}><use href={`#${opt.icon}`} /></svg>
                  <div className="display" style={{ fontSize: '2.4rem', lineHeight: 1 }}>{opt.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: 'var(--muted)' }}>
                    <span className="mono" style={{ color: isCorrect ? '#fff' : opt.color, fontWeight: 800 }}>{Math.round(opt.pct)}%</span>
                    <span>of the room</span>
                  </div>
                  {isCorrect && <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,.2)', fontSize: '.78rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>✓ Correct</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)' }}>
          {twink.revealed ? (
            <div style={{ flex: 1, color: 'var(--text-2)', fontSize: '.95rem' }}>
              <strong style={{ color: 'var(--accent-3)' }}>Hot take:</strong> {r.reveal}
            </div>
          ) : (
            <div style={{ flex: 1, color: 'var(--muted)', fontSize: '.9rem' }}>
              <strong style={{ color: 'var(--text)' }}>{totalVotes}</strong> / {players.length} voted
            </div>
          )}
          {twink.revealed
            ? <Btn kind="success" size="sm" onClick={() => send({ type: 'host_next_twink' })} icon="ic-arrow-right">
                {isLast ? 'Back to Hub →' : 'Next Round →'}
              </Btn>
            : <Btn kind="primary" size="sm" onClick={() => send({ type: 'host_reveal_twink' })} icon="ic-check">Reveal</Btn>
          }
        </div>
      </div>
    </Stage>
  );
}

// ─── Group Reveal animation ───────────────────────────────────────────────────

function GroupReveal({ groupA, groupB }) {
  const [phase, setPhase] = useState(0); // 0=stacked 1=scatter 2=split
  const offsets = useRef([...Array(8)].map(() => ({
    tx: (Math.random() - 0.5) * 300,
    ty: (Math.random() - 0.5) * 110,
    rot: (Math.random() - 0.5) * 38,
  }))).current;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 250);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const allIds = [...groupA, ...groupB];
  const allTeams = allIds.map(id => TEAMS.find(t => t.id === id));

  if (phase < 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 16 }}>
        <div className="mono" style={{ letterSpacing: 4, color: 'var(--muted)', fontSize: '.75rem', animation: 'pulse 0.8s ease-in-out infinite' }}>
          {phase === 0 ? 'DRAWING GROUPS…' : 'SHUFFLING…'}
        </div>
        <div style={{ position: 'relative', width: 340, height: 160 }}>
          {allTeams.map((team, i) => (
            <div key={team.id} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 58, height: 58, marginTop: -29, marginLeft: -29,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, color-mix(in oklab, ${team.color} 75%, #fff), ${team.color})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 22px color-mix(in oklab, ${team.color} 55%, transparent)`,
              transform: phase === 1
                ? `translate(${offsets[i].tx}px, ${offsets[i].ty}px) rotate(${offsets[i].rot}deg)`
                : 'translate(0,0) rotate(0deg)',
              transition: `transform ${0.35 + i * 0.07}s cubic-bezier(0.34,1.56,0.64,1)`,
              zIndex: 8 - i,
            }}>
              <svg width={30} height={30} style={{ color: 'rgba(0,0,0,0.45)' }}><use href={`#${team.icon}`} /></svg>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {[
        { label: 'Group A · Performs First', ids: groupA, color: 'var(--accent-1)', delay: '0s' },
        { label: 'Group B · Performs Second', ids: groupB, color: 'var(--accent-2)', delay: '0.18s' },
      ].map(({ label, ids, color, delay }) => (
        <Card key={label} glow style={{ padding: 22, animation: `float-up 0.5s ${delay} ease-out both` }}>
          <div className="mono" style={{ fontSize: '.68rem', color, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>{label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {ids.map(id => {
              const team = TEAMS.find(t => t.id === id);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 15px', background: `color-mix(in oklab, ${team.color} 11%, transparent)`, border: `1px solid color-mix(in oklab, ${team.color} 28%, transparent)`, borderRadius: 12 }}>
                  <TeamOrb team={team} size={38} />
                  <span style={{ fontWeight: 800, color: team.color, fontSize: '.95rem' }}>{team.name} Team</span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Lipsync wheel ───────────────────────────────────────────────────────────

const WHEEL_COLORS = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', '#ff3cac', '#3d8eff', '#00e5ff', '#c84bff'];

function SpinWheel({ songs, activeSong, onSpin }) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const landingRef = useRef(0); // tracks cumulative rotation
  const prevSongRef = useRef(null);

  useEffect(() => {
    if (!activeSong) return;
    if (activeSong.title === prevSongRef.current) return;
    prevSongRef.current = activeSong.title;
    play('spin');
    setTimeout(() => play('spinStop'), 2800);

    const n = songs.length;
    const segAngle = 360 / n;
    const idx = songs.findIndex(s => s.title === activeSong.title);
    // Land segment center at top (under the pointer)
    const segCenter = (idx + 0.5) * segAngle;
    const normalizedTarget = ((360 - segCenter) % 360 + 360) % 360;
    const currentMod = ((landingRef.current % 360) + 360) % 360;
    const diff = ((normalizedTarget - currentMod) + 360) % 360;
    const totalAdd = diff + 5 * 360;
    landingRef.current += totalAdd;
    setRotation(landingRef.current);
    setSpinning(true);
    setTimeout(() => setSpinning(false), 3600);
  }, [activeSong, songs]);

  const n = songs.length;
  const cx = 180, cy = 180, r = 172;

  const segments = songs.map((song, i) => {
    const startRad = (i * 360 / n - 90) * Math.PI / 180;
    const endRad   = ((i + 1) * 360 / n - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const midRad = ((i + 0.5) * 360 / n - 90) * Math.PI / 180;
    const tr = r * 0.63;
    const tx = cx + tr * Math.cos(midRad);
    const ty = cy + tr * Math.sin(midRad);
    const textDeg = (i + 0.5) * 360 / n;
    const label = song.title.length > 16 ? song.title.slice(0, 15) + '…' : song.title;
    return { i, label, x1, y1, x2, y2, tx, ty, textDeg, color: WHEEL_COLORS[i % WHEEL_COLORS.length] };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 360, height: 360 }}>
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: '26px solid #fff', filter: 'drop-shadow(0 0 10px var(--accent-1))', zIndex: 3 }} />
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,.15)', boxShadow: '0 0 60px rgba(255,59,97,.4)', transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }}>
          <svg width="360" height="360" viewBox="0 0 360 360">
            {segments.map(seg => (
              <g key={seg.i}>
                <path d={`M ${cx} ${cy} L ${seg.x1} ${seg.y1} A ${r} ${r} 0 0 1 ${seg.x2} ${seg.y2} Z`} fill={seg.color} stroke="rgba(0,0,0,.25)" strokeWidth="1.5" />
                <text transform={`rotate(${seg.textDeg}, ${seg.tx}, ${seg.ty})`} x={seg.tx} y={seg.ty} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="10.5" fontWeight="800" fontFamily="system-ui, sans-serif" style={{ textShadow: '0 1px 3px rgba(0,0,0,.7)' }}>{seg.label}</text>
              </g>
            ))}
            <circle cx={cx} cy={cy} r={38} fill="var(--bg-deep)" stroke="rgba(255,255,255,.15)" strokeWidth="2" />
            <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="22">🎤</text>
          </svg>
        </div>
      </div>
      <Btn kind="primary" size="lg" onClick={onSpin} disabled={spinning} icon="ic-mic">
        {activeSong ? 'Respin' : 'Spin the Wheel'}
      </Btn>
    </div>
  );
}

// ─── Lipsync (host) ───────────────────────────────────────────────────────────

const RANK_PTS = [500, 300, 100, 0];
const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

function computeLiveRanking(ranks, groupTeams) {
  const totals = {};
  groupTeams.forEach(t => { totals[t.id] = 0; });
  for (const ranking of Object.values(ranks)) {
    ranking.forEach((tid, i) => { if (totals[tid] !== undefined) totals[tid] += RANK_PTS[i] || 0; });
  }
  return [...groupTeams].sort((a, b) => totals[b.id] - totals[a.id]).map(t => ({ ...t, pts: totals[t.id] }));
}

function HostLipsync({ state, send }) {
  const { lipsync } = state;
  const { subPhase } = lipsync;
  const groupA = lipsync.groupA || [];
  const groupB = lipsync.groupB || [];
  const groupATeams = groupA.map(id => TEAMS.find(t => t.id === id)).filter(Boolean);
  const groupBTeams = groupB.map(id => TEAMS.find(t => t.id === id)).filter(Boolean);
  const allPlayers = Object.values(state.players);
  const votersForA = allPlayers.filter(p => groupB.includes(p.team));
  const votersForB = allPlayers.filter(p => groupA.includes(p.team));
  const ranksA = lipsync.ranksA || {};
  const ranksB = lipsync.ranksB || {};

  const subtitles = {
    reveal: 'Group Draw', performA: 'Round 1 · Group A Performing',
    voteA: 'Round 1 · Voting Open', resultsA: 'Round 1 · Results',
    spinB: 'Round 2 · Group B', performB: 'Round 2 · Group B Performing',
    voteB: 'Round 2 · Voting Open', resultsB: 'Round 2 · Results',
  };

  const bottomButtons = {
    performA: <Btn kind="primary" size="md" onClick={() => send({ type: 'host_lipsync_vote_a' })} icon="ic-check">Open Voting →</Btn>,
    voteA:    <Btn kind="success" size="md" onClick={() => send({ type: 'host_lipsync_results_a' })}>Show Results →</Btn>,
    resultsA: <Btn kind="primary" size="md" onClick={() => send({ type: 'host_lipsync_start_b' })} icon="ic-arrow-right">Round 2: Group B →</Btn>,
    performB: <Btn kind="primary" size="md" onClick={() => send({ type: 'host_lipsync_vote_b' })} icon="ic-check">Open Voting →</Btn>,
    voteB:    <Btn kind="success" size="md" onClick={() => send({ type: 'host_lipsync_results_b' })}>Show Results →</Btn>,
    resultsB: <Btn kind="success" size="md" onClick={() => send({ type: 'host_lipsync_finish' })} icon="ic-trophy">Finish Lipsync →</Btn>,
  };

  function VotingPanel({ ranks, voters, groupTeams, }) {
    const voted = Object.keys(ranks).length;
    const live = computeLiveRanking(ranks, groupTeams);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
        <Card style={{ padding: 22 }}>
          <div className="mono" style={{ fontSize: '.68rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Live Tally</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {live.map((team, i) => (
              <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 15px', background: `color-mix(in oklab, ${team.color} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${team.color} 25%, transparent)`, borderRadius: 12 }}>
                <span style={{ fontSize: '1.3rem' }}>{MEDALS[i]}</span>
                <TeamDot team={team} size={13} />
                <span style={{ flex: 1, fontWeight: 700, color: team.color }}>{team.name} Team</span>
                <span className="mono" style={{ color: 'var(--text-2)', fontSize: '.9rem' }}>{team.pts} pts</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: '.68rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Voters</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="display" style={{ fontSize: '3.5rem', lineHeight: 1, color: 'var(--accent-2)' }}>{voted}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>/ {voters.length}<br/>ranked</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {voters.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', color: ranks[p.id] ? 'var(--text)' : 'var(--muted)' }}>
                <svg width="10" height="10" style={{ color: ranks[p.id] ? '#00e676' : 'var(--dim)', flexShrink: 0 }}><use href={`#${ranks[p.id] ? 'ic-check' : 'ic-x'}`} /></svg>
                {p.name}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function ResultsPanel({ scores, groupTeams }) {
    const sorted = [...groupTeams].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {sorted.map((team, i) => (
          <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '20px 26px', background: i === 0 ? `linear-gradient(135deg, color-mix(in oklab, ${team.color} 22%, transparent), transparent)` : `color-mix(in oklab, ${team.color} 8%, transparent)`, border: `${i === 0 ? 2 : 1}px solid color-mix(in oklab, ${team.color} ${i === 0 ? 50 : 22}%, transparent)`, borderRadius: 16, animation: `float-up 0.4s ${i * 0.1}s ease-out both` }}>
            <span style={{ fontSize: '2rem' }}>{MEDALS[i]}</span>
            <TeamOrb team={team} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: team.color, fontSize: '1.1rem' }}>{team.name} Team</div>
            </div>
            <div className="display" style={{ fontSize: '1.8rem', color: 'var(--text)' }}>+{(scores[team.id] || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Stage>
      <GameHeader
        title="Lipsync Off"
        subtitle={subtitles[subPhase] || ''}
        accent="var(--accent-2)"
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* ── reveal: group draw animation + wheel for Group A ── */}
        {subPhase === 'reveal' && (
          <>
            <GroupReveal groupA={groupA} groupB={groupB} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
              <SpinWheel songs={LIPSYNC_SONGS} activeSong={lipsync.songA} onSpin={() => send({ type: 'host_lipsync_spin_a' })} />
              <Card glow style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 280 }}>
                {!lipsync.songA ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                    <svg width="52" height="52" style={{ color: 'var(--dim)', marginBottom: 14 }}><use href="#ic-music" /></svg>
                    <div>Spin the wheel for Group A's song</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', animation: 'float-up .4s ease-out' }}>
                    <div className="mono" style={{ fontSize: '.7rem', color: 'var(--accent-2)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Group A's Song</div>
                    <div className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.1, color: 'var(--text)', marginBottom: 8 }}>{lipsync.songA.title}</div>
                    <div style={{ color: 'var(--accent-1)', fontWeight: 700, marginBottom: 22 }}>{lipsync.songA.artist}</div>
                    <Btn kind="success" size="lg" onClick={() => send({ type: 'host_lipsync_perform_a' })} icon="ic-mic">Group A is Performing! →</Btn>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ── performA: song display + team rosters ── */}
        {subPhase === 'performA' && lipsync.songA && (
          <>
            <Card glow style={{ padding: '22px 32px', textAlign: 'center' }}>
              <div className="mono" style={{ color: 'var(--accent-2)', fontSize: '.7rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Now Performing · Group A</div>
              <div className="display" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', lineHeight: 1 }}>{lipsync.songA.title}</div>
              <div style={{ color: 'var(--accent-1)', fontWeight: 700, fontSize: '1.2rem', marginTop: 6 }}>{lipsync.songA.artist}</div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              {[{ label: '🎤 Performing', teams: groupATeams, color: 'var(--accent-1)' }, { label: '⚖️ Judging', teams: groupBTeams, color: 'var(--accent-3)' }].map(({ label, teams, color }) => (
                <Card key={label} style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: '.68rem', color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {teams.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: `color-mix(in oklab, ${t.color} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${t.color} 25%, transparent)`, borderRadius: 11 }}>
                        <TeamOrb team={t} size={36} />
                        <span style={{ fontWeight: 700, color: t.color }}>{t.name} Team</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ── voteA ── */}
        {subPhase === 'voteA' && <VotingPanel ranks={ranksA} voters={votersForA} groupTeams={groupATeams} />}

        {/* ── resultsA ── */}
        {subPhase === 'resultsA' && lipsync.scoresA && <ResultsPanel scores={lipsync.scoresA} groupTeams={groupATeams} />}

        {/* ── spinB ── */}
        {subPhase === 'spinB' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, flex: 1 }}>
            <SpinWheel songs={LIPSYNC_SONGS} activeSong={lipsync.songB} onSpin={() => send({ type: 'host_lipsync_spin_b' })} />
            <Card glow style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!lipsync.songB ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <svg width="52" height="52" style={{ color: 'var(--dim)', marginBottom: 14 }}><use href="#ic-music" /></svg>
                  <div>Spin the wheel for Group B's song</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', animation: 'float-up .4s ease-out' }}>
                  <div className="mono" style={{ fontSize: '.7rem', color: 'var(--accent-2)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Group B's Song</div>
                  <div className="display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.1, color: 'var(--text)', marginBottom: 8 }}>{lipsync.songB.title}</div>
                  <div style={{ color: 'var(--accent-1)', fontWeight: 700, marginBottom: 22 }}>{lipsync.songB.artist}</div>
                  <Btn kind="success" size="lg" onClick={() => send({ type: 'host_lipsync_perform_b' })} icon="ic-mic">Group B is Performing! →</Btn>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── performB ── */}
        {subPhase === 'performB' && lipsync.songB && (
          <>
            <Card glow style={{ padding: '22px 32px', textAlign: 'center' }}>
              <div className="mono" style={{ color: 'var(--accent-2)', fontSize: '.7rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Now Performing · Group B</div>
              <div className="display" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', lineHeight: 1 }}>{lipsync.songB.title}</div>
              <div style={{ color: 'var(--accent-1)', fontWeight: 700, fontSize: '1.2rem', marginTop: 6 }}>{lipsync.songB.artist}</div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              {[{ label: '⚖️ Judging', teams: groupATeams, color: 'var(--accent-3)' }, { label: '🎤 Performing', teams: groupBTeams, color: 'var(--accent-1)' }].map(({ label, teams, color }) => (
                <Card key={label} style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: '.68rem', color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {teams.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: `color-mix(in oklab, ${t.color} 10%, transparent)`, border: `1px solid color-mix(in oklab, ${t.color} 25%, transparent)`, borderRadius: 11 }}>
                        <TeamOrb team={t} size={36} />
                        <span style={{ fontWeight: 700, color: t.color }}>{t.name} Team</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ── voteB ── */}
        {subPhase === 'voteB' && <VotingPanel ranks={ranksB} voters={votersForB} groupTeams={groupBTeams} />}

        {/* ── resultsB ── */}
        {subPhase === 'resultsB' && lipsync.scoresB && <ResultsPanel scores={lipsync.scoresB} groupTeams={groupBTeams} />}

        {/* ── bottom action bar ── */}
        {bottomButtons[subPhase] && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--border-2)', flexShrink: 0 }}>
            {bottomButtons[subPhase]}
          </div>
        )}

      </div>
    </Stage>
  );
}

// ─── Songpop (host) ───────────────────────────────────────────────────────────

const SONGPOP_PRIZES = { 1: 10000, 2: 7000, 3: 4500, 4: 2500, 5: 1200, 6: 600, 7: 200, 8: 0 };
const PLACE_LABELS = ['', '🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th', '7th', '8th'];

function HostSongpop({ state, send }) {
  const { songpop } = state;
  const players = Object.values(state.players);
  // local placement state — host assigns 1st-8th to each team
  const [placements, setPlacements] = useState({}); // teamId -> place number

  const assignPlace = (teamId, place) => {
    setPlacements(prev => {
      const next = { ...prev };
      // clear any other team that had this place
      for (const [tid, p] of Object.entries(next)) {
        if (p === place && tid !== teamId) delete next[tid];
      }
      // toggle off if already assigned
      if (next[teamId] === place) delete next[teamId];
      else next[teamId] = place;
      return next;
    });
  };

  const allPlaced = TEAMS.every(t => placements[t.id] !== undefined);
  const uniquePlaces = new Set(Object.values(placements)).size === TEAMS.length;
  const canAward = allPlaced && uniquePlaces;

  // Phase 1: picking reps
  if (!songpop.locked) {
    return (
      <Stage>
        <GameHeader
          title="Songpop Duel"
          subtitle="Players pick their team champion on their phones"
          accent="var(--accent-4)"
        />
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 14, background: 'color-mix(in oklab, var(--accent-4) 8%, var(--card))' }}>
            <svg width="20" height="20" style={{ color: 'var(--accent-4)', flexShrink: 0 }}><use href="#ic-info" /></svg>
            <div style={{ fontSize: '.9rem', color: 'var(--text-2)' }}>
              <strong style={{ color: 'var(--accent-4)' }}>IRL tournament.</strong> Each team votes for their rep on their phone. Lock them in, run the Songpop bracket, then come back to award places.
            </div>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, flex: 1 }}>
            {TEAMS.map(team => {
              const teamPlayers = players.filter(p => p.team === team.id);
              const repId = songpop.reps[team.id];
              const rep = teamPlayers.find(p => p.id === repId);
              return (
                <Card key={team.id} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <TeamDot team={team} size={14} />
                    <div style={{ fontWeight: 800, color: team.color, fontSize: '.9rem' }}>{team.name} Team</div>
                  </div>
                  <div style={{ padding: '14px 12px', background: `color-mix(in oklab, ${team.color} 14%, transparent)`, border: `1px solid color-mix(in oklab, ${team.color} 30%, transparent)`, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, margin: '0 auto 8px', borderRadius: '50%', background: `linear-gradient(135deg, ${team.color}, var(--accent-1))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: '#fff', boxShadow: `0 0 16px ${team.color}` }}>
                      {rep ? rep.name[0] : '?'}
                    </div>
                    <div className="display" style={{ fontSize: '1rem', color: rep ? 'var(--text)' : 'var(--muted)' }}>{rep ? rep.name : 'Choosing…'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {teamPlayers.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px', background: repId === p.id ? `color-mix(in oklab, ${team.color} 16%, transparent)` : 'rgba(255,255,255,.02)', border: `1px solid ${repId === p.id ? team.color : 'var(--border-2)'}`, borderRadius: 9, fontSize: '.8rem', color: 'var(--text)' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{p.name[0]}</div>
                        <span style={{ flex: 1 }}>{p.name}</span>
                        {repId === p.id && <svg width="12" height="12" style={{ color: team.color }}><use href="#ic-check" /></svg>}
                      </div>
                    ))}
                    {teamPlayers.length === 0 && <div style={{ color: 'var(--muted)', fontSize: '.75rem', fontStyle: 'italic', padding: '4px 9px' }}>No players yet</div>}
                  </div>
                </Card>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--border-2)', flexShrink: 0 }}>
            <Btn kind="primary" size="md" onClick={() => send({ type: 'host_songpop_lock' })} icon="ic-check">Lock Champions</Btn>
          </div>
        </div>
      </Stage>
    );
  }

  // Phase 2: placing teams (after IRL tournament)
  if (!songpop.awarded) {
    return (
      <Stage>
        <GameHeader
          title="Songpop Duel · Award Points"
          subtitle="Assign each team their finish position, then award"
          accent="var(--accent-4)"
        />
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'color-mix(in oklab, var(--accent-4) 8%, var(--card))' }}>
            <svg width="18" height="18" style={{ color: 'var(--accent-4)' }}><use href="#ic-info" /></svg>
            <div style={{ fontSize: '.88rem', color: 'var(--text-2)' }}>
              IRL tournament done — tap the place buttons to assign each team's finish. 1st = 10,000 pts · 2nd = 7,000 · 3rd = 4,500 · 4th = 2,500 · 5th = 1,200 · 6th = 600 · 7th = 200 · 8th = 0
            </div>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflowY: 'auto' }}>
            {TEAMS.map(team => {
              const assigned = placements[team.id];
              return (
                <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', background: assigned ? `color-mix(in oklab, ${team.color} 12%, transparent)` : 'rgba(255,255,255,.03)', border: `1.5px solid ${assigned ? team.color : 'var(--border-2)'}`, borderRadius: 14, transition: 'all .2s' }}>
                  <TeamOrb team={team} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: team.color }}>{team.name} Team</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                      {assigned ? `${PLACE_LABELS[assigned]} · +${SONGPOP_PRIZES[assigned].toLocaleString()} pts` : 'No place assigned yet'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 340 }}>
                    {[1,2,3,4,5,6,7,8].map(place => {
                      const taken = Object.entries(placements).find(([tid, p]) => p === place && tid !== team.id);
                      const isAssigned = placements[team.id] === place;
                      return (
                        <button key={place} onClick={() => assignPlace(team.id, place)} style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                          background: isAssigned ? team.color : taken ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)',
                          border: `1.5px solid ${isAssigned ? team.color : taken ? 'var(--border-2)' : 'rgba(255,255,255,.15)'}`,
                          color: isAssigned ? '#fff' : taken ? 'var(--dim)' : 'var(--text-2)',
                          opacity: taken && !isAssigned ? 0.35 : 1,
                          transition: 'all .15s',
                        }}>
                          {place}{['st','nd','rd','th','th','th','th','th'][place-1]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--border-2)', flexShrink: 0 }}>
            <Btn kind="success" size="md" disabled={!canAward}
              onClick={() => send({ type: 'host_songpop_award', placements })}
              icon="ic-trophy">
              Award Points
            </Btn>
          </div>
        </div>
      </Stage>
    );
  }

  // Phase 3: results after awarding
  const sortedResults = TEAMS
    .map(t => ({ ...t, place: songpop.placements[t.id] || 9, prize: SONGPOP_PRIZES[songpop.placements[t.id]] || 0 }))
    .sort((a, b) => a.place - b.place);

  return (
    <Stage>
      <GameHeader
        title="Songpop Duel · Results"
        subtitle="Points awarded — back to hub when ready"
        accent="var(--accent-4)"
      />
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedResults.map((team, i) => (
          <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', background: i === 0 ? `linear-gradient(135deg, color-mix(in oklab, ${team.color} 22%, transparent), transparent)` : `color-mix(in oklab, ${team.color} 8%, transparent)`, border: `${i < 3 ? 2 : 1}px solid color-mix(in oklab, ${team.color} ${i === 0 ? 55 : 22}%, transparent)`, borderRadius: 16, animation: `float-up 0.35s ${i * 0.06}s ease-out both` }}>
            <div style={{ fontSize: i < 3 ? '2rem' : '1.3rem', minWidth: 36, textAlign: 'center' }}>{PLACE_LABELS[team.place]}</div>
            <TeamOrb team={team} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: team.color, fontSize: '1rem' }}>{team.name} Team</div>
            </div>
            <div className="display" style={{ fontSize: '1.6rem', color: team.prize > 0 ? 'var(--text)' : 'var(--dim)' }}>
              {team.prize > 0 ? `+${team.prize.toLocaleString()}` : '—'}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 0 0', borderTop: '1px solid var(--border-2)', flexShrink: 0 }}>
          <Btn kind="success" size="md" onClick={() => send({ type: 'host_songpop_finish' })} icon="ic-arrow-right">Back to Hub →</Btn>
        </div>
      </div>
    </Stage>
  );
}

// ─── Finale (host) ────────────────────────────────────────────────────────────

// Podium layout L→R: 8th → 1st (ascending staircase)
const PODIUM_ORDER = [7, 6, 5, 4, 3, 2, 1, 0];
// Bar heights per column L→R — ascending staircase
const PODIUM_HEIGHTS = [48, 72, 98, 126, 157, 191, 228, 270];
// Reveal left to right: col 0 (8th) first, col 7 (1st) last
const PODIUM_REVEAL_SEQ = [0, 1, 2, 3, 4, 5, 6, 7];

function HostFinale({ state, send }) {
  const [confetti, setConfetti] = useState(0);
  const prevStep = useRef(0);
  const revealStep = state.revealStep || 0;
  const sorted = teamScores(state.players);
  const winner = sorted[0];
  const showWinner = revealStep >= 8;

  useEffect(() => {
    if (revealStep > prevStep.current) {
      if (revealStep === 8) {
        setConfetti(c => c + 1);
        setTimeout(() => setConfetti(c => c + 1), 250);
        setTimeout(() => setConfetti(c => c + 1), 500);
        setTimeout(() => setConfetti(c => c + 1), 850);
      } else {
        setConfetti(c => c + 1);
      }
      prevStep.current = revealStep;
    }
  }, [revealStep]);

  const revealedCols = new Set(PODIUM_REVEAL_SEQ.slice(0, revealStep));

  const revealLabel = revealStep === 0 ? 'Reveal 8th Place'
    : revealStep < 7 ? `Reveal #${8 - revealStep}`
    : revealStep === 7 ? 'Reveal the Winner! 🏆'
    : '🎉 Champions Crowned!';

  return (
    <Stage>
      <Confetti trigger={confetti} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexShrink: 0 }}>
        <MiniLogo subtitle="Final Results" />
        <Btn kind="ghost" size="sm" onClick={() => send({ type: 'host_reset' })}>New Game</Btn>
      </div>

      {/* Winner banner — slides in from top when 1st is revealed */}
      <div style={{ overflow: 'hidden', maxHeight: showWinner ? 110 : 0, opacity: showWinner ? 1 : 0, transition: 'max-height .7s cubic-bezier(.34,1.4,.64,1), opacity .4s ease', flexShrink: 0, marginBottom: showWinner ? 6 : 0 }}>
        {winner && (
          <div style={{ textAlign: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
            <div className="mono" style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 2 }}>★ Steve's 40th Champion ★</div>
            <div className="display" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: .95, fontWeight: 900, color: winner.color, animation: showWinner ? 'winner-pulse 1.5s ease-in-out infinite' : 'none' }}>
              {winner.name.toUpperCase()}
            </div>
            <div className="mono" style={{ fontSize: '.9rem', color: winner.color, opacity: .85, marginTop: 2 }}>{winner.score.toLocaleString()} pts</div>
          </div>
        )}
      </div>

      {/* Podium */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, padding: '0 8px', minHeight: 0 }}>
        {PODIUM_ORDER.map((sortedIdx, colIdx) => {
          const team = sorted[sortedIdx];
          if (!team) return null;
          const place = sortedIdx + 1;
          const barH = PODIUM_HEIGHTS[colIdx];
          const revealed = revealedCols.has(colIdx);
          const placeBorderColor = place === 1 ? 'var(--accent-4)' : place === 2 ? '#c0c0c0' : place === 3 ? '#cd7f32' : 'rgba(255,255,255,.15)';
          const placeColor = place === 1 ? 'var(--accent-4)' : place === 2 ? '#d4d4d4' : place === 3 ? '#d4954a' : 'rgba(255,255,255,.75)';
          return (
            <div key={team.id} style={{ flex: 1, maxWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity .45s .1s ease, transform .45s .1s ease' }}>
              {/* Big callout card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: '100%', padding: '0 4px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.6rem', fontWeight: 900, padding: '1px 7px', borderRadius: 99, background: place === 1 ? 'rgba(255,214,0,.15)' : 'rgba(0,0,0,.5)', border: `1.5px solid ${placeBorderColor}`, color: placeColor, letterSpacing: '.04em', marginBottom: 2 }}>
                  #{place}
                </div>
                <TeamDot team={team} size={30} />
                <div className="display" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.8rem)', fontWeight: 900, color: team.color, lineHeight: .95, letterSpacing: '-.01em', filter: `drop-shadow(0 0 12px ${team.color}88)` }}>
                  {team.name.toUpperCase()}
                </div>
                <div className="mono" style={{ fontSize: 'clamp(.6rem, 1.1vw, .85rem)', color: team.color, opacity: .85 }}>
                  {team.score.toLocaleString()} pts
                </div>
                <div style={{ fontSize: 'clamp(.52rem, .9vw, .7rem)', color: 'var(--text-2)', lineHeight: 1.5, opacity: .75 }}>
                  {team.members.map((p, i) => <span key={i} style={{ display: 'block' }}>{p.name}</span>)}
                </div>
              </div>
              {/* Bar */}
              <div style={{ width: '100%', height: barH, borderRadius: '8px 8px 0 0', flexShrink: 0, background: `linear-gradient(180deg, ${team.color}, color-mix(in oklab, ${team.color} 55%, #0a0812))`, boxShadow: `0 0 20px color-mix(in oklab, ${team.color} 40%, transparent)`, transform: revealed ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'bottom center', transition: 'transform .65s cubic-bezier(.34,1.5,.64,1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.2) 0%, transparent 45%)', pointerEvents: 'none' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground line */}
      <div style={{ height: 3, margin: '0 12px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent)', borderRadius: 2, flexShrink: 0 }} />

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, padding: '12px 0 18px', flexShrink: 0 }}>
        <Btn kind="primary" size="lg" disabled={revealStep >= 8} onClick={() => send({ type: 'host_reveal_next' })}>
          {revealLabel}
        </Btn>
      </div>
    </Stage>
  );
}

// ─── Live standings sidebar (used during games) ───────────────────────────────

function StandingsBar({ state }) {
  const sorted = teamScores(state.players);
  return (
    <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 500, width: 210, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {sorted.map((t, rank) => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'rgba(10,8,18,.85)', backdropFilter: 'blur(12px)', border: `1px solid color-mix(in oklab, ${t.color} ${t.members.length > 0 ? 30 : 12}%, transparent)`, borderRadius: 9, fontSize: '.75rem', opacity: t.members.length === 0 ? 0.45 : 1 }}>
          <span style={{ color: 'var(--muted)', minWidth: 14, textAlign: 'center', fontSize: '.7rem' }}>{rank + 1}</span>
          <TeamDot team={t} size={9} />
          <span style={{ flex: 1, color: t.color, fontWeight: 700 }}>{t.name}</span>
          <span className="mono" style={{ color: 'var(--text-2)', fontSize: '.72rem' }}>{t.score > 0 ? t.score.toLocaleString() : '—'}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HostApp ──────────────────────────────────────────────────────────────────

export default function HostApp() {
  const { gameState, connected, send } = useGame(true);

  if (!connected || !gameState) return <Connecting />;

  const phase = gameState.phase;
  const showStandings = !['lobby', 'finale'].includes(phase);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {showStandings && <StandingsBar state={gameState} />}
        {phase === 'lobby'    && <HostLobby   state={gameState} send={send} />}
        {phase === 'trivia'   && <HostTrivia   state={gameState} send={send} />}
        {phase === 'twink'    && <HostTwink    state={gameState} send={send} />}
        {phase === 'lipsync'  && <HostLipsync  state={gameState} send={send} />}
        {phase === 'songpop'  && <HostSongpop  state={gameState} send={send} />}
        {phase === 'finale'   && <HostFinale   state={gameState} send={send} />}
      </div>
    </div>
  );
}
