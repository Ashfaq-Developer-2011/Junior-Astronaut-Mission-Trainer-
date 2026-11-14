import React, { useState } from 'react';
import { X, Hammer, Zap, Wind, Droplets, Check, AlertCircle } from 'lucide-react';
import { BuildingType, BuildingBlueprint } from '../../types/survival';
import { BUILDING_BLUEPRINTS } from '../simulation/GameEngine';
import { sound } from '../../services/audio';

interface BuildMenuProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Map<string, number>;
  onSelectBlueprint: (type: BuildingType) => void;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({
  isOpen,
  onClose,
  inventory,
  onSelectBlueprint
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Life Support' | 'Power' | 'Protection' | 'Science & Food'>('All');

  if (!isOpen) return null;

  const blueprints = Object.values(BUILDING_BLUEPRINTS).filter(bp => {
    if (selectedCategory === 'All') return true;
    return bp.category === selectedCategory;
  });

  const canAfford = (bp: BuildingBlueprint): boolean => {
    for (const [res, count] of Object.entries(bp.cost)) {
      if ((inventory.get(res) || 0) < count) {
        return false;
      }
    }
    return true;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Base Construction"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-4xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-4 gap-4">
          <div>
            <div className="text-xs font-mono-tech text-[#78A9C8] mb-0.5">
              Outpost Engineering
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Base Construction &amp; Fabrication
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close construction menu"
            className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Available Materials & Engineering Note */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#35434E] text-xs">
          <div className="flex flex-wrap items-center gap-4 font-mono-tech tabular-nums text-[#AAB5BE]">
            <span className="font-sans text-[#8895A0]">Materials in cargo:</span>
            <span>
              Regolith <strong className="text-[#F0F2F3] font-semibold">{inventory.get('regolith') || 0}</strong>
            </span>
            <span>
              Ice <strong className="text-[#F0F2F3] font-semibold">{inventory.get('ice') || 0}</strong>
            </span>
            <span>
              Silicon <strong className="text-[#F0F2F3] font-semibold">{inventory.get('silicon') || 0}</strong>
            </span>
          </div>
          <span className="text-[11px] text-[#8895A0]">
            kW, O₂, H₂O, and growth values are simulated balance metrics paired with NASA/CSA context.
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {['All', 'Life Support', 'Power', 'Protection', 'Science & Food'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat as typeof selectedCategory);
              }}
              className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#78A9C8] text-[#0E171F] font-semibold'
                  : 'bg-[#202C36] hover:bg-[#2A3946] text-[#AAB5BE] hover:text-[#F0F2F3] border border-[#35434E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blueprint Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {blueprints.map(bp => {
              const affordable = canAfford(bp);

              return (
                <div
                  key={bp.type}
                  className={`p-4 rounded-lg border flex flex-col justify-between transition-colors ${
                    affordable
                      ? 'bg-[#202C36] border-[#35434E]'
                      : 'bg-[#151E27] border-[#2A3640] opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-sm sm:text-base text-[#F0F2F3]">
                        {bp.name}
                      </h3>
                      <span className="text-[11px] font-mono-tech text-[#8895A0] shrink-0">
                        {bp.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#AAB5BE] leading-relaxed mb-3">
                      {bp.description}
                    </p>

                    {/* Telemetry Impact */}
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-mono-tech tabular-nums">
                      {bp.powerDelta !== 0 && (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            bp.powerDelta > 0 ? 'text-[#79A88B]' : 'text-[#D2A45F]'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          {bp.powerDelta > 0 ? `+${bp.powerDelta} kW` : `${bp.powerDelta} kW`}
                        </span>
                      )}

                      {bp.oxygenDelta !== 0 && (
                        <span className="inline-flex items-center gap-1 text-[#78A9C8]">
                          <Wind className="w-3.5 h-3.5" />
                          +{bp.oxygenDelta} O₂/s
                        </span>
                      )}

                      {bp.waterDelta !== 0 && (
                        <span className="inline-flex items-center gap-1 text-[#78A9C8]">
                          <Droplets className="w-3.5 h-3.5" />
                          {bp.waterDelta > 0 ? `+${bp.waterDelta}` : bp.waterDelta} H₂O
                        </span>
                      )}
                    </div>

                    {/* Material Requirements */}
                    <div className="py-2.5 px-3 rounded-md bg-[#111820] border border-[#35434E] mb-3">
                      <div className="text-[11px] text-[#8895A0] mb-1">
                        Required Materials
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono-tech tabular-nums">
                        {Object.entries(bp.cost).map(([res, needed]) => {
                          const has = inventory.get(res) || 0;
                          const enough = has >= needed;
                          return (
                            <span
                              key={res}
                              className={`inline-flex items-center gap-1 ${
                                enough ? 'text-[#79A88B]' : 'text-[#C97979]'
                              }`}
                            >
                              {enough ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              <span className="capitalize">{res}</span>
                              <span>{has}/{needed}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8895A0] leading-snug mb-3.5">
                      Reference: {bp.nasaContext}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!affordable) return;
                      sound.playSuccess();
                      onSelectBlueprint(bp.type);
                      onClose();
                    }}
                    disabled={!affordable}
                    className={`w-full min-h-[40px] py-2 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                      affordable
                        ? 'bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F]'
                        : 'bg-[#111820] border border-[#35434E] text-[#778590] cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>{affordable ? 'Select for Placement' : 'Insufficient Materials'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
