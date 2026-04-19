import { useState, useEffect, useRef, useCallback } from 'react';

const SESSION_KEY = 'steave-session-id';

export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useGame(isHost, onMessage) {
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const isHostRef = useRef(isHost);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const send = useCallback((msg) => {
    if (ws.current?.readyState === 1) {
      ws.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    // Dev: Vite on 5173, server on 3001. Prod: same port (or no port = standard 443/80).
    const port = window.location.port === '5173' ? '3001' : window.location.port;
    const wsUrl = port ? `${protocol}//${host}:${port}/ws` : `${protocol}//${host}/ws`;

    function connect() {
      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        setConnected(true);
        if (isHostRef.current) {
          socket.send(JSON.stringify({ type: 'set_host' }));
        }
      };

      socket.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'state') {
          setGameState(msg.state);
        } else if (onMessageRef.current) {
          onMessageRef.current(msg);
        }
      };

      socket.onclose = () => {
        setConnected(false);
        setTimeout(connect, 2000);
      };

      socket.onerror = () => socket.close();
    }

    connect();
    return () => {
      ws.current?.close();
    };
  }, []);

  return { gameState, connected, send };
}
