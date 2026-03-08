
import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { getAIPlanningInsights } from '../services/geminiService';
import { TreeItem, SoilEntry, AnalysisResponse } from '../types';

interface Props {
  siteArea: number;
  targetPct: number;
  trees: TreeItem[];
  soilEntries: SoilEntry[];
}

export const AIInsights: React.FC<Props> = ({ siteArea, targetPct, trees, soilEntries }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIPlanningInsights(siteArea, targetPct, trees, soilEntries);
      setInsights(data);
    } catch (err: any) {
      setError("Unable to generate AI insights. Check your connection or API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="bg-indigo-100 text-indigo-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Planning Consultant</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Leverage generative intelligence to analyze your canopy targets and soil provisions against urban development standards.
        </p>
        
        {!insights && !loading && (
          <button 
            onClick={generateInsights}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2 mx-auto"
          >
            <Sparkles size={20} /> Analyze Design Data
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 animate-pulse">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-slate-400 font-medium italic">Synthesizing landscape ecology data...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-rose-800 text-center">
          <p>{error}</p>
          <button onClick={generateInsights} className="mt-2 font-bold underline">Retry Analysis</button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-4">Strategic Summary</h3>
            <p className="text-slate-700 leading-relaxed text-lg">
              {insights.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl flex gap-4 items-start">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg flex-shrink-0">
                  <ArrowRight size={16} />
                </div>
                <p className="text-slate-700 font-medium">{rec}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => { setInsights(null); generateInsights(); }}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-2"
            >
              <Sparkles size={16} /> Refresh Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
