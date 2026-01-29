import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import VehicleSelector from '../components/VehicleSelector';
import ErrorCodeInput from '../components/ErrorCodeInput';
import ResultsDisplay from '../components/ResultsDisplay';
import Spinner from '../components/Spinner';

const generatePrompt = (vehicle, codes) => {
    const cleanedCodes = codes.split(/[,\s]+/).filter(c => c.trim()).join(', ');

    return `You are an expert automotive diagnostic AI. Analyze these OBD2 codes for the vehicle below.

VEHICLE: ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}
ERROR CODES: ${cleanedCodes}

IMPORTANT: Respond with ONLY valid JSON, no extra text, no markdown. Use this exact format:

{
  "diagnosis": {
    "explanation": "Clear explanation of the problem. End with: This is a diagnostic guide, not a replacement for a professional mechanic.",
    "commonality": "State if this is common for this specific vehicle.",
    "suggestedFixes": [
      {
        "name": "Check Gas Cap",
        "difficulty": 1,
        "description": "Inspect and tighten or replace the gas cap.",
        "isMostLikely": true
      },
      {
        "name": "Replace Oxygen Sensor",
        "difficulty": 3,
        "description": "Test and replace faulty O2 sensor if needed.",
        "isMostLikely": false
      }
    ]
  }
}

Provide 3-5 fixes ordered by likelihood. Mark ONLY ONE as isMostLikely: true.`;
};

function Home() {
    const [session, setSession] = useState(null);
    const [savedVehicles, setSavedVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

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

    useEffect(() => {
        // Check auth and fetch vehicles
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchSavedVehicles(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchSavedVehicles(session.user.id);
            } else {
                setSavedVehicles([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchSavedVehicles = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error.message);
        }
    };

    const handleVehicleSelect = (e) => {
        const vehicleId = e.target.value;
        setSelectedVehicleId(vehicleId);

        if (vehicleId === 'manual') {
            setVehicle({ year: '', make: '', model: '', trim: '' });
        } else if (vehicleId) {
            const selected = savedVehicles.find(v => v.id.toString() === vehicleId);
            if (selected) {
                setVehicle({
                    year: selected.year,
                    make: selected.make,
                    model: selected.model,
                    trim: selected.trim || ''
                });
            }
        }
    };

    const handleDiagnose = async () => {
        if (!codes.trim()) {
            setError("Please enter at least one error code.");
            return;
        }

        if (!vehicle.year || !vehicle.make || !vehicle.model) {
            setError("Please select your vehicle year, make, and model.");
            return;
        }

        setLoading(true);
        setError(null);
        setDiagnosis(null);

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

        const prompt = generatePrompt(vehicle, codes);

        try {
            console.log("Sending request to Gemini API...");

            // Add timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 2048,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_NONE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorBody = await response.json();
                console.error("API Error:", JSON.stringify(errorBody, null, 2));
                console.error("Status Code:", response.status);
                console.error("Status Text:", response.statusText);

                const errorMessage = errorBody?.error?.message || `API Error: ${response.statusText}`;

                // Show the FULL error message to user for debugging
                throw new Error(`${errorMessage} (HTTP ${response.status})`);
            }

            const data = await response.json();
            console.log("Full API Response:", data);

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("AI returned no response. Please try again.");
            }

            const candidate = data.candidates[0];

            // Check for blocked content
            if (candidate.finishReason === "SAFETY") {
                throw new Error("Response was blocked by safety filters. Try different error codes.");
            }

            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error("AI response is empty. Please try again.");
            }

            const rawText = candidate.content.parts[0].text;
            console.log("Raw AI Response:", rawText);

            if (!rawText || rawText.trim().length === 0) {
                throw new Error("AI returned empty text. Please try again.");
            }

            // More aggressive JSON extraction
            let cleanJsonText = rawText.trim();

            // Remove all markdown
            cleanJsonText = cleanJsonText.replace(/```json\n?/gi, '');
            cleanJsonText = cleanJsonText.replace(/```\n?/g, '');
            cleanJsonText = cleanJsonText.replace(/^[^{]*/, ''); // Remove anything before first {
            cleanJsonText = cleanJsonText.replace(/[^}]*$/, ''); // Remove anything after last }

            console.log("Cleaned text for parsing:", cleanJsonText);

            let parsedDiagnosis;
            try {
                parsedDiagnosis = JSON.parse(cleanJsonText);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.error("Failed to parse:", cleanJsonText);
                throw new Error("AI response is not valid JSON. Please try again with different codes.");
            }

            if (!parsedDiagnosis?.diagnosis) {
                console.error("Missing diagnosis key:", parsedDiagnosis);
                throw new Error("AI response is missing diagnosis data. Please try again.");
            }

            const diag = parsedDiagnosis.diagnosis;

            // Validate required fields
            if (!diag.explanation || !diag.commonality || !Array.isArray(diag.suggestedFixes)) {
                console.error("Incomplete diagnosis:", diag);
                throw new Error("AI response is incomplete. Please try again.");
            }

            if (diag.suggestedFixes.length === 0) {
                throw new Error("AI returned no suggested fixes. Please try again.");
            }

            // Ensure at least one fix is marked as most likely
            if (!diag.suggestedFixes.some(f => f.isMostLikely)) {
                diag.suggestedFixes[0].isMostLikely = true;
            }

            console.log("Successfully parsed diagnosis:", diag);
            setDiagnosis(diag);

        } catch (e) {
            console.error("Diagnosis Error:", e);

            if (e.name === 'AbortError') {
                setError('Request timed out. The API is taking too long to respond. Please try again.');
            } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                setError('Network error. Please check your internet connection and API key.');
            } else {
                setError(e.message || 'An unknown error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4">
            <header className="mb-8 text-center pt-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">OBD.ai</h1>
                <p className="text-slate-400 text-lg">Personalized Check Engine Light Diagnostics</p>
            </header>

            <main className="bg-slate-800 p-6 rounded-lg shadow-xl">
                {/* Saved Vehicles Dropdown - Only show if logged in and has vehicles */}
                {session && savedVehicles.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-slate-700">
                        <label className="block text-sm font-medium text-cyan-300 mb-2">
                            🚗 My Garage - Quick Select
                        </label>
                        <select
                            value={selectedVehicleId}
                            onChange={handleVehicleSelect}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        >
                            <option value="">Select a saved vehicle...</option>
                            {savedVehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.year} {v.make} {v.model}
                                </option>
                            ))}
                            <option value="manual">— Enter Manually —</option>
                        </select>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={selectedVehicleId && selectedVehicleId !== 'manual' ? 'opacity-50 pointer-events-none' : ''}>
                        <VehicleSelector vehicle={vehicle} onVehicleChange={setVehicle} />
                    </div>
                    <ErrorCodeInput codes={codes} onCodesChange={setCodes} />
                </div>


                <button
                    onClick={handleDiagnose}
                    disabled={loading}
                    className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-colors"
                >
                    {loading ? (
                        <>
                            <Spinner />
                            <span>Analyzing...</span>
                        </>
                    ) : (
                        'Diagnose My Car'
                    )}
                </button>
            </main>

            <section className="mt-8">
                <ResultsDisplay loading={loading} error={error} diagnosisData={diagnosis} />
            </section>
        </div>
    );
}

export default Home;