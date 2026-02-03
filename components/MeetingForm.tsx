
import React, { useState } from 'react';
import { MeetingType } from '../types';
import { MEETING_TYPE_DESCRIPTIONS } from '../constants';
import { Send, Upload, Info, FileText, X, File as FileIcon, Users, Plus } from 'lucide-react';
import { MeetingSource } from '../services/geminiService';

interface MeetingFormProps {
  onAnalyze: (data: { 
    sources: MeetingSource[];
    type: MeetingType; 
    teamName: string; 
    sprintNumber: string 
  }) => void;
  isLoading: boolean;
}

const TEAM_OPTIONS = [
  "Masterminds",
  "Vectors",
  "PerfPowerhouse",
  "Gaia",
  "Others"
];

const MeetingForm: React.FC<MeetingFormProps> = ({ onAnalyze, isLoading }) => {
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<MeetingType>(MeetingType.DAILY_SCRUM);
  const [selectedTeam, setSelectedTeam] = useState(TEAM_OPTIONS[0]);
  const [customTeamName, setCustomTeamName] = useState('');
  const [sprintNumber, setSprintNumber] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; data: string; mimeType: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTeamName = selectedTeam === "Others" ? customTeamName : selectedTeam;
    
    const sources: MeetingSource[] = [];
    if (notes.trim()) {
      sources.push({ notes: notes.trim() });
    }
    attachedFiles.forEach(file => {
      sources.push({ file: { data: file.data, mimeType: file.mimeType, name: file.name } });
    });

    if (sources.length > 0 && finalTeamName) {
      onAnalyze({ 
        sources,
        type, 
        teamName: finalTeamName, 
        sprintNumber 
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const isPdf = file.type === 'application/pdf';
        const reader = new FileReader();

        reader.onload = (event) => {
          const content = event.target?.result;
          if (isPdf) {
            const base64 = (content as string).split(',')[1];
            setAttachedFiles(prev => [...prev, {
              name: file.name,
              data: base64,
              mimeType: file.type
            }]);
          } else {
            // Text/md files: just add to the list as a separate "file" source
            // Or we could append to notes, but separate is better for multi-meeting context
            const textContent = content as string;
             setAttachedFiles(prev => [...prev, {
              name: file.name,
              data: btoa(textContent), // We'll handle this in service or just pass as text
              mimeType: file.type || 'text/plain'
            }]);
          }
        };

        if (isPdf) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              New Multi-Meeting Analysis
            </h2>
            <p className="text-slate-500 text-sm mt-1">Upload multiple transcripts or paste notes to detect team habits over time.</p>
          </div>
          {attachedFiles.length > 0 && (
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {attachedFiles.length} Files Attached
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Meeting Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                {Object.values(MeetingType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg text-xs text-blue-700">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{MEETING_TYPE_DESCRIPTIONS[type]}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sprint / Period</label>
              <input
                type="text"
                placeholder="e.g. Sprint 42"
                value={sprintNumber}
                onChange={(e) => setSprintNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                Select Squad
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                required
              >
                {TEAM_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {selectedTeam === "Others" && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-slate-700">Custom Squad Name</label>
                <input
                  type="text"
                  placeholder="Enter squad name..."
                  value={customTeamName}
                  onChange={(e) => setCustomTeamName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  required={selectedTeam === "Others"}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Meeting Records
            </label>
            <label className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Records (PDF/Text)
              <input type="file" className="hidden" accept=".txt,.md,.pdf" multiple onChange={handleFileUpload} />
            </label>
          </div>

          <div className="space-y-3">
             {attachedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl group hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-blue-900 truncate">{file.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-blue-100 rounded-full text-blue-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Or paste collective meeting notes here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 h-40 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || (!notes.trim() && attachedFiles.length === 0)}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
              isLoading || (!notes.trim() && attachedFiles.length === 0)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing Trends...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Health & Trends
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;
