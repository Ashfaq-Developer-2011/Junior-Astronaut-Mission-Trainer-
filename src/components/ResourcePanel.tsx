import React from 'react';
import { Shield, Zap, Wind, Utensils, Sparkles, AlertTriangle } from 'lucide-react';
import { ResourceDelta, ResourceState } from '../types/game';

interface ResourcePanelProps {
  resources: ResourceState;
  recentDelta?: ResourceDelta | null;
  compact?: boolean;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({
  resources,
  recentDelta,
  compact = false
}) => {
  const getStatusColor = (val: number) => {
    if (val <= 20) return 'text-red-400 border-red-500/60 bg-red-950/40';
    if (val <= 45) return 'text-amber-300 border-amber-500/50 bg-amber-950/30';
    return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30';
  };

  const getBarColor = (val: number) => {
    if (val <= 20) return 'from-red-600 to-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]';
    if (val <= 45) return 'from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    return 'from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  };

  const coreList = [
    {
      key: 'lifeSupport' as const,
      label: 'Life Support (O₂ & Water)',
      value: resources.lifeSupport,
      delta: recentDelta?.lifeSupport,
      icon: Wind,
      unit: '%',
      detail: 'ECLSS loop integrity, cabin pressure, oxygen & potable water'
    },
    {
      key: 'power' as const,
      label: 'Energy & Power Grid',
      value: resources.power,
      delta: recentDelta?.power,
      icon: Zap,
      unit: '%',
      detail: 'Solar arrays, fuel cells, Kilopower fission & battery storage'
    },
    {
      key: 'protection' as const,
      label: 'Radiation & Hull Shielding',
      value: resources.protection,
      delta: recentDelta?.protection,
      icon: Shield,
      unit: '%',
      detail: 'Regolith berm, water wall, storm shelter & micrometeorite armor'
    },
    {
      key: 'food' as const,
      label: 'Food & Crew Stamina',
      value: resources.food,
      delta: recentDelta?.food,
      icon: Utensils,
      unit: '%',
      detail: 'Hydroponic crop harvest, ration reserves & crew stamina'
    }
  ];

  return (
    <div className="w-full bg-[#070e1c]/95 border border-cyan-900/60 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-cyan-300">
            Outpost Core Telemetry
          </h2>
        </div>

        {/* Science Research Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-mono-tech font-bold">
            SCIENCE: <span className="text-white text-sm">{resources.science}</span> PTS
          </span>
          {recentDelta?.science !== undefined && recentDelta.science !== 0 && (
            <span
              className={`text-xs font-bold font-mono-tech animate-bounce ${
                recentDelta.science > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {recentDelta.science > 0 ? `+${recentDelta.science}` : recentDelta.science}
            </span>
          )}
        </div>
      </div>

      {/* 4 Core Resource Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {coreList.map(item => {
          const Icon = item.icon;
          const statusClass = getStatusColor(item.value);
          const barClass = getBarColor(item.value);

          return (
            <div
              key={item.key}
              className={`relative rounded-xl border p-2.5 transition-all ${statusClass} flex flex-col justify-between`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-lg bg-black/40">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-mono-tech font-bold text-sm text-white">
                    {item.value}
                    <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                  </span>

                  {/* Animated Delta Float */}
                  {item.delta !== undefined && item.delta !== 0 && (
                    <span
                      className={`text-xs font-mono-tech font-bold px-1 rounded animate-pulse ${
                        item.delta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {item.delta > 0 ? `+${item.delta}` : item.delta}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 rounded-full bg-slate-900/90 overflow-hidden border border-slate-700/50 p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${barClass}`}
                  style={{ width: `${Math.min(100, Math.max(4, item.value))}%` }}
                />
              </div>

              {/* Sub-label */}
              <div className="mt-1.5 text-[10px] text-slate-400 truncate font-mono-tech">
                {item.value <= 20 ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Critical threshold!
                  </span>
                ) : (
                  item.detail
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
