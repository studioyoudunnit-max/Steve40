// Game screens: Trivia, Twink or Lesbian, Lipsync, Songpop
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

// ═══════════════════════════════════════════
// 1. TRIVIA
// ═══════════════════════════════════════════
function TriviaScreen({ onBack, onNextGame }) {
  const questions = TRIVIA_QS;
  const [qIdx, setQIdx] = useStateG(0);
  const [selected, setSelected] = useStateG(null);
  const [revealed, setRevealed] = useStateG(false);
  const [time, setTime] = useStateG(15);
  const [showPts, setShowPts] = useStateG(false);
  const q = questions[qIdx];

  useEffectG(() => {
    if (revealed) return;
    if (time <= 0) { setRevealed(true); return; }
    const t = setTimeout(()=>setTime(time-1), 1000);
    return () => clearTimeout(t);
  }, [time, revealed]);

  const pick = (i) => {
    if (revealed) return;
    setSelected(i);
    setTimeout(() => {
      setRevealed(true);
      if (i === q.correct) setShowPts(true);
    }, 400);
  };

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx+1); setSelected(null); setRevealed(false); setTime(15);
    } else {
      onNextGame();
    }
  };

  const colors = ['var(--accent-1)','var(--accent-2)','var(--accent-4)','var(--accent-3)'];
  const shapes = ['ic-shape-tri','ic-shape-dia','ic-shape-circ','ic-shape-sq'];

  return (
    <Stage>
      <GameHeader
        title="Trivia Showdown"
        subtitle={`Question ${qIdx+1} of ${questions.length}`}
        accent="var(--accent-1)"
        onBack={onBack}
        right={<Btn kind="ghost" size="sm" onClick={next}>{qIdx===questions.length-1 ? 'Finish →' : 'Skip →'}</Btn>}
      />

      <PointsPop pts={1000 + time*50} shown={showPts} onDone={()=>setShowPts(false)}/>

      <div style={{maxWidth:1200, margin:'0 auto', width:'100%', flex:1, display:'flex', flexDirection:'column'}}>
        {/* Timer */}
        <div style={{marginBottom:32, marginTop:12}}>
          <TimerBar value={time} max={15} accent="var(--accent-1)" big/>
        </div>

        {/* Question */}
        <Card style={{padding:'32px 40px', marginBottom:28, textAlign:'center', position:'relative', overflow:'hidden'}} glow>
          <div style={{position:'absolute', top:-20, left:-20, fontSize:'10rem', fontFamily:'var(--font-display)', color:'var(--accent-1)', opacity:.05, lineHeight:1}}>
            Q{qIdx+1}
          </div>
          <div className="mono" style={{fontSize:'.72rem', color:'var(--accent-1)', letterSpacing:3, textTransform:'uppercase', marginBottom:14}}>
            {q.category || 'Steve Trivia'} · {q.worth || 1000} pts
          </div>
          <h2 className="display" style={{fontSize:'clamp(1.8rem, 3.4vw, 2.8rem)', lineHeight:1.15, color:'var(--text)', position:'relative'}}>
            {q.text}
          </h2>
        </Card>

        {/* Answers — 2x2 grid */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, flex:1}}>
          {q.answers.map((a,i) => {
            const isCorrect = revealed && i===q.correct;
            const isWrong   = revealed && i===selected && i!==q.correct;
            const isDim     = revealed && i!==q.correct && i!==selected;
            return (
              <button
                key={i}
                onClick={()=>pick(i)}
                disabled={revealed}
                style={{
                  display:'flex', alignItems:'center', gap:18,
                  padding:'22px 26px', minHeight:90,
                  background: isCorrect
                    ? 'linear-gradient(135deg, #00e676, var(--accent-2))'
                    : isWrong
                      ? 'linear-gradient(135deg, #ff3b61, #ff7c00)'
                      : `color-mix(in oklab, ${colors[i]} 14%, transparent)`,
                  border: `2px solid ${isCorrect ? '#00e676' : isWrong ? '#ff3b61' : `color-mix(in oklab, ${colors[i]} 45%, transparent)`}`,
                  borderRadius:'var(--r-lg)',
                  color: (isCorrect || isWrong) ? '#fff' : 'var(--text)',
                  fontSize:'1.15rem', fontWeight:600,
                  fontFamily:'var(--font-body)',
                  textAlign:'left',
                  cursor: revealed ? 'default' : 'pointer',
                  opacity: isDim ? .35 : 1,
                  transform: selected===i && !revealed ? 'scale(.98)' : 'scale(1)',
                  transition:'transform .15s, opacity .3s, background .3s, border-color .3s',
                  boxShadow: isCorrect ? '0 0 40px #00e676' : 'none',
                }}
              >
                <div style={{
                  width:44, height:44, flexShrink:0, borderRadius:12,
                  background: (isCorrect || isWrong) ? 'rgba(255,255,255,.18)' : colors[i],
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  color:'#fff',
                }}>
                  <svg width="20" height="20"><use href={`#${shapes[i]}`}/></svg>
                </div>
                <div style={{flex:1}}>{a}</div>
                {isCorrect && <svg width="28" height="28" style={{color:'#fff'}}><use href="#ic-check"/></svg>}
              </button>
            );
          })}
        </div>

        {/* Reveal bar */}
        {revealed && (
          <div style={{
            marginTop:20, padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'rgba(0,230,118,.1)', border:'1px solid rgba(0,230,118,.3)', borderRadius:'var(--r-lg)',
            animation:'float-up .3s ease-out',
          }}>
            <div>
              <div className="mono" style={{fontSize:'.72rem', color:'#00e676', letterSpacing:2, textTransform:'uppercase', marginBottom:4}}>The Answer</div>
              <div style={{fontSize:'1.1rem', color:'var(--text)'}}>
                <strong>{q.answers[q.correct]}</strong>
                {q.fact && <span style={{color:'var(--text-2)'}}> — {q.fact}</span>}
              </div>
            </div>
            <Btn kind="success" size="md" onClick={next} icon="ic-arrow-right">
              {qIdx===questions.length-1 ? 'Finish Game' : 'Next Question'}
            </Btn>
          </div>
        )}
      </div>
    </Stage>
  );
}

