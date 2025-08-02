import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Assignment, Project } from '../../types';


const EngineerProfile: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchAssignments, fetchProjects } = useApp();
  const {assignments, projects} = state;
  const [userAssignments, setUserAssignments] = useState<Assignment[]>([]);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);


  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (user && assignments.length > 0) {
      // Filter assignments for current user
      const myAssignments = assignments.filter((assignment: Assignment) =>  {
        return assignment.engineerId?._id === user._id}
        );
      setUserAssignments(myAssignments);

      const today = new Date();
      const activeAssignments = myAssignments.filter((assignment: Assignment) => 
        new Date(assignment.startDate) <= today && new Date(assignment.endDate) >= today
      );

      // Get current projects
      const projectIds = activeAssignments.map((assignment: Assignment) => assignment.projectId._id);
      const activeProjects = projects.filter((project: Project) => 
        projectIds.includes(project._id)
      );
      setCurrentProjects(activeProjects);
    }
  }, [user, assignments, projects]);



  const upcomingAssignments = userAssignments.filter(assignment => 
    new Date(assignment.startDate) > new Date()
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
   
      <div className="max-w-7xl mx-auto mt-6">

        {/* Current Projects */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Projects
          </h2>
          {currentProjects.length === 0 ? (
            <p className="text-gray-500">No active projects</p>
          ) : (
            <div className="space-y-4">
              {currentProjects.map((project) => {
                const assignment = userAssignments.find(a => a.projectId._id === project._id);
                return (
                  <div key={project._id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            Role: {assignment?.role || 'Developer'}
                          </span>
                          <span className="text-sm text-gray-500">
                            Allocation: {assignment?.allocationPercentage}%
                          </span>
                          <span className="text-sm text-gray-500">
                            Until: {assignment ? formatDate(assignment.endDate) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Assignments
          </h2>
          {upcomingAssignments.length === 0 ? (
            <p className="text-gray-500">No upcoming assignments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.map((assignment) => {
                const project = projects.find((p: Project) => p._id === assignment.projectId._id);
                const daysUntil = getDaysUntil(assignment.startDate);
                return (
                  <div key={assignment._id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {project?.name || 'Unknown Project'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {project?.description || 'No description available'}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-sm text-gray-500">
                            Role: {assignment.role}
                          </span>
                          <span className="text-sm text-gray-500">
                            Allocation: {assignment.allocationPercentage}%
                          </span>
                          <span className="text-sm text-gray-500">
                            Starts: {formatDate(assignment.startDate)}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {daysUntil === 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' : 
                         `${daysUntil} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

  );
};

export default EngineerProfile;