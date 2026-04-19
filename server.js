// sTEAve 40th Faceoff — game server
import { TRIVIA_QS, CELEB_ROUNDS, LIPSYNC_SONGS, TEAMS } from './src/constants.js';

const PORT = 3001;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous I/O/0/1
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function freshState() {
  return {
    roomCode: generateCode(),
    phase: 'lobby', // lobby | trivia | twink | lipsync | songpop | finale
    completedGames: [], // tracks which games have been played
    players: {},    // sessionId -> {id, name, team, score, connected}
    trivia: {
      questionIdx: 0,
      revealed: false,
      answers: {},        // sessionId -> {answerIdx, timestamp}
      questionStarted: null,
      timerLeft: 15,
    },
    twink: {
      roundIdx: 0,
      revealed: false,
      votes: {},          // sessionId -> 'twink'|'lesbian'
    },
    lipsync: {
      subPhase: 'reveal', // reveal | performA | voteA | resultsA | spinB | performB | voteB | resultsB
      groupA: [],         // [teamId, ...]
      groupB: [],
      songA: null,
      songB: null,
      ranksA: {},         // sessionId -> [teamId_1st, teamId_2nd, teamId_3rd, teamId_4th]
      ranksB: {},
      scoresA: null,      // teamId -> totalScore, set at resultsA
      scoresB: null,
    },
    songpop: {
      reps: {},           // teamId -> sessionId
      locked: false,
      placements: {},     // teamId -> place (1–8)
      awarded: false,
    },
  };
}

let state = freshState();
const clients = new Map();  // ws -> {sessionId, role}
let triviaTimer = null;

// ─── broadcast ────────────────────────────────────────────────────────────────

