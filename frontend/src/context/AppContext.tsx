import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

import api from '../utils/api';

// Types
interface Engineer {
  _id: string;
  email: string;
  name: string;
  role: 'engineer';
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  maxCapacity: number;
  department: string;
  availableCapacity?: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId: string;
}

interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
  engineer?: Engineer;
  project?: Project;
}

// State interface
interface AppState {
  engineers: Engineer[];
  projects: Project[];
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
}

// Actions - Using const object instead of enum for TypeScript strict mode
const ActionType = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ENGINEERS: 'SET_ENGINEERS',
  SET_PROJECTS: 'SET_PROJECTS',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  SET_ASSIGNMENTS: 'SET_ASSIGNMENTS',
  ADD_PROJECT: 'ADD_PROJECT',
  ADD_ASSIGNMENT: 'ADD_ASSIGNMENT',
  UPDATE_ASSIGNMENT: 'UPDATE_ASSIGNMENT',
  DELETE_ASSIGNMENT: 'DELETE_ASSIGNMENT',
} as const;

// type ActionTypeKeys = typeof ActionType[keyof typeof ActionType];

type Action =
  | { type: typeof ActionType.SET_LOADING; payload: boolean }
  | { type: typeof ActionType.SET_ERROR; payload: string | null }
  | { type: typeof ActionType.SET_ENGINEERS; payload: Engineer[] }
  | { type: typeof ActionType.SET_PROJECTS; payload: Project[] }
  | { type: typeof ActionType.UPDATE_PROJECT; payload: Project }
  | { type: typeof ActionType.SET_ASSIGNMENTS; payload: Assignment[] }
  | { type: typeof ActionType.ADD_PROJECT; payload: Project }
  | { type: typeof ActionType.ADD_ASSIGNMENT; payload: Assignment }
  | { type: typeof ActionType.UPDATE_ASSIGNMENT; payload: Assignment }
  | { type: typeof ActionType.DELETE_ASSIGNMENT; payload: string };

// Initial state
const initialState: AppState = {
  engineers: [],
  projects: [],
  assignments: [],
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionType.SET_ENGINEERS:
      return { ...state, engineers: action.payload, loading: false };
    case ActionType.SET_PROJECTS:
      return { ...state, projects: action.payload, loading: false };
    case ActionType.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
    };
    case ActionType.SET_ASSIGNMENTS:
      return { ...state, assignments: action.payload, loading: false };
    case ActionType.ADD_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };
    case ActionType.ADD_ASSIGNMENT:
      return { ...state, assignments: [...state.assignments, action.payload] };
    case ActionType.UPDATE_ASSIGNMENT:
      return {
        ...state,
        assignments: state.assignments.map(assignment =>
          assignment._id === action.payload._id ? action.payload : assignment
        ),
      };
    case ActionType.DELETE_ASSIGNMENT:
      return {
        ...state,
        assignments: state.assignments.filter(assignment => assignment._id !== action.payload),
      };
    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: AppState;
  fetchEngineers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  createProject: (projectData: Omit<Project, '_id'>) => Promise<void>;
  editProject: (projectData: any, projectId: any) => Promise<void>;
  createAssignment: (assignmentData: Omit<Assignment, '_id' | 'engineer' | 'project'>) => Promise<void>;
  updateAssignment: (id: string, assignmentData: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  getEngineerCapacity: (engineerId: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchEngineers = async () => {
    try {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      const response = await api.get('/engineers');
      dispatch({ type: ActionType.SET_ENGINEERS, payload: response.data.engineers });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to fetch engineers' });
    }
  };

  const fetchProjects = async () => {
    try {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      const response = await api.get('/projects');
      dispatch({ type: ActionType.SET_PROJECTS, payload: response.data.projects });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to fetch projects' });
    }
  };

  const fetchAssignments = async () => {
    try {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      const response = await api.get('/assignments');
      dispatch({ type: ActionType.SET_ASSIGNMENTS, payload: response.data.assignments });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to fetch assignments' });
    }
  };

  const createProject = async (projectData: Omit<Project, '_id'>) => {
    try {
      const response = await api.post('/projects', projectData);
      dispatch({ type: ActionType.ADD_PROJECT, payload: response.data.project });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to create project' });
      throw error;
    }
  };
const editProject = async (projectId: any, projectData: any) => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData);

      dispatch({ 
        type: 'UPDATE_PROJECT', 
        payload: response.data.project 
      });
    
  } catch (error) {
    console.error('Error editing project:', error);
    throw error;
  }
};

  const createAssignment = async (assignmentData: Omit<Assignment, '_id' | 'engineer' | 'project'>) => {
    try {
      console.log(assignmentData)
      const response = await api.post('/assignments', assignmentData);
      console.log(response)
      dispatch({ type: ActionType.ADD_ASSIGNMENT, payload: response.data.assignment });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to create assignment' });
      throw error;
    }
  };

  const updateAssignment = async (id: string, assignmentData: Partial<Assignment>) => {
    try {
      const response = await api.put(`/assignments/${id}`, assignmentData);
      dispatch({ type: ActionType.UPDATE_ASSIGNMENT, payload: response.data.assignment });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to update assignment' });
      throw error;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await api.delete(`/assignments/${id}`);
      dispatch({ type: ActionType.DELETE_ASSIGNMENT, payload: id });
    } catch (error: any) {
      dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to delete assignment' });
      throw error;
    }
  };
  const getEngineerCapacity = async (engineerId: string): Promise<number> => {
  try {
    const response = await api.get(`/engineers/${engineerId}/capacity`);
    return response.data;
  } catch (error: any) {
    dispatch({ type: ActionType.SET_ERROR, payload: error.response?.data?.message || 'Failed to fetch capacity' });
    throw error;
  }
};

  const value = {
    state,
    fetchEngineers,
    fetchProjects,
    fetchAssignments,
    createProject,
    editProject,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getEngineerCapacity
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};