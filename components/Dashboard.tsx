import React from 'react';
import { AppData, DailyLog, MonthlyReport, Project } from '../types';
import { Logbook } from './Logbook';
import { Reports } from './Reports';
import { Projects } from './Projects';

interface DashboardProps {
  data: AppData;
  actions: {
    saveLog: (log: DailyLog) => void;
    deleteLog: (id: string) => void;
    saveReport: (report: MonthlyReport) => void;
    deleteReport: (id: string) => void;
    saveProject: (project: Project) => void;
    deleteProject: (id: string) => void;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ data, actions }) => {
  return (
    <div className="space-y-12 pb-20">
      <section>
        <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Magang Telkom DDP Dashboard</h1>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-mono">v1.0</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
            Welcome to your internship tracker. Use the sections below to manage your daily activities, monthly progress, and project deliverables.
        </p>
      </section>

      {/* Linked View: Daily Logbook (This Week) */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl"></div>
        <div className="mb-4">
             <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Overview</h3>
             <p className="text-xs text-gray-400 dark:text-gray-500">Showing logs for the last 7 days</p>
        </div>
        <Logbook 
          logs={data.logs} 
          onSave={actions.saveLog} 
          onDelete={actions.deleteLog} 
          filterWeek={true} 
        />
      </section>

      {/* Linked View: Monthly Report (Board View) */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-xl"></div>
        <div className="mb-4">
             <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Reports</h3>
             <p className="text-xs text-gray-400 dark:text-gray-500">Monthly progress and summaries</p>
        </div>
        <Reports 
          reports={data.reports} 
          logs={data.logs} 
          onSave={actions.saveReport} 
          onDelete={actions.deleteReport} 
        />
      </section>

      {/* Linked View: Internship Projects (Gallery View) */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
         <div className="mb-4">
             <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Projects</h3>
             <p className="text-xs text-gray-400 dark:text-gray-500">Active and completed deliverables</p>
        </div>
        <Projects 
          projects={data.projects} 
          onSave={actions.saveProject} 
          onDelete={actions.deleteProject} 
        />
      </section>
    </div>
  );
};