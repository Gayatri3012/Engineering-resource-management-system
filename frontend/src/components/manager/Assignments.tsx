import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Assignment } from '../../types';
import AssignmentForm from './AssignmentForm';
import { 
  Plus,
  Filter,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CalendarDays,
  List,

  ChevronLeft,
  ChevronRight
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

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments, deleteAssignment } = useApp();
  const { engineers, projects, assignments } = state;
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Filter states - only keeping status filter
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Enhanced assignments with additional calculated data
  const enhancedAssignments = useMemo(() => {
    return assignments.map(assignment => {
      const extractId = (id: string | { _id: string }) => {
        return typeof id === 'object' && id !== null ? id._id : id;
      };
      const engineer = engineers.find(e => e._id === extractId(assignment.engineerId));
      const project = projects.find(p => p._id === extractId(assignment.projectId));
      
      // Calculate assignment status based on dates
      const now = new Date();
      const startDate = new Date(assignment.startDate);
      const endDate = new Date(assignment.endDate);
      
      let status: 'upcoming' | 'active' | 'completed' | 'overdue';
      if (now < startDate) {
        status = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        status = 'active';
      } else if (now > endDate) {
        status = 'completed';
      } else {
        status = 'overdue';
      }

      return {
        ...assignment,
        engineer,
        project,
        status,
        engineerName: engineer?.name || 'Unknown Engineer',
        projectName: project?.name || 'Unknown Project'
      };
    });
  }, [assignments, engineers, projects]);

  // Filter assignments - only by status now
  const filteredAssignments = useMemo(() => {
    return enhancedAssignments
      .filter(assignment => {
        const matchesStatus = !statusFilter || assignment.status === statusFilter;
        return matchesStatus;
      })

  }, [enhancedAssignments, statusFilter]);

  // Calendar view helper functions
  const getCalendarData = () => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayAssignments = filteredAssignments.filter(assignment => {
        const startDate = new Date(assignment.startDate);
        const endDate = new Date(assignment.endDate);
        return date >= startDate && date <= endDate;
      });
      
      days.push({
        date: day,
        fullDate: date,
        assignments: dayAssignments,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(assignmentId);
        fetchAssignments(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowAssignmentForm(false);
    setEditingAssignment(null);
    fetchAssignments();
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

  const calendarData = getCalendarData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Assignments Management</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage engineer assignments and resource allocation</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-2 sm:px-3 flex-1 sm:flex-none"
                >
                  <List className="h-4 w-4 sm:mr-1" />
                  <span className="text-xs sm:text-sm">List</span>
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="px-2 sm:px-3 flex-1 sm:flex-none"
                >
                  <CalendarDays className="h-4 w-4 sm:mr-1" />
                  <span className="text-xs sm:text-sm">Calendar</span>
                </Button>
              </div>
              <Button onClick={() => setShowAssignmentForm(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Assignment</span>
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
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enhancedAssignments.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enhancedAssignments.filter(a => a.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {enhancedAssignments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 flex items-center sm:ml-auto">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-4 sm:p-6">
              <div className="rounded-md border overflow-hidden">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {assignments.length === 0 
                        ? "Get started by creating your first assignment."
                        : "Try adjusting your filter criteria."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px] sm:min-w-[180px]">Engineer</TableHead>
                          <TableHead className="min-w-[150px] sm:min-w-[180px]">Project</TableHead>
                          <TableHead className="min-w-[80px]">Role</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Allocation</TableHead>
                          <TableHead className="min-w-[140px]">Timeline</TableHead>
                          <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.map((assignment: any) => (
                          <TableRow key={assignment._id} className="hover:bg-gray-50">
                            <TableCell className="min-w-[150px] sm:min-w-[180px]">
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px]">{assignment.engineerName}</div>
                                <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[150px]">
                                  {assignment.engineer?.skills?.slice(0, 2).join(', ') || 'No skills listed'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[150px] sm:min-w-[180px]">
                              <div>
                                <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px]">{assignment.projectName}</div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {assignment.project?.status || 'Unknown status'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[80px]">
                              <Badge variant="outline" className="text-xs">
                                {assignment.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[100px]">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(assignment.status)}
                                <Badge variant={getStatusColor(assignment.status) as any} className="text-xs">
                                  {assignment.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[100px]">
                              <div className="text-xs sm:text-sm">
                                <div className="font-medium">{assignment.allocationPercentage}%</div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{width: `${assignment.allocationPercentage}%`}}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <div className="text-xs sm:text-sm">
                                <div className="font-medium">{formatDate(assignment.startDate)}</div>
                                <div className="text-gray-500">to {formatDate(assignment.endDate)}</div>
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[120px]">
                              <div className="flex space-x-1 sm:space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                  className="text-red-600 border-red-600 hover:bg-red-50 p-1 sm:p-2"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
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
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="p-4 sm:p-6">
              {/* Calendar Header with Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">{calendarData.monthName}</h3>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid Container with Scroll */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] sm:min-w-[700px] md:min-w-[800px] lg:min-w-full">
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 rounded-t">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 3)}</span>
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarData.days.map((day, index) => (
                      <div 
                        key={index} 
                        className={`min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[180px] xl:min-h-[200px] p-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors ${
                          day?.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-semibold mb-2 ${
                              day.isToday ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {day.date}
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                              {day.assignments.map((assignment, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs p-2 rounded cursor-pointer hover:shadow-sm transition-shadow border"
                                  style={{
                                    backgroundColor: assignment.status === 'active' ? '#dcfce7' : 
                                                   assignment.status === 'upcoming' ? '#dbeafe' : 
                                                   assignment.status === 'overdue' ? '#fee2e2' : '#f3f4f6',
                                    color: assignment.status === 'active' ? '#166534' : 
                                           assignment.status === 'upcoming' ? '#1e40af' : 
                                           assignment.status === 'overdue' ? '#991b1b' : '#374151',
                                    borderColor: assignment.status === 'active' ? '#10b981' : 
                                               assignment.status === 'upcoming' ? '#3b82f6' : 
                                               assignment.status === 'overdue' ? '#ef4444' : '#d1d5db'
                                  }}
                                  title={`${assignment.engineerName} - ${assignment.projectName} (${assignment.allocationPercentage}%)`}
                                >
                                  <div className="font-medium truncate text-xs">
                                    {assignment.engineerName}
                                  </div>
                                  <div className="truncate opacity-90 mt-1 text-xs">
                                    {assignment.projectName}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="opacity-75 text-xs">{assignment.allocationPercentage}%</span>
                                    <span className="text-xs px-1 py-0.5 rounded" style={{
                                      backgroundColor: assignment.status === 'active' ? '#22c55e' : 
                                                     assignment.status === 'upcoming' ? '#3b82f6' : 
                                                     assignment.status === 'overdue' ? '#ef4444' : '#6b7280',
                                      color: 'white'
                                    }}>
                                      {assignment.status.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {day.assignments.length === 0 && (
                                <div className="text-xs text-gray-400 italic text-center py-4">
                                  No assignments
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Form Modal */}
      {showAssignmentForm && (
        <AssignmentForm 
          onClose={handleCloseForm} 
          isOpen={showAssignmentForm}
          assignment={editingAssignment}
        />
      )}
    </div>
  );
};

export default Assignments;