// ═══════════════════════════════════════════
// 2. TWINK OR LESBIAN
// ═══════════════════════════════════════════
function TwinkLesbianScreen({ onBack, onNextGame }) {
  const rounds = CELEB_ROUNDS;
  const [rIdx, setRIdx] = useStateG(0);
  const [vote, setVote] = useStateG(null); // 'twink' | 'lesbian'
  const [revealed, setRevealed] = useStateG(false);
  const r = rounds[rIdx];

  // fake live vote tally
  const [tally, setTally] = useStateG({ twink: 0, lesbian: 0 });
  useEffectG(() => {
    if (revealed) return;
    const id = setInterval(() => {
      setTally(t => ({
        twink: Math.min(t.twink + Math.random() * 2, r.trueTally.twink + Math.random()*5),
        lesbian: Math.min(t.lesbian + Math.random() * 2, r.trueTally.lesbian + Math.random()*5),
      }));
    }, 250);
    return () => clearInterval(id);
  }, [rIdx, revealed]);

  const pick = (v) => {
    if (revealed) return;
    setVote(v);
    setTimeout(() => setRevealed(true), 900);
  };

  const next = () => {
    if (rIdx < rounds.length - 1) {
      setRIdx(rIdx+1); setVote(null); setRevealed(false); setTally({twink:0,lesbian:0});
    } else {
      onNextGame();
    }
  };

  const total = Math.max(1, tally.twink + tally.lesbian);
  const twinkPct = revealed ? r.trueTally.twink : (tally.twink/total)*100;
  const lesbPct  = revealed ? r.trueTally.lesbian : (tally.lesbian/total)*100;
  const correct = r.answer;

  return (
    <Stage>
      <GameHeader
        title="Twink or Lesbian?"
        subtitle={`Round ${rIdx+1} of ${rounds.length}`}
        accent="var(--accent-3)"
        onBack={onBack}
        right={<Btn kind="ghost" size="sm" onClick={next}>Skip →</Btn>}
      />

      <div style={{maxWidth:1200, margin:'0 auto', width:'100%', flex:1, display:'flex', flexDirection:'column', gap:20}}>
        {/* Celeb card */}
        <Card glow style={{padding:'24px 28px', display:'grid', gridTemplateColumns:'auto 1fr', gap:28, alignItems:'center'}}>
          <div style={{
            width:180, height:180, borderRadius:'50%',
            background: `conic-gradient(from 0deg, var(--accent-1), var(--accent-3), var(--accent-2), var(--accent-4), var(--accent-1))`,
            padding:5, position:'relative',
          }}>
            <div style={{
              width:'100%', height:'100%', borderRadius:'50%',
              background:`linear-gradient(135deg, color-mix(in oklab, ${r.hue} 40%, #1a1530), #0a0a12)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'4.5rem', fontFamily:'var(--font-display)',
              color:'#fff', textShadow:'0 0 24px rgba(0,0,0,.6)',
            }}>
              {r.initials}
            </div>
          </div>
          <div>
            <div className="mono" style={{fontSize:'.72rem', color:'var(--accent-3)', letterSpacing:3, textTransform:'uppercase', marginBottom:6}}>The Subject</div>
            <h2 className="display" style={{fontSize:'clamp(2.4rem, 5vw, 4rem)', lineHeight:1, color:'var(--text)', marginBottom:10}}>
              {r.name}
            </h2>
            <div style={{color:'var(--text-2)', fontSize:'1rem', marginBottom:14}}>{r.hint}</div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {r.tags.map(t => (
                <span key={t} style={{
                  padding:'4px 12px', borderRadius:999,
                  background:'rgba(255,255,255,.05)', border:'1px solid var(--border-2)',
                  fontSize:'.78rem', color:'var(--muted)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* Vote buttons + live tally */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, flex:1}}>
          {[
            { key:'twink',   label:'Twink',   icon:'ic-star-burst', color:'#3d8eff', grad:'linear-gradient(135deg, #3d8eff, #c84bff)' },
            { key:'lesbian', label:'Lesbian', icon:'ic-flame',      color:'#ff3cac', grad:'linear-gradient(135deg, #ff3cac, #ff7c00)' },
          ].map(opt => {
            const pct = opt.key==='twink' ? twinkPct : lesbPct;
            const isCorrect = revealed && correct===opt.key;
            const isWrong   = revealed && vote===opt.key && correct!==opt.key;
            return (
              <button
                key={opt.key}
                onClick={()=>pick(opt.key)}
                disabled={revealed}
                style={{
                  position:'relative', overflow:'hidden',
                  padding:'30px 28px', minHeight:180,
                  background: revealed
                    ? isCorrect ? opt.grad : 'rgba(255,255,255,.04)'
                    : vote===opt.key ? opt.grad : 'rgba(255,255,255,.04)',
                  border: `2px solid ${isCorrect ? '#fff' : isWrong ? '#ff3b61' : `color-mix(in oklab, ${opt.color} 40%, transparent)`}`,
                  borderRadius:'var(--r-lg)',
                  color: 'var(--text)',
                  cursor: revealed ? 'default' : 'pointer',
                  transition:'all .3s',
                  opacity: revealed && !isCorrect && !isWrong ? .4 : 1,
                  transform: vote===opt.key && !revealed ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Live tally fill */}
                <div style={{
                  position:'absolute', inset:0, pointerEvents:'none',
                  background:`linear-gradient(90deg, color-mix(in oklab, ${opt.color} 16%, transparent) ${pct}%, transparent ${pct}%)`,
                  transition:'background .3s',
                }}/>
                <div style={{position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
                  <svg width="44" height="44" style={{color: revealed && isCorrect ? '#fff' : opt.color, filter: `drop-shadow(0 0 12px ${opt.color})`}}>
                    <use href={`#${opt.icon}`}/>
                  </svg>
                  <div className="display" style={{fontSize:'2.4rem', lineHeight:1}}>{opt.label}</div>
                  <div style={{display:'flex', alignItems:'center', gap:8, fontSize:'.85rem', color:'var(--muted)'}}>
                    <span className="mono" style={{color:revealed && isCorrect ? '#fff':opt.color, fontWeight:800}}>{Math.round(pct)}%</span>
                    <span>of the room</span>
                  </div>
                  {isCorrect && (
                    <div style={{marginTop:6, padding:'6px 14px', borderRadius:999, background:'rgba(255,255,255,.2)', fontSize:'.78rem', fontWeight:800, letterSpacing:2, textTransform:'uppercase'}}>
                      ✓ Correct
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {revealed && (
          <Card style={{padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', animation:'float-up .3s ease-out'}}>
            <div style={{color:'var(--text-2)', fontSize:'.95rem', maxWidth:'70%'}}>
              <strong style={{color:'var(--accent-3)'}}>Hot take:</strong> {r.reveal}
            </div>
            <Btn kind="primary" size="md" onClick={next} icon="ic-arrow-right">
              {rIdx===rounds.length-1 ? 'Finish →' : 'Next →'}
            </Btn>
          </Card>
        )}
      </div>
    </Stage>
  );
}

// ═══════════════════════════════════════════
// 3. LIPSYNC OFF
// ═══════════════════════════════════════════
function LipsyncScreen({ onBack, onNextGame }) {
  const [phase, setPhase] = useStateG('spin'); // spin | picked | judge
  const [picked, setPicked] = useStateG(null);
  const [spinning, setSpinning] = useStateG(false);
  const [votes, setVotes] = useStateG({}); // teamId -> count

  const spin = () => {
    setSpinning(true);
    setPicked(null);
    setTimeout(() => {
      const song = LIPSYNC_SONGS[Math.floor(Math.random() * LIPSYNC_SONGS.length)];
      setPicked(song);
      setSpinning(false);
      setPhase('picked');
    }, 2200);
  };

  const goJudge = () => {
    setPhase('judge');
    // fake incoming live votes
    const seedVotes = () => {
      const next = {};
      TEAMS.slice(0,6).forEach(t => {
        next[t.id] = Math.floor(Math.random()*18);
      });
      setVotes(next);
    };
    seedVotes();
    const id = setInterval(() => {
      setVotes(v => {
        const n = {...v};
        const keys = Object.keys(n);
        const k = keys[Math.floor(Math.random()*keys.length)];
        n[k] = (n[k] || 0) + 1;
        return n;
      });
    }, 600);
    // stop after a while
    setTimeout(() => clearInterval(id), 15000);
  };

  const totalVotes = Object.values(votes).reduce((a,b)=>a+b,0) || 1;
  const sortedVotes = Object.entries(votes)
    .map(([team, count]) => ({ team: TEAMS.find(t=>t.id===team), count, pct: (count/totalVotes)*100 }))
    .sort((a,b)=>b.count-a.count);

  return (
    <Stage>
      <GameHeader
        title="Lipsync Off"
        subtitle={phase==='judge' ? 'Judging live' : 'The wheel decides'}
        accent="var(--accent-2)"
        onBack={onBack}
        right={
          phase==='judge'
            ? <Btn kind="primary" size="sm" onClick={onNextGame} icon="ic-arrow-right">Next Game →</Btn>
            : <Btn kind="ghost" size="sm" onClick={onNextGame}>Skip →</Btn>
        }
      />

      {phase !== 'judge' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, flex:1, maxWidth:1200, margin:'0 auto', width:'100%'}}>
          {/* WHEEL */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20}}>
            <div style={{position:'relative', width:360, height:360}}>
              {/* Pointer */}
              <div style={{
                position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)',
                width:0, height:0, borderLeft:'18px solid transparent', borderRight:'18px solid transparent',
                borderTop:'28px solid var(--accent-1)',
                filter:'drop-shadow(0 0 12px var(--accent-1))',
                zIndex:2,
              }}/>
              <div style={{
                width:'100%', height:'100%', borderRadius:'50%',
                background:`conic-gradient(
                  var(--accent-1) 0 45deg,
                  var(--accent-2) 45deg 90deg,
                  var(--accent-3) 90deg 135deg,
                  var(--accent-4) 135deg 180deg,
                  #ff3cac 180deg 225deg,
                  #3d8eff 225deg 270deg,
                  #00e5ff 270deg 315deg,
                  #c84bff 315deg 360deg
                )`,
                animation: spinning ? 'wheel-spin 2.2s cubic-bezier(.15,.8,.25,1) forwards' : 'none',
                boxShadow:'0 0 60px rgba(255,59,97,.4), inset 0 0 40px rgba(0,0,0,.4)',
                border:'4px solid var(--text)',
                position:'relative',
              }}>
                <div style={{
                  position:'absolute', inset:'36%', borderRadius:'50%',
                  background:'var(--bg-deep)', border:'2px solid var(--border)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--accent-1)',
                }}>
                  <svg width="44" height="44"><use href="#ic-mic"/></svg>
                </div>
              </div>
            </div>
            <Btn kind="primary" size="lg" onClick={spin} disabled={spinning} icon="ic-mic">
              {spinning ? 'Spinning…' : picked ? 'Respin' : 'Spin the Wheel'}
            </Btn>
          </div>

          {/* CARD */}
          <Card glow style={{padding:32, display:'flex', flexDirection:'column', justifyContent:'center', minHeight:360}}>
            {!picked ? (
              <div style={{textAlign:'center', color:'var(--muted)'}}>
                <svg width="60" height="60" style={{color:'var(--dim)', marginBottom:16}}><use href="#ic-music"/></svg>
                <div style={{fontSize:'1.1rem', marginBottom:8}}>Waiting for the wheel…</div>
                <div style={{fontSize:'.85rem'}}>One team will be called up. You'll have 90 seconds to perform.</div>
              </div>
            ) : (
              <div style={{textAlign:'center', animation:'float-up .4s ease-out'}}>
                <div className="mono" style={{fontSize:'.72rem', color:'var(--accent-2)', letterSpacing:3, textTransform:'uppercase', marginBottom:14}}>
                  Your Song Is
                </div>
                <h2 className="display" style={{fontSize:'clamp(2rem, 4vw, 3rem)', lineHeight:1.05, color:'var(--text)', marginBottom:8}}>
                  {picked.title}
                </h2>
                <div style={{fontSize:'1.15rem', color:'var(--accent-1)', fontWeight:700, marginBottom:20}}>
                  {picked.artist}
                </div>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:10,
                  padding:'10px 18px', borderRadius:999,
                  background:'rgba(255,214,0,.1)', border:'1px solid rgba(255,214,0,.3)',
                  fontSize:'.9rem', color:'var(--accent-4)', fontWeight:700, marginBottom:24,
                }}>
                  <svg width="14" height="14"><use href="#ic-bolt"/></svg>
                  90 seconds · Lip only · No real singing
                </div>
                <div>
                  <Btn kind="success" size="lg" onClick={goJudge} icon="ic-check">
                    Start Performance
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {phase === 'judge' && picked && (
        <div style={{maxWidth:1100, margin:'0 auto', width:'100%', flex:1, display:'flex', flexDirection:'column', gap:20}}>
          <Card glow style={{padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20}}>
            <div>
              <div className="mono" style={{fontSize:'.72rem', color:'var(--accent-2)', letterSpacing:3, textTransform:'uppercase', marginBottom:4}}>Now Performing</div>
              <div style={{display:'flex', alignItems:'baseline', gap:14}}>
                <h2 className="display" style={{fontSize:'2rem', color:'var(--text)'}}>{picked.title}</h2>
                <span style={{color:'var(--accent-1)', fontWeight:700}}>— {picked.artist}</span>
              </div>
            </div>
            <BeatPulse color="var(--accent-2)" intensity={1.5}/>
          </Card>

          <Card style={{padding:24, flex:1, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
              <h3 className="display" style={{fontSize:'1.3rem'}}>Live Vote Tally</h3>
              <span className="mono" style={{fontSize:'.8rem', color:'var(--muted)', letterSpacing:1}}>{totalVotes} votes cast</span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:10, flex:1}}>
              {sortedVotes.map((v,i) => (
                <div key={v.team.id} style={{
                  display:'grid', gridTemplateColumns:'24px auto 1fr auto', gap:12, alignItems:'center',
                  padding:'10px 14px',
                  background:`linear-gradient(90deg, color-mix(in oklab, ${v.team.color} 18%, transparent) ${v.pct}%, transparent ${v.pct}%)`,
                  border:`1px solid color-mix(in oklab, ${v.team.color} 25%, transparent)`,
                  borderRadius:12,
                  transition:'background .4s',
                }}>
                  <div className="display" style={{color: i===0 ? 'var(--accent-4)':'var(--muted)', fontSize:'1.1rem', textAlign:'center'}}>{i+1}</div>
                  <TeamDot team={v.team} size={14}/>
                  <div style={{fontWeight:700, color:v.team.color}}>{v.team.name} Team</div>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{color:'var(--muted)', fontSize:'.8rem'}}>{Math.round(v.pct)}%</span>
                    <span className="display mono" style={{fontSize:'1.1rem', color:'var(--text)', minWidth:32, textAlign:'right'}}>{v.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </Stage>
  );
}

// ═══════════════════════════════════════════
// 4. SONGPOP DUEL
// ═══════════════════════════════════════════
function SongpopScreen({ onBack, onNextGame }) {
  const [phase, setPhase] = useStateG('selecting'); // selecting | ready
  const [reps, setReps] = useStateG(() => {
    const obj = {};
    TEAMS.slice(0,4).forEach(t => {
      const pool = DEMO_PLAYERS.filter(p => p.team===t.id);
      obj[t.id] = pool[0]?.id || null;
    });
    return obj;
  });

  const pickRep = (teamId, playerId) => {
    setReps(r => ({ ...r, [teamId]: playerId }));
  };

  return (
    <Stage>
      <GameHeader
        title="Songpop Duel"
        subtitle="Each team picks one champion to take to the mat"
        accent="var(--accent-4)"
        onBack={onBack}
        right={
          phase==='selecting'
            ? <Btn kind="primary" size="sm" onClick={()=>setPhase('ready')} icon="ic-check">Lock In</Btn>
            : <Btn kind="success" size="sm" onClick={onNextGame} icon="ic-trophy">End & Reveal →</Btn>
        }
      />

      <div style={{maxWidth:1200, margin:'0 auto', width:'100%', flex:1, display:'flex', flexDirection:'column', gap:18}}>
        <Card style={{padding:'18px 24px', display:'flex', alignItems:'center', gap:14, background:'color-mix(in oklab, var(--accent-4) 8%, var(--card))'}}>
          <svg width="22" height="22" style={{color:'var(--accent-4)', flexShrink:0}}><use href="#ic-info"/></svg>
          <div style={{fontSize:'.95rem', color:'var(--text-2)'}}>
            <strong style={{color:'var(--accent-4)'}}>This one's IRL.</strong> Everyone picks a rep, they go head-to-head on the Songpop app. Winner takes 2,000 pts. Second place: 1,000.
          </div>
        </Card>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, flex:1}}>
          {TEAMS.slice(0,4).map(team => {
            const teamPlayers = DEMO_PLAYERS.filter(p => p.team===team.id);
            const rep = teamPlayers.find(p => p.id===reps[team.id]);
            return (
              <Card key={team.id} accent={team.color} style={{padding:18, display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
                  <TeamDot team={team} size={16}/>
                  <div style={{fontWeight:800, color:team.color}}>{team.name} Team</div>
                </div>

                {/* REP BIG */}
                <div style={{
                  padding:'18px 14px', marginBottom:14,
                  background:`linear-gradient(180deg, color-mix(in oklab, ${team.color} 20%, transparent), transparent)`,
                  border:`1px solid color-mix(in oklab, ${team.color} 35%, transparent)`,
                  borderRadius:14, textAlign:'center',
                }}>
                  <div className="mono" style={{fontSize:'.65rem', color:'var(--muted)', letterSpacing:2, textTransform:'uppercase', marginBottom:8}}>Champion</div>
                  <div style={{
                    width:64, height:64, margin:'0 auto 10px', borderRadius:'50%',
                    background:`linear-gradient(135deg, ${team.color}, var(--accent-1))`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.5rem', fontFamily:'var(--font-display)', color:'#fff',
                    boxShadow:`0 0 20px ${team.color}`,
                  }}>
                    {rep ? rep.name[0] : '?'}
                  </div>
                  <div className="display" style={{fontSize:'1.2rem', color:'var(--text)'}}>{rep ? rep.name : '—'}</div>
                  {rep && <div style={{fontSize:'.75rem', color:'var(--muted)', marginTop:2}}>{rep.flair}</div>}
                </div>

                {/* PICKER */}
                <div className="mono" style={{fontSize:'.65rem', color:'var(--muted)', letterSpacing:2, textTransform:'uppercase', marginBottom:8}}>Roster</div>
                <div style={{display:'flex', flexDirection:'column', gap:4, flex:1}}>
                  {teamPlayers.map(p => (
                    <button
                      key={p.id}
                      onClick={()=>pickRep(team.id, p.id)}
                      disabled={phase!=='selecting'}
                      style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'8px 10px',
                        background: reps[team.id]===p.id ? `color-mix(in oklab, ${team.color} 18%, transparent)` : 'rgba(255,255,255,.02)',
                        border:`1px solid ${reps[team.id]===p.id ? team.color : 'var(--border-2)'}`,
                        borderRadius:10, color:'var(--text)',
                        cursor: phase==='selecting' ? 'pointer':'default', fontSize:'.85rem',
                        textAlign:'left',
                      }}
                    >
                      <div style={{width:22, height:22, borderRadius:'50%', background:team.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:800, color:'#fff'}}>
                        {p.name[0]}
                      </div>
                      <span style={{flex:1}}>{p.name}</span>
                      {reps[team.id]===p.id && <svg width="14" height="14" style={{color:team.color}}><use href="#ic-check"/></svg>}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {phase==='ready' && (
          <Card glow style={{
            padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'linear-gradient(90deg, color-mix(in oklab, var(--accent-4) 14%, transparent), transparent)',
            animation:'float-up .3s ease-out',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:14}}>
              <svg width="32" height="32" style={{color:'var(--accent-4)'}}><use href="#ic-bolt"/></svg>
              <div>
                <div className="display" style={{fontSize:'1.4rem', color:'var(--accent-4)'}}>Champions locked in</div>
                <div style={{color:'var(--muted)', fontSize:'.9rem'}}>Open Songpop on the big screen. Winner scores 2,000 pts.</div>
              </div>
            </div>
            <Btn kind="success" size="md" onClick={onNextGame} icon="ic-trophy">Crown Results →</Btn>
          </Card>
        )}
      </div>
    </Stage>
  );
}

Object.assign(window, { TriviaScreen, TwinkLesbianScreen, LipsyncScreen, SongpopScreen });
