import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { NasaObservation } from '../types/game';
import { Phase2ScienceBundle, ScienceFeedStatus } from '../services/nasaData';
import { sound } from '../services/audio';

interface NasaScienceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  observations: NasaObservation[];
  isLive: boolean;
  onRefresh: () => void;
  isRefreshing?: boolean;
  bundle?: Phase2ScienceBundle | null;
  errorMessage?: string | null;
}

type DrawerTab = 'all' | 'solar' | 'radlab' | 'biology' | 'planetary' | 'csa_food';

function getOriginMeta(obs: NasaObservation): { label: string; colorClass: string } {
  const origin = obs.dataOrigin || (obs.status === 'live' ? 'live' : 'curated');
  if (origin === 'live') {
    return { label: 'Live API Telemetry', colorClass: 'text-[#79A88B]' };
  }
  if (origin === 'cached') {
    return { label: 'Cached Telemetry', colorClass: 'text-[#78A9C8]' };
  }
  if (origin === 'simulated') {
    return { label: 'Simulated Gameplay', colorClass: 'text-[#D2A45F]' };
  }
  return { label: 'Curated Official Record', colorClass: 'text-[#AAB5BE]' };
}

function getStatusTextColor(status: ScienceFeedStatus): string {
  switch (status) {
    case 'live':
      return 'text-[#79A88B]';
    case 'cached':
      return 'text-[#78A9C8]';
    case 'curated':
      return 'text-[#AAB5BE]';
    case 'error':
      return 'text-[#D2A45F]';
  }
}

