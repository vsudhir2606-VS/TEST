
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UploadModal } from './components/UploadModal';
import { MonthlyData, ProductionRecord } from './types';

const STORAGE_KEY = 'protrack_monthly_data';

const App: React.FC = () => {
  const [allData, setAllData] = useState<MonthlyData[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAllData(parsed);
        if (parsed.length > 0) {
          setSelectedMonthId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  }, [allData]);

  const selectedData = useMemo(() => {
    return allData.find(d => d.id === selectedMonthId) || null;
  }, [allData, selectedMonthId]);

  const handleUpload = (monthStr: string, records: ProductionRecord[]) => {
    const id = monthStr; // Format "YYYY-MM"
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    setAllData(prev => {
      const filtered = prev.filter(d => d.id !== id);
      const newData = [
        { id, monthName, records, createdAt: Date.now() },
        ...filtered
      ].sort((a, b) => b.id.localeCompare(a.id));
      return newData;
    });
    
    setSelectedMonthId(id);
    setIsUploadModalOpen(false);
  };

  const handleDeleteMonth = (id: string) => {
    setAllData(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (selectedMonthId === id) {
        setSelectedMonthId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Sidebar 
        allData={allData} 
        selectedId={selectedMonthId} 
        onSelect={setSelectedMonthId} 
        onAddClick={() => setIsUploadModalOpen(true)}
        onDelete={handleDeleteMonth}
      />
      
      <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {selectedData ? (
            <Dashboard data={selectedData} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl">
                <i className="fas fa-chart-line"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">No Production Data Yet</h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Upload your monthly production Excel/CSV file to start visualizing your performance metrics and insights.
                </p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <i className="fas fa-plus mr-2"></i>
                Upload First Data Set
              </button>
            </div>
          )}
        </div>
      </main>

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onUpload={handleUpload} 
        />
      )}
    </div>
  );
};

export default App;
