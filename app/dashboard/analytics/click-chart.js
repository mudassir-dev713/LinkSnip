'use client';

import { useEffect, useId, useRef, useState } from 'react';

const PAD = { top: 16, right: 16, bottom: 30, left: 44 };
const PRIMARY = 'hsl(var(--primary))';
const GRID = 'hsl(var(--border))';

/** Pick a round axis ceiling + evenly spaced integer ticks. */
function niceScale(maxValue, tickCount = 4) {
  const max = Math.max(1, maxValue);
  const rough = max / tickCount;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * pow;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= niceMax + step / 2; v += step) ticks.push(Math.round(v));
  return { max: niceMax, ticks };
}

/** Monotone-ish smooth cubic path through the given points. */
function smoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const mid = (a.x + b.x) / 2;
    d += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/**
 * Clicks-over-time chart. Bar chart for the 24h view (one bar per hour), a
 * smoothed area line for multi-day views. Fully responsive — measured with a
 * ResizeObserver so strokes and labels never stretch or overflow, and the
 * hover tooltip is HTML (not SVG) so it can't be clipped at the edges.
 */
export function ClickChart({ data = [], period = '7d', height = 260 }) {
  const wrapRef = useRef(null);
  const gradientId = useId();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isBars = period === '24h';
  const n = data.length;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(0, height - PAD.top - PAD.bottom);
  const maxClicks = data.reduce((m, d) => Math.max(m, d.clicks || 0), 0);
  const scale = niceScale(maxClicks);

  const bandW = n > 0 ? plotW / n : plotW;
  const stepX = n > 1 ? plotW / (n - 1) : 0;

  const xCenter = (i) => (isBars ? PAD.left + bandW * (i + 0.5) : PAD.left + i * stepX);
  const yAt = (v) => PAD.top + plotH - (clamp(v, 0, scale.max) / scale.max) * plotH;

  const points = data.map((d, i) => ({ x: xCenter(i), y: yAt(d.clicks), ...d }));
  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PAD.top + plotH} L ${points[0].x} ${
          PAD.top + plotH
        } Z`
      : '';

  const labelStep = isBars ? 3 : Math.max(1, Math.ceil(n / 7));
  const activePoint = active != null && data[active] ? data[active] : null;
  const activeX = activePoint ? xCenter(active) : 0;
  const dotRadius = n <= 32 ? 2.5 : 0;

  const handleMove = (e) => {
    if (n === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    let i;
    if (isBars) {
      i = Math.floor((relX - PAD.left) / bandW);
    } else {
      i = Math.round((relX - PAD.left) / (stepX || 1));
    }
    setActive(clamp(i, 0, n - 1));
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{ height }}
      onMouseLeave={() => setActive(null)}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Clicks over the last ${period}`}
          onMouseMove={handleMove}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: PRIMARY, stopOpacity: 0.26 }} />
              <stop offset="100%" style={{ stopColor: PRIMARY, stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Horizontal grid + y ticks */}
          {scale.ticks.map((tick) => {
            const y = yAt(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={width - PAD.right}
                  y2={y}
                  stroke={GRID}
                  strokeWidth="1"
                  strokeDasharray={tick === 0 ? 'none' : '3 3'}
                />
                <text
                  x={PAD.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] tabular-nums"
                >
                  {tick.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars (24h) */}
          {isBars &&
            data.map((d, i) => {
              const barW = Math.max(2, bandW * 0.62);
              const y = yAt(d.clicks);
              const barH = Math.max(d.clicks > 0 ? 2 : 0, PAD.top + plotH - y);
              return (
                <rect
                  key={i}
                  x={xCenter(i) - barW / 2}
                  y={PAD.top + plotH - barH}
                  width={barW}
                  height={barH}
                  rx="2"
                  style={{ fill: PRIMARY }}
                  fillOpacity={active == null || active === i ? 0.9 : 0.45}
                  className="transition-[fill-opacity]"
                />
              );
            })}

          {/* Area + line (multi-day) */}
          {!isBars && points.length > 0 && (
            <>
              <path d={areaPath} fill={`url(#${gradientId})`} />
              <path
                d={linePath}
                fill="none"
                stroke={PRIMARY}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {dotRadius > 0 &&
                points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={active === i ? dotRadius + 2 : dotRadius}
                    style={{ fill: 'hsl(var(--card))', stroke: PRIMARY }}
                    strokeWidth="2"
                  />
                ))}
            </>
          )}

          {/* Hover guide */}
          {activePoint && (
            <line
              x1={activeX}
              y1={PAD.top}
              x2={activeX}
              y2={PAD.top + plotH}
              stroke={PRIMARY}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          )}

          {/* X labels */}
          {data.map((d, i) => {
            if (i % labelStep !== 0) return null;
            return (
              <text
                key={i}
                x={xCenter(i)}
                y={height - PAD.bottom + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {d.shortLabel}
              </text>
            );
          })}
        </svg>
      )}

      {/* HTML tooltip — never clipped by the SVG box */}
      {activePoint && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: clamp(activeX, 56, Math.max(width - 56, 56)) }}
        >
          <div className="font-medium tabular-nums">{activePoint.clicks.toLocaleString()} clicks</div>
          <div className="text-muted-foreground">{activePoint.label}</div>
        </div>
      )}
    </div>
  );
}
