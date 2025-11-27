import React, { useState } from 'react';
import { MonthlyReport, DailyLog } from '../types';
import { Icons } from './ui/Icons';
import { generateMonthlySummary } from '../services/geminiService';

interface ReportsProps {
  reports: MonthlyReport[];
  logs: DailyLog[];
  onSave: (report: MonthlyReport) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_REPORT_TEMPLATE: Partial<MonthlyReport> = {
  summary: "",
  achievements: "- Successfully delivered: \n- Key metric improved: ",
  challengesSolutions: "**Challenge:** \n**Solution:** ",
  nextMonthPlan: "- Focus on: \n- Learn: ",
  linkedLogIds: []
};

export const Reports: React.FC<ReportsProps> = ({ reports, logs, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Partial<MonthlyReport>>(DEFAULT_REPORT_TEMPLATE);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleOpenModal = (report?: MonthlyReport) => {
    if (report) {
      setEditingReport(report);
    } else {
      setEditingReport({
        ...DEFAULT_REPORT_TEMPLATE,
        id: crypto.randomUUID(),
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingReport.month) {
      onSave(editingReport as MonthlyReport);
      setIsModalOpen(false);
    }
  };

  const handleAutoSummarize = async () => {
    // Find logs for this month
    if (!editingReport.month) return;
    const [year, month] = editingReport.month.split('-');
    
    const monthLogs = logs.filter(l => l.date.startsWith(`${year}-${month}`));
    if (monthLogs.length === 0) {
      alert("No logs found for this month to summarize.");
      return;
    }

    setIsSummarizing(true);
    const logText = monthLogs.map(l => `Date: ${l.date}\nActivity: ${l.activity}\nLearnings: ${l.learnings}`).join('\n---\n');
    const summary = await generateMonthlySummary(logText);
    
    setEditingReport(prev => ({ 
      ...prev, 
      summary: summary,
      linkedLogIds: monthLogs.map(l => l.id) 
    }));
    setIsSummarizing(false);
  };

  // Grouping logic for "Board View by Month" - effectively chronological cards
  const sortedReports = [...reports].sort((a, b) => b.month.localeCompare(a.month));

  // Input styling
  const inputClass = "w-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-500 dark:placeholder-gray-400";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Icons.Report className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Monthly Reports
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-600 dark:bg-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-700 dark:hover:bg-orange-600 flex items-center gap-2 transition-colors"
        >
          <Icons.Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedReports.length === 0 ? (
           <div className="col-span-3 text-center py-10 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
             No monthly reports yet.
           </div>
        ) : (
          sortedReports.map(report => (
            <div key={report.id} onClick={() => handleOpenModal(report)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 group relative">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                  {new Date(report.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Icons.Delete className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1">Monthly Summary</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 h-16">
                {report.summary || "No summary provided."}
              </p>
              
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Icons.Logbook className="w-3 h-3" /> {report.linkedLogIds.length} Logs Linked
                </span>
                <span className="flex items-center gap-1">
                  <Icons.Attachment className="w-3 h-3" /> {report.files?.length || 0} Files
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 dark:bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Report</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Format: Monthly Report Template</p>
              </div>
              <button onClick={() => setIsModalOpen(false)}><Icons.Close className="w-6 h-6 text-gray-400 dark:text-gray-300" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                <input 
                  type="month" 
                  value={editingReport.month}
                  onChange={e => setEditingReport({...editingReport, month: e.target.value})}
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Summary</label>
                  <button 
                    onClick={handleAutoSummarize} 
                    disabled={isSummarizing || !editingReport.month}
                    className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded hover:bg-purple-200 dark:hover:bg-purple-900/60 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Icons.AI className={`w-3 h-3 ${isSummarizing ? 'animate-spin' : ''}`} /> 
                    {isSummarizing ? 'Analyzing Logs...' : 'Generate from Logs'}
                  </button>
                </div>
                <textarea 
                  rows={4} 
                  value={editingReport.summary}
                  onChange={e => setEditingReport({...editingReport, summary: e.target.value})}
                  className={inputClass}
                  placeholder="Summary of the month..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements</label>
                    <textarea 
                      rows={5} 
                      value={editingReport.achievements}
                      onChange={e => setEditingReport({...editingReport, achievements: e.target.value})}
                      className={inputClass}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Challenges & Solutions</label>
                    <textarea 
                      rows={5} 
                      value={editingReport.challengesSolutions}
                      onChange={e => setEditingReport({...editingReport, challengesSolutions: e.target.value})}
                      className={inputClass}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Month Plan</label>
                <textarea 
                  rows={3} 
                  value={editingReport.nextMonthPlan}
                  onChange={e => setEditingReport({...editingReport, nextMonthPlan: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-orange-600 dark:bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-700 dark:hover:bg-orange-600 shadow-sm">Save Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};