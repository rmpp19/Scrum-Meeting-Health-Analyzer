
import React from 'react';
import { AnalysisResult, GoalLabel } from '../types';
import { CheckCircle2, AlertTriangle, Lightbulb, Calendar, ArrowLeft, File as FileIcon, Users, Layers } from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, onBack }) => {
  const getLabelColor = (label: GoalLabel) => {
    switch (label) {
      case GoalLabel.ACHIEVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case GoalLabel.PARTIALLY_ACHIEVED: return 'bg-amber-100 text-amber-700 border-amber-200';
      case GoalLabel.NOT_ACHIEVED: return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4 text-slate-400 text-sm">
          {result.sourceFileNames && result.sourceFileNames.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
              <Layers className="w-3.5 h-3.5" />
              {result.sourceFileNames.length} records analyzed
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Analyzed: {new Date(result.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">{result.meetingType}</span>
                {result.sprintNumber && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{result.sprintNumber}</span>
                )}
                {result.isMultiMeeting && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase border border-indigo-100">Trend Report</span>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">
                  {result.extractedTeamName || result.teamName} {result.isMultiMeeting ? 'Trend Analysis' : 'Health Report'}
                </h2>
                {(result.extractedTeamName && result.extractedTeamName !== result.teamName) && (
                   <p className="text-xs text-slate-400 mt-1 italic flex items-center gap-1">
                     <Users className="w-3 h-3" />
                     User input: {result.teamName}
                   </p>
                )}
              </div>
              {result.extractedDate && (
                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                  <Calendar className="w-4 h-4" />
                  Period: {result.extractedDate}
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-xl border-2 font-bold text-sm ${getLabelColor(result.label)}`}>
              {result.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-8">
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="currentColor" strokeWidth="8"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (283 * result.score) / 100}
                  strokeLinecap="round"
                  className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black ${getScoreColor(result.score)}`}>{result.score}</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{result.isMultiMeeting ? 'Consistency' : 'Health'} Score</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Key Insights</h4>
              <ul className="space-y-3">
                {result.summary.map((point, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.sourceFileNames && result.sourceFileNames.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Included Records</h4>
              <div className="flex flex-wrap gap-2">
                {result.sourceFileNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                    <FileIcon className="w-3 h-3" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          {/* Recommendations */}
          <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold">Strategic Recommendations</h3>
              </div>
              <div className="space-y-4">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="group bg-slate-800/50 p-4 rounded-2xl hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.impact === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{rec.impact} Impact</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-snug">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Anti-Patterns Detail */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold">{result.isMultiMeeting ? 'Recurring Patterns' : 'Anti-Patterns Detected'}</h3>
          <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            {result.antiPatterns.length} Identified
          </span>
        </div>
        <div className="p-8">
          {result.antiPatterns.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-slate-500">Amazing! No consistent anti-patterns detected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.antiPatterns.map((pattern, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl p-6 bg-white hover:border-amber-200 hover:shadow-md transition-all">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                    {pattern.name}
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </h4>
                  <p className="text-sm text-slate-500 mb-4">{pattern.description}</p>
                  <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contextual Evidence</span>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{pattern.evidence}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultView;
