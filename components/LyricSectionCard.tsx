
import React from 'react';
import { LyricSection } from '../types';

interface LyricSectionCardProps {
  section: LyricSection;
  index: number;
}

const LyricSectionCard: React.FC<LyricSectionCardProps> = ({ section, index }) => {
  const getHeaderColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'chorus': return 'text-purple-400 border-purple-400/30';
      case 'bridge': return 'text-amber-400 border-amber-400/30';
      case 'verse': return 'text-blue-400 border-blue-400/30';
      default: return 'text-slate-400 border-slate-400/30';
    }
  };

  return (
    <div className="mb-8 group">
      <div className={`inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest uppercase border rounded-full ${getHeaderColor(section.type)}`}>
        {section.type} {section.type === 'Verse' ? index : ''}
      </div>
      <div className="space-y-2">
        {section.lines.map((line, idx) => (
          <p 
            key={idx} 
            className="text-lg md:text-xl font-light leading-relaxed text-slate-200 transition-all duration-300 hover:text-white"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LyricSectionCard;
