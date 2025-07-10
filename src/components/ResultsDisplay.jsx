// --- START OF FILE ResultsDisplay.jsx (CORRECTED) ---

import React from 'react';
import Spinner from './Spinner';
import DiagnosisCard from './DiagnosisCard';

const ResultsDisplay = ({ loading, error, diagnosisData }) => {
  if (loading) {
    return <div className="flex flex-col items-center gap-4 mt-12"><Spinner /><p className="text-slate-400">Consulting the AI expert...</p></div>;
  }

  if (error) {
    return <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>;
  }

  if (!diagnosisData) {
    return <div className="text-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-lg">Your diagnosis will appear here.</div>;
  }
  
  // *** THIS IS THE CRITICAL CHANGE ***
  // diagnosisData now directly contains explanation, commonality, and suggestedFixes
  const { explanation, commonality, suggestedFixes } = diagnosisData;
  
  console.log("Analysis Data (ResultsDisplay):", diagnosisData); // This log will now show the correct object!

  return (
    <div className="space-y-6 animate-fade-in"> {/* Added animate-fade-in for the smooth entry */}
      {/* Explanation Card */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">Diagnosis Summary</h3>
        {/* Uses 'explanation' directly */}
        <p className="text-slate-300 whitespace-pre-wrap">{explanation}</p>
      </div>
      
      {/* Commonality Card */}
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">Is This Common?</h3>
        <p className="text-slate-300 whitespace-pre-wrap">
          {/* Infer 'isCommon' based on the content of the 'commonality' string */}
          <span className={`font-bold ${commonality && commonality.toLowerCase().includes('common') ? 'text-orange-400' : 'text-green-400'}`}>
            {commonality && commonality.toLowerCase().includes('common') ? "Yes" : "No"}
          </span>
          {/* Uses 'commonality' directly */}
          , {commonality}
        </p>
      </div>

      {/* Suggested Fixes */}
      <div>
        <h3 className="text-2xl font-bold mb-4 text-center">Suggested Fixes</h3>
        <div className="space-y-4">
          {/* Check if suggestedFixes is an array before mapping */}
          {Array.isArray(suggestedFixes) && suggestedFixes.map((fix) => (
            <DiagnosisCard key={fix.name} fix={fix} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
// --- END OF FILE ResultsDisplay.jsx (CORRECTED) ---