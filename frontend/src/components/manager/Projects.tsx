import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../types';
import ProjectForm from './ProjectForm';
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { 
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '@/components/ui/shadcn-components';

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { projects, assignments } = state;
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'endDate' | 'status'>('name');

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

  // Get unique skills from all projects
  const allProjectSkills = useMemo(() => {
    const skills = new Set<string>();
    projects.forEach(project => {
      if (project.requiredSkills) {
        project.requiredSkills.forEach(skill => skills.add(skill));
      }
    });
    return Array.from(skills).sort();
  }, [projects]);

  // Enhanced projects with additional calculated data
  const enhancedProjects = useMemo(() => {
    return projects.map(project => {
      // Get assignments for this project
      const projectAssignments = assignments.filter(assignment => 
        assignment.projectId === project._id || 
        (typeof assignment.projectId === 'object' && assignment.project?._id === project._id)
      );

      // Calculate current team size
      const currentTeamSize = projectAssignments.filter(assignment => 
        new Date(assignment.endDate) > new Date() && 
        new Date(assignment.startDate) <= new Date()
      ).length;

      return {
        ...project,
        currentTeamSize,
        projectAssignments
      };
    });
  }, [projects, assignments]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return enhancedProjects
      .filter(project => {
        const matchesSearch = 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.requiredSkills && project.requiredSkills.some(skill => 
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          ));

        const matchesStatus = !statusFilter || project.status === statusFilter;
        
        const matchesSkill = !skillFilter || 
          (project.requiredSkills && project.requiredSkills.includes(skillFilter));

        return matchesSearch && matchesStatus && matchesSkill;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'startDate':
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          case 'endDate':
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [enhancedProjects, searchTerm, statusFilter, skillFilter, sortBy]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'planning':
        return <ClipboardList className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    fetchProjects(); // Refresh projects after create/edit
  };

  if (!user || user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to managers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Projects Management</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your engineering projects and resources</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setShowProjectForm(true)} className="bg-blue-600 hover:bg-blue-700 px-3 py-2 sm:px-4 w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Planning</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'planning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="">All Skills</option>
                {allProjectSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="name">Sort by Name</option>
                <option value="startDate">Sort by Start Date</option>
                <option value="endDate">Sort by End Date</option>
                <option value="status">Sort by Status</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setSkillFilter('');
                  setSortBy('name');
                }}
                className="text-gray-600 border-gray-300 hover:bg-gray-50 px-2 sm:px-3 py-1 text-xs sm:text-sm w-full sm:w-auto"
              >
                Clear Filters
              </Button>

              <div className="text-xs sm:text-sm text-gray-600 flex items-center pt-2 sm:pt-0">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 sm:p-6">
            <div className="rounded-md border overflow-hidden">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {projects.length === 0 
                      ? "Get started by creating your first project."
                      : "Try adjusting your search criteria or filters."
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px] sm:min-w-[250px]">Project Details</TableHead>
                        <TableHead className="min-w-[120px]">Status</TableHead>
                        <TableHead className="min-w-[150px]">Required Skills</TableHead>
                        <TableHead className="min-w-[140px]">Timeline</TableHead>
                        <TableHead className="min-w-[100px]">Team Size</TableHead>
                        <TableHead className="min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project: any) => (
                        <TableRow key={project._id} className="hover:bg-gray-50">
                          <TableCell className="min-w-[200px] sm:min-w-[250px]">
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[300px]">{project.name}</div>
                              <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[300px]">
                                {project.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(project.status)}
                              <Badge variant={
                                project.status === 'active' ? 'success' :
                                project.status === 'planning' ? 'warning' :
                                project.status === 'completed' ? 'default' :
                                project.status === 'on-hold' ? 'destructive' :
                                'secondary'
                              } className="text-xs">
                                {project.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <div className="flex flex-wrap gap-1">
                              {project.requiredSkills?.slice(0, 2).map((skill: string) => (
                                <Badge
                                  key={skill}
                                  variant="default"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              )) || <span className="text-xs text-gray-400">No skills specified</span>}
                              {project.requiredSkills?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.requiredSkills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <div className="text-xs sm:text-sm">
                              <div className="font-medium">{formatDate(project.startDate)}</div>
                              <div className="text-gray-500">to {formatDate(project.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <div className="text-xs sm:text-sm">
                              <div className="font-medium">
                                {project.teamSize || 0}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProject(project)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                             
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-[600px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-medium">
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </Button>
            </div>
            <ProjectForm 
              onClose={handleCloseForm} 
              isOpen={showProjectForm}
              project={editingProject}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;