export const NasaScienceDrawer: React.FC<NasaScienceDrawerProps> = ({
  isOpen,
  onClose,
  observations,
  isLive,
  onRefresh,
  isRefreshing = false,
  bundle = null,
  errorMessage = null
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('all');

  if (!isOpen) return null;

  const filtered = observations.filter((item) => {
    if (activeTab === 'solar') {
      return item.type === 'solar_flare' || item.type === 'cme' || item.type === 'sep' || item.type === 'geomagnetic';
    }
    if (activeTab === 'radlab') return item.type === 'radlab';
    if (activeTab === 'biology') return item.type === 'biology_osdr';
    if (activeTab === 'planetary') {
      return item.type === 'mars_trek' || item.type === 'lunar_artemis' || item.type === 'mars_weather';
    }
    if (activeTab === 'csa_food') return item.type === 'csa_food';
    return true;
  });

  const warnings = bundle?.warnings || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NASA and CSA Open Science Data Center"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1016]/80 select-none"
    >
      <div className="relative w-full max-w-4xl bg-[#19232D] border border-[#35434E] rounded-lg p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#35434E] pb-4 mb-4 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech mb-0.5">
              <span className="text-[#78A9C8]">NASA &amp; CSA Open Science Center</span>
              <span className="text-[#35434E]" aria-hidden="true">·</span>
              <span className={isLive ? 'text-[#79A88B]' : 'text-[#AAB5BE]'}>
                {isLive ? 'Server Proxy Live' : 'Verified Cached / Curated'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#F0F2F3]">
              Official NASA &amp; Canadian Space Agency Science Data
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onRefresh();
              }}
              disabled={isRefreshing}
              aria-label="Refresh NASA and CSA telemetry feeds"
              className="h-9 px-3 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#F0F2F3] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-60"
              title="Refresh NASA & CSA Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#78A9C8]' : 'text-[#AAB5BE]'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Close NASA Data Drawer"
              className="w-9 h-9 rounded-lg bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3] flex items-center justify-center transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unboxed Provenance Strip */}
        {bundle && (
          <div className="mb-3 pb-3 border-b border-[#35434E] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono-tech">
            <span className={getStatusTextColor(bundle.donkiStatus)}>
              DONKI: {bundle.donkiStatus.toUpperCase()}
            </span>
            <span className={getStatusTextColor(bundle.radlabStatus)}>
              RadLab: {bundle.radlabStatus.toUpperCase()}
            </span>
            <span className={getStatusTextColor(bundle.osdrStatus)}>
              OSDR: {bundle.osdrStatus.toUpperCase()}
            </span>
            <span className={getStatusTextColor(bundle.marsTrekStatus)}>
              Mars Trek: {bundle.marsTrekStatus.toUpperCase()}
            </span>
            <span className="text-[#AAB5BE]">CSA Food: CURATED</span>
          </div>
        )}

        {/* Scientific Integrity Callout */}
        <div className="mb-3 p-3 rounded-lg bg-[#202C36] border border-[#35434E] text-xs text-[#AAB5BE] leading-relaxed">
          <span className="font-semibold text-[#F0F2F3]">Scientific Provenance Rule:</span> Real NASA telemetry (DONKI, OSDR, RadLab, Mars Trek) is proxied via our backend server, while CSA educational resources and fallback archives are clearly labeled. Orbital radiation baselines (ISS, LRO, TGO) are never presented as planetary surface dosage, and simulated survival rates in gameplay remain distinct from NASA/CSA observations.
        </div>

        {/* Loading or Error / Warning States */}
        {isRefreshing && (
          <div className="mb-3 px-3.5 py-2 rounded-lg bg-[#202C36] border border-[#78A9C8]/50 text-xs font-mono-tech text-[#78A9C8] flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Syncing NASA DONKI, OSDR, RadLab, and Mars Trek feeds via server proxy...</span>
          </div>
        )}

        {(errorMessage || warnings.length > 0) && (
          <div className="mb-3 px-3.5 py-2.5 rounded-lg bg-[#282118] border border-[#D2A45F]/60 text-xs text-[#F0F2F3] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D2A45F] shrink-0 mt-0.5" />
            <div className="text-[#AAB5BE]">
              <span className="font-semibold text-[#D2A45F]">Upstream Notice:</span>{' '}
              {errorMessage || warnings.join(' · ')}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'solar', label: 'Solar Weather (DONKI)' },
            { id: 'radlab', label: 'Radiation (RadLab)' },
            { id: 'biology', label: 'Space Biology (OSDR)' },
            { id: 'planetary', label: 'Mars & Moon (Mars Trek)' },
            { id: 'csa_food', label: 'Food Systems (CSA)' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as DrawerTab);
              }}
              className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#78A9C8] text-[#0E171F] font-semibold'
                  : 'bg-[#202C36] hover:bg-[#2A3946] border border-[#35434E] text-[#AAB5BE] hover:text-[#F0F2F3]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'radlab' && (
            <div className="p-3.5 rounded-lg bg-[#282118] border border-[#D2A45F]/60 text-xs text-[#AAB5BE] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#D2A45F] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#F0F2F3] mb-0.5">
                  Measurement Context (Units: μGy/hour absorbed dose rate)
                </div>
                Earth LEO (ISS DosTel2), Lunar Orbit (LRO CRaTER), Mars Orbit (TGO Liulin-MO), and Mars Surface (Curiosity MSL-RAD) are measured in distinct shielding regimes. Orbital rates must never be interpreted as lunar or Martian surface dose rates. No Moon surface dataset is currently present in this RadLab feed.
              </div>
            </div>
          )}

          {/* NASA 3D Resource Collection */}
          {(activeTab === 'all' || activeTab === 'planetary') && (
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-[#AAB5BE]">
                Integrated NASA 3D Assets
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    type: 'Lander Spacecraft',
                    title: 'Apollo Lunar Module (LM-5)',
                    desc: 'Official NASA 3D model with throttleable descent engine, gold insulation foil, and quad landing footpads.',
                    meta: 'Landing Zone [-6, -6] · Active 3D Asset',
                    url: 'https://science.nasa.gov/3d-resources/apollo-lunar-module/'
                  },
                  {
                    type: 'Player Avatar',
                    title: 'NASA EVA Spacesuit Astronaut',
                    desc: 'Extravehicular Mobility Unit (EMU) with PLSS life-support backpack, gold helmet visor, and low-gravity locomotion.',
                    meta: 'Controls: WASD · Active 3D Avatar',
                    url: 'https://science.nasa.gov/3d-resources/astronaut/'
                  },
                  {
                    type: 'Deep Space Habitat',
                    title: 'Habitat Demonstration Unit (HDU)',
                    desc: 'Pressurized cylinder habitat with EVA suit ports and upper observation cupola, developed by NASA Desert RATS.',
                    meta: 'Build Menu (B) · Active 3D Module',
                    url: 'https://science.nasa.gov/3d-resources/habitat-demonstration-unit/'
                  },
                  {
                    type: 'Surface Texture',
                    title: 'NASA Lunar Surface Topography',
                    desc: 'Mapped from Lunar Reconnaissance Orbiter (LRO) imagery and elevation data, applied to the lunar terrain mesh.',
                    meta: 'Lunar Terrain · Active PBR Map',
                    url: 'https://science.nasa.gov/3d-resources/moon/'
                  }
                ].map((asset) => (
                  <div
                    key={asset.title}
                    className="p-4 rounded-lg bg-[#202C36] border border-[#35434E] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-mono-tech text-[#78A9C8]">
                          {asset.type}
                        </span>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#78A9C8] hover:text-[#9AC2DB] inline-flex items-center gap-1"
                        >
                          <span>NASA Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <h4 className="text-sm font-semibold text-[#F0F2F3]">{asset.title}</h4>
                      <p className="text-xs text-[#AAB5BE] mt-1 leading-relaxed">
                        {asset.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#35434E] text-[11px] font-mono-tech text-[#8895A0]">
                      {asset.meta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="p-6 rounded-lg bg-[#202C36] border border-[#35434E] text-center text-xs text-[#AAB5BE]">
              No records returned for this category right now. Select Refresh to query the backend proxy.
            </div>
          )}

          {/* Observation Records */}
          {filtered.map((obs) => {
            const originMeta = getOriginMeta(obs);
            const parsedTime = Date.parse(obs.timestamp);
            const timeLabel = Number.isFinite(parsedTime) ? new Date(parsedTime).toUTCString() : obs.timestamp;

            return (
              <div
                key={obs.id}
                className="p-4 sm:p-5 rounded-lg bg-[#202C36] border border-[#35434E] flex flex-col justify-between"
              >
                <div>
                  {/* Unboxed Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 text-xs font-mono-tech">
                    <div className="flex flex-wrap items-center gap-2 text-[#8895A0]">
                      <span className="text-[#78A9C8]">{obs.id}</span>
                      <span aria-hidden="true">·</span>
                      <span>{timeLabel}</span>
                    </div>
                    <span className={originMeta.colorClass}>{originMeta.label}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#F0F2F3] mb-1">{obs.title}</h3>

                  {obs.measurementContext && (
                    <div className="text-xs font-mono-tech text-[#AAB5BE] mb-2">
                      Context: {obs.measurementContext}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    {obs.previewImageUrl && (
                      <div className="sm:w-36 shrink-0 rounded-md overflow-hidden border border-[#35434E] bg-[#111820]">
                        <img
                          src={obs.previewImageUrl}
                          alt={`${obs.title} Mars Trek orbital tile`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-28 sm:h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-[#AAB5BE] leading-relaxed flex-1">{obs.summary}</p>
                  </div>

                  {/* Verified Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 bg-[#111820] p-3 rounded-md border border-[#35434E]">
                    {Object.entries(obs.metrics).map(([key, val]) => (
                      <div key={key}>
                        <div className="text-[11px] text-[#8895A0] truncate">{key}</div>
                        <div className="text-xs font-semibold font-mono-tech text-[#F0F2F3] tabular-nums truncate mt-0.5">
                          {String(val)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {obs.caveat && (
                    <div className="p-2.5 rounded-md bg-[#282118] border border-[#D2A45F]/50 text-xs text-[#AAB5BE] mb-2.5">
                      <span className="font-semibold text-[#D2A45F] mr-1.5">
                        Scientific Note:
                      </span>
                      {obs.caveat}
                    </div>
                  )}

                  <div className="p-2.5 rounded-md bg-[#141D26] border border-[#35434E] text-xs text-[#AAB5BE] mb-3">
                    <span className="font-semibold text-[#F0F2F3] block mb-0.5">
                      How This Informs Outpost Training
                    </span>
                    {obs.gameplayRelevance}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#35434E] flex items-center justify-between gap-3 text-xs text-[#8895A0]">
                  <span className="truncate">
                    Source: <span className="text-[#AAB5BE]">{obs.source}</span>
                  </span>
                  <a
                    href={obs.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#78A9C8] hover:text-[#9AC2DB] font-medium shrink-0"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
