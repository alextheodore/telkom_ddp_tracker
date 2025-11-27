export enum AttendanceStatus {
  Present = 'Present',
  Permission = 'Permission',
  Sick = 'Sick',
  WFH = 'WFH'
}

export enum ProjectStatus {
  OnProgress = 'On Progress',
  Completed = 'Completed',
  Waiting = 'Waiting'
}

export interface Attachment {
  name: string;
  size: number;
  type: string;
}

export interface DailyLog {
  id: string;
  date: string; // ISO Date string
  attendance: AttendanceStatus;
  activity: string;
  learnings: string;
  challenges: string;
  tags: string[];
  attachments: Attachment[];
}

export interface MonthlyReport {
  id: string;
  month: string; // YYYY-MM
  summary: string;
  achievements: string;
  challengesSolutions: string;
  nextMonthPlan: string;
  linkedLogIds: string[]; // Simulation of Relation
  files: Attachment[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  techStack: string[];
  role: string;
  deliverables: string;
  status: ProjectStatus;
  documents: Attachment[];
}

export type ViewState = 'dashboard' | 'logs' | 'reports' | 'projects';

export interface AppData {
  logs: DailyLog[];
  reports: MonthlyReport[];
  projects: Project[];
}