
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MeetingForm from './components/MeetingForm';
import AnalysisResultView from './components/AnalysisResultView';
import TrendsDashboard from './components/TrendsDashboard';
import { AppState, AnalysisResult, MeetingType } from './types';
import { analyzeMeetingNotes, MeetingSource } from './services/geminiService';
import { Shield, Database, Lock, History, Sparkles, Plus, FileText, File as FileIcon, Calendar, Layers, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'trends' | 'settings'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('scrum_analyzer_state');
    return saved ? JSON.parse(saved) : { history: [], privacyFirst: false };
  });
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    localStorage.setItem('scrum_analyzer_state', JSON.stringify(state));
  }, [state]);

  const handleAnalyze = async (data: { 
    sources: MeetingSource[];
    type: MeetingType; 
    teamName: string; 
    sprintNumber: string 
  }) => {
    setLoading(true);
    try {
      const result = await analyzeMeetingNotes(
        data.type, 
        data.teamName, 
        data.sprintNumber, 
        data.sources
      );
      
      // Data Minimization logic: If privacyFirst is on, we don't store raw content in history
      const finalResult = state.privacyFirst 
        ? { ...result, rawNotesAnonymized: "[HIDDEN - PRIVACY SETTING]" } 
        : result;
      
      setState(prev => ({
        ...prev,
        history: [finalResult, ...prev.history].slice(0, 50) // Keep last 50
      }));
      setSelectedResult(finalResult);
      setActiveTab('analyze');
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Something went wrong with the AI analysis. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Stop the parent row's onClick from firing
    
    if (window.confirm("Are you sure you want to delete this specific analysis record?")) {
      setState(prev => {
        const newHistory = prev.history.filter(h => h.id !== id);
        return {
          ...prev,
          history: newHistory
        };
      });
      
      // If the deleted item was currently being viewed, clear it
      if (selectedResult?.id === id) {
        setSelectedResult(null);
      }
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Health Overview</h1>
          <p className="text-slate-500 mt-2">Welcome back. Here is your squad's recent meeting performance.</p>
        </div>
        <button 
          onClick={() => setActiveTab('analyze')}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Analyze New Records
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">Recent Activity</div>
          <div className="text-3xl font-black text-slate-800">{state.history.length}</div>
          <div className="text-slate-500 text-sm">Analyses performed</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">Avg Team Health</div>
          <div className="text-3xl font-black text-blue-600">
            {state.history.length > 0 ? Math.round(state.history.reduce((a, b) => a + b.score, 0) / state.history.length) : 0}%
          </div>
          <div className="text-slate-500 text-sm">Across all squads</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-widest">Privacy Status</div>
          <div className="flex items-center gap-2 text-3xl font-black text-emerald-600">
             <Shield className="w-8 h-8" />
             {state.privacyFirst ? "Enabled" : "Standard"}
          </div>
          <div className="text-slate-500 text-sm">Data protection active</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Recent History
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {state.history.length > 0 ? (
            state.history.map((h) => (
              <div 
                key={h.id} 
                onClick={() => { setSelectedResult(h); setActiveTab('analyze'); }}
                className="px-8 py-5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    h.score >= 80 ? 'bg-emerald-100 text-emerald-600' : h.score >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {h.score}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      {h.extractedTeamName || h.teamName} - {h.meetingType}
                      {h.isMultiMeeting && <span title="Aggregate Analysis"><Layers className="w-4 h-4 text-blue-500" /></span>}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {h.extractedDate ? (
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <Calendar className="w-3 h-3" />
                          {h.extractedDate}
                        </span>
                      ) : (
                        <span>{new Date(h.date).toLocaleDateString()}</span>
                      )}
                      <span>•</span>
                      <span>{h.sprintNumber || 'No Sprint'}</span>
                      {h.sourceFileNames && h.sourceFileNames.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <FileIcon className="w-3 h-3" />
                            {h.sourceFileNames.length} files
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    h.label === 'Achieved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : h.label === 'Partially Achieved' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {h.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteResult(e, h.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all relative z-10"
                      title="Delete record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-2 text-slate-300 group-hover:text-slate-600 transition-colors">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">No history yet</h4>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">Start by analyzing your first meeting records to see health metrics here.</p>
              <button 
                onClick={() => setActiveTab('analyze')}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Start analysis now &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'analyze':
        if (selectedResult) {
          return <AnalysisResultView result={selectedResult} onBack={() => { setSelectedResult(null); setActiveTab('dashboard'); }} />;
        }
        return <MeetingForm onAnalyze={handleAnalyze} isLoading={loading} />;
      case 'trends':
        return <TrendsDashboard history={state.history} />;
      case 'settings':
        return (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 mt-2">Manage your data and privacy preferences.</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Privacy First Mode</h3>
                    <p className="text-sm text-slate-500">Do not persist raw meeting content in local database after analysis.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setState(p => ({ ...p, privacyFirst: !p.privacyFirst }))}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${state.privacyFirst ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${state.privacyFirst ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Clear All Data</h3>
                    <p className="text-sm text-slate-500">Permanently delete your entire analysis history and reset settings.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure? This action cannot be undone.")) {
                      setState({ history: [], privacyFirst: false });
                    }
                  }}
                  className="px-4 py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Clear History
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
              <h4 className="font-bold text-blue-800 mb-2">Technical Information</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                This analyzer uses the <strong>gemini-3-flash-preview</strong> model for trend detection and recommendation generation.
                All processing is ephemeral; if "Privacy First" is enabled, content is transmitted but never saved locally.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
