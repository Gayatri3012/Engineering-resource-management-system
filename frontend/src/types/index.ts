// User interfaces
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'engineer' | 'manager';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Engineer extends User {
  role: 'engineer';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
  availableCapacity?: number;
}

export interface Manager extends User {
  role: 'manager';
}

// Project interface
export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId: string;
  manager?: Manager;
  createdAt?: string;
  updatedAt?: string;
}

// Assignment interface
export interface Assignment {
  _id: string;
  engineerId: any;
  projectId: any;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  engineer?: Engineer;
  project?: Project;
  createdAt?: string;
  updatedAt?: string;
}

export interface CapacityInfo {
  totalAllocated: number;
  maxCapacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
}

export interface EngineerWithCapacity extends Engineer {
  capacityInfo: CapacityInfo;
  currentAssignments: Assignment[];
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// App context types
export interface AppState {
  engineers: Engineer[];
  projects: Project[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

export interface AppContextType {
  state: AppState;
  fetchEngineers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  createProject: (projectData: Omit<Project, '_id'>) => Promise<void>;
  createAssignment: (assignmentData: Omit<Assignment, '_id' | 'engineer' | 'project'>) => Promise<void>;
  updateAssignment: (id: string, assignmentData: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  managerId: string;
  status: 'planning' | 'active' | 'completed';
}

export interface AssignmentFormData {
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
}


export interface ProfileFormData {
  name: string;
  department: string;
  seniority: string;
  maxCapacity: number;
  skills: string[];
}

export interface EngineerWithCapacity extends Engineer {
  capacityInfo: CapacityInfo;
  currentAssignments: Assignment[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
}