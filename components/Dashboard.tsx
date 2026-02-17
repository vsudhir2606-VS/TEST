
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';
import { MonthlyData, Stats, AIInsight } from '../types';
import { analyzeProductionData } from '../services/geminiService';

interface DashboardProps {
  data: MonthlyData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo<Stats>(() => {
    if (!data.records || data.records.length === 0) {
      return { total: 0, average: 0, max: 0, min: 0, count: 0, topPerformer: 'None' };
    }
    const values = data.records.map(r => r.value || 0);
    const total = values.reduce((sum, v) => sum + v, 0);
    const max = Math.max(...values);
    const topPerformer = data.records.find(r => r.value === max)?.name || 'N/A';
    
    return {
      total,
      average: total / values.length,
      max,
      min: Math.min(...values),
      count: values.length,
      topPerformer
    };
  }, [data]);

  const getInsight = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeProductionData(data);
      setInsight(result);
    } catch (err: any) {
      console.error("Failed to get AI insights", err);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [data]);

  useEffect(() => {
    getInsight();
  }, [getInsight]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  if (!data.records || data.records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <i className="fas fa-exclamation-triangle text-amber-500 text-3xl mb-4"></i>
        <h3 className="text-lg font-bold text-slate-800">No records found for this month</h3>
        <p className="text-slate-500">The data set appears to be empty or corrupted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.monthName}</h2>
          <p className="text-slate-500 mt-1">Production Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <i className="fas fa-clock text-blue-400"></i>
          <span>Last updated {new Date(data.createdAt).toLocaleDateString()}</span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="Total Production" 
          value={stats.total.toLocaleString()} 
          icon="fa-boxes-stacked" 
          color="bg-blue-600" 
        />
        <StatCard 
          label="Average Output" 
          value={stats.average.toFixed(1)} 
          icon="fa-chart-line" 
          color="bg-emerald-600" 
        />
        <StatCard 
          label="Top Performer" 
          value={stats.topPerformer} 
          icon="fa-trophy" 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Team Size" 
          value={stats.count.toString()} 
          icon="fa-users" 
          color="bg-violet-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-blue-500"></i>
            Production by Personnel
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.records} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                >
                  {data.records.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative min-h-[400px]">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <i className="fas fa-brain text-8xl"></i>
          </div>
          
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-sparkles text-amber-400"></i>
            AI Insights
          </h3>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">Analyzing monthly data...</p>
            </div>
          ) : insight ? (
            <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Executive Summary</p>
                <p className="text-slate-200 text-sm leading-relaxed">{insight.summary}</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Trend Analysis</p>
                <p className="text-slate-200 text-sm leading-relaxed italic">"{insight.trendAnalysis}"</p>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Recommendations</p>
                <ul className="space-y-3">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                        <i className="fas fa-check text-[10px] text-blue-400 group-hover:text-white"></i>
                      </div>
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={getInsight}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-400 transition-colors border border-slate-700"
              >
                Refresh Analysis
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <i className="fas fa-circle-exclamation text-slate-600 text-3xl mb-4"></i>
              <p className="text-slate-500 text-sm mb-4">{error || "Insights unavailable"}</p>
              <button 
                onClick={getInsight}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Raw Data Records</h3>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-medium">A - B Columns</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                  <th className="px-6 py-3">Name (A)</th>
                  <th className="px-6 py-3">Production (B)</th>
                  <th className="px-6 py-3">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.records.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{row.name}</td>
                    <td className="px-6 py-4 text-slate-600">{row.value.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full max-w-[80px]">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${stats.total > 0 ? (row.value / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-xs font-medium">
                          {stats.total > 0 ? ((row.value / stats.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-emerald-500"></i>
            Resource Allocation
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.records}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {data.records.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.records.slice(0, 6).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 truncate">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="truncate">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        <i className={`fas ${icon} text-lg`}></i>
      </div>
      <span className="text-slate-300">
        <i className="fas fa-ellipsis-h"></i>
      </span>
    </div>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
  </div>
);
