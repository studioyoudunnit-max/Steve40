import React, { useState, useEffect, useRef, useCallback } from 'react';
import { play } from './sounds.js';
import { useGame, getSessionId } from './useGame.js';
import { TEAMS, TRIVIA_QS, CELEB_ROUNDS, LIPSYNC_SONGS, SONGPOP_CATEGORIES } from './constants.js';
import { Logo, MiniLogo, Btn, Card, TeamChip, TeamDot, TeamOrb } from './ui-primitives.jsx';

// ─── Full-screen mobile wrapper (replaces Phone) ──────────────────────────────

function Screen({ children, style, teamColor }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-deep)',
      backgroundImage: teamColor
        ? `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${teamColor} 20%, transparent) 0%, transparent 65%), var(--bg-layer)`
        : 'var(--bg-layer)',
      backgroundAttachment: 'fixed',
      ...style,
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 'max(16px, env(safe-area-inset-top)) 20px calc(28px + env(safe-area-inset-bottom))',
        maxWidth: 520,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Team Reveal slot-machine animation ───────────────────────────────────────

function TeamRevealScreen({ assignedTeam, playerName, onDone }) {
  const [displayIdx, setDisplayIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const stateRef = useRef({ idx: 0, phase: 'fast', delay: 90, timer: null });
  const assignedRef = useRef(assignedTeam);

  // Keep ref current
  useEffect(() => { assignedRef.current = assignedTeam; }, [assignedTeam]);

  useEffect(() => {
    const s = stateRef.current;

    const schedule = () => {
      s.timer = setTimeout(() => {
        s.idx = (s.idx + 1) % TEAMS.length;
        setDisplayIdx(s.idx);

        if (s.phase === 'landing') {
          const team = assignedRef.current;
          if (team) {
            const target = TEAMS.findIndex(t => t.id === team);
            if (s.idx === target) {
              s.phase = 'done';
              setTimeout(() => setRevealed(true), 80);
              setTimeout(onDone, 2800);
              return; // stop scheduling
            }
          }
          s.delay = Math.min(s.delay * 1.28, 600);
        }

        schedule();
      }, s.delay);
    };

    schedule();

    // Switch to landing after 1.4 seconds
    const landTimer = setTimeout(() => {
      if (s.phase === 'fast') {
        s.phase = 'landing';
        s.delay = 120;
      }
    }, 1400);

    return () => {
      clearTimeout(s.timer);
      clearTimeout(landTimer);
    };
  }, [onDone]);

  const team = TEAMS[displayIdx];

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      backgroundImage: 'var(--bg-layer)',
      gap: 28,
      padding: '40px 24px',
    }}>
      <MiniLogo />

      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: '.72rem', color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 28 }}>
          {revealed ? `Welcome, ${playerName}!` : 'Assigning your team…'}
        </div>

        {/* Team orb */}
        <div style={{
          width: 150, height: 150, borderRadius: '50%', margin: '0 auto 20px',
          background: `radial-gradient(circle at 35% 35%, color-mix(in oklab, ${team.color} 65%, #fff), ${team.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${revealed ? '80px' : '36px'} color-mix(in oklab, ${team.color} ${revealed ? '65' : '45'}%, transparent)`,
          transition: revealed ? 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)' : 'background 0.08s, box-shadow 0.08s',
          transform: revealed ? 'scale(1.12)' : 'scale(1)',
        }}>
          <svg width={78} height={78} style={{ color: 'rgba(0,0,0,0.4)' }}>
            <use href={`#${team.icon}`} />
          </svg>
        </div>

        <div className="display" style={{
          fontSize: revealed ? '3rem' : '1.9rem',
          color: team.color,
          lineHeight: 1,
          marginBottom: 10,
          transition: revealed ? 'all 0.4s ease-out' : 'color 0.08s, font-size 0.08s',
          textShadow: revealed ? `0 0 40px ${team.color}` : 'none',
        }}>
          {team.name}
        </div>

        {revealed && (
          <div style={{ color: 'var(--text-2)', fontSize: '1rem', animation: 'float-up 0.5s ease-out', marginTop: 6 }}>
            You&rsquo;re on the {team.name} Team! 🎉
          </div>
        )}
      </div>

      {!revealed && (
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--dim)', letterSpacing: 2, animation: 'pulse 1s ease-in-out infinite' }}>
          {assignedTeam ? 'LANDING…' : 'SPINNING…'}
        </div>
      )}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function useTeamStandings(state) {
  return TEAMS.map(t => ({
    ...t,
    score: Object.values(state.players || {})
      .filter(p => p.team === t.id)
      .reduce((s, p) => s + (p.score || 0), 0),
  })).sort((a, b) => b.score - a.score);
}

// ─── Lobby ────────────────────────────────────────────────────────────────────

