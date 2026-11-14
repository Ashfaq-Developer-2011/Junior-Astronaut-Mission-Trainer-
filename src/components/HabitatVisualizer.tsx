import React from 'react';
import { DestinationType } from '../types/game';

interface HabitatVisualizerProps {
  destination: DestinationType;
  visualState?: 'nominal' | 'warning' | 'alert' | 'storm' | 'critical';
  solCount?: number;
  missionNumber?: number;
  activeSystem?: string;
}

export const HabitatVisualizer: React.FC<HabitatVisualizerProps> = ({
  destination,
  visualState = 'nominal',
  solCount = 1,
  missionNumber = 1,
  activeSystem
}) => {
  const isMars = destination === 'mars';
  const isStorm = visualState === 'storm';
  const isCritical = visualState === 'critical' || visualState === 'alert';

  return (
    <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-cyan-900/60 shadow-xl bg-[#040812] select-none">
      {/* Sky Gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isMars
            ? isStorm
              ? 'bg-gradient-to-b from-[#381608] via-[#521c0b] to-[#7a2e14]'
              : 'bg-gradient-to-b from-[#120a1c] via-[#2a131b] to-[#59261a]'
            : isStorm
            ? 'bg-gradient-to-b from-[#110426] via-[#1a0e38] to-[#0d162d]'
            : 'bg-gradient-to-b from-[#02040a] via-[#050b18] to-[#0a1628]'
        }`}
      />

      {/* Starfield (visible on Moon and clear Mars nights) */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isStorm && isMars ? 'opacity-10' : 'opacity-85'}`}>
        {[
          { x: 12, y: 15, s: 2, d: 0 },
          { x: 28, y: 22, s: 1.5, d: 1 },
          { x: 45, y: 12, s: 2.5, d: 0.5 },
          { x: 62, y: 28, s: 1.5, d: 1.8 },
          { x: 78, y: 18, s: 2, d: 0.2 },
          { x: 91, y: 25, s: 1.5, d: 2.1 },
          { x: 18, y: 40, s: 1, d: 1.2 },
          { x: 84, y: 42, s: 1.5, d: 0.7 },
          { x: 53, y: 35, s: 1, d: 1.5 }
        ].map((star, idx) => (
          <div
            key={idx}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.s}px`,
              height: `${star.s}px`,
              animationDelay: `${star.d}s`
            }}
          />
        ))}
      </div>

      {/* Celestial Bodies */}
      {isMars ? (
        // Mars Sky: Phobos & Deimos small moons
        <div className="absolute top-4 right-12 flex items-center gap-6 pointer-events-none">
          <div className="w-5 h-4 rounded-full bg-slate-300 shadow-[0_0_8px_rgba(255,200,160,0.4)] opacity-80 border border-slate-400" title="Phobos" />
          <div className="w-2.5 h-2 rounded-full bg-slate-400 opacity-60" title="Deimos" />
        </div>
      ) : (
        // Moon Sky: The Earth ("Blue Marble")
        <div className="absolute top-4 right-8 pointer-events-none flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-950 shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-cyan-300/40 relative overflow-hidden">
            {/* Earth Swirls */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.7),transparent_50%)]" />
            <div className="absolute top-2 left-2 w-7 h-4 rounded-full bg-emerald-600/60 blur-[1px]" />
            <div className="absolute bottom-2 right-2 w-6 h-5 rounded-full bg-white/40 blur-[1px]" />
          </div>
          <span className="text-[9px] font-mono-tech text-blue-300 mt-1 uppercase tracking-widest opacity-80">
            Earth (384,400 km)
          </span>
        </div>
      )}

      {/* Solar Storm Aurora & Radiation Wave Effect */}
      {isStorm && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 left-0 right-0 h-40 bg-gradient-to-b from-purple-500/25 via-pink-500/20 to-transparent blur-xl animate-aurora" />
          <div className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge animate-pulse" />
          {/* Charged Particle Streaks */}
          {[15, 35, 60, 80].map((left, idx) => (
            <div
              key={idx}
              className="absolute top-0 w-0.5 h-32 bg-gradient-to-b from-yellow-200 via-pink-400 to-transparent opacity-75 transform -rotate-12 animate-pulse"
              style={{ left: `${left}%`, animationDuration: `${0.8 + idx * 0.3}s` }}
            />
          ))}
        </div>
      )}

      {/* Mars Dust Storm Haze Effect */}
      {isMars && isStorm && (
        <div className="absolute inset-0 pointer-events-none bg-[#943a1a]/25 backdrop-blur-[0.5px]">
          <div className="w-full h-full bg-[radial-gradient(circle,transparent_40%,rgba(148,58,26,0.4)_100%)]" />
        </div>
      )}

      {/* Landscape Horizons (SVG Terrain) */}
      <svg
        className="absolute bottom-0 w-full h-32 sm:h-36 md:h-40"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Terrain Gradients */}
          <linearGradient id="moonTerrainFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="moonTerrainNear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="60%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="marsTerrainFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="marsTerrainNear" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9a3412" />
            <stop offset="50%" stopColor="#7c2d12" />
            <stop offset="100%" stopColor="#2e0f06" />
          </linearGradient>
          <linearGradient id="domeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="greenhouseGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Distant Hills / Crater Rim */}
        <path
          d="M0,130 Q180,90 350,115 T700,95 T1000,120 L1000,240 L0,240 Z"
          fill={isMars ? 'url(#marsTerrainFar)' : 'url(#moonTerrainFar)'}
          opacity="0.8"
        />

        {/* Foreground Terrain & Craters */}
        <path
          d="M0,165 Q140,140 280,160 Q450,175 620,150 Q800,160 1000,145 L1000,240 L0,240 Z"
          fill={isMars ? 'url(#marsTerrainNear)' : 'url(#moonTerrainNear)'}
        />

        {/* Crater Details */}
        <ellipse cx="180" cy="190" rx="45" ry="12" fill={isMars ? '#451a03' : '#0f172a'} opacity="0.6" />
        <ellipse cx="780" cy="180" rx="65" ry="14" fill={isMars ? '#451a03' : '#0f172a'} opacity="0.6" />

        {/* OUTPOST STRUCTURES */}

        {/* Solar Array Left */}
        <g transform="translate(110, 115)">
          {/* Solar Mast */}
          <rect x="23" y="10" width="4" height="42" fill="#64748b" />
          {/* Solar Panel Wings */}
          <rect x="0" y="8" width="50" height="24" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="16" y1="8" x2="16" y2="32" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="33" y1="8" x2="33" y2="32" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="0" y1="20" x2="50" y2="20" stroke="#bae6fd" strokeWidth="0.8" />
          {/* Active generation blinker */}
          <circle cx="25" cy="5" r="2.5" fill="#38bdf8" className="animate-ping" />
        </g>

        {/* Solar Array Right */}
        <g transform="translate(740, 110)">
          <rect x="23" y="12" width="4" height="40" fill="#64748b" />
          <rect x="0" y="10" width="50" height="24" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="16" y1="10" x2="16" y2="34" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="33" y1="10" x2="33" y2="34" stroke="#bae6fd" strokeWidth="0.8" />
          <line x1="0" y1="22" x2="50" y2="22" stroke="#bae6fd" strokeWidth="0.8" />
          <circle cx="25" cy="7" r="2.5" fill="#38bdf8" className="animate-ping" />
        </g>

        {/* Communications High-Gain Dish */}
        <g transform="translate(290, 105)">
          <line x1="15" y1="15" x2="15" y2="55" stroke="#94a3b8" strokeWidth="3" />
          {/* Parabolic Dish */}
          <path d="M0,20 Q15,5 30,20" fill="none" stroke="#f8fafc" strokeWidth="3.5" />
          <line x1="15" y1="12" x2="15" y2="3" stroke="#f43f5e" strokeWidth="2" />
          <circle cx="15" cy="2" r="2" fill="#f43f5e" className="animate-pulse" />
        </g>

        {/* CENTRAL HABITAT DOME COMPLEX */}
        {/* Module A: Hydroponics Greenhouse Dome (Green Glow) */}
        <g transform="translate(370, 125)">
          <path d="M0,35 Q30,0 60,35 Z" fill="url(#greenhouseGlow)" stroke="#86efac" strokeWidth="1.5" />
          {/* Interior plants silhouette */}
          <path d="M15,35 Q20,20 25,35 Q35,18 45,35" fill="none" stroke="#15803d" strokeWidth="2" />
        </g>

        {/* Connecting Airlock Tunnel */}
        <rect x="425" y="145" width="30" height="15" rx="3" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

        {/* Module B: Primary Crew Habitat Dome */}
        <g transform="translate(450, 115)">
          {/* Regolith Berm Shielding Base */}
          <ellipse cx="60" cy="50" rx="75" ry="18" fill={isMars ? '#521c0b' : '#1e293b'} />
          {/* Main Dome */}
          <path d="M10,45 Q60,-5 110,45 Z" fill="url(#domeGlow)" stroke="#7dd3fc" strokeWidth="2" />
          {/* Geodesic Hex Structure Lines */}
          <path d="M35,38 L60,18 L85,38 M60,18 L60,45" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.6" />
          {/* Main Airlock Entryway */}
          <rect x="48" y="32" width="24" height="18" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Status Beacon on top of Dome */}
          <circle
            cx="60"
            cy="3"
            r="3.5"
            fill={isCritical ? '#ef4444' : isStorm ? '#eab308' : '#22c55e'}
            className="animate-pulse"
          />
        </g>

        {/* Secondary Module: Storm Shelter / Lab Bunker */}
        <g transform="translate(565, 130)">
          <path d="M0,32 Q25,5 50,32 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="25" cy="22" r="4" fill="#38bdf8" opacity="0.7" />
        </g>

        {/* Surface Exploration Rover */}
        <g transform="translate(640, 150)">
          {/* Chassis */}
          <rect x="8" y="8" width="32" height="14" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
          {/* Wheels */}
          <circle cx="12" cy="24" r="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="36" cy="24" r="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Mast Cam */}
          <line x1="30" y1="8" x2="30" y2="0" stroke="#64748b" strokeWidth="1.5" />
          <rect x="27" y="-3" width="7" height="4" rx="1" fill="#38bdf8" />
        </g>
      </svg>

      {/* Outpost Telemetry Overlay Badges */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-black/75 border border-cyan-500/40 text-[11px] font-mono-tech text-cyan-300 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{isMars ? 'MARS OUTPOST: JEZERO-ALPHA' : 'MOON BASE: ARTEMIS-CAMP'}</span>
        </div>

        <div className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[10px] font-mono-tech text-slate-300">
          SOL {solCount} • {isMars ? 'GRAVITY: 0.38g' : 'GRAVITY: 0.16g'}
        </div>

        {isStorm && (
          <div className="px-2.5 py-0.5 rounded bg-red-950/90 border border-red-500 text-red-200 text-[11px] font-bold font-mono-tech flex items-center gap-1 animate-pulse">
            <span>⚠ SOLAR PROTON STORM DETECTED</span>
          </div>
        )}
      </div>

      {/* Active System Focus Pill */}
      {activeSystem && (
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 border border-cyan-500/50 text-[11px] font-mono-tech text-cyan-200 shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>SYSTEM ACTIVE: {activeSystem.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};
