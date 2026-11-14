import React from 'react';
import {
  X,
  Utensils,
  Droplets,
  Mountain,
  Snowflake,
  Cpu,
  FlaskConical
} from 'lucide-react';
import { sound } from '../../services/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Map<string, number>;
  onEatFood: () => void;
  onMeltIce: () => void;
  vitals: { food: number; water: number };
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onEatFood,
  onMeltIce,
  vitals
}) => {
  if (!isOpen) return null;

  const items = [
    {
      id: 'regolith',
      name: 'Planetary Regolith Ore',
      count: inventory.get('regolith') || 0,
      Icon: Mountain,
      description: 'Crushed mineral rock containing iron, titanium, and silicates for foundations and radiation shielding.'
    },
    {
      id: 'ice',
      name: 'Sub-surface Water-Ice',
      count: inventory.get('ice') || 0,
      Icon: Snowflake,
      description: 'Frozen volatile ice harvested from shaded craters. Can be melted into drinking water or split into oxygen.'
    },
    {
      id: 'silicon',
      name: 'Solar Silicon Ore',
      count: inventory.get('silicon') || 0,
      Icon: Cpu,
      description: 'High-purity semiconductor crystal used for fabricating solar photovoltaic arrays and battery circuitry.'
    },
    {
      id: 'food_rations',
      name: 'Nutrient Food Rations',
      count: inventory.get('food_rations') || 0,
      Icon: Utensils,
      description: 'Hydroponic produce and balanced astronaut rations to sustain physical EVA performance.'
    },
    {
      id: 'biosignature',
      name: 'Biosignature Core Sample',
      count: inventory.get('biosignature') || 0,
      Icon: FlaskConical,
      description: 'Drilled geological core sample from ancient strata. Analyze in the Research Laboratory for science data.'
    }
  ];

  const foodCount = inventory.get('food_rations') || 0;
  const iceCount = inventory.get('ice') || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cargo Manifest"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-2xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-4 gap-4">
          <div>
            <div className="text-xs font-mono-tech text-[#78A9C8] mb-0.5">
              EVA Backpack Inventory
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Cargo &amp; Field Resource Manifest
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close cargo manifest"
            className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Survival Actions Bar */}
        <div className="p-3.5 rounded-lg bg-[#202C36] border border-[#35434E] flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-xs text-[#AAB5BE] font-mono-tech tabular-nums">
            Suit Reserves · Food {Math.round(vitals.food)}% · H₂O {Math.round(vitals.water)}%
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (foodCount <= 0) return;
                sound.playSuccess();
                onEatFood();
              }}
              disabled={foodCount <= 0}
              className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                foodCount > 0
                  ? 'bg-[#79A88B] hover:bg-[#8AB59B] text-[#0E171F]'
                  : 'bg-[#111820] border border-[#35434E] text-[#778590] cursor-not-allowed'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Eat Ration (+25% Food)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (iceCount < 2) return;
                sound.playSuccess();
                onMeltIce();
              }}
              disabled={iceCount < 2}
              className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                iceCount >= 2
                  ? 'bg-[#78A9C8] hover:bg-[#8BB8D4] text-[#0E171F]'
                  : 'bg-[#111820] border border-[#35434E] text-[#778590] cursor-not-allowed'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Melt 2 Ice (+25% H₂O)</span>
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto border border-[#35434E] rounded-lg bg-[#141D26] divide-y divide-[#35434E]">
          {items.map(({ id, name, count, Icon, description }) => (
            <div
              key={id}
              className="p-3.5 flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-[#202C36] border border-[#35434E] flex items-center justify-center text-[#78A9C8] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-[#F0F2F3]">{name}</h3>
                  <p className="text-xs text-[#AAB5BE] leading-snug mt-0.5">
                    {description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <div className="text-lg font-mono-tech font-semibold text-[#F0F2F3] tabular-nums">
                  {count}
                </div>
                <div className="text-[11px] text-[#8895A0] font-mono-tech">units</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
