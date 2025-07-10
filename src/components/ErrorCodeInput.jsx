import React from 'react';

const ErrorCodeInput = ({ codes, onCodesChange }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-cyan-300">2. Error Codes</h2>
      <div>
        <label htmlFor="codes" className="block text-sm font-medium text-slate-300 mb-1">Enter codes (e.g., P0420, P0301)</label>
        <textarea
          id="codes"
          name="codes"
          rows="5"
          value={codes}
          onChange={(e) => onCodesChange(e.target.value)}
          placeholder="P0420, P0171..."
          className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-slate-500"
        />
        <p className="text-xs text-slate-400 mt-1">Separate multiple codes with a comma or space.</p>
      </div>
    </div>
  );
};

export default ErrorCodeInput;