import React, { useEffect, useState, useRef, useMemo } from 'react';
import QRCode from 'react-qr-code';
import { TEAMS, ROOM_CODE, JOIN_URL } from './constants.js';

export function Logo({ size = 'md', glow = true }) {
  const sizes = {
    sm: { wordmark: '1.5rem',  box: '1.5rem',  forty: '.75rem' },
    md: { wordmark: '2.2rem',  box: '2.2rem',  forty: '.9rem'  },
    lg: { wordmark: 'clamp(3rem, 8vw, 5rem)',   box: 'clamp(3rem, 8vw, 5rem)',   forty: '1.2rem' },
    xl: { wordmark: 'clamp(4rem, 11vw, 7rem)',  box: 'clamp(4rem, 11vw, 7rem)',  forty: '1.6rem' },
  };
  const s = sizes[size];
  return (
    <div className="logo-lockup" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div className="display" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, lineHeight: 1, fontSize: s.wordmark }}>
        <span style={{ color: 'var(--text)' }}>s</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          border: '3px solid var(--accent-1)',
          padding: '0 6px',
          color: 'var(--accent-1)',
          boxShadow: glow ? '0 0 20px var(--accent-1), inset 0 0 14px color-mix(in oklab, var(--accent-1) 20%, transparent)' : 'none',
          textShadow: glow ? '0 0 16px var(--accent-1)' : 'none',
        }}>TEA</span>
        <span style={{ color: 'var(--text)' }}>ve</span>
      </div>
      {size !== 'sm' && (
        <>
          <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, transparent, var(--accent-1), transparent)', opacity: .6 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="display" style={{ fontSize: s.forty, letterSpacing: 3, color: 'var(--accent-1)', textShadow: glow ? '0 0 10px var(--accent-1)' : 'none' }}>40th</span>
            <span style={{ width: 1, height: 14, background: 'var(--border-2)' }} />
            <span className="display" style={{ fontSize: s.forty, letterSpacing: 3, color: 'var(--dim)' }}>Faceoff</span>
          </div>
        </>
      )}
    </div>
  );
}

export function MiniLogo({ subtitle }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span className="display" style={{ fontSize: '1.1rem', color: 'var(--text)' }}>s</span>
      <span className="display" style={{ fontSize: '1.1rem', color: 'var(--accent-1)', textShadow: '0 0 8px var(--accent-1)' }}>TEA</span>
      <span className="display" style={{ fontSize: '1.1rem', color: 'var(--text)' }}>ve</span>
      {subtitle && <span className="display" style={{ fontSize: '.7rem', color: 'var(--muted)', marginLeft: 6, letterSpacing: 2 }}>· {subtitle}</span>}
    </div>
  );
}

