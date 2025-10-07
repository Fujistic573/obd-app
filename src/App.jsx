// --- START OF FINAL, WORKING App.jsx ---

import { useState } from 'react';
import VehicleSelector from './components/VehicleSelector';
import ErrorCodeInput from './components/ErrorCodeInput';
import ResultsDisplay from './components/ResultsDisplay';
import Spinner from './components/Spinner';
import logo from './assets/logo.svg'; // The missing logo import
const generatePrompt = (vehicle, codes) => {
  // We can add more context for the AI inside the function
  const isMultipleCodes = codes.includes(',') || codes.includes(' ');

  // The main instruction block for the AI. This is where we engineer the response.
  const instructions = `
    You are "AutoSpec AI", an expert automotive diagnostic assistant. Your tone is helpful, clear, and professional. You are speaking directly to a car owner who is likely not an expert. Avoid overly technical jargon where possible, or explain it simply.

    Your primary goal is to analyze the provided OBD2 error codes in the context of the specific vehicle and provide a safe, logical, and prioritized action plan.Also make sure to identify any relationships between the codes, prioritize them by severity, and provide a clear explanation of the most likely root cause.

    **CRITICAL INSTRUCTIONS:**
    1.  **Analyze Relationships:** If multiple codes are provided, your FIRST step is to determine if they are related. For example, a vacuum leak (P0171/P0174) often causes misfires (P030x). Explicitly state this relationship if you find one.
    2.  **Prioritize by Severity:** Always address the most severe or root-cause codes first in your explanation. A failing computer (P0606) is more critical than a gas cap leak (P0456).
    3.  **Be Cautious:** If a code is ambiguous or could have many causes, state that clearly. If codes seem to contradict each other (e.g., P0171 "too lean" and P0172 "too rich"), identify this as a likely sensor or computer issue.
    4.  **Provide a Disclaimer:** The final part of your explanation MUST include the sentence: "This is a diagnostic guide, not a replacement for a professional mechanic."
    5. **Be careful with older cars that may not have OBD2 codes. If the vehicle is older than 1996, state that OBD2 codes may not be available and suggest checking for any visible issues or consulting a mechanic.
    6. **Vehicle Context:** Use the provided vehicle context to tailor your analysis. If the vehicle is a common model with known issues, mention that explicitly.
    7. **Search the web for common issues related to the vehicle make, model, and engine type. If you find any known issues, include them in your analysis and mention the sources.
    **VEHICLE CONTEXT:**
    *   Year: ${vehicle.year}
    *   Make: ${vehicle.make}
    *   Model: ${vehicle.model}
    *   Trim Details: ${vehicle.trim || 'Not specified'}
    * *   Multiple Codes Detected: ${isMultipleCodes}

    **ERROR CODES TO ANALYZE:**
    ${codes}

    **RESPONSE FORMAT:**
    Provide your response exclusively in a clean, minified JSON format. The JSON object must have a single top-level key named "diagnosis". The value of "diagnosis" should be an object containing:
    1.  "explanation": A string explaining the codes, their relationships, and the most likely root cause, ending with the mandatory disclaimer.
    2.  "commonality": A string stating if this is a common problem for this specific vehicle model and engine. Be specific if possible (e.g., "Yes, the intake manifold gaskets on this V6 are a known failure point.").
    3.  "suggestedFixes": An array of 3-5 objects, ordered from MOST LIKELY/SIMPLEST fix to LEAST LIKELY/MOST COMPLEX. Each object must have:
        *   "name": (string) A short name for the fix (e.g., "Check Gas Cap Seal").
        *   "difficulty": (number 1-5) A rating from 1 (very easy) to 5 (mechanic required).
        *   "description": (string) A simple, one-sentence description of the fix.
        *   "isMostLikely": (boolean) A flag set to 'true' for the single most probable fix to try first.
        
  `;

  return instructions;
};
function App() {
  const [vehicle, setVehicle] = useState({ 
    year: '2024', 
    make: 'Ford', 
    model: 'F-150',
    trim: ''
  });
  
  const [codes, setCodes] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDiagnose = async () => {
    if (!codes.trim()) {
      setError("Please enter at least one error code.");
      return;
    }
    setLoading(true);
    setError(null);
    setDiagnosis(null);

    
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

    const prompt = generatePrompt(vehicle, codes);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = errorBody?.error?.message || `API Error: ${response.statusText}`;
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("AI did not return a valid response structure.");
      }
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedDiagnosis = JSON.parse(cleanJsonText);
      if (parsedDiagnosis?.diagnosis) {
        setDiagnosis(parsedDiagnosis.diagnosis);
      } else {
        throw new Error("AI response structure missing 'diagnosis' key.");
      }
    } catch (e) {
      setError(`Diagnosis failed: ${e.message || 'An unknown error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans flex justify-center items-center p-4">
      <div className="w-full max-w-3xl">
        <header className="flex items-center gap-4 mb-8">
          {logo && <img src={logo} alt="Logo" className="w-12 h-12" />}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">OBD.ai</h1>
            <p className="text-slate-400">Personalized Check Engine Light Diagnostics</p>
          </div>
        </header>
        <main className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VehicleSelector vehicle={vehicle} onVehicleChange={setVehicle} />
            <ErrorCodeInput codes={codes} onCodesChange={setCodes} />
          </div>
          <button onClick={handleDiagnose} disabled={loading} className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center">
            {loading ? <Spinner /> : 'Diagnose My Car'} 
          </button>
        </main>
        <section className="mt-8">
          <ResultsDisplay loading={loading} error={error} diagnosisData={diagnosis} />
        </section>
      </div>
    </div>
  );
}

export default App;

// --- END OF FINAL, WORKING App.jsx ---