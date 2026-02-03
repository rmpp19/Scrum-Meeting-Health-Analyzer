
import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Activity, Target, AlertOctagon, ArrowUpRight, ArrowDownRight, Minus, MousePointer2, Users, Filter } from 'lucide-react';

interface TrendsDashboardProps {
  history: AnalysisResult[];
}

const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ history }) => {
  const [teamFilter, setTeamFilter] = useState<string>('All Squads');

  // Get unique teams from history for the filter
  const uniqueTeams = useMemo(() => {
    const teams = Array.from(new Set(history.map(h => h.teamName)));
    return ['All Squads', ...teams.sort()];
  }, [history]);

  // Filter history based on selected team
  const filteredHistory = useMemo(() => {
    if (teamFilter === 'All Squads') return history;
    return history.filter(h => h.teamName === teamFilter);
  }, [history, teamFilter]);

  // 1. Calculate Total Individual Sessions (taking into account multi-meeting uploads)
  const totalSessions = useMemo(() => 
    filteredHistory.reduce((acc, curr) => acc + (curr.sourceFileNames?.length || 1), 0),
    [filteredHistory]
  );

  // 2. Prepare Chart Data
  const chartData = useMemo(() => 
    [...filteredHistory].reverse().map(item => ({
      date: item.extractedDate || new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score,
      team: item.teamName,
      sessions: item.sourceFileNames?.length || 1,
    })),
    [filteredHistory]
  );

  // 3. Health Momentum (Improvement over time)
  const averageScore = useMemo(() => 
    filteredHistory.length > 0 
      ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / filteredHistory.length) 
      : 0,
    [filteredHistory]
  );

  const momentum = useMemo(() => {
    if (filteredHistory.length < 2) return 0;
    const mid = Math.ceil(filteredHistory.length / 2);
    const recent = filteredHistory.slice(0, mid);
    const older = filteredHistory.slice(mid);
    const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.score, 0) / older.length;
    return Math.round(recentAvg - olderAvg);
  }, [filteredHistory]);

  // 4. Pattern Prevalence (Frequency Analysis)
  // FIXED: Logic now aggregates by normalized name and calculates prevalence based on total sessions
  const frequencyData = useMemo(() => {
    if (filteredHistory.length === 0) return [];
    
    const patternStats: Record<string, { sessionsCiting: number, originalName: string }> = {};
    
    filteredHistory.forEach(h => {
      // If a report is a "Multi-Meeting" report, its anti-patterns apply to all sessions in that report
      const sessionCount = h.sourceFileNames?.length || 1;
      
      h.antiPatterns.forEach(p => {
        // Simple normalization to group similar patterns (case-insensitive, trimmed)
        const key = p.name.trim().toLowerCase();
        
        if (!patternStats[key]) {
          patternStats[key] = { sessionsCiting: 0, originalName: p.name };
        }
        
        // We increment by the number of sessions this report covers to represent actual prevalence
        patternStats[key].sessionsCiting += sessionCount;
      });
    });

    return Object.entries(patternStats)
      .map(([_, stats]) => ({
        name: stats.originalName,
        // Prevalence = (Total sessions where this was found) / (Total sessions analyzed)
        prevalence: Math.round((stats.sessionsCiting / totalSessions) * 100),
        rawCount: stats.sessionsCiting
      }))
      .sort((a, b) => b.prevalence - a.prevalence || b.rawCount - a.rawCount)
      .slice(0, 5);
  }, [filteredHistory, totalSessions]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No data for trends yet</h3>
        <p className="text-slate-500 mt-2">Analyze a few meetings to unlock squad performance visualizations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Squad Trends</h2>
            <p className="text-xs text-slate-400">Filtering: {teamFilter}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-w-[200px]"
          >
            {uniqueTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Health</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{averageScore}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions Evaluated</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{totalSessions}</span>
            <span className="text-xs font-bold text-slate-400">Records</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Momentum</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-black ${momentum > 0 ? 'text-emerald-600' : momentum < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {momentum > 0 ? `+${momentum}` : momentum}%
            </span>
            {momentum > 0 ? <ArrowUpRight className="text-emerald-500" /> : momentum < 0 ? <ArrowDownRight className="text-rose-500" /> : <Minus className="text-slate-300" />}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports</span>
          </div>
          <div className="text-3xl font-black text-slate-800">{filteredHistory.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health Velocity Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {teamFilter === 'All Squads' ? 'Global Health Velocity' : `${teamFilter} Velocity`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Consistency and improvement of meeting goals</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10}} 
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{data.date}</p>
                            <p className="text-lg font-black text-blue-600">{data.score}% Health</p>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">{data.team}</p>
                            <p className="text-xs text-slate-500">{data.sessions} session{data.sessions > 1 ? 's' : ''} analyzed</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">Not enough data points</div>
            )}
          </div>
        </div>

        {/* Issue Frequency / Habit Prevalence */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                Anti-Pattern Prevalence
              </h3>
              <p className="text-xs text-slate-400 mt-1">Found across {totalSessions} total sessions for {teamFilter}</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {frequencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 10, fontWeight: 600}}
                    width={140}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border-none text-xs">
                            <p className="font-bold mb-1">{data.name}</p>
                            <p className="text-slate-400">Impact: {data.prevalence}% of sessions</p>
                            <p className="text-slate-500 text-[10px]">CITED IN {data.rawCount} SESSIONS</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="prevalence" radius={[0, 8, 8, 0]} barSize={20}>
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.prevalence > 60 ? '#f43f5e' : entry.prevalence > 30 ? '#fbbf24' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">No anti-patterns identified for this filter</div>
            )}
          </div>
        </div>
      </div>

      {/* Persistence Insights */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold mb-6">
              <MousePointer2 className="w-3 h-3" />
              Strategic Insight: {teamFilter}
            </div>
            <h3 className="text-3xl font-black mb-6 leading-tight">
              Is the {teamFilter === 'All Squads' ? 'organization' : 'squad'} improving?
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${momentum >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {momentum >= 0 ? <TrendingUp className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-lg">Health Trend</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {momentum > 0 
                      ? `Performance has increased by ${momentum}% across analyzed periods. Positive habits are becoming standard.` 
                      : momentum < 0 
                      ? `The health score has dipped by ${Math.abs(momentum)}%. This indicates regression or new friction in the process.` 
                      : `Stability is high. The health metrics are consistent, but looking for new optimizations is recommended.`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Primary Blocker</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {frequencyData[0] 
                      ? `"${frequencyData[0].name}" is the most persistent issue, identified as affecting ${frequencyData[0].prevalence}% of sessions for ${teamFilter}.` 
                      : `No recurring anti-patterns have been identified for ${teamFilter}. Excellent consistency!`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Aggregate Breakdown ({teamFilter})</h4>
             <div className="space-y-4">
               <div className="flex items-center justify-between py-3 border-b border-white/5">
                 <span className="text-slate-400 text-sm">Individual Sessions</span>
                 <span className="font-mono font-bold text-blue-400">{totalSessions}</span>
               </div>
               <div className="flex items-center justify-between py-3 border-b border-white/5">
                 <span className="text-slate-400 text-sm">Report Count</span>
                 <span className="font-mono font-bold text-blue-400">{filteredHistory.length}</span>
               </div>
               <div className="flex items-center justify-between py-3 border-b border-white/5">
                 <span className="text-slate-400 text-sm">Unique Anti-patterns</span>
                 <span className="font-mono font-bold text-blue-400">{frequencyData.length}</span>
               </div>
               <div className="flex items-center justify-between py-3">
                 <span className="text-slate-400 text-sm">Average Score</span>
                 <span className="font-mono font-bold text-blue-400">{averageScore}%</span>
               </div>
             </div>
             <div className="mt-8">
                <div className={`w-full h-3 bg-white/5 rounded-full overflow-hidden`}>
                   <div 
                    className={`h-full transition-all duration-1000 ${averageScore > 80 ? 'bg-emerald-500' : averageScore > 50 ? 'bg-blue-500' : 'bg-rose-500'}`} 
                    style={{ width: `${averageScore}%` }}
                   ></div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default TrendsDashboard;
