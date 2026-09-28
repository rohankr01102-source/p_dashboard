"use client";

import React from "react";
import { Activity, ShieldCheck, Zap } from "lucide-react";

interface RadarMetric {
  subject: string;
  score: number;
  fullMark: number;
}

interface VocalRadarOverviewProps {
  radarMetrics?: RadarMetric[];
  progressTimeline?: any[];
}

export const VocalRadarOverview: React.FC<VocalRadarOverviewProps> = ({
  radarMetrics = [
    { subject: "Intonation", score: 88.5, fullMark: 100 },
    { subject: "Stability", score: 86.0, fullMark: 100 },
    { subject: "Vibrato", score: 89.0, fullMark: 100 },
    { subject: "Dynamics", score: 85.5, fullMark: 100 },
    { subject: "Breath Control", score: 84.0, fullMark: 100 },
    { subject: "Timbre Clarity", score: 88.0, fullMark: 100 },
  ],
  progressTimeline = [],
}) => {
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const angleStep = (Math.PI * 2) / 6;

  const rings = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valuePct: number) => {
    const safePct = isNaN(valuePct) ? 0.5 : Math.max(0.05, Math.min(1.0, valuePct));
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * safePct;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Safe polygon path points
  const polygonPoints = radarMetrics
    .map((m, idx) => {
      const score = Number(m.score) || 0;
      const fullMark = Number(m.fullMark) || 100;
      const pct = Math.max(0.1, Math.min(1.0, score / Math.max(1, fullMark)));
      const { x, y } = getCoordinates(idx, pct);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const defaultTrendPoints = [
    { x: 40, y: 125, yStab: 132, label: "74%", d: "Sep 12" },
    { x: 110, y: 110, yStab: 120, label: "78%", d: "Sep 15" },
    { x: 190, y: 92, yStab: 102, label: "83%", d: "Sep 18" },
    { x: 270, y: 72, yStab: 85, label: "88%", d: "Sep 21" },
    { x: 360, y: 55, yStab: 68, label: "91%", d: "Sep 24" },
    { x: 450, y: 35, yStab: 48, label: "93%", d: "Today" },
  ];

  const trendPoints = React.useMemo(() => {
    if (!progressTimeline || progressTimeline.length < 2) return defaultTrendPoints;
    const recent = progressTimeline.slice(-6);
    const n = recent.length;
    const xCoords = [40, 110, 190, 270, 360, 450].slice(6 - n);
    return recent.map((item: any, idx: number) => {
      const acc = Number(item.pitchAccuracy ?? item.overallScore ?? 80);
      const stab = Number(item.tempoConsistency ?? item.stabilityScore ?? Math.max(60, acc - 5));
      const clampAcc = Math.max(50, Math.min(100, acc));
      const clampStab = Math.max(50, Math.min(100, stab));
      const y = 145 - ((clampAcc - 50) / 50) * 110;
      const yStab = 145 - ((clampStab - 50) / 50) * 110;
      let dateLabel = "Recent";
      if (item.date) {
        try {
          const d = new Date(item.date);
          dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch {}
      }
      return {
        x: xCoords[idx] ?? (40 + idx * 70),
        y: Math.round(y),
        yStab: Math.round(yStab),
        label: `${Math.round(clampAcc)}%`,
        d: dateLabel,
      };
    });
  }, [progressTimeline]);

  const cyanPathD = React.useMemo(() => {
    if (trendPoints.length === 0) return "";
    return `M ${trendPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
  }, [trendPoints]);

  const cyanAreaD = React.useMemo(() => {
    if (trendPoints.length === 0) return "";
    const first = trendPoints[0];
    const last = trendPoints[trendPoints.length - 1];
    return `M ${first.x} ${first.y} L ${trendPoints.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${last.x} 145 L ${first.x} 145 Z`;
  }, [trendPoints]);

  const brandPathD = React.useMemo(() => {
    if (trendPoints.length === 0) return "";
    return `M ${trendPoints.map((p) => `${p.x} ${p.yStab}`).join(" L ")}`;
  }, [trendPoints]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* 6-Axis Radar Chart */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl lg:col-span-5 shadow-glass flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-neon-cyan" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Vocal Skill Geometry
              </h3>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
              6-Axis DSP Radar
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time multi-dimensional assessment of vocal resonance, intonation, and breath support.
          </p>
        </div>

        {/* SVG Radar */}
        <div className="relative my-4 flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Background concentric polygons */}
            {rings.map((r, ringIdx) => {
              const ringPoints = Array.from({ length: 6 })
                .map((_, i) => {
                  const { x, y } = getCoordinates(i, r);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ");
              return (
                <polygon
                  key={ringIdx}
                  points={ringPoints}
                  fill={ringIdx === rings.length - 1 ? "rgba(99,102,241,0.02)" : "none"}
                  stroke="rgba(255,255,255,0.09)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axes spokes */}
            {Array.from({ length: 6 }).map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* User Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(6, 182, 212, 0.25)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            />

            {/* Node markers & labels */}
            {radarMetrics.map((m, idx) => {
              const score = Number(m.score) || 0;
              const fullMark = Number(m.fullMark) || 100;
              const pct = Math.max(0.1, Math.min(1.0, score / Math.max(1, fullMark)));
              const { x, y } = getCoordinates(idx, pct);
              const labelPos = getCoordinates(idx, 1.25);

              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#38bdf8"
                    stroke="#090d16"
                    strokeWidth="2"
                    className="shadow-glow"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                    className="select-none tracking-wider"
                  >
                    {m.subject}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {Math.round(score)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-3 text-center">
          <div className="rounded-xl bg-white/[0.02] p-2">
            <span className="text-[10px] text-slate-400">Peak Domain</span>
            <p className="text-xs font-bold text-neon-cyan">Vibrato (89%)</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] p-2">
            <span className="text-[10px] text-slate-400">Growth Focus</span>
            <p className="text-xs font-bold text-amber-400">Breath (84%)</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] p-2">
            <span className="text-[10px] text-slate-400">Vocal Health</span>
            <p className="text-xs font-bold text-emerald-400">Optimal</p>
          </div>
        </div>
      </div>

      {/* Intonation & Pitch Stability Progression Area Chart */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl lg:col-span-7 shadow-glass flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pitch Accuracy & Centering Trend
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-slate-300">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-cyan-400" /> Pitch Accuracy
              </span>
              <span className="flex items-center text-slate-400">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-brand-500" /> Stability
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Intonation progression across consecutive takes. Shows micro-cent drift reduction over time.
          </p>
        </div>

        {/* SVG Area Chart */}
        <div className="my-3 w-full overflow-x-auto">
          <div className="min-w-[400px]">
            <svg viewBox="0 0 500 160" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[40, 80, 120].map((y, i) => (
                <line
                  key={i}
                  x1="30"
                  y1={y}
                  x2="490"
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="5" y="44" fill="#64748b" fontSize="9" fontFamily="monospace">95%</text>
              <text x="5" y="84" fill="#64748b" fontSize="9" fontFamily="monospace">85%</text>
              <text x="5" y="124" fill="#64748b" fontSize="9" fontFamily="monospace">75%</text>

              {/* Trend Curve */}
              {cyanAreaD && (
                <path
                  d={cyanAreaD}
                  fill="url(#cyanGradient)"
                />
              )}
              {cyanPathD && (
                <path
                  d={cyanPathD}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  className="filter drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                />
              )}
              {brandPathD && (
                <path
                  d={brandPathD}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              )}

              {/* Dots */}
              {trendPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#090d16" stroke="#06b6d4" strokeWidth="2.5" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    {pt.label}
                  </text>
                  <text x={pt.x} y={155} textAnchor="middle" fill="#64748b" fontSize="9">
                    {pt.d}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-brand-500/10 border border-brand-500/20 px-3.5 py-2.5 text-xs text-brand-200">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-neon-cyan" />
            <span>AI Coach Insight: Intonation error has reduced by 12.8 cents over 14 days.</span>
          </div>
          <span className="font-bold text-white font-mono">+19% Mastery</span>
        </div>
      </div>
    </div>
  );
};
