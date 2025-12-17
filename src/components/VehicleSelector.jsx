import React, { useEffect, useState } from 'react';

const proxy = 'https://corsproxy.io/?';

const VehicleSelector = ({ vehicle, onVehicleChange }) => {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [isLoading, setIsLoading] = useState({ makes: false, models: false, trims: false });

  // 1. Fetch Makes when Year changes.
  useEffect(() => {
    if (!vehicle.year) return;
    setIsLoading(prev => ({ ...prev, makes: true }));
    setMakes([]); setModels([]); setTrims([]);

    const url = proxy + encodeURIComponent(`https://www.carqueryapi.com/api/0.3/?cmd=getMakes&year=${vehicle.year}`);
    fetch(url).then(res => res.json()).then(data => {
      console.log("Fetched makes:", data?.Makes);
      if (data?.Makes) setMakes(data.Makes.map(m => m.make_display).sort());
    }).catch(e => console.error("Error fetching makes:", e))
      .finally(() => setIsLoading(prev => ({ ...prev, makes: false })));
  }, [vehicle.year]);

  // 2. Fetch Models when Make changes AND makes have been loaded.
  useEffect(() => {
    if (!vehicle.make || makes.length === 0) return;
    setIsLoading(prev => ({ ...prev, models: true }));
    setModels([]); setTrims([]);

    const url = proxy + encodeURIComponent(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${vehicle.make.toLowerCase()}&year=${vehicle.year}`);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data?.Models) setModels(data.Models.map(m => m.model_name).sort());
      })
      .catch(e => console.error("Error fetching models:", e))
      .finally(() => setIsLoading(prev => ({ ...prev, models: false })));
  }, [vehicle.make, vehicle.year, makes]);

  // 3. Fetch Trims when Model changes AND models have been loaded.
  useEffect(() => {
    if (!vehicle.model || models.length === 0) return;
    setIsLoading(prev => ({ ...prev, trims: true }));
    setTrims([]);

    const url = proxy + encodeURIComponent(`https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${vehicle.make.toLowerCase()}&model=${vehicle.model}&year=${vehicle.year}`);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text(); // Get as text first to handle non-JSON responses
      })
      .then(text => {
        try {
          const data = JSON.parse(text);
          if (data?.Trims) {
            const trimOptions = data.Trims.map(t =>
              `${t.model_trim || 'Base'} - ${t.model_engine_cc ? `${t.model_engine_cc / 1000}L` : ''} - ${t.model_transmission_type || ''}`
            ).sort();
            setTrims(trimOptions.length > 0 ? trimOptions : ['Standard']);
          } else {
            setTrims(['Standard']); // Fallback
          }
        } catch (parseError) {
          console.error("Failed to parse trims JSON:", text.substring(0, 100));
          setTrims(['Standard']); // Fallback to a default option
        }
      })
      .catch(e => {
        console.error("Error fetching trims:", e);
        setTrims(['Standard']); // Fallback to a default option
      })
      .finally(() => setIsLoading(prev => ({ ...prev, trims: false })));
  }, [vehicle.model, vehicle.year, vehicle.make, models]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...vehicle, [name]: value };
    if (name === 'year') { updated.make = ''; updated.model = ''; updated.trim = ''; }
    if (name === 'make') { updated.model = ''; updated.trim = ''; }
    if (name === 'model') { updated.trim = ''; }
    onVehicleChange(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-cyan-300">1. Your Vehicle</h2>
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-slate-300 mb-1">Year</label>
        <select id="year" name="year" value={vehicle.year} onChange={handleSelectChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="">Select year</option>
          {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="make" className="block text-sm font-medium text-slate-300 mb-1">Make</label>
        <select id="make" name="make" value={vehicle.make} onChange={handleSelectChange} disabled={isLoading.makes || !vehicle.year} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 disabled:opacity-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="">{isLoading.makes ? 'Loading...' : 'Select a make'}</option>
          {makes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">Model</label>
        <select id="model" name="model" value={vehicle.model} onChange={handleSelectChange} disabled={isLoading.models || !vehicle.make} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 disabled:opacity-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="">{isLoading.models ? 'Loading...' : 'Select a model'}</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="trim" className="block text-sm font-medium text-slate-300 mb-1">Trim / Specifics (Optional)</label>
        <select id="trim" name="trim" value={vehicle.trim} onChange={handleSelectChange} disabled={isLoading.trims || !vehicle.model} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 disabled:opacity-50 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="">{isLoading.trims ? 'Loading...' : 'Select trim (optional)'}</option>
          {trims.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
};

export default VehicleSelector;