function sendTo(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function broadcastAll() {
  for (const [ws, client] of clients) {
    sendTo(ws, { type: 'state', state: sanitize(state, client) });
  }
}

// Hide other players' answers until revealed
function sanitize(state, client) {
  const s = { ...state };
  if (state.phase === 'trivia' && !state.trivia.revealed && client.role !== 'host') {
    const mine = state.trivia.answers[client.sessionId];
    s.trivia = { ...state.trivia, answers: mine ? { [client.sessionId]: mine } : {} };
  }
  if (state.phase === 'twink' && !state.twink.revealed && client.role !== 'host') {
    const mine = state.twink.votes[client.sessionId];
    s.twink = { ...state.twink, votes: mine ? { [client.sessionId]: mine } : {} };
  }
  return s;
}

// ─── trivia timer ─────────────────────────────────────────────────────────────

function startTriviaTimer() {
  if (triviaTimer) clearInterval(triviaTimer);
  state.trivia.timerLeft = 15;
  state.trivia.questionStarted = Date.now();
  triviaTimer = setInterval(() => {
    if (state.trivia.revealed || state.phase !== 'trivia') {
      clearInterval(triviaTimer);
      return;
    }
    state.trivia.timerLeft = Math.max(0, state.trivia.timerLeft - 1);
    broadcastAll();
    if (state.trivia.timerLeft === 0) {
      clearInterval(triviaTimer);
      state.trivia.revealed = true;
      awardTriviaPoints();
      broadcastAll();
    }
  }, 1000);
}

function awardTriviaPoints() {
  const q = TRIVIA_QS[state.trivia.questionIdx];
  for (const [sid, answer] of Object.entries(state.trivia.answers)) {
    if (answer.answerIdx === q.correct && state.players[sid]) {
      const elapsed = (answer.timestamp - state.trivia.questionStarted) / 1000;
      // 500 base + up to 250 speed bonus (instant = +250, at 15s = +0)
      const pts = Math.round(500 + Math.max(0, (15 - elapsed) / 15 * 250));
      state.players[sid].score = (state.players[sid].score || 0) + pts;
      state.players[sid].lastPts = pts;
    }
  }
}

function awardTwinkPoints() {
  const round = CELEB_ROUNDS[state.twink.roundIdx];
  for (const [sid, vote] of Object.entries(state.twink.votes)) {
    if (vote === round.answer && state.players[sid]) {
      state.players[sid].score = (state.players[sid].score || 0) + 600;
      state.players[sid].lastPts = 600;
    }
  }
}

// Flat prizes per rank position (1st, 2nd, 3rd, 4th)
const LIPSYNC_PRIZES = [10000, 6500, 2500, 0];

// Vote weights used only for sorting — not the actual prize values
const VOTE_WEIGHTS = [4, 3, 2, 1];

function computeGroupScores(ranks, groupTeamIds) {
  // Tally weighted votes to determine ranking order
  const totals = {};
  groupTeamIds.forEach(id => { totals[id] = 0; });
  for (const ranking of Object.values(ranks)) {
    ranking.forEach((teamId, i) => {
      if (totals[teamId] !== undefined) totals[teamId] += VOTE_WEIGHTS[i] || 0;
    });
  }
  // Assign flat prizes based on rank
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const prizes = {};
  sorted.forEach(([teamId], i) => { prizes[teamId] = LIPSYNC_PRIZES[i] || 0; });
  return prizes; // teamId -> flat prize
}

// Award per-team flat prize, divided evenly among team members so team total = prize
function awardGroupPoints(scores) {
  const teamCounts = {};
  for (const p of Object.values(state.players)) {
    teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
  }
  for (const player of Object.values(state.players)) {
    const total = scores[player.team];
    if (!total) continue;
    const share = Math.round(total / (teamCounts[player.team] || 1));
    player.score = (player.score || 0) + share;
    player.lastPts = share;
  }
}

const SONGPOP_PRIZES = { 1: 10000, 2: 7000, 3: 4500, 4: 2500, 5: 1200, 6: 600, 7: 200, 8: 0 };

function awardSongpopPoints(placements) {
  const teamCounts = {};
  for (const p of Object.values(state.players)) {
    teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
  }
  for (const [teamId, place] of Object.entries(placements)) {
    const total = SONGPOP_PRIZES[place] || 0;
    if (!total) continue;
    const count = teamCounts[teamId] || 1;
    const share = Math.round(total / count);
    for (const player of Object.values(state.players)) {
      if (player.team === teamId) {
        player.score = (player.score || 0) + share;
        player.lastPts = share;
      }
    }
  }
}

// ─── server ───────────────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,

  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === '/ws') {
      const ok = server.upgrade(req);
      return ok ? undefined : new Response('Upgrade failed', { status: 400 });
    }

    // Serve built frontend (production)
    const base = import.meta.dir + '/dist';
    const tryPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = Bun.file(base + tryPath);
    if (await file.exists()) return new Response(file);
    // SPA fallback
    return new Response(Bun.file(base + '/index.html'));
  },

  websocket: {
    open(ws) {
      clients.set(ws, { sessionId: null, role: 'player' });
      sendTo(ws, { type: 'state', state });
    },

    message(ws, raw) {
      const client = clients.get(ws);
      if (!client) return;
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }

      switch (msg.type) {

        // ── identity ──────────────────────────────────────────────────────────
        case 'set_host': {
          client.role = 'host';
          sendTo(ws, { type: 'state', state: sanitize(state, client) });
          break;
        }

        case 'join': {
          const { sessionId, name, roomCode } = msg;
          const existing = state.players[sessionId];
          // Validate room code for brand-new players
          if (!existing) {
            if (!roomCode || roomCode.toUpperCase() !== state.roomCode) {
              sendTo(ws, { type: 'join_error', message: 'Wrong room code' });
              break;
            }
          }
          client.sessionId = sessionId;
          // Auto-assign to least-populated team (keep existing team on reconnect)
          let team = existing?.team;
          if (!team) {
            const counts = {};
            TEAMS.forEach(t => { counts[t.id] = 0; });
            for (const p of Object.values(state.players)) counts[p.team] = (counts[p.team] || 0) + 1;
            const min = Math.min(...Object.values(counts));
            const picks = TEAMS.filter(t => counts[t.id] === min);
            team = picks[Math.floor(Math.random() * picks.length)].id;
          }
          state.players[sessionId] = {
            id: sessionId, name, team,
            score: existing?.score || 0,
            connected: true,
          };
          broadcastAll();
          break;
        }

        case 'kick_player': {
          if (client.role !== 'host') break;
          delete state.players[msg.playerId];
          broadcastAll();
          break;
        }

        // ── player actions ────────────────────────────────────────────────────
        case 'trivia_answer': {
          if (state.phase !== 'trivia' || state.trivia.revealed) break;
          if (state.trivia.answers[client.sessionId]) break; // no double answer
          state.trivia.answers[client.sessionId] = {
            answerIdx: msg.answerIdx,
            timestamp: Date.now(),
          };
          broadcastAll();
          break;
        }

        case 'twink_vote': {
          if (state.phase !== 'twink' || state.twink.revealed) break;
          if (state.twink.votes[client.sessionId]) break;
          state.twink.votes[client.sessionId] = msg.vote;
          broadcastAll();
          break;
        }

        case 'lipsync_rank_a': {
          if (state.phase !== 'lipsync' || state.lipsync.subPhase !== 'voteA') break;
          const playerA = state.players[client.sessionId];
          if (!playerA || !state.lipsync.groupB.includes(playerA.team)) break;
          state.lipsync.ranksA[client.sessionId] = msg.ranking;
          broadcastAll();
          break;
        }

        case 'lipsync_rank_b': {
          if (state.phase !== 'lipsync' || state.lipsync.subPhase !== 'voteB') break;
          const playerB = state.players[client.sessionId];
          if (!playerB || !state.lipsync.groupA.includes(playerB.team)) break;
          state.lipsync.ranksB[client.sessionId] = msg.ranking;
          broadcastAll();
          break;
        }

        case 'songpop_pick_rep': {
          const { teamId, playerId } = msg;
          if (state.players[client.sessionId]?.team !== teamId) break;
          state.songpop.reps[teamId] = playerId;
          broadcastAll();
          break;
        }

        // ── host commands ─────────────────────────────────────────────────────
        case 'host_start_trivia': {
          if (client.role !== 'host') break;
          state.phase = 'trivia';
          state.trivia = { questionIdx: 0, revealed: false, answers: {}, questionStarted: null, timerLeft: 15 };
          startTriviaTimer();
          broadcastAll();
          break;
        }

        case 'host_reveal_trivia': {
          if (client.role !== 'host' || state.trivia.revealed) break;
          if (triviaTimer) clearInterval(triviaTimer);
          state.trivia.revealed = true;
          awardTriviaPoints();
          broadcastAll();
          break;
        }

        case 'host_next_trivia': {
          if (client.role !== 'host') break;
          const nextIdx = state.trivia.questionIdx + 1;
          if (nextIdx < TRIVIA_QS.length) {
            state.trivia = { questionIdx: nextIdx, revealed: false, answers: {}, questionStarted: null, timerLeft: 15 };
            startTriviaTimer();
          } else {
            if (!state.completedGames.includes('trivia')) state.completedGames.push('trivia');
            state.phase = 'lobby';
          }
          broadcastAll();
          break;
        }

        case 'host_start_twink': {
          if (client.role !== 'host') break;
          state.phase = 'twink';
          state.twink = { roundIdx: 0, revealed: false, votes: {} };
          broadcastAll();
          break;
        }

        case 'host_reveal_twink': {
          if (client.role !== 'host' || state.twink.revealed) break;
          state.twink.revealed = true;
          awardTwinkPoints();
          broadcastAll();
          break;
        }

        case 'host_next_twink': {
          if (client.role !== 'host') break;
          const nextRound = state.twink.roundIdx + 1;
          if (nextRound < CELEB_ROUNDS.length) {
            state.twink = { roundIdx: nextRound, revealed: false, votes: {} };
          } else {
            if (!state.completedGames.includes('twink')) state.completedGames.push('twink');
            state.phase = 'lobby';
          }
          broadcastAll();
          break;
        }

        case 'host_start_lipsync': {
          if (client.role !== 'host') break;
          const shuffled = [...TEAMS].sort(() => Math.random() - 0.5);
          state.phase = 'lipsync';
          state.lipsync = {
            subPhase: 'reveal',
            groupA: shuffled.slice(0, 4).map(t => t.id),
            groupB: shuffled.slice(4).map(t => t.id),
            songA: null, songB: null,
            ranksA: {}, ranksB: {},
            scoresA: null, scoresB: null,
          };
          broadcastAll();
          break;
        }

        case 'host_lipsync_spin_a': {
          if (client.role !== 'host') break;
          state.lipsync.songA = LIPSYNC_SONGS[Math.floor(Math.random() * LIPSYNC_SONGS.length)];
          broadcastAll();
          break;
        }

        case 'host_lipsync_perform_a': {
          if (client.role !== 'host') break;
          state.lipsync.subPhase = 'performA';
          broadcastAll();
          break;
        }

        case 'host_lipsync_vote_a': {
          if (client.role !== 'host') break;
          state.lipsync.subPhase = 'voteA';
          state.lipsync.ranksA = {};
          broadcastAll();
          break;
        }

        case 'host_lipsync_results_a': {
          if (client.role !== 'host') break;
          state.lipsync.scoresA = computeGroupScores(state.lipsync.ranksA, state.lipsync.groupA);
          awardGroupPoints(state.lipsync.scoresA);
          state.lipsync.subPhase = 'resultsA';
          broadcastAll();
          break;
        }

        case 'host_lipsync_start_b': {
          if (client.role !== 'host') break;
          state.lipsync.subPhase = 'spinB';
          broadcastAll();
          break;
        }

        case 'host_lipsync_spin_b': {
          if (client.role !== 'host') break;
          state.lipsync.songB = LIPSYNC_SONGS[Math.floor(Math.random() * LIPSYNC_SONGS.length)];
          broadcastAll();
          break;
        }

        case 'host_lipsync_perform_b': {
          if (client.role !== 'host') break;
          state.lipsync.subPhase = 'performB';
          broadcastAll();
          break;
        }

        case 'host_lipsync_vote_b': {
          if (client.role !== 'host') break;
          state.lipsync.subPhase = 'voteB';
          state.lipsync.ranksB = {};
          broadcastAll();
          break;
        }

        case 'host_lipsync_results_b': {
          if (client.role !== 'host') break;
          state.lipsync.scoresB = computeGroupScores(state.lipsync.ranksB, state.lipsync.groupB);
          awardGroupPoints(state.lipsync.scoresB);
          state.lipsync.subPhase = 'resultsB';
          broadcastAll();
          break;
        }

        case 'host_lipsync_finish': {
          if (client.role !== 'host') break;
          if (!state.completedGames.includes('lipsync')) state.completedGames.push('lipsync');
          state.phase = 'lobby';
          broadcastAll();
          break;
        }

        case 'host_start_songpop': {
          if (client.role !== 'host') break;
          state.phase = 'songpop';
          state.songpop = { reps: {}, locked: false, placements: {}, awarded: false };
          broadcastAll();
          break;
        }

        case 'host_songpop_lock': {
          if (client.role !== 'host') break;
          state.songpop.locked = true;
          broadcastAll();
          break;
        }

        case 'host_songpop_award': {
          if (client.role !== 'host' || state.songpop.awarded) break;
          awardSongpopPoints(msg.placements);
          state.songpop.placements = msg.placements;
          state.songpop.awarded = true;
          broadcastAll();
          break;
        }

        case 'host_songpop_finish': {
          if (client.role !== 'host') break;
          if (!state.completedGames.includes('songpop')) state.completedGames.push('songpop');
          state.phase = 'lobby';
          broadcastAll();
          break;
        }

        case 'host_finale': {
          if (client.role !== 'host') break;
          state.phase = 'finale';
          broadcastAll();
          break;
        }

        case 'host_reset': {
          if (client.role !== 'host') break;
          if (triviaTimer) clearInterval(triviaTimer);
          state = freshState();
          broadcastAll();
          break;
        }

        case 'host_skip_to': {
          if (client.role !== 'host') break;
          if (triviaTimer) clearInterval(triviaTimer);
          state.phase = msg.phase;
          if (msg.phase === 'trivia') {
            state.trivia = { questionIdx: 0, revealed: false, answers: {}, questionStarted: null, timerLeft: 15 };
            startTriviaTimer();
          } else if (msg.phase === 'twink') {
            state.twink = { roundIdx: 0, revealed: false, votes: {} };
          } else if (msg.phase === 'lipsync') {
            const s2 = [...TEAMS].sort(() => Math.random() - 0.5);
            state.lipsync = { subPhase: 'reveal', groupA: s2.slice(0,4).map(t=>t.id), groupB: s2.slice(4).map(t=>t.id), songA: null, songB: null, ranksA: {}, ranksB: {}, scoresA: null, scoresB: null };
          } else if (msg.phase === 'songpop') {
            state.songpop = { reps: {}, locked: false, placements: {}, awarded: false };
          }
          broadcastAll();
          break;
        }
      }
    },

    close(ws) {
      const client = clients.get(ws);
      if (client?.sessionId && state.players[client.sessionId]) {
        state.players[client.sessionId].connected = false;
      }
      clients.delete(ws);
      broadcastAll();
    },
  },
});

console.log(`🎮 sTEAve game server on ws://localhost:${PORT}/ws`);
console.log(`   Host:   http://localhost:${PORT}/?host`);
console.log(`   Player: http://localhost:${PORT}/`);
