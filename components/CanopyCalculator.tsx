
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, TreePine, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { TreeItem } from '../types';

interface Props {
  siteArea: number;
  setSiteArea: (v: number) => void;
  targetPct: number;
  setTargetPct: (v: number) => void;
  trees: TreeItem[];
  setTrees: (v: TreeItem[]) => void;
}

export const CanopyCalculator: React.FC<Props> = ({ siteArea, setSiteArea, targetPct, setTargetPct, trees, setTrees }) => {
  const calculateArea = (dia: number) => Math.PI * Math.pow(dia / 2, 2);
  
  const getClassification = (d: number): 'A' | 'B' | 'C' => {
    if (d >= 12) return 'C';
    if (d >= 8) return 'B';
    return 'A';
  };

  const treeTypeCounts = {
    A: trees.filter(t => getClassification(t.diameter) === 'A').length,
    B: trees.filter(t => getClassification(t.diameter) === 'B').length,
    C: trees.filter(t => getClassification(t.diameter) === 'C').length,
  };

  const totalBioArea = trees.reduce((acc, t) => acc + calculateArea(t.diameter), 0);
  const totalCompliantCover = trees.reduce((acc, t) => acc + (t.compliantCover || 0), 0);
  const totalNonCompliant = Math.max(0, totalBioArea - totalCompliantCover);
  
  const minRequired = siteArea * (targetPct / 100);
  const diff = totalCompliantCover - minRequired;
  const currentPct = siteArea > 0 ? (totalCompliantCover / siteArea) * 100 : 0;

  const chartData = [
    { name: 'Compliant Canopy', value: totalCompliantCover, color: '#10b981' },
    { name: 'Remaining Site', value: Math.max(0, siteArea - totalCompliantCover), color: '#e2e8f0' }
  ];

  const addTree = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const dia = 5.0;
    const classification = getClassification(dia);
    const count = trees.filter(t => getClassification(t.diameter) === classification).length + 1;
    const defaultCode = `${classification}${count.toString().padStart(2, '0')}`;
    const area = calculateArea(dia);
    
    setTrees([...trees, { 
      id, 
      code: defaultCode,
      qty: 1, 
      type: '', 
      diameter: dia, 
      compliantCover: Number(area.toFixed(1)) 
    }]);
  };

  const removeTree = (id: string) => {
    setTrees(trees.filter(t => t.id !== id));
  };

  const updateTree = (id: string, updates: Partial<TreeItem>) => {
    setTrees(trees.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-md"><TreePine size={18} className="text-emerald-600" /></div>
            Site Parameters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Total Site Area (m²)</label>
              <input 
                type="number" 
                value={siteArea}
                onChange={(e) => setSiteArea(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 font-semibold italic">
                {siteArea < 1000 ? "Target 10% applied (Area < 1000m²)" : "Target 20% applied (Area ≥ 1000m²)"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1 flex justify-between">
                Target Coverage <span>{targetPct}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="100" 
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-md"><CheckCircle2 size={18} className="text-blue-600" /></div>
            Site Metrics
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-sm font-bold text-slate-600">Total Tree Number</span>
                <span className="text-lg font-black text-slate-800">{trees.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">A</p>
                  <p className="text-sm font-black text-indigo-600">{treeTypeCounts.A}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">B</p>
                  <p className="text-sm font-black text-emerald-600">{treeTypeCounts.B}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">C</p>
                  <p className="text-sm font-black text-amber-600">{treeTypeCounts.C}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-xl text-xs">
              <span className="font-medium text-slate-500">Min. Required</span>
              <span className="font-bold text-slate-800">{minRequired.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-xl text-xs">
              <span className="font-medium text-slate-500">Compliant Total</span>
              <span className="font-bold text-emerald-600">{totalCompliantCover.toFixed(2)} m²</span>
            </div>
            
            <div className={`p-4 rounded-xl flex items-center gap-3 ${diff >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              {diff >= 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <div>
                <p className="font-bold text-sm">{diff >= 0 ? 'Compliance Met' : 'Shortfall'}</p>
                <p className="text-xs opacity-90">{Math.abs(diff).toFixed(2)} m² {diff >= 0 ? 'excess' : 'shortfall'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-64 relative flex items-center justify-center">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* Background Track */}
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
                {/* Progress Arc */}
                <Pie
                  data={[{ value: currentPct }, { value: 100 - currentPct }]}
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
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 rounded-lg shadow-xl border border-slate-100 text-[10px] font-bold">
                          {currentPct.toFixed(1)}% Compliant
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-slate-800 tracking-tight leading-none">
              {currentPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-2">
              Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Tree Inventory Table */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Proposed Tree Inventory</h2>
              <p className="text-sm text-slate-500 italic">Manage tree dimensions and compliant canopy areas</p>
            </div>
            <button 
              onClick={addTree}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
            >
              <Plus size={18} /> Add Tree
            </button>
          </div>
          <div className="w-full">
            <table className="w-full text-left table-fixed">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-[70px]">Code</th>
                  <th className="px-4 py-3">Botanical Name</th>
                  <th className="px-4 py-3 w-[60px] text-center">Type</th>
                  <th className="px-4 py-3 w-[75px] text-center">Dia (m)</th>
                  <th className="px-4 py-3 w-[90px] text-right">Req. Area</th>
                  <th className="px-4 py-3 w-[110px] text-emerald-600 text-center">Compliant</th>
                  <th className="px-4 py-3 w-[80px] text-rose-600 text-right">Non-Comp</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trees.map((tree) => {
                  const classification = getClassification(tree.diameter);
                  const requiredArea = calculateArea(tree.diameter);
                  const compliant = tree.compliantCover || 0;
                  const nonCompliant = Math.max(0, requiredArea - compliant);

                  const typeBadgeColor = classification === 'A' ? 'bg-indigo-50 text-indigo-700' : 
                                       classification === 'B' ? 'bg-emerald-50 text-emerald-700' : 
                                       'bg-amber-50 text-amber-700';

                  return (
                    <tr key={tree.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-2 py-3">
                        <input 
                          type="text" 
                          value={tree.code || ''}
                          onChange={(e) => updateTree(tree.id, { code: e.target.value })}
                          className="w-full bg-slate-100 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-mono font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none uppercase"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={tree.type}
                          onChange={(e) => updateTree(tree.id, { type: e.target.value })}
                          placeholder="Quercus..."
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 py-1 outline-none text-xs transition-all italic"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${typeBadgeColor}`}>
                          {classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="number" 
                          step="0.1"
                          value={tree.diameter}
                          onChange={(e) => updateTree(tree.id, { diameter: Number(e.target.value) })}
                          className="w-12 px-1 py-1 rounded border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-[10px] text-slate-400 font-medium">
                        {requiredArea.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <input 
                            type="number" 
                            step="0.1"
                            value={tree.compliantCover ?? ''}
                            onChange={(e) => updateTree(tree.id, { compliantCover: Number(e.target.value) })}
                            className="w-16 px-1.5 py-1 rounded border border-emerald-200 focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-bold bg-emerald-50/20 text-center"
                          />
                          <span className="text-[10px] text-emerald-500 font-bold">m²</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] font-bold ${nonCompliant > 0.1 ? 'text-rose-500' : 'text-slate-300'}`}>
                          {nonCompliant.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right">
                        <button 
                          onClick={() => removeTree(tree.id)}
                          className="text-slate-200 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {trees.length > 0 && (
                <tfoot className="bg-slate-50 font-bold text-slate-700 border-t border-slate-200 text-xs">
                  <tr>
                    <td className="px-4 py-3" colSpan={4}>Totals</td>
                    <td className="px-4 py-3 text-right text-[10px] text-slate-400">{totalBioArea.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center text-emerald-700">{totalCompliantCover.toFixed(1)} m²</td>
                    <td className="px-4 py-3 text-right text-rose-500">{totalNonCompliant.toFixed(1)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[9px] font-bold uppercase text-slate-400 flex justify-center gap-6">
            <span className="flex items-center gap-1"><Info size={10} /> Type A: &lt;8m | Type B: 8-12m | Type C: &gt;12m</span>
            <span className="flex items-center gap-1"><Info size={10} /> REQUIRED AREA: BIOLOGICAL CANOPY (πr²)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
