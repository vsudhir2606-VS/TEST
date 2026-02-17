
import React, { useState } from 'react';
import { ProductionRecord } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (month: string, records: ProductionRecord[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [month, setMonth] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContent(text);
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsText(file);
    }
  };

  const parseData = () => {
    setError('');
    if (!month) {
      setError('Please select a month.');
      return;
    }

    if (!csvContent.trim()) {
      setError('Please provide data content.');
      return;
    }

    try {
      // Split by any newline character sequence
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
      const records: ProductionRecord[] = [];

      lines.forEach((line, index) => {
        // Skip common header row identifiers
        const lowerLine = line.toLowerCase();
        if (index === 0 && (lowerLine.includes('name') || lowerLine.includes('production') || lowerLine.includes('value'))) {
          return;
        }

        // Support comma, semicolon, or tab separation
        const parts = line.split(/[,\t;]/).map(p => p.trim().replace(/^"|"$/g, ''));
        
        if (parts.length >= 2) {
          const name = parts[0];
          // Extract only digits and decimal points for robust parsing
          const valueStr = parts[1].replace(/[^0-9.]/g, '');
          const value = parseFloat(valueStr);
          
          if (name && !isNaN(value)) {
            records.push({ name, value });
          }
        }
      });

      if (records.length === 0) {
        throw new Error('No valid production records found. Ensure Column A has names and Column B has numbers.');
      }

      onUpload(month, records);
    } catch (err: any) {
      setError(err.message || 'Failed to parse data. Please check the format.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">Upload Monthly Production</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Select Month</label>
            <input 
              type="month" 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Production Data (CSV/Excel)</label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => setCsvContent(event.target?.result as string);
                  reader.readAsText(file);
                }
              }}
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                <i className="fas fa-file-csv text-2xl"></i>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 font-medium">Drag & drop your CSV file or</p>
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-bold">
                  Browse files
                  <input type="file" className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Column A: Name | Column B: Data</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Or Paste Content</label>
            <textarea 
              placeholder="John Doe, 5000&#10;Jane Smith, 4200..."
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-mono"
            ></textarea>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100">
              <i className="fas fa-circle-exclamation flex-shrink-0"></i>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={parseData}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};
