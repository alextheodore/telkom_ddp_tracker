import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { Icons } from './ui/Icons';

interface ProjectsProps {
  projects: Project[];
  onSave: (project: Project) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_PROJECT_TEMPLATE: Partial<Project> = {
  status: ProjectStatus.OnProgress,
  description: "",
  techStack: [],
  role: "Fullstack Developer",
  deliverables: "- Source Code\n- Documentation",
  startDate: new Date().toISOString().split('T')[0],
};

type ViewMode = 'gallery' | 'timeline';

export const Projects: React.FC<ProjectsProps> = ({ projects, onSave, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>(DEFAULT_PROJECT_TEMPLATE);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
    } else {
      setEditingProject({
        ...DEFAULT_PROJECT_TEMPLATE,
        id: crypto.randomUUID(),
        startDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingProject.name) {
      onSave(editingProject as Project);
      setIsModalOpen(false);
    }
  };

  const getGradient = (name: string) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-violet-500 to-purple-500',
      'from-amber-500 to-orange-500',
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  const inputClass = "w-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 dark:placeholder-gray-400";

  // --- Timeline Logic ---
  const timelineData = useMemo(() => {
    if (projects.length === 0) return null;

    const validProjects = projects.filter(p => p.startDate || p.endDate);
    if (validProjects.length === 0) return null;

    let minDate = new Date();
    let maxDate = new Date();
    
    // Determine bounds
    validProjects.forEach((p, idx) => {
      const start = p.startDate ? new Date(p.startDate) : new Date();
      const end = p.endDate ? new Date(p.endDate) : new Date(start.getTime() + 86400000 * 30);
      
      if (idx === 0) {
          minDate = new Date(start);
          maxDate = new Date(end);
      } else {
          if (start < minDate) minDate = new Date(start);
          if (end > maxDate) maxDate = new Date(end);
      }
    });

    // Buffers
    minDate.setDate(minDate.getDate() - 15);
    maxDate.setDate(maxDate.getDate() + 45); // Extra buffer for labels

    const totalDuration = maxDate.getTime() - minDate.getTime();
    if (totalDuration <= 0) return null;

    // Generate Month Headers
    const months: { label: string, left: number }[] = [];
    const currentIter = new Date(minDate);
    currentIter.setDate(1); 
    
    while (currentIter <= maxDate) {
      const iterTime = currentIter.getTime();
      if (iterTime >= minDate.getTime()) {
         const left = ((iterTime - minDate.getTime()) / totalDuration) * 100;
         if (left >= 0 && left <= 100) {
            months.push({
              label: currentIter.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
              left
            });
         }
      }
      currentIter.setMonth(currentIter.getMonth() + 1);
    }

    return { minDate, maxDate, totalDuration, months };
  }, [projects]);

  const todayPercent = useMemo(() => {
    if (!timelineData) return -1;
    const now = new Date().getTime();
    const min = timelineData.minDate.getTime();
    const total = timelineData.totalDuration;
    const p = ((now - min) / total) * 100;
    return (p >= 0 && p <= 100) ? p : -1;
  }, [timelineData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <Icons.Project className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Internship Projects
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode('gallery')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'gallery' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="Gallery View"
            >
              <Icons.Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              title="Timeline View"
            >
              <Icons.Gantt className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2 transition-colors flex-1 sm:flex-none justify-center"
          >
            <Icons.Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              No projects added yet.
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} onClick={() => handleOpenModal(project)} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1">
                <div className={`h-24 bg-gradient-to-r ${getGradient(project.name)} relative`}>
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-1 bg-white/20 backdrop-blur rounded text-white hover:bg-red-500 hover:text-white">
                        <Icons.Delete className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate flex-1 pr-2">{project.name}</h3>
                    {project.status === ProjectStatus.Completed && <Icons.Success className="w-4 h-4 text-green-500 shrink-0" />}
                    {project.status === ProjectStatus.OnProgress && <Icons.Waiting className="w-4 h-4 text-blue-500 shrink-0" />}
                    {project.status === ProjectStatus.Waiting && <Icons.Alert className="w-4 h-4 text-gray-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 h-8">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3 h-12 overflow-hidden content-start">
                    {project.techStack.map(tech => (
                      <span key={tech} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded border border-gray-200 dark:border-gray-600">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{project.role}</span>
                    {project.endDate && <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {projects.length === 0 ? (
             <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                No projects to display on timeline.
             </div>
          ) : timelineData ? (
             <div className="overflow-x-auto">
               <div className="min-w-[800px] p-6">
                 {/* Timeline Header */}
                 <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 pb-2">
                    <div className="w-1/4 shrink-0 px-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Project Name</div>
                    <div className="flex-1 relative h-6">
                      {timelineData.months.map((month, idx) => (
                        <div 
                          key={idx} 
                          className="absolute bottom-0 text-xs font-medium text-gray-400 dark:text-gray-500 border-l border-gray-300 dark:border-gray-600 pl-1"
                          style={{ left: `${month.left}%` }}
                        >
                          {month.label}
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Timeline Body */}
                 <div className="relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex pointer-events-none">
                       <div className="w-1/4 shrink-0"></div>
                       <div className="flex-1 relative h-full">
                          {timelineData.months.map((month, idx) => (
                              <div 
                                key={idx} 
                                className="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-700/50"
                                style={{ left: `${month.left}%` }}
                              />
                          ))}
                          {todayPercent >= 0 && (
                            <div 
                              className="absolute top-0 bottom-0 border-l-2 border-red-500/50 border-dashed z-0"
                              style={{ left: `${todayPercent}%` }}
                            >
                               <div className="absolute -top-3 -left-4 text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/50 px-1 rounded">Today</div>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-3 relative z-10">
                      {projects.map(project => {
                        const startDate = project.startDate ? new Date(project.startDate) : new Date();
                        const endDate = project.endDate ? new Date(project.endDate) : new Date(startDate.getTime() + 86400000 * 30);
                        
                        const startPercent = Math.max(0, ((startDate.getTime() - timelineData.minDate.getTime()) / timelineData.totalDuration) * 100);
                        const endPercent = Math.min(100, ((endDate.getTime() - timelineData.minDate.getTime()) / timelineData.totalDuration) * 100);
                        const widthPercent = Math.max(1, endPercent - startPercent); // Min width 1%

                        // Color logic
                        const isCompleted = project.status === ProjectStatus.Completed;
                        const isProgress = project.status === ProjectStatus.OnProgress;
                        
                        const barColor = isCompleted 
                          ? 'bg-green-500 dark:bg-green-600' 
                          : isProgress 
                            ? 'bg-blue-500 dark:bg-blue-600' 
                            : 'bg-gray-400 dark:bg-gray-500';

                        return (
                          <div key={project.id} className="flex items-center group hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded py-2 -mx-2 px-2 transition-colors cursor-pointer" onClick={() => handleOpenModal(project)}>
                            <div className="w-1/4 shrink-0 pr-4 truncate text-sm font-medium text-gray-700 dark:text-gray-300" title={project.name}>
                               {project.name}
                            </div>
                            
                            <div className="flex-1 relative h-6">
                               <div 
                                  className={`absolute h-5 top-0.5 rounded shadow-sm flex items-center px-2 overflow-hidden text-white text-[10px] font-medium transition-all hover:brightness-110 ${barColor}`}
                                  style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                                  title={`${project.name}\n${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\nStatus: ${project.status}`}
                               >
                                  <span className="whitespace-nowrap drop-shadow-md">{project.status}</span>
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               </div>
             </div>
          ) : (
            <div className="p-12 text-center text-gray-500">Loading Timeline...</div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/20 dark:bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
           <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Details</h3>
                <button onClick={() => setIsModalOpen(false)}><Icons.Close className="w-5 h-5 text-gray-400 dark:text-gray-300" /></button>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                   <input 
                    type="text" 
                    value={editingProject.name || ''} 
                    onChange={e => setEditingProject({...editingProject, name: e.target.value})}
                    className={inputClass}
                    placeholder="e.g. Employee Dashboard"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                      value={editingProject.status} 
                      onChange={e => setEditingProject({...editingProject, status: e.target.value as ProjectStatus})}
                      className={inputClass}
                    >
                      {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    {/* Placeholder */}
                  </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={editingProject.startDate || ''}
                      onChange={e => setEditingProject({...editingProject, startDate: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={editingProject.endDate || ''}
                      onChange={e => setEditingProject({...editingProject, endDate: e.target.value})}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                   <textarea 
                    rows={3}
                    value={editingProject.description || ''} 
                    onChange={e => setEditingProject({...editingProject, description: e.target.value})}
                    className={inputClass}
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tech Stack (comma separated)</label>
                   <input 
                    type="text" 
                    value={editingProject.techStack?.join(', ')} 
                    onChange={e => setEditingProject({...editingProject, techStack: e.target.value.split(',').map(t => t.trim())})}
                    placeholder="React, PostgreSQL, Docker"
                    className={inputClass}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">My Role</label>
                     <input 
                      type="text" 
                      value={editingProject.role || ''} 
                      onChange={e => setEditingProject({...editingProject, role: e.target.value})}
                      className={inputClass}
                     />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deliverables</label>
                     <input 
                      type="text" 
                      value={editingProject.deliverables || ''} 
                      onChange={e => setEditingProject({...editingProject, deliverables: e.target.value})}
                      className={inputClass}
                     />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Cancel</button>
                  <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600">Save Project</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};