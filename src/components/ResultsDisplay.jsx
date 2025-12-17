import React from 'react';
import Spinner from './Spinner';
import DiagnosisCard from './DiagnosisCard';

const ResultsDisplay = ({ loading, error, diagnosisData }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 mt-12 p-8 bg-slate-800 rounded-lg">
        <Spinner />
        <p className="text-slate-400 text-center">Consulting the AI expert...</p>
        <p className="text-slate-500 text-sm text-center">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border-2 border-red-700 text-red-300 p-6 rounded-lg text-center animate-fade-in">
        <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold mb-2">Diagnosis Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!diagnosisData) {
    return (
      <div className="text-center text-slate-500 p-12 border-2 border-dashed border-slate-700 rounded-lg">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-lg font-medium mb-2">No Diagnosis Yet</p>
        <p className="text-sm">Enter your vehicle info and error codes above to get started</p>
      </div>
    );
  }
  
  const { explanation, commonality, suggestedFixes } = diagnosisData;
  
  // Validate data
  if (!explanation || !commonality || !suggestedFixes) {
    return (
      <div className="bg-yellow-900/30 border-2 border-yellow-700 text-yellow-300 p-6 rounded-lg text-center">
        <p>Received incomplete diagnosis data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Explanation Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-xl border border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Diagnosis Summary</h3>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>
      
      {/* Commonality Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-xl border border-slate-700">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Is This Common?</h3>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              <span className={`font-bold ${commonality.toLowerCase().includes('common') || commonality.toLowerCase().includes('yes') ? 'text-orange-400' : 'text-green-400'}`}>
                {commonality.toLowerCase().includes('common') || commonality.toLowerCase().includes('yes') ? "Yes" : "No"}
              </span>
              {commonality.toLowerCase().startsWith('yes') || commonality.toLowerCase().startsWith('no') 
                ? `, ${commonality.substring(commonality.indexOf(',') + 1).trim() || commonality.substring(3).trim()}`
                : `, ${commonality}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Fixes */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-white">Suggested Fixes</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">Ordered from most likely to least likely fix</p>
        <div className="space-y-4">
          {Array.isArray(suggestedFixes) && suggestedFixes.length > 0 ? (
            suggestedFixes.map((fix, index) => (
              <DiagnosisCard key={fix.name || index} fix={fix} />
            ))
          ) : (
            <p className="text-slate-500 text-center p-4">No suggested fixes available</p>
          )}
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-200 text-sm">
            <strong className="font-semibold">Important:</strong> This AI-powered diagnosis is for informational purposes only. Always consult with a qualified mechanic for professional advice and repairs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;