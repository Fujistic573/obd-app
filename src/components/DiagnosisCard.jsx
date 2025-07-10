import React from 'react';

const DifficultyMeter = ({ level }) => {
  return (
    <div className="flex items-center gap-1.5" title={`Difficulty: ${level}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-2 rounded-full ${i < level ? 'bg-cyan-400' : 'bg-slate-600'}`}
        />
      ))}
    </div>
  );
};


const DiagnosisCard = ({ fix }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-lg transition-transform hover:scale-[1.02] hover:border-cyan-500">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{fix.name}</h4>
          <p className="text-slate-400 text-sm mt-1">{fix.description}</p>
        </div>
        <div className="flex-shrink-0">
          {fix.isMostLikely && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Most Likely
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">DIY Difficulty:</span>
        <DifficultyMeter level={fix.difficulty} />
      </div>
    </div>
  );
};

export default DiagnosisCard;