
import React, { useState, useEffect, useRef } from 'react';
import { CanopyCalculator } from './components/CanopyCalculator';
import { DeepSoilCalculator } from './components/DeepSoilCalculator';
import { Layout, TreePine, Shovel, BrainCircuit, Save, FolderOpen, Download, Upload, Check, AlertCircle, Image as ImageIcon, Camera } from 'lucide-react';
import { AIInsights } from './components/AIInsights';
import { TreeItem, SoilEntry, ProjectData } from './types';
import { toPng } from 'html-to-image';

const STORAGE_KEY = 'urban_canopy_project_data';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'canopy' | 'soil' | 'ai'>('canopy');
  const [siteArea, setSiteArea] = useState<number>(1363.93);
  const [targetPct, setTargetPct] = useState<number>(20);
  const [trees, setTrees] = useState<TreeItem[]>([
    { id: '1', code: 'A01', qty: 1, type: 'Quercus robur', diameter: 4.5, compliantCover: 15.9 },
    { id: '2', code: 'B01', qty: 1, type: 'Acer rubrum', diameter: 8.5, compliantCover: 56.7 },
    // Fix: Removed duplicate 'code' property from the object literal below
    { id: '3', code: 'C01', qty: 1, type: 'Platanus acerifolia', diameter: 12.5, compliantCover: 122.7 },
  ]);
  const [soilEntries, setSoilEntries] = useState<SoilEntry[]>([]);
  
  // Feedback states
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  // Auto-load on first mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: ProjectData = JSON.parse(saved);
        setSiteArea(data.siteArea);
        setTargetPct(data.targetPct);
        setTrees(data.trees);
        setSoilEntries(data.soilEntries);
        showStatus('success', 'Project loaded from browser storage');
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Auto-target coverage logic based on site area
  useEffect(() => {
    const autoTarget = siteArea < 1000 ? 10 : 20;
    setTargetPct(autoTarget);
  }, [siteArea]);

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const saveToLocal = () => {
    const data: ProjectData = {
      version: '1.0',
      timestamp: Date.now(),
      siteArea,
      targetPct,
      trees,
      soilEntries
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showStatus('success', 'Project saved to browser');
  };

  const downloadProject = async () => {
    const data: ProjectData = {
      version: '1.0',
      timestamp: Date.now(),
      siteArea,
      targetPct,
      trees,
      soilEntries
    };
    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `canopy-project-${new Date().toISOString().split('T')[0]}.json`;

    // Try File System Access API first (Chrome/Edge/Opera)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'JSON Project File',
            accept: { 'application/json': ['.json'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        showStatus('success', 'Project saved to chosen location');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('File picker failed', err);
      }
    }

    // Fallback to traditional download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'Project file downloaded');
  };

  const exportAsImage = async () => {
    if (!contentRef.current) return;
    
    showStatus('success', 'Preparing high-resolution snapshot...');
    try {
      // Ensure we capture the full scroll height if needed
      const originalStyle = contentRef.current.style.height;
      contentRef.current.style.height = 'auto';
      
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
        style: {
          padding: '40px',
          margin: '0',
        },
        pixelRatio: 2, // Higher quality
      });

      contentRef.current.style.height = originalStyle;
      
      const fileName = `canopy-snapshot-${new Date().toISOString().split('T')[0]}.png`;

      // Try File System Access API first
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] },
            }],
          });
          
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          showStatus('success', 'Snapshot saved to chosen location');
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.error('File picker failed', err);
        }
      }

      // Fallback
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      showStatus('success', 'Snapshot downloaded');
    } catch (err) {
      console.error('Snapshot failed', err);
      showStatus('error', 'Failed to export image');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: ProjectData = JSON.parse(e.target?.result as string);
        setSiteArea(data.siteArea);
        setTargetPct(data.targetPct);
        setTrees(data.trees);
        setSoilEntries(data.soilEntries);
        showStatus('success', 'Project imported successfully');
      } catch (err) {
        showStatus('error', 'Invalid project file');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Status Toast */}
      {status && (
        <div className={`fixed top-24 right-6 z-[60] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 border ${
          status.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          {status.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{status.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-emerald-800 text-white p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <TreePine className="text-emerald-800 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Urban Canopy & Soil Architect</h1>
              <p className="text-emerald-200 text-xs font-medium">Professional Compliance Tool</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Project Controls */}
            <div className="flex items-center gap-1 bg-emerald-900/40 p-1 rounded-xl border border-emerald-700/50">
              <button 
                onClick={saveToLocal}
                title="Save to Browser"
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors text-emerald-100 flex items-center gap-2 text-xs font-bold"
              >
                <Save size={16} /> <span className="hidden lg:inline">Save</span>
              </button>
              <div className="w-px h-4 bg-emerald-700 mx-1"></div>
              <button 
                onClick={downloadProject}
                title="Download JSON"
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors text-emerald-100 flex items-center gap-2 text-xs font-bold"
              >
                <Download size={16} /> <span className="hidden lg:inline">Export JSON</span>
              </button>
              <button 
                onClick={exportAsImage}
                title="Save as Image"
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors text-emerald-100 flex items-center gap-2 text-xs font-bold"
              >
                <Camera size={16} /> <span className="hidden lg:inline">Snapshot</span>
              </button>
              <div className="w-px h-4 bg-emerald-700 mx-1"></div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Upload JSON"
                className="p-2 hover:bg-emerald-700/50 rounded-lg transition-colors text-emerald-100 flex items-center gap-2 text-xs font-bold"
              >
                <Upload size={16} /> <span className="hidden lg:inline">Import</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            {/* Navigation */}
            <nav className="flex bg-emerald-950/60 rounded-full p-1 border border-emerald-700/50">
              <button 
                onClick={() => setActiveTab('canopy')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-bold ${activeTab === 'canopy' ? 'bg-emerald-50 text-white shadow-lg' : 'hover:bg-emerald-800/50 text-emerald-200/70'}`}
              >
                <Layout size={16} /> Canopy
              </button>
              <button 
                onClick={() => setActiveTab('soil')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-bold ${activeTab === 'soil' ? 'bg-emerald-50 text-white shadow-lg' : 'hover:bg-emerald-800/50 text-emerald-200/70'}`}
              >
                <Shovel size={16} /> Deep Soil
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all text-sm font-bold ${activeTab === 'ai' ? 'bg-emerald-50 text-white shadow-lg' : 'hover:bg-emerald-800/50 text-emerald-200/70'}`}
              >
                <BrainCircuit size={16} /> AI Planning
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main ref={contentRef} className="flex-1 max-w-7xl mx-auto w-full p-6 pb-24">
        {activeTab === 'canopy' && (
          <CanopyCalculator 
            siteArea={siteArea} setSiteArea={setSiteArea}
            targetPct={targetPct} setTargetPct={setTargetPct}
            trees={trees} setTrees={setTrees}
          />
        )}
        {activeTab === 'soil' && (
          <DeepSoilCalculator 
            entries={soilEntries} setEntries={setSoilEntries}
            trees={trees}
          />
        )}
        {activeTab === 'ai' && (
          <AIInsights 
            siteArea={siteArea}
            targetPct={targetPct}
            trees={trees}
            soilEntries={soilEntries}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 text-center text-slate-500 text-xs font-medium uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Urban Planning Solutions. Professional Tools for Greener Cities.</p>
      </footer>
    </div>
  );
};

export default App;