function LobbyScreen({ me, state }) {
  const team = TEAMS.find(t => t.id === me.team);
  const teamMates = Object.values(state.players).filter(p => p.team === me.team);
  const standings = useTeamStandings(state);
  const hasScores = standings.some(t => t.score > 0);

  return (
    <Screen teamColor={team?.color}>
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MiniLogo />
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>WAITING</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ width: 70, height: 70, margin: '0 auto 12px', borderRadius: '50%', background: `linear-gradient(135deg, ${team.color}, var(--accent-1))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#fff', boxShadow: `0 0 30px ${team.color}` }}>
          {me.name[0]}
        </div>
        <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>
          You&rsquo;re in, {me.name}.
        </div>
        <TeamChip team={team} />
      </div>

      <div className="mono" style={{ fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
        Your team ({teamMates.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
        {teamMates.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 11px', background: 'rgba(255,255,255,.03)', borderRadius: 10, fontSize: '.82rem' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#fff' }}>{p.name[0]}</div>
            <span style={{ flex: 1, color: 'var(--text)' }}>{p.name}</span>
          </div>
        ))}
      </div>

      {hasScores && (
        <>
          <div className="mono" style={{ fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Standings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {standings.filter(t => t.score > 0 || t.id === me.team).map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: t.id === me.team ? `color-mix(in oklab, ${t.color} 14%, transparent)` : 'rgba(255,255,255,.02)', border: `1px solid ${t.id === me.team ? `color-mix(in oklab, ${t.color} 35%, transparent)` : 'var(--border-2)'}`, borderRadius: 9 }}>
                <span style={{ fontSize: '.7rem', color: i === 0 ? 'var(--accent-4)' : 'var(--muted)', minWidth: 16, textAlign: 'center', fontWeight: 700 }}>{i + 1}</span>
                <TeamDot team={t} size={8} />
                <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 700, color: t.id === me.team ? t.color : 'var(--text-2)' }}>{t.name}</span>
                <span className="mono" style={{ fontSize: '.72rem', color: t.id === me.team ? t.color : 'var(--muted)' }}>{t.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 'auto', padding: 12, background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.25)', borderRadius: 12, textAlign: 'center', fontSize: '.82rem', color: 'var(--accent-4)' }}>
        <svg width="13" height="13" style={{ verticalAlign: -2, marginRight: 5 }}><use href="#ic-bolt" /></svg>
        Game starts when the host hits go
      </div>
    </Screen>
  );
}

// ─── Drink overlay ────────────────────────────────────────────────────────────

function DrinkOverlay({ onDismiss }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'radial-gradient(ellipse at 50% 40%, #1a0030 0%, #08000f 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 36, padding: 32,
      animation: 'float-up .25s ease-out',
    }}>
      <div className="display" style={{
        fontSize: 'clamp(5.5rem, 24vw, 9rem)',
        background: 'linear-gradient(135deg, #ff3b61 0%, #ff7c00 25%, #ffd600 50%, #00e676 72%, #3d8eff 88%, #c84bff 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        lineHeight: 1, textAlign: 'center',
        animation: 'tick .9s ease-in-out infinite',
        filter: 'drop-shadow(0 0 24px rgba(255,59,97,.6))',
      }}>
        DRINK
      </div>
      <button onClick={onDismiss} style={{
        padding: '18px 52px', borderRadius: 99,
        background: 'linear-gradient(135deg, #3d8eff, #c84bff)',
        border: '2px solid rgba(255,255,255,.25)',
        color: '#fff', fontSize: '1.15rem', fontWeight: 800,
        cursor: 'pointer', fontFamily: 'var(--font-display)',
        letterSpacing: 1,
        boxShadow: '0 0 40px rgba(200,75,255,.5), 0 8px 32px rgba(0,0,0,.5)',
        transition: 'transform .12s',
      }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(.96)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(.96)'}
        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; onDismiss(); }}
      >
        I drank
      </button>
    </div>
  );
}

// ─── Trivia ───────────────────────────────────────────────────────────────────

function PlayerTrivia({ me, state, send }) {
  const { trivia } = state;
  const q = TRIVIA_QS[trivia.questionIdx];
  const myAnswer = trivia.answers?.[me.id];
  const colors = ['var(--accent-1)', 'var(--accent-2)', 'var(--accent-4)', 'var(--accent-3)'];
  const shapes = ['ic-shape-tri', 'ic-shape-dia', 'ic-shape-circ', 'ic-shape-sq'];
  const team = TEAMS.find(t => t.id === me.team);
  const [showDrink, setShowDrink] = useState(false);

  useEffect(() => {
    if (!trivia.revealed) { setShowDrink(false); return; }
    if (myAnswer?.answerIdx === q.correct) play('correct');
    else { play('wrong'); setShowDrink(true); }
  }, [trivia.revealed, trivia.questionIdx]);

  const pick = (i) => {
    if (myAnswer || trivia.revealed) return;
    send({ type: 'trivia_answer', answerIdx: i });
  };

  return (
    <>
      {showDrink && <DrinkOverlay onDismiss={() => setShowDrink(false)} />}
    <Screen teamColor={team?.color}>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TeamChip team={team} />
        <div className="display" style={{ color: trivia.timerLeft <= 3 ? '#ff3b61' : 'var(--accent-1)', fontSize: '1.3rem', textShadow: '0 0 10px currentColor', animation: trivia.timerLeft <= 3 ? 'tick 1s infinite' : 'none' }}>
          {trivia.timerLeft.toString().padStart(2, '0')}
        </div>
      </div>

      <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ width: `${(trivia.timerLeft / 15) * 100}%`, height: '100%', background: trivia.timerLeft <= 3 ? 'linear-gradient(90deg,#ff3b61,#ff7c00)' : 'linear-gradient(90deg, var(--accent-1), var(--accent-2))', transition: 'width 1s linear', boxShadow: '0 0 10px var(--accent-1)' }} />
      </div>

      <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, textAlign: 'center' }}>
        Q{trivia.questionIdx + 1} · {q.worth} pts
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)', lineHeight: 1.3, textAlign: 'center' }}>{q.text}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
        {q.answers.map((ans, i) => {
          const picked = myAnswer?.answerIdx === i;
          const isCorrect = trivia.revealed && i === q.correct;
          const isWrong = trivia.revealed && picked && i !== q.correct;
          const isDim = trivia.revealed && !picked && i !== q.correct;
          return (
            <button key={i} onClick={() => pick(i)} style={{
              background: isCorrect ? 'linear-gradient(135deg,#00e676,var(--accent-2))' : isWrong ? 'linear-gradient(135deg,#ff3b61,#ff7c00)' : picked ? `linear-gradient(135deg, ${colors[i]}, color-mix(in oklab, ${colors[i]} 60%, #000))` : `color-mix(in oklab, ${colors[i]} 14%, transparent)`,
              border: `2px solid ${isCorrect ? '#00e676' : isWrong ? '#ff3b61' : picked ? colors[i] : `color-mix(in oklab, ${colors[i]} 40%, transparent)`}`,
              borderRadius: 16, color: (isCorrect || isWrong || picked) ? '#fff' : 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 100, cursor: myAnswer || trivia.revealed ? 'default' : 'pointer',
              opacity: isDim ? .3 : 1, transition: 'all .2s',
              boxShadow: isCorrect ? '0 0 30px #00e676' : 'none',
              flexDirection: 'column', gap: 6,
            }}>
              <svg width="32" height="32"><use href={`#${shapes[i]}`} /></svg>
              <span style={{ fontSize: '.75rem', fontWeight: 700, textAlign: 'center', padding: '0 6px', lineHeight: 1.2 }}>{ans}</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)', minHeight: 32 }}>
        {trivia.revealed && myAnswer?.answerIdx === q.correct && (
          <div style={{ color: '#00e676', fontWeight: 800, fontSize: '1rem', animation: 'float-up .3s ease-out' }}>
            ✓ Correct! +{me.lastPts?.toLocaleString() ?? '—'} pts
          </div>
        )}
        {trivia.revealed && myAnswer && myAnswer.answerIdx !== q.correct && (
          <div style={{ color: '#ff3b61', fontWeight: 700, animation: 'float-up .3s ease-out' }}>
            ✗ Not this time — it was {q.answers[q.correct]}
          </div>
        )}
        {!trivia.revealed && myAnswer && <span>Locked in — waiting for host to reveal…</span>}
        {!trivia.revealed && !myAnswer && <span>Faster answers = more points</span>}
      </div>
    </Screen>
    </>
  );
}

