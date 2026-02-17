
import React from 'react';
import { MonthlyData } from '../types';

interface SidebarProps {
  allData: MonthlyData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
  onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ allData, selectedId, onSelect, onAddClick, onDelete }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-40">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <i className="fas fa-industry text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ProTrack</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports</h3>
            <button 
              onClick={onAddClick}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-plus-circle"></i>
              Add
            </button>
          </div>
          
          <div className="space-y-1">
            {allData.length === 0 ? (
              <p className="text-sm text-slate-400 px-2 italic">No reports found</p>
            ) : (
              allData.map(month => (
                <div 
                  key={month.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    selectedId === month.id 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => onSelect(month.id)}
                >
                  <div className="flex items-center gap-3">
                    <i className={`far fa-calendar-alt ${selectedId === month.id ? 'text-blue-500' : 'text-slate-400'}`}></i>
                    <span className="truncate">{month.monthName}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('Delete this month?')) onDelete(month.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Months Tracked</p>
          <p className="text-2xl font-bold text-slate-900">{allData.length}</p>
        </div>
      </div>
    </aside>
  );
};
