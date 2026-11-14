import React, { useState } from 'react';
import { X, Search, BookOpen, ExternalLink, Sparkles, Volume2 } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossary';
import { sound } from '../services/audio';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Life Support', 'Power & Energy', 'Radiation & Sun', 'Planetary Science', 'Spacecraft & Habitat'];

  const filtered = GLOSSARY_TERMS.filter(item => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.funFact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#081224] border border-cyan-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono-tech text-cyan-400 uppercase tracking-widest font-bold">
                JUNIOR ASTRONAUT DICTIONARY
              </span>
              <h2 className="text-lg sm:text-xl font-display font-bold text-white">
                Space Science & Habitat Glossary
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Categories */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words (e.g. radiation, sol, ECLSS, regolith)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Terms List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching scientific terms found. Try searching another space word!
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#09152b] border border-cyan-900/50 hover:border-cyan-700/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{item.term}</span>
                      {item.phonetic && (
                        <span className="text-xs font-mono-tech text-cyan-300 font-normal">
                          [{item.phonetic}]
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-mono-tech text-cyan-400 uppercase font-semibold">
                      {item.category}
                    </span>
                  </div>

                  {item.nasaLink && (
                    <a
                      href={item.nasaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono-tech"
                    >
                      <span>NASA Article</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-2.5">
                  {item.simpleDefinition}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Fun Fact:</span> {item.funFact}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