export function Btn({ children, kind = 'primary', size = 'md', full = false, onClick, disabled = false, style = {}, icon }) {
  const sizes = {
    sm: { pad: '10px 18px', fs: '.85rem', h: 40 },
    md: { pad: '14px 24px', fs: '.95rem', h: 52 },
    lg: { pad: '18px 34px', fs: '1.05rem', h: 60 },
    xl: { pad: '22px 44px', fs: '1.2rem', h: 72 },
  };
  const s = sizes[size];
  const kinds = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
      color: '#fff',
      border: 'none',
      boxShadow: '0 8px 24px color-mix(in oklab, var(--accent-1) 30%, transparent), 0 0 40px color-mix(in oklab, var(--accent-1) 15%, transparent)',
    },
    ghost: {
      background: 'rgba(255,255,255,.04)',
      color: 'var(--text-2)',
      border: '1.5px solid var(--border-2)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-2)',
      border: '2px solid var(--accent-2)',
      boxShadow: 'inset 0 0 0 0 var(--accent-2), 0 0 20px color-mix(in oklab, var(--accent-2) 25%, transparent)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ff3b61, #ff7c00)',
      color: '#fff',
      border: 'none',
    },
    success: {
      background: 'linear-gradient(135deg, #00e676, var(--accent-2))',
      color: '#0a0a12',
      border: 'none',
      fontWeight: 800,
    },
  };
  const k = kinds[kind];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: s.pad, minHeight: s.h,
        fontSize: s.fs, fontWeight: 700,
        borderRadius: 999,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        width: full ? '100%' : 'auto',
        transition: 'transform .15s ease, box-shadow .2s ease, filter .2s',
        fontFamily: 'var(--font-body)',
        letterSpacing: '.01em',
        ...k,
        ...style,
      }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(.97)')}
      onMouseUp={e => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon && (
        <svg width="18" height="18">
          <use href={`#${icon}`} />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Card({ children, style = {}, glow = false, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: glow ? 'var(--shadow-card), var(--glow-1)' : 'var(--shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Stage({ children, pad = true, style = {} }) {
  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      padding: pad ? '20px 28px' : 0,
      display: 'flex', flexDirection: 'column',
      position: 'relative', zIndex: 2,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function GameHeader({ title, subtitle, onBack, right, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,.06)', border: '1px solid var(--border-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text)', flexShrink: 0,
          }}>
            <svg width="18" height="18"><use href="#ic-back" /></svg>
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <MiniLogo />
            <span style={{ width: 1, height: 16, background: 'var(--border-2)' }} />
            <span className="mono" style={{ fontSize: '.72rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Live · Room {ROOM_CODE}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h1 className="display" style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', color: accent || 'var(--text)', lineHeight: 1 }}>
              {title}
            </h1>
            {subtitle && <span style={{ color: 'var(--muted)', fontSize: '.95rem' }}>{subtitle}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {right}
      </div>
    </div>
  );
}

export function TimerBar({ value, max, accent = 'var(--accent-2)', big = false }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = big ? 14 : 10;
  const urgent = value <= 3;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        height: h, background: 'rgba(255,255,255,.06)', borderRadius: h / 2, overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3)',
      }}>
        <div style={{
          height: '100%', width: pct + '%',
          background: urgent
            ? 'linear-gradient(90deg, #ff3b61, #ff7c00)'
            : `linear-gradient(90deg, ${accent}, var(--accent-1))`,
          borderRadius: h / 2,
          transition: 'width 1s linear, background .3s',
          boxShadow: urgent ? '0 0 20px #ff3b61' : `0 0 16px ${accent}`,
        }} />
      </div>
      <div className="display" style={{
        position: 'absolute', right: 0, top: big ? -42 : -30,
        fontSize: big ? '2rem' : '1.4rem',
        color: urgent ? '#ff3b61' : accent,
        textShadow: '0 0 12px currentColor',
        animation: urgent ? 'tick 1s ease-in-out infinite' : 'none',
      }}>
        {value}
      </div>
    </div>
  );
}

export function Confetti({ trigger, count = 60 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!trigger || !ref.current) return;
    const colors = ['#ff3b61', '#3d8eff', '#00e676', '#ffd600', '#c84bff', '#ff7c00', '#ff3cac', '#00e5ff'];
    const wrap = ref.current;
    wrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = 5 + Math.random() * 7;
      p.style.cssText = `
        position:absolute; left:${Math.random() * 100}vw; top:-10px;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > .5 ? '50%' : '2px'};
        animation: confetti-fall ${1.8 + Math.random() * 2}s linear forwards;
        animation-delay: ${Math.random() * .8}s;
      `;
      wrap.appendChild(p);
    }
    const t = setTimeout(() => { if (wrap) wrap.innerHTML = ''; }, 4000);
    return () => clearTimeout(t);
  }, [trigger]);
  return <div ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9000 }} />;
}

