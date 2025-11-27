import React, { useState, useEffect } from 'react';
import { AppData, DailyLog, MonthlyReport, Project, ViewState } from './types';
import { Icons } from './components/ui/Icons';
import { Dashboard } from './components/Dashboard';
import { Logbook } from './components/Logbook';
import { Reports } from './components/Reports';
import { Projects } from './components/Projects';

const LOCAL_STORAGE_KEY = 'telkom_ddp_data_v1';
const THEME_STORAGE_KEY = 'telkom_ddp_theme';

// Seed data to make the app look good initially if empty
const INITIAL_DATA: AppData = {
  logs: [],
  reports: [],
  projects: []
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved as 'light' | 'dark';
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
  }, []);

  // Save to Local Storage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Actions
  const saveLog = (log: DailyLog) => {
    setData(prev => {
      const exists = prev.logs.find(l => l.id === log.id);
      const newLogs = exists 
        ? prev.logs.map(l => l.id === log.id ? log : l)
        : [log, ...prev.logs];
      return { ...prev, logs: newLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
    });
  };

  const deleteLog = (id: string) => {
    // Confirmation is now handled by the UI component (Logbook.tsx)
    setData(prev => ({ ...prev, logs: prev.logs.filter(l => l.id !== id) }));
  };

  const saveReport = (report: MonthlyReport) => {
    setData(prev => {
      const exists = prev.reports.find(r => r.id === report.id);
      const newReports = exists 
        ? prev.reports.map(r => r.id === report.id ? report : r)
        : [...prev.reports, report];
      return { ...prev, reports: newReports };
    });
  };

  const deleteReport = (id: string) => {
    if(confirm("Delete this report?"))
    setData(prev => ({ ...prev, reports: prev.reports.filter(r => r.id !== id) }));
  };

  const saveProject = (project: Project) => {
    setData(prev => {
      const exists = prev.projects.find(p => p.id === project.id);
      const newProjects = exists 
        ? prev.projects.map(p => p.id === project.id ? project : p)
        : [...prev.projects, project];
      return { ...prev, projects: newProjects };
    });
  };

  const deleteProject = (id: string) => {
    if(confirm("Delete this project?"))
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const actions = { saveLog, deleteLog, saveReport, deleteReport, saveProject, deleteProject };

  // Nav Item Helper
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentView === view 
          ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5] dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#F7F7F5] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">T</div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">Telkom DDP</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-8">Internship Workspace</p>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          <NavItem view="dashboard" icon={Icons.Dashboard} label="Dashboard" />
          <div className="pt-4 pb-1 pl-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Databases</div>
          <NavItem view="logs" icon={Icons.Logbook} label="Daily Logbook" />
          <NavItem view="reports" icon={Icons.Report} label="Monthly Reports" />
          <NavItem view="projects" icon={Icons.Project} label="Internship Projects" />
        </div>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
           <div className="flex items-center gap-2 text-xs text-gray-400">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             Workspace Ready
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
         <header className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400">
                 <Icons.Dashboard className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {currentView === 'dashboard' ? 'Magang Telkom DDP Dashboard' : 
                 currentView === 'logs' ? 'Daily Logbook' : 
                 currentView === 'reports' ? 'Monthly Reports' : 'Internship Projects'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Icons.Moon className="w-4 h-4" /> : <Icons.Sun className="w-4 h-4" />}
              </button>
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">Me</div>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12">
            <div className="max-w-5xl mx-auto">
              {currentView === 'dashboard' && <Dashboard data={data} actions={actions} />}
              {currentView === 'logs' && <Logbook logs={data.logs} onSave={actions.saveLog} onDelete={actions.deleteLog} />}
              {currentView === 'reports' && <Reports reports={data.reports} logs={data.logs} onSave={actions.saveReport} onDelete={actions.deleteReport} />}
              {currentView === 'projects' && <Projects projects={data.projects} onSave={actions.saveProject} onDelete={actions.deleteProject} />}
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;