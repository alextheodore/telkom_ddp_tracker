import React, { useState, useMemo } from 'react';
import { DailyLog, AttendanceStatus } from '../types';
import { Icons } from './ui/Icons';
import { generateTextImprovement } from '../services/geminiService';

interface LogbookProps {
  logs: DailyLog[];
  onSave: (log: DailyLog) => void;
  onDelete: (id: string) => void;
  filterWeek?: boolean;
}

const DEFAULT_LOG_TEMPLATE: Partial<DailyLog> = {
  attendance: AttendanceStatus.Present,
  activity: "**Morning Session:**\n- \n\n**Afternoon Session:**\n- ",
  learnings: "- Learned about: \n- Improved skill in: ",
  challenges: "No significant challenges today.",
  tags: []
};

export const Logbook: React.FC<LogbookProps> = ({ logs, onSave, onDelete, filterWeek }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Partial<DailyLog>>(DEFAULT_LOG_TEMPLATE);
  const [isThinking, setIsThinking] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedAttendance, setSelectedAttendance] = useState('');

  // Extract unique tags for the filter dropdown
  const uniqueTags = useMemo(() => {
    const allTags = logs.flatMap(log => log.tags);
    return Array.from(new Set(allTags)).sort();
  }, [logs]);

  // Filter Logic
  const displayedLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Date/Week Filter
      if (filterWeek) {
        const date = new Date(log.date);
        const now = new Date();
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        if (date < oneWeekAgo) return false;
      }

      // 2. Search Query (Case insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const contentMatch = 
          log.activity.toLowerCase().includes(query) || 
          log.learnings.toLowerCase().includes(query) ||
          log.challenges.toLowerCase().includes(query);
        if (!contentMatch) return false;
      }

      // 3. Attendance Filter
      if (selectedAttendance && log.attendance !== selectedAttendance) {
        return false;
      }

      // 4. Tag Filter
      if (selectedTag && !log.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [logs, filterWeek, searchQuery, selectedAttendance, selectedTag]);

  const handleOpenModal = (log?: DailyLog) => {
    if (log) {
      setEditingLog(log);
    } else {
      setEditingLog({
        ...DEFAULT_LOG_TEMPLATE,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingLog.date && editingLog.activity) {
      onSave(editingLog as DailyLog);
      setIsModalOpen(false);
    }
  };

  const handleAIImprove = async (field: 'activity' | 'learnings') => {
    if (!editingLog[field]) return;
    setIsThinking(true);
    const improved = await generateTextImprovement(editingLog[field] as string, `Internship Daily Log - ${field}`);
    setEditingLog(prev => ({ ...prev, [field]: improved }));
    setIsThinking(false);
  };

  const confirmDelete = () => {
    if (logToDelete) {
      onDelete(logToDelete);
      setLogToDelete(null);
    }
  };

  // Standard input style for better visibility in light mode
  const inputClass = "w-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Icons.Logbook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Daily Logbook
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <Icons.Plus className="w-4 h-4" /> New Log
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input 
            type="text" 
            placeholder="Search activity, learnings, or challenges..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            value={selectedAttendance}
            onChange={(e) => setSelectedAttendance(e.target.value)}
            className={inputClass}
          >
            <option value="">All Statuses</option>
            {Object.values(AttendanceStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-48">
          <select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={inputClass}
          >
            <option value="">All Tags</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 w-32">Date</th>
                <th className="px-4 py-3 w-24">Attendance</th>
                <th className="px-4 py-3">Activity Summary</th>
                <th className="px-4 py-3 w-48">Tags</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                    {searchQuery || selectedTag || selectedAttendance 
                      ? "No logs match your filters." 
                      : "No logs found. Start by creating one!"}
                  </td>
                </tr>
              ) : (
                displayedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 group cursor-pointer" onClick={() => handleOpenModal(log)}>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                        ${log.attendance === AttendanceStatus.Present ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          log.attendance === AttendanceStatus.Sick ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                          log.attendance === AttendanceStatus.WFH ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                        {log.attendance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 truncate max-w-xs">
                      {log.activity.split('\n')[0] || log.activity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {log.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setLogToDelete(log.id); }}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Icons.Delete className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centered Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 dark:bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Log Entry</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Template applied: Daily Log Format</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Icons.Close className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editingLog.date} 
                    onChange={e => setEditingLog({...editingLog, date: e.target.value})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attendance</label>
                  <select 
                    value={editingLog.attendance} 
                    onChange={e => setEditingLog({...editingLog, attendance: e.target.value as AttendanceStatus})}
                    className={inputClass}
                  >
                    {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Description</label>
                  <button 
                    onClick={() => handleAIImprove('activity')} 
                    disabled={isThinking}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                  >
                    <Icons.AI className={`w-3 h-3 ${isThinking ? 'animate-spin' : ''}`} /> {isThinking ? 'Thinking...' : 'AI Refine'}
                  </button>
                </div>
                <textarea 
                  rows={6}
                  value={editingLog.activity}
                  onChange={e => setEditingLog({...editingLog, activity: e.target.value})}
                  className={`${inputClass} font-mono`}
                  placeholder="What did you do today?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Learnings</label>
                     <button onClick={() => handleAIImprove('learnings')} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"><Icons.AI className="w-3 h-3"/> AI Refine</button>
                  </div>
                  <textarea 
                    rows={4}
                    value={editingLog.learnings}
                    onChange={e => setEditingLog({...editingLog, learnings: e.target.value})}
                    className={inputClass}
                    placeholder="Key takeaways..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Challenges</label>
                  <textarea 
                    rows={4}
                    value={editingLog.challenges}
                    onChange={e => setEditingLog({...editingLog, challenges: e.target.value})}
                    className={inputClass}
                    placeholder="Any blockers?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={editingLog.tags?.join(', ')} 
                  onChange={e => setEditingLog({...editingLog, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  placeholder="React, Meeting, Bugfix..."
                  className={inputClass}
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md shadow-sm transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 dark:bg-black/50 backdrop-blur-sm p-4" onClick={() => setLogToDelete(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                <Icons.Alert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Log Entry?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this log? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setLogToDelete(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};