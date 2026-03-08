
import React from 'react';
import { Plus, Trash2, Shovel, Info, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SoilEntry, TreeItem } from '../types';

interface Props {
  entries: SoilEntry[];
  setEntries: (v: SoilEntry[]) => void;
  trees: TreeItem[];
}

export const DeepSoilCalculator: React.FC<Props> = ({ entries, setEntries, trees }) => {
  const addEntry = () => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setEntries([...entries, { 
      id, 
      areaId: `Zone ${entries.length + 1}`, 
      treeIds: [], 
      soilAreaProvided: 25.0, 
      isCluster: false 
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const updateEntry = (id: string, updates: Partial<SoilEntry>) => {
    setEntries(entries.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addTreeToZone = (zoneId: string, treeId: string) => {
    if (!treeId) return;
    const entry = entries.find(e => e.id === zoneId);
    if (entry && !entry.treeIds.includes(treeId)) {
      updateEntry(zoneId, { treeIds: [...entry.treeIds, treeId] });
    }
  };

  const removeTreeFromZone = (zoneId: string, treeId: string) => {
    const entry = entries.find(e => e.id === zoneId);
    if (entry) {
      updateEntry(zoneId, { treeIds: entry.treeIds.filter(id => id !== treeId) });
    }
  };

  const getTableBData = (diameter: number) => {
    if (diameter < 4) return { req: 0, dim: 0, class: 'N/A' };
    if (diameter < 5) return { req: 12, dim: 2.5, class: 'A' };
    if (diameter < 6) return { req: 16, dim: 3.0, class: 'A' };
    if (diameter < 7) return { req: 25, dim: 3.5, class: 'A' };
    if (diameter < 8) return { req: 36, dim: 4.0, class: 'A' };
    if (diameter < 9) return { req: 49, dim: 4.5, class: 'B' };
    if (diameter < 10) return { req: 64, dim: 5.0, class: 'B' };
    if (diameter < 11) return { req: 81, dim: 5.5, class: 'B' };
    if (diameter < 12) return { req: 100, dim: 6.0, class: 'B' };
    if (diameter < 13) return { req: 121, dim: 6.5, class: 'C' };
    if (diameter < 14) return { req: 136, dim: 7.0, class: 'C' };
    return { req: 144, dim: 7.5, class: 'C' };
  };

  const totalSoilProvided = entries.reduce((acc, curr) => acc + curr.soilAreaProvided, 0);
  
  const zoneStats = entries.map(entry => {
    const linkedTrees = trees.filter(t => entry.treeIds.includes(t.id));
    const tableDataArray = linkedTrees.map(t => getTableBData(t.diameter));
    const totalBaseReq = tableDataArray.reduce((sum, d) => sum + d.req, 0);
    const adjustedReq = totalBaseReq * (entry.isCluster ? 0.95 : 1.0);
    return entry.soilAreaProvided >= adjustedReq;
  });

  const passingZones = zoneStats.filter(Boolean).length;
  const soilCompliancePct = entries.length > 0 ? (passingZones / entries.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informational Header */}
        <div className="lg:col-span-2 bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Shovel size={28} /> Deep Soil Volume Assessment
            </h2>
            <p className="text-emerald-100/80 max-w-2xl mb-6">
              Ensuring adequate root volume is critical for tree health. Minimum soil area and dimension standards apply based on tree mature size.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Small (Type A)</p>
                  <p className="text-sm font-medium">Min Dim: 2.5m - 4.0m</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Medium (Type B)</p>
                  <p className="text-sm font-medium">Min Dim: 4.5m - 6.0m</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Large (Type C)</p>
                  <p className="text-sm font-medium">Min Dim: 6.5m - 7.5m</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
        </div>

        {/* Compliance Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full relative flex items-center justify-center min-h-[240px]">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: 100 }]}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  fill="#f1f5f9"
                  isAnimationActive={false}
                />
                <Pie
                  data={[{ value: soilCompliancePct }, { value: 100 - soilCompliancePct }]}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={10}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="transparent" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-slate-800 tracking-tight leading-none">
              {soilCompliancePct.toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-2">
              Soil Compliance
            </span>
          </div>
        </div>
      </div>

      {/* Calculator Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Soil Allocation Log</h3>
            <p className="text-sm text-slate-500 italic">Assign trees from inventory to deep soil zones</p>
          </div>
          <button 
            onClick={addEntry}
            disabled={trees.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-sm ${ trees.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            <Plus size={18} /> Add Soil Zone
          </button>
        </div>

        {trees.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="bg-rose-50 text-rose-500 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
            </div>
            <div className="max-w-xs mx-auto">
                <p className="font-bold text-slate-800">No Trees Detected</p>
                <p className="text-sm text-slate-500">Please add trees in the Canopy tab first.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked Trees</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Provided Soil (m²)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Cluster?</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Agg. Target</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Req. Min Dim</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const linkedTrees = trees.filter(t => entry.treeIds.includes(t.id));
                  const tableDataArray = linkedTrees.map(t => getTableBData(t.diameter));
                  const totalBaseReq = tableDataArray.reduce((sum, d) => sum + d.req, 0);
                  const maxRequiredDim = tableDataArray.length > 0 ? Math.max(...tableDataArray.map(d => d.dim)) : 0;
                  const adjustedReq = totalBaseReq * (entry.isCluster ? 0.95 : 1.0);
                  const isPass = entry.soilAreaProvided >= adjustedReq;

                  return (
                    <tr key={entry.id} className={`hover:bg-emerald-50/30 transition-colors group ${!isPass ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={entry.areaId}
                          onChange={(e) => updateEntry(entry.id, { areaId: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-bold text-slate-700"
                        />
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {linkedTrees.map(t => (
                            <span key={t.id} className="inline-flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded text-[10px] font-bold shadow-sm border border-slate-100 group/tag">
                              {t.code || '??'}
                              <button onClick={() => removeTreeFromZone(entry.id, t.id)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={12}/></button>
                            </span>
                          ))}
                        </div>
                        <select 
                          value=""
                          onChange={(e) => addTreeToZone(entry.id, e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="">+ Add tree...</option>
                          {trees.map(t => (
                            <option key={t.id} value={t.id} disabled={entry.treeIds.includes(t.id)}>
                              {t.code || '??'} &mdash; {t.type || 'Unnamed'} ({t.diameter}m)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            {!isPass && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                            <div className="flex items-center gap-1">
                                <input 
                                    type="number" 
                                    value={entry.soilAreaProvided}
                                    onChange={(e) => updateEntry(entry.id, { soilAreaProvided: Number(e.target.value) })}
                                    className={`w-20 px-2 py-1.5 rounded border text-sm font-bold text-right transition-all outline-none ${
                                      isPass 
                                      ? 'border-slate-200 focus:border-emerald-500' 
                                      : 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-1 focus:ring-rose-500'
                                    }`}
                                />
                                <span className="text-xs text-slate-400 font-medium">m²</span>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={entry.isCluster}
                          onChange={(e) => updateEntry(entry.id, { isCluster: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{adjustedReq.toFixed(1)}m²</span>
                            {entry.isCluster && entry.treeIds.length > 0 && <span className="text-[9px] text-emerald-600 font-bold uppercase">-5% Cluster</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-mono font-bold text-slate-600">
                          {maxRequiredDim > 0 ? `${maxRequiredDim.toFixed(1)}m` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${isPass ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                          {isPass ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isPass ? 'Pass' : 'Shortfall'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => removeEntry(entry.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {entries.length > 0 && (
                <tfoot className="bg-slate-50 font-bold text-slate-700 border-t border-slate-200">
                  <tr>
                    <td className="px-6 py-4" colSpan={2}>Deep Soil Allocation Totals</td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-emerald-700 text-sm">{totalSoilProvided.toFixed(1)} m²</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter">Total Provided</span>
                        </div>
                    </td>
                    <td className="px-6 py-4" colSpan={5}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Compliant
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <div className="w-3 h-3 bg-rose-400 rounded-sm"></div> Area Shortfall
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium italic">
                <Info size={12} className="text-emerald-500" /> Req. Min Dim is the largest minimum dimension requirement among all linked trees.
            </div>
        </div>
      </div>
    </div>
  );
};
