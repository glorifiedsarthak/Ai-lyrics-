
import React, { useState } from 'react';
import { Genre, Mood, GeneratorParams } from '../types';

interface SettingsPanelProps {
  onGenerate: (params: GeneratorParams) => void;
  isLoading: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState<Genre>(Genre.POP);
  const [mood, setMood] = useState<Mood>(Mood.HAPPY);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, genre, mood, keywords });
  };

  return (
    <div className="glass p-6 rounded-2xl sticky top-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <i className="fa-solid fa-sliders text-purple-400"></i>
        Composition Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">What's the song about?</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all h-24 resize-none"
            placeholder="E.g., A rainy night in Paris, remembering a lost love..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {Object.values(Genre).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as Mood)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {Object.values(Mood).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Key Phrases / Keywords</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="E.g., starlight"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl transition-colors"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {keywords.map((kw, idx) => (
              <span key={idx} className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-2">
                {kw}
                <button type="button" onClick={() => removeKeyword(idx)}>
                  <i className="fa-solid fa-xmark hover:text-white transition-colors"></i>
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isLoading 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 text-white'
          }`}
        >
          {isLoading ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <i className="fa-solid fa-music"></i>
          )}
          {isLoading ? 'Composing...' : 'Weave Lyrics'}
        </button>
      </form>
    </div>
  );
};

export default SettingsPanel;
