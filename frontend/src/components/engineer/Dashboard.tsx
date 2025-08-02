import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Assignment, Project } from '../../types';
import  CapacityBar  from '../ui/CapacityBar';
import { Calendar, Clock, User } from 'lucide-react';
import EngineerAssignments from './EngineerAssignments';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchAssignments, fetchProjects , getEngineerCapacity} = useApp();
  const {assignments, projects} = state;
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [totalCapacity, setTotalCapacity] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (user && assignments.length > 0) {
      // Filter assignments for current user
      const myAssignments = assignments.filter((assignment: Assignment) => 
        assignment.engineerId._id.toString() === user._id.toString()
      );

      // Calculate total capacity used
      const today = new Date();
      const activeAssignments = myAssignments.filter((assignment: Assignment) => 
        new Date(assignment.startDate) <= today && new Date(assignment.endDate) >= today
      );
      (async () => {
        const response = await getEngineerCapacity(user._id);
        setTotalCapacity(user.maxCapacity! - response.availableCapacity);
    })();

      // Get current projects
      const projectIds = activeAssignments.map((assignment: Assignment) => assignment.projectId._id);
      const activeProjects = projects.filter((project: Project) => 
        projectIds.includes(project._id)
      );
      setCurrentProjects(activeProjects);
    }
  }, [user, assignments, projects]);




  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
            Welcome, {user.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Here's your current workload and upcoming assignments
          </p>
        </div>

        {/* Capacity Overview */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Current Capacity
            </h2>
            <span className="text-xs sm:text-sm text-gray-500">
              {totalCapacity}% of {user.maxCapacity}% capacity
            </span>
          </div>
          <CapacityBar 
            current={totalCapacity} 
            max={user.maxCapacity!} 
            className="mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-blue-900">
                  {user.seniority} {user.role}
                </span>
              </div>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-green-900">
                  {user.maxCapacity! - totalCapacity}% Available
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-purple-900">
                  {currentProjects.length} Active Projects
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Projects */}
        <div className="overflow-hidden">
          <EngineerAssignments />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;