// ─── Twink or Lesbian ─────────────────────────────────────────────────────────

function PlayerTwink({ me, state, send }) {
  const { twink } = state;
  const r = CELEB_ROUNDS[twink.roundIdx];
  const myVote = twink.votes?.[me.id];
  const team = TEAMS.find(t => t.id === me.team);
  const [showDrink, setShowDrink] = useState(false);

  const twinkCount = Object.values(twink.votes || {}).filter(v => v === 'twink').length;
  const lesbCount  = Object.values(twink.votes || {}).filter(v => v === 'lesbian').length;
  const totalVotes = twinkCount + lesbCount;
  const twinkPct = totalVotes ? (twinkCount / totalVotes) * 100 : 0;
  const lesbPct  = totalVotes ? (lesbCount  / totalVotes) * 100 : 0;

  useEffect(() => {
    if (!twink.revealed) { setShowDrink(false); return; }
    if (myVote !== r.answer) setShowDrink(true);
  }, [twink.revealed, twink.roundIdx]);

  const vote = (v) => {
    if (myVote || twink.revealed) return;
    send({ type: 'twink_vote', vote: v });
  };

  return (
    <>
      {showDrink && <DrinkOverlay onDismiss={() => setShowDrink(false)} />}
    <Screen teamColor={team?.color}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TeamChip team={team} />
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>R{twink.roundIdx + 1}/{CELEB_ROUNDS.length}</div>
      </div>

      <div style={{ position: 'relative', marginBottom: 16, borderRadius: 14, overflow: 'hidden', background: '#0a0812', minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={r.questionImg} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', opacity: twink.revealed ? 0 : 1, transition: 'opacity 0.7s ease', position: 'absolute', inset: 0, margin: 'auto' }} />
        <img src={r.revealImg}   alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', opacity: twink.revealed ? 1 : 0, transition: 'opacity 0.7s ease', position: 'absolute', inset: 0, margin: 'auto' }} />
        <div style={{ height: 200 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10, flex: 1 }}>
        {[
          { key: 'twink',   label: 'Twink',   icon: 'ic-star-burst', color: '#3d8eff', grad: 'linear-gradient(135deg,#3d8eff,#c84bff)', pct: twinkPct },
          { key: 'lesbian', label: 'Lesbian', icon: 'ic-flame',      color: '#ff3cac', grad: 'linear-gradient(135deg,#ff3cac,#ff7c00)', pct: lesbPct  },
        ].map(opt => {
          const picked = myVote === opt.key;
          const isCorrect = twink.revealed && r.answer === opt.key;
          return (
            <button key={opt.key} onClick={() => vote(opt.key)} style={{
              position: 'relative', overflow: 'hidden',
              background: picked || isCorrect ? opt.grad : 'rgba(255,255,255,.04)',
              border: `2px solid ${picked || isCorrect ? '#fff' : `color-mix(in oklab, ${opt.color} 40%, transparent)`}`,
              borderRadius: 16, color: 'var(--text)',
              cursor: myVote || twink.revealed ? 'default' : 'pointer',
              opacity: twink.revealed && !isCorrect ? .4 : 1, transition: 'all .3s',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, color-mix(in oklab, ${opt.color} 16%, transparent) ${opt.pct}%, transparent ${opt.pct}%)`, transition: 'background .4s', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%', padding: '16px' }}>
                <svg width="32" height="32" style={{ color: picked || isCorrect ? '#fff' : opt.color }}><use href={`#${opt.icon}`} /></svg>
                <span className="display" style={{ fontSize: '1.8rem' }}>{opt.label}</span>
                {(myVote || twink.revealed) && (
                  <span className="mono" style={{ position: 'absolute', right: 14, color: picked || isCorrect ? '#fff' : opt.color, fontWeight: 800, fontSize: '.85rem' }}>{Math.round(opt.pct)}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {twink.revealed && (
        <div style={{ marginTop: 10, padding: 12, background: myVote === r.answer ? 'rgba(0,230,118,.1)' : 'rgba(255,59,97,.1)', border: `1px solid ${myVote === r.answer ? 'rgba(0,230,118,.3)' : 'rgba(255,59,97,.3)'}`, borderRadius: 10, textAlign: 'center', fontSize: '.82rem', color: myVote === r.answer ? '#00e676' : '#ff3b61', animation: 'float-up .3s ease-out' }}>
          {myVote === r.answer ? `✓ Correct! +500 pts` : `✗ It's ${r.answer}`}
        </div>
      )}
    </Screen>
    </>
  );
}

// ─── Lipsync ──────────────────────────────────────────────────────────────────

function PlayerLipsync({ me, state, send }) {
  const { lipsync } = state;
  const team = TEAMS.find(t => t.id === me.team);
  const inGroupA = lipsync.groupA?.includes(me.team);
  const inGroupB = lipsync.groupB?.includes(me.team);
  const subPhase = lipsync.subPhase;
  const RANK_PTS = [500, 300, 100, 0];

  const [rankingA, setRankingA] = useState([]);
  const [rankingB, setRankingB] = useState([]);
  const [submittedA, setSubmittedA] = useState(false);
  const [submittedB, setSubmittedB] = useState(false);

  useEffect(() => { if (subPhase === 'voteA') { setRankingA([]); setSubmittedA(false); } }, [subPhase]);
  useEffect(() => { if (subPhase === 'voteB') { setRankingB([]); setSubmittedB(false); } }, [subPhase]);

  const serverRankA = lipsync.ranksA?.[me.id];
  const serverRankB = lipsync.ranksB?.[me.id];

  const tapTeam = (setter, current, teamId, disabled) => {
    if (disabled) return;
    setter(prev => prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]);
  };

  const VotePanel = ({ groupTeamIds, ranking, onTap, submitted, serverRank, onSubmit }) => {
    const done = submitted || !!serverRank;
    const display = serverRank || ranking;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-2)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>
          {done ? 'Vote locked ✓' : `Tap to rank · ${display.length} / ${groupTeamIds.length}`}
        </div>
        {groupTeamIds.map(teamId => {
          const t = TEAMS.find(t => t.id === teamId);
          const pos = display.indexOf(teamId);
          return (
            <button key={teamId} onClick={() => onTap(teamId)} disabled={done} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 14,
              background: pos >= 0 ? `color-mix(in oklab, ${t.color} 18%, transparent)` : 'rgba(255,255,255,.03)',
              border: `2px solid ${pos >= 0 ? t.color : 'var(--border-2)'}`,
              color: 'var(--text)', fontFamily: 'var(--font-body)',
              cursor: done ? 'default' : 'pointer', transition: 'all .2s',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: pos >= 0 ? t.color : 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, flexShrink: 0, transition: 'all .2s' }}>
                {pos >= 0 ? (['🥇','🥈','🥉','4'][pos]) : '?'}
              </div>
              <TeamDot team={t} size={10} />
              <span style={{ flex: 1, fontWeight: 700, color: pos >= 0 ? t.color : 'var(--text-2)' }}>{t.name} Team</span>
              {pos >= 0 && <span className="mono" style={{ fontSize: '.75rem', color: 'var(--muted)' }}>+{RANK_PTS[pos]}</span>}
            </button>
          );
        })}
        {!done && (
          <Btn kind="primary" size="md" full onClick={onSubmit} disabled={ranking.length !== groupTeamIds.length}>
            Lock in my ranking
          </Btn>
        )}
        {done && (
          <div style={{ padding: 10, background: 'rgba(0,230,118,.08)', border: '1px solid rgba(0,230,118,.3)', borderRadius: 10, textAlign: 'center', fontSize: '.8rem', color: '#00e676' }}>
            ✓ Ranking submitted — waiting for results…
          </div>
        )}
      </div>
    );
  };

  const ResultsPanel = ({ groupTeamIds, scores, accentVar, suffix }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="mono" style={{ fontSize: '.65rem', color: accentVar, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>{suffix} Results</div>
      {groupTeamIds
        .map(teamId => ({ teamId, score: scores[teamId] || 0 }))
        .sort((a, b) => b.score - a.score)
        .map(({ teamId, score }, i) => {
          const t = TEAMS.find(t => t.id === teamId);
          const isMe = teamId === me.team;
          return (
            <div key={teamId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: isMe ? `color-mix(in oklab, ${t.color} 15%, transparent)` : 'rgba(255,255,255,.03)', border: `1.5px solid ${isMe ? t.color : 'var(--border-2)'}`, borderRadius: 14 }}>
              <div className="display" style={{ minWidth: 28, fontSize: '1.1rem' }}>{['🥇','🥈','🥉','4️⃣'][i]}</div>
              <TeamDot team={t} size={12} />
              <span style={{ flex: 1, fontWeight: 700, color: t.color }}>{t.name}</span>
              <span className="mono" style={{ color: 'var(--text)', fontWeight: 800 }}>+{score}</span>
            </div>
          );
        })
      }
    </div>
  );

  return (
    <Screen teamColor={team?.color}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TeamChip team={team} />
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>LIPSYNC</div>
      </div>

      {subPhase === 'reveal' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-2)', letterSpacing: 3, textTransform: 'uppercase' }}>Your group</div>
          <div className="display" style={{ fontSize: '3rem', color: inGroupA ? 'var(--accent-1)' : 'var(--accent-3)', textShadow: '0 0 30px currentColor' }}>
            Group {inGroupA ? 'A' : 'B'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(inGroupA ? lipsync.groupA : lipsync.groupB).map(teamId => {
              const t = TEAMS.find(t => t.id === teamId);
              return <div key={teamId} style={{ padding: '4px 12px', borderRadius: 999, background: `color-mix(in oklab, ${t.color} 16%, transparent)`, border: `1px solid ${t.color}`, color: t.color, fontSize: '.8rem', fontWeight: 700 }}>{t.name}</div>;
            })}
          </div>
          {lipsync.songA && (
            <div style={{ padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-2)', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 2, marginBottom: 4 }}>GROUP A SONG</div>
              <div className="display" style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{lipsync.songA.title}</div>
              <div style={{ color: 'var(--accent-1)', fontSize: '.8rem' }}>{lipsync.songA.artist}</div>
            </div>
          )}
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Watch the big screen!</div>
        </div>
      )}

      {subPhase === 'performA' && inGroupA && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', animation: 'float-up .4s ease-out' }}>
          <div style={{ fontSize: '3rem' }}>🎤</div>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', letterSpacing: 3, textTransform: 'uppercase' }}>You&rsquo;re performing!</div>
          <div className="display" style={{ fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1.1 }}>{lipsync.songA?.title}</div>
          <div style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{lipsync.songA?.artist}</div>
          <div style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(61,142,255,.1)', border: '1px solid rgba(61,142,255,.3)', fontSize: '.85rem', color: '#3d8eff', fontWeight: 700 }}>Give it everything! 🔥</div>
        </div>
      )}

      {subPhase === 'performA' && inGroupB && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>👀</div>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-3)', letterSpacing: 3, textTransform: 'uppercase' }}>Group A is performing</div>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)', lineHeight: 1.1 }}>{lipsync.songA?.title}</div>
          <div style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{lipsync.songA?.artist}</div>
          <div style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(200,75,255,.1)', border: '1px solid rgba(200,75,255,.3)', fontSize: '.85rem', color: 'var(--accent-3)', fontWeight: 700 }}>Watch carefully — you&rsquo;re judging! 🧐</div>
        </div>
      )}

      {subPhase === 'voteA' && inGroupB && (
        <VotePanel groupTeamIds={lipsync.groupA} ranking={rankingA}
          onTap={(id) => tapTeam(setRankingA, rankingA, id, submittedA || !!serverRankA)}
          submitted={submittedA} serverRank={serverRankA}
          onSubmit={() => { send({ type: 'lipsync_rank_a', ranking: rankingA }); setSubmittedA(true); }} />
      )}

      {subPhase === 'voteA' && inGroupA && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>Audience is judging!</div>
          <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
            {Object.keys(lipsync.ranksA || {}).length} vote{Object.keys(lipsync.ranksA || {}).length !== 1 ? 's' : ''} in so far
          </div>
        </div>
      )}

      {subPhase === 'resultsA' && lipsync.scoresA && (
        <ResultsPanel groupTeamIds={lipsync.groupA} scores={lipsync.scoresA} accentVar="var(--accent-1)" suffix="Group A" />
      )}

      {subPhase === 'spinB' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🎡</div>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>Group B&rsquo;s turn!</div>
          <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Spinning for Group B&rsquo;s song…</div>
        </div>
      )}

      {subPhase === 'performB' && inGroupB && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', animation: 'float-up .4s ease-out' }}>
          <div style={{ fontSize: '3rem' }}>🎤</div>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-1)', letterSpacing: 3, textTransform: 'uppercase' }}>You&rsquo;re performing!</div>
          <div className="display" style={{ fontSize: '1.6rem', color: 'var(--text)', lineHeight: 1.1 }}>{lipsync.songB?.title}</div>
          <div style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{lipsync.songB?.artist}</div>
          <div style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(61,142,255,.1)', border: '1px solid rgba(61,142,255,.3)', fontSize: '.85rem', color: '#3d8eff', fontWeight: 700 }}>Give it everything! 🔥</div>
        </div>
      )}

      {subPhase === 'performB' && inGroupA && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>👀</div>
          <div className="mono" style={{ fontSize: '.65rem', color: 'var(--accent-3)', letterSpacing: 3, textTransform: 'uppercase' }}>Group B is performing</div>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)', lineHeight: 1.1 }}>{lipsync.songB?.title}</div>
          <div style={{ color: 'var(--accent-1)', fontWeight: 700 }}>{lipsync.songB?.artist}</div>
          <div style={{ padding: '10px 18px', borderRadius: 999, background: 'rgba(200,75,255,.1)', border: '1px solid rgba(200,75,255,.3)', fontSize: '.85rem', color: 'var(--accent-3)', fontWeight: 700 }}>Watch carefully — you&rsquo;re judging! 🧐</div>
        </div>
      )}

      {subPhase === 'voteB' && inGroupA && (
        <VotePanel groupTeamIds={lipsync.groupB} ranking={rankingB}
          onTap={(id) => tapTeam(setRankingB, rankingB, id, submittedB || !!serverRankB)}
          submitted={submittedB} serverRank={serverRankB}
          onSubmit={() => { send({ type: 'lipsync_rank_b', ranking: rankingB }); setSubmittedB(true); }} />
      )}

      {subPhase === 'voteB' && inGroupB && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--text)' }}>Audience is judging!</div>
          <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
            {Object.keys(lipsync.ranksB || {}).length} vote{Object.keys(lipsync.ranksB || {}).length !== 1 ? 's' : ''} in so far
          </div>
        </div>
      )}

      {subPhase === 'resultsB' && lipsync.scoresB && (
        <>
          <ResultsPanel groupTeamIds={lipsync.groupB} scores={lipsync.scoresB} accentVar="var(--accent-3)" suffix="Group B" />
          <div style={{ marginTop: 8, padding: 10, background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.25)', borderRadius: 10, textAlign: 'center', fontSize: '.82rem', color: 'var(--accent-4)' }}>
            🎉 Lipsync complete — back to hub soon!
          </div>
        </>
      )}
    </Screen>
  );
}