export function PointsPop({ pts, shown, onDone }) {
  useEffect(() => {
    if (shown) {
      const t = setTimeout(onDone, 1400);
      return () => clearTimeout(t);
    }
  }, [shown]);
  if (!shown) return null;
  return (
    <div className="display" style={{
      position: 'fixed', top: '30%', left: '50%',
      fontSize: '4rem', color: 'var(--accent-4)',
      textShadow: '0 0 30px var(--accent-4), 0 0 60px var(--accent-1)',
      animation: 'pts-fly 1.4s ease-out forwards',
      pointerEvents: 'none', zIndex: 9500, whiteSpace: 'nowrap',
    }}>
      +{pts.toLocaleString()}
    </div>
  );
}

export function TeamDot({ team, size = 12 }) {
  const t = typeof team === 'string' ? TEAMS.find(x => x.id === team) : team;
  if (!t) return null;
  const iconSize = Math.round(size * 0.58);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: t.color,
      boxShadow: `0 0 10px ${t.color}, 0 0 0 2px color-mix(in oklab, ${t.color} 30%, transparent)`,
      flexShrink: 0,
    }}>
      <svg width={iconSize} height={iconSize} style={{ color: 'rgba(0,0,0,0.45)' }}>
        <use href={`#${t.icon}`} />
      </svg>
    </span>
  );
}

export function TeamOrb({ team, size = 40 }) {
  const t = typeof team === 'string' ? TEAMS.find(x => x.id === team) : team;
  if (!t) return null;
  const iconSize = Math.round(size * 0.52);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: t.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 0 ${size * 0.4}px color-mix(in oklab, ${t.color} 50%, transparent)`,
    }}>
      <svg width={iconSize} height={iconSize} style={{ color: 'rgba(0,0,0,0.45)' }}>
        <use href={`#${t.icon}`} />
      </svg>
    </div>
  );
}

export function TeamChip({ team, score }) {
  const t = typeof team === 'string' ? TEAMS.find(x => x.id === team) : team;
  if (!t) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 14px',
      background: `color-mix(in oklab, ${t.color} 14%, transparent)`,
      border: `1px solid color-mix(in oklab, ${t.color} 40%, transparent)`,
      borderRadius: 999,
      fontWeight: 700, fontSize: '.9rem',
    }}>
      <TeamDot team={t} />
      {t.name} Team
      {score !== undefined && <span className="mono" style={{ color: 'var(--muted)', marginLeft: 4 }}>{score.toLocaleString()}</span>}
    </div>
  );
}

export function BeatPulse({ color = 'var(--accent-1)', intensity = 1 }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: color, color,
      animation: `beat-pulse ${1.2 / intensity}s ease-out infinite`,
    }} />
  );
}

export function Sparks() {
  const sparks = [
    { top: '6%',   left:  '8%',  color: 'var(--accent-1)', size: 28, delay: 0   },
    { top: '14%',  right: '10%', color: 'var(--accent-2)', size: 22, delay: .8  },
    { top: '60%',  left:  '5%',  color: 'var(--accent-3)', size: 20, delay: 1.4 },
    { bottom: '18%', right: '7%', color: 'var(--accent-4)', size: 24, delay: .4 },
    { top: '40%',  right: '20%', color: 'var(--accent-1)', size: 16, delay: 1.8 },
    { bottom: '40%', left: '15%', color: 'var(--accent-2)', size: 18, delay: 2.2 },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <svg key={i} width={s.size} height={s.size} style={{
          position: 'absolute', ...s, color: s.color,
          animation: `glimmer ${2 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
          pointerEvents: 'none',
        }}>
          <use href="#ic-sparkle" />
        </svg>
      ))}
    </>
  );
}

export function QRPlaceholder({ size = 170 }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      padding: 8,
      display: 'inline-block',
      lineHeight: 0,
    }}>
      <QRCode
        value={`https://${JOIN_URL}/?join`}
        size={size - 16}
        bgColor="#ffffff"
        fgColor="#0a0a12"
        level="M"
      />
    </div>
  );
}
