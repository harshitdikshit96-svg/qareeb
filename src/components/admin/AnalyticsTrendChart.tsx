"use client";

import { useRef, useState } from "react";

type TrendPoint = { day: string; pageviews: number; uniqueVisitors: number };

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 24, left: 36 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

// Validated pair (dataviz skill, aqua/yellow slots) — distinct from the
// device-split chart's blue/orange so the two charts' colors never imply a
// relationship that isn't there.
const PAGEVIEWS_COLOR = "#1baf7a";
const VISITORS_COLOR = "#c98500";

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const residual = value / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsTrendChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = data.length;
  const maxPageviews = Math.max(1, ...data.map((d) => d.pageviews));
  const yMax = niceCeil(maxPageviews);

  const xAt = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const yAt = (v: number) => PAD.top + PLOT_H - (v / yMax) * PLOT_H;

  const pageviewsPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(d.pageviews)}`)
    .join(" ");
  const visitorsPath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(d.uniqueVisitors)}`)
    .join(" ");

  const totalPageviews = data.reduce((s, d) => s + d.pageviews, 0);
  const totalVisitors = data.reduce((s, d) => s + d.uniqueVisitors, 0);

  const tickCount = Math.min(6, n);
  const tickIndices = Array.from(
    new Set(
      Array.from({ length: tickCount }, (_, i) =>
        n <= 1 ? 0 : Math.round((i / (tickCount - 1)) * (n - 1))
      )
    )
  );
  const yTicks = [0, yMax / 2, yMax];

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (localX - PAD.left) / PLOT_W;
    const idx = Math.round(ratio * (n - 1));
    setHoverIndex(Math.min(n - 1, Math.max(0, idx)));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const tooltipLeftPct =
    hoverIndex !== null ? Math.min(90, Math.max(10, (xAt(hoverIndex) / WIDTH) * 100)) : 0;

  return (
    <div>
      <div className="flex items-center gap-5 text-sm mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-0.5 rounded-full"
            style={{ backgroundColor: PAGEVIEWS_COLOR }}
          />
          <span className="text-neutral-500">Pageviews</span>
          <span className="font-semibold">{totalPageviews.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-0.5 rounded-full"
            style={{ backgroundColor: VISITORS_COLOR }}
          />
          <span className="text-neutral-500">Unique visitors</span>
          <span className="font-semibold">{totalVisitors.toLocaleString()}</span>
        </div>
      </div>

      {n === 0 ? (
        <p className="text-sm text-neutral-500 py-8 text-center">No data yet.</p>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  stroke="#e1e0d9"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 6}
                  y={yAt(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="#898781"
                >
                  {Math.round(t).toLocaleString()}
                </text>
              </g>
            ))}

            {tickIndices.map((i, tickPos) => (
              <text
                key={i}
                x={xAt(i)}
                y={HEIGHT - 6}
                textAnchor={
                  tickPos === 0 ? "start" : tickPos === tickIndices.length - 1 ? "end" : "middle"
                }
                fontSize={10}
                fill="#898781"
              >
                {formatShortDate(data[i].day)}
              </text>
            ))}

            {hoverIndex !== null && (
              <line
                x1={xAt(hoverIndex)}
                x2={xAt(hoverIndex)}
                y1={PAD.top}
                y2={PAD.top + PLOT_H}
                stroke="#c3c2b7"
                strokeWidth={1}
              />
            )}

            <path
              d={pageviewsPath}
              fill="none"
              stroke={PAGEVIEWS_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={visitorsPath}
              fill="none"
              stroke={VISITORS_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle
              cx={xAt(n - 1)}
              cy={yAt(data[n - 1].pageviews)}
              r={4}
              fill={PAGEVIEWS_COLOR}
              stroke="#fff"
              strokeWidth={2}
            />
            <circle
              cx={xAt(n - 1)}
              cy={yAt(data[n - 1].uniqueVisitors)}
              r={4}
              fill={VISITORS_COLOR}
              stroke="#fff"
              strokeWidth={2}
            />

            {hovered && hoverIndex !== null && (
              <>
                <circle
                  cx={xAt(hoverIndex)}
                  cy={yAt(hovered.pageviews)}
                  r={4}
                  fill={PAGEVIEWS_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <circle
                  cx={xAt(hoverIndex)}
                  cy={yAt(hovered.uniqueVisitors)}
                  r={4}
                  fill={VISITORS_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </>
            )}
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-lg bg-neutral-900 text-white text-xs px-3 py-2 shadow-lg whitespace-nowrap"
              style={{ left: `${tooltipLeftPct}%` }}
            >
              <p className="text-neutral-400 mb-1">{formatShortDate(hovered.day)}</p>
              <p className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: PAGEVIEWS_COLOR }}
                />
                <span className="font-semibold">{hovered.pageviews.toLocaleString()}</span>
                <span className="text-neutral-400">pageviews</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: VISITORS_COLOR }}
                />
                <span className="font-semibold">{hovered.uniqueVisitors.toLocaleString()}</span>
                <span className="text-neutral-400">unique</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