// ─── Songpop ──────────────────────────────────────────────────────────────────

function PlayerSongpop({ me, state, send }) {
  const { songpop } = state;
  const myTeam = TEAMS.find(t => t.id === me.team);
  const teamPlayers = Object.values(state.players).filter(p => p.team === me.team);
  const teamAssignments = songpop.assignments?.[me.team] || {};
  const [lifted, setLifted] = useState(null); // playerId currently "held"

  // clear lifted selection when locked
  useEffect(() => { if (songpop.locked) setLifted(null); }, [songpop.locked]);

  const tapPlayer = (playerId) => {
    if (songpop.locked) return;
    setLifted(prev => prev === playerId ? null : playerId);
  };

  const tapCategory = (categoryKey) => {
    if (!lifted || songpop.locked) return;
    send({ type: 'songpop_assign', playerId: lifted, category: categoryKey });
    setLifted(null);
  };

  const removePlayer = (playerId) => {
    if (songpop.locked) return;
    send({ type: 'songpop_assign', playerId, category: null });
    setLifted(null);
  };

  const unassigned = teamPlayers.filter(p => !teamAssignments[p.id]);

  return (
    <Screen teamColor={myTeam?.color}>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TeamChip team={myTeam} />
        <div className="mono" style={{ fontSize: '.65rem', color: songpop.locked ? 'var(--accent-4)' : lifted ? myTeam?.color : 'var(--muted)', letterSpacing: 1.5, transition: 'color .2s' }}>
          {songpop.locked ? 'LOCKED' : lifted ? 'DROP INTO A CATEGORY' : 'ASSIGNING'}
        </div>
      </div>

      {!songpop.locked && (
        <>
          {/* Unassigned roster */}
          <div className="mono" style={{ fontSize: '.6rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            Tap to pick up · tap a category to assign
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, minHeight: 38 }}>
            {unassigned.length === 0
              ? <div style={{ fontSize: '.78rem', color: 'var(--accent-2)', fontWeight: 700 }}>Everyone assigned ✓</div>
              : unassigned.map(p => {
                  const isLifted = lifted === p.id;
                  return (
                    <button key={p.id} onClick={() => tapPlayer(p.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                      background: isLifted ? myTeam?.color : 'rgba(255,255,255,.06)',
                      border: `1.5px solid ${isLifted ? myTeam?.color : 'var(--border-2)'}`,
                      borderRadius: 99, color: isLifted ? '#fff' : 'var(--text)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '.82rem',
                      transform: isLifted ? 'scale(1.06)' : 'scale(1)',
                      boxShadow: isLifted ? `0 4px 16px color-mix(in oklab, ${myTeam?.color} 50%, transparent)` : 'none',
                      transition: 'all .15s',
                    }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: isLifted ? 'rgba(255,255,255,.25)' : myTeam?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{p.name[0]}</div>
                      {p.name}
                    </button>
                  );
                })}
          </div>

          {/* Category buckets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {SONGPOP_CATEGORIES.map(cat => {
              const assigned = teamPlayers.filter(p => teamAssignments[p.id] === cat.key);
              const isTarget = !!lifted;
              return (
                <div key={cat.key} onClick={() => tapCategory(cat.key)} style={{
                  padding: '10px 12px', borderRadius: 14,
                  background: isTarget ? `color-mix(in oklab, ${myTeam?.color} 14%, rgba(255,255,255,.05))` : 'rgba(255,255,255,.03)',
                  border: `2px ${isTarget ? 'solid' : 'dashed'} ${isTarget ? myTeam?.color : 'var(--border-2)'}`,
                  cursor: isTarget ? 'pointer' : 'default',
                  transition: 'all .15s',
                  boxShadow: isTarget ? `0 0 12px color-mix(in oklab, ${myTeam?.color} 30%, transparent)` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: assigned.length ? 8 : 0 }}>
                    <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                    <span style={{ fontSize: '.78rem', fontWeight: 800, color: isTarget ? myTeam?.color : 'var(--text-2)' }}>{cat.label}</span>
                    {assigned.length > 0 && <span className="mono" style={{ fontSize: '.6rem', color: 'var(--muted)', marginLeft: 'auto' }}>{assigned.length}</span>}
                  </div>
                  {assigned.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {assigned.map(p => (
                        <button key={p.id} onClick={e => { e.stopPropagation(); removePlayer(p.id); }} style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px',
                          background: `color-mix(in oklab, ${myTeam?.color} 20%, transparent)`,
                          border: `1px solid color-mix(in oklab, ${myTeam?.color} 40%, transparent)`,
                          borderRadius: 99, color: 'var(--text)', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontSize: '.75rem', fontWeight: 700,
                        }}>
                          {p.name} <span style={{ opacity: .5, fontSize: '.65rem' }}>✕</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {songpop.locked && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="display" style={{ fontSize: '1.1rem', color: 'var(--text)', textAlign: 'center', marginBottom: 4 }}>Your team's lineup</div>
          {SONGPOP_CATEGORIES.map(cat => {
            const assigned = teamPlayers.filter(p => teamAssignments[p.id] === cat.key);
            return (
              <div key={cat.key} style={{ padding: '10px 14px', background: `color-mix(in oklab, ${myTeam?.color} 10%, rgba(255,255,255,.03))`, border: `1px solid color-mix(in oklab, ${myTeam?.color} 30%, transparent)`, borderRadius: 12 }}>
                <div style={{ fontSize: '.75rem', fontWeight: 800, color: myTeam?.color, marginBottom: 5 }}>{cat.emoji} {cat.label}</div>
                {assigned.length === 0
                  ? <div style={{ fontSize: '.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>Nobody assigned</div>
                  : <div style={{ fontSize: '.82rem', color: 'var(--text)', fontWeight: 700 }}>{assigned.map(p => p.name).join(', ')}</div>}
              </div>
            );
          })}
          <div style={{ marginTop: 'auto', textAlign: 'center', color: 'var(--muted)', fontSize: '.82rem' }}>Watch the big screen!</div>
        </div>
      )}
    </Screen>
  );
}

// ─── Finale ───────────────────────────────────────────────────────────────────

function PlayerFinale({ me, state }) {
  const revealStep = state.revealStep || 0;
  const sorted = TEAMS.map(t => ({
    ...t,
    score: Object.values(state.players).filter(p => p.team === t.id).reduce((s, p) => s + (p.score || 0), 0),
  })).sort((a, b) => b.score - a.score);
  // sorted[0]=1st … sorted[7]=8th

  // Show teams that have been revealed (8th first), displayed 1st→8th top-to-bottom
  const revealedTeams = sorted.slice(Math.max(0, sorted.length - revealStep));

  const myTeam = sorted.find(t => t.id === me?.team);
  const myRank = sorted.findIndex(t => t.id === me?.team) + 1;
  const myRevealed = revealStep >= (9 - myRank);

  return (
    <Screen teamColor={myTeam?.color}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Logo size="md" />
        <div className="mono" style={{ fontSize: '.7rem', color: 'var(--accent-4)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 8 }}>★ Final Results ★</div>
      </div>

      {revealStep === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div className="display" style={{ fontSize: '1.4rem', color: 'var(--muted)' }}>Waiting for reveal…</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {revealedTeams.map(t => {
            const rank = sorted.findIndex(s => s.id === t.id) + 1;
            const isMe = t.id === me?.team;
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isMe ? `color-mix(in oklab, ${t.color} 14%, transparent)` : 'rgba(255,255,255,.03)', border: `1px solid ${isMe ? `color-mix(in oklab, ${t.color} 40%, transparent)` : 'var(--border-2)'}`, borderRadius: 12, animation: 'float-up .4s ease-out' }}>
                <div className="display" style={{ minWidth: 24, color: rank === 1 ? 'var(--accent-4)' : 'var(--muted)', fontSize: '.95rem', textAlign: 'center' }}>{rank === 1 ? '★' : rank}</div>
                <TeamDot team={t} size={12} />
                <div style={{ flex: 1, fontWeight: 700, color: t.color, fontSize: '.9rem' }}>{t.name} Team</div>
                <div className="mono" style={{ fontSize: '.9rem', color: 'var(--text)' }}>{t.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {myRevealed && myTeam && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div className="display" style={{ fontSize: '2rem', color: myTeam.color, marginBottom: 4, textShadow: `0 0 20px ${myTeam.color}` }}>#{myRank}</div>
          <div style={{ color: 'var(--text-2)', fontSize: '.85rem', marginBottom: 2 }}>{myTeam.name} Team · <strong style={{ color: 'var(--text)' }}>{myTeam.score.toLocaleString()} pts</strong></div>
          <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Your contribution: {(me?.score || 0).toLocaleString()} pts</div>
        </div>
      )}
    </Screen>
  );
}

// ─── Standby ──────────────────────────────────────────────────────────────────

function StandbyScreen({ me, state }) {
  const team = TEAMS.find(t => t.id === me.team);
  const standings = useTeamStandings(state);
  const myRank = standings.findIndex(t => t.id === me.team) + 1;
  const myTeamScore = standings.find(t => t.id === me.team)?.score || 0;

  return (
    <Screen teamColor={team?.color}>
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TeamChip team={team} />
        <div className="mono" style={{ fontSize: '.65rem', color: 'var(--muted)', letterSpacing: 1.5 }}>STANDBY</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,.04)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-1)', animation: 'pulse 2s ease-in-out infinite' }}>
          <svg width="30" height="30"><use href="#ic-bolt" /></svg>
        </div>
        <div>
          <div className="display" style={{ fontSize: '1.6rem', color: 'var(--text)', marginBottom: 6 }}>Hang tight…</div>
          <div style={{ color: 'var(--muted)', fontSize: '.9rem', maxWidth: 260, lineHeight: 1.4 }}>Watch the big screen — next round coming up.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ padding: '10px 14px', background: `color-mix(in oklab, ${team.color} 12%, transparent)`, border: `1px solid color-mix(in oklab, ${team.color} 30%, transparent)`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Team standing</span>
          <span className="display" style={{ fontSize: '1rem', color: team.color }}>#{myRank} · {myTeamScore.toLocaleString()} pts</span>
        </div>
        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Your score</span>
          <span className="display mono" style={{ fontSize: '1rem', color: 'var(--accent-1)' }}>{(me.score || 0).toLocaleString()}</span>
        </div>
      </div>
    </Screen>
  );
}

// ─── Connecting ───────────────────────────────────────────────────────────────

function ConnectingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', gap: 20 }}>
      <Logo size="md" />
      <div className="mono" style={{ color: 'var(--muted)', letterSpacing: 2, fontSize: '.75rem', animation: 'pulse 1.5s infinite' }}>CONNECTING…</div>
    </div>
  );
}

// ─── PlayerApp ────────────────────────────────────────────────────────────────

export default function PlayerApp({ init, onReset }) {
  const sessionId = getSessionId();
  const [revealDone, setRevealDone] = useState(false);
  const wasInGameRef = useRef(false);

  const handleMessage = useCallback((msg) => {
    if (msg.type === 'join_error') {
      onReset('Wrong room code — double-check with your host!');
    }
  }, [onReset]);

  const { gameState, connected, send } = useGame(false, handleMessage);

  // Auto-join: for QR joins (init.roomCode is null) wait for gameState to arrive
  // so we can use the live server room code.
  const roomCodeToJoin = init.roomCode || gameState?.roomCode;
  useEffect(() => {
    if (!connected || !roomCodeToJoin) return;
    send({ type: 'join', sessionId, name: init.name, roomCode: roomCodeToJoin });
  }, [connected, roomCodeToJoin]);

  // If server room code changes (server restart / new game), boot manual-code joiners.
  // QR joiners always get the live code so no mismatch is possible.
  useEffect(() => {
    if (!gameState?.roomCode || !init.roomCode) return;
    if (gameState.roomCode !== init.roomCode) {
      onReset('Room not found — get the latest code from the host.');
    }
  }, [gameState?.roomCode]);

  // Detect if kicked (was in game, now missing)
  useEffect(() => {
    if (!gameState) return;
    const inGame = !!gameState.players?.[sessionId];
    if (inGame) {
      wasInGameRef.current = true;
    } else if (wasInGameRef.current) {
      wasInGameRef.current = false;
      onReset('You were removed from the game.');
    }
  }, [gameState]);

  if (!connected) return <ConnectingScreen />;

  const me = gameState?.players?.[sessionId];

  // Show team reveal animation once we know our team, until it finishes
  if (!revealDone) {
    return (
      <TeamRevealScreen
        assignedTeam={me?.team ?? null}
        playerName={init.name}
        onDone={() => setRevealDone(true)}
      />
    );
  }

  if (!me) {
    // Briefly disconnected / re-joining
    return <ConnectingScreen />;
  }

  const phase = gameState.phase;

  return (
    <>
      {phase === 'lobby'   && <LobbyScreen   me={me} state={gameState} />}
      {phase === 'trivia'  && <PlayerTrivia  me={me} state={gameState} send={send} />}
      {phase === 'twink'   && <PlayerTwink   me={me} state={gameState} send={send} />}
      {phase === 'lipsync' && <PlayerLipsync me={me} state={gameState} send={send} />}
      {phase === 'songpop' && <PlayerSongpop me={me} state={gameState} send={send} />}
      {phase === 'finale'  && <PlayerFinale  me={me} state={gameState} />}
      {!['lobby','trivia','twink','lipsync','songpop','finale'].includes(phase) && (
        <StandbyScreen me={me} state={gameState} />
      )}
    </>
  );
}
