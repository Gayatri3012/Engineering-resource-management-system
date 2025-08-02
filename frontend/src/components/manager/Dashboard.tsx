import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { User, Project } from '../../types';
import TeamOverview from './TeamOverview';
import { 
  Users, 
  FolderOpen, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  Alert, 
  AlertDescription, 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/shadcn-components';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  Legend
} from 'recharts';

import { calculateEngineersCapacity, getCapacitySummary } from '@/utils/engineerCapacity';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchEngineers, fetchProjects, fetchAssignments } = useApp();
  const { engineers, projects, assignments } = state;
  const [stats, setStats] = useState({
    totalEngineers: 0,
    activeProjects: 0,
    avgUtilization: 0,
    overloadedEngineers: 0
  })
  const [capacityAlerts, setCapacityAlerts] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [chartData, setChartData] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchEngineers();
      fetchProjects();
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (engineers?.length > 0 && assignments.length > 0) {
      calculateStats();
      getCapacityAlerts();
      prepareChartData();

    }
  }, [engineers, assignments, projects]);

  const calculateStats = () => {
    const activeProjects = projects.filter((p: Project) => p.status === 'active').length;
    const capacitySummary = getCapacitySummary(engineers, assignments);
    
    setStats({
      totalEngineers: capacitySummary.totalEngineers,
      activeProjects,
      avgUtilization: Math.round(capacitySummary.utilizationPercentage),
      overloadedEngineers: capacitySummary.overallocatedCount
    });
  };

  const getCapacityAlerts = () => {
    const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments);
    
    const alerts: User[] = engineersWithCapacity
      .filter(engineer => 
        engineer.capacityInfo.totalAllocated > engineer.maxCapacity || 
        engineer.capacityInfo.totalAllocated < 30
      )
      .map(engineer => ({
        ...engineer,
        currentUtilization: engineer.capacityInfo.totalAllocated
      } as User & { currentUtilization: number }));
    
    setCapacityAlerts(alerts);
  };

  const prepareChartData = () => {
    const engineersWithCapacity = calculateEngineersCapacity(engineers, assignments);
    
    // Utilization distribution data for pie chart
    const utilizationRanges = [
      { name: 'Under-utilized', count: 0, fill: '#ef4444' },
      { name: 'Optimal', count: 0, fill: '#22c55e' },
      { name: 'High', count: 0, fill: '#f59e0b' },
      { name: 'Overloaded', count: 0, fill: '#dc2626' }
    ];

    engineersWithCapacity.forEach(engineer => {
      const utilization = engineer.capacityInfo.totalAllocated;
      if (utilization < 30) utilizationRanges[0].count++;
      else if (utilization <= 80) utilizationRanges[1].count++;
      else if (utilization <= 100) utilizationRanges[2].count++;
      else utilizationRanges[3].count++;
    });

    setUtilizationData(utilizationRanges.filter(range => range.count > 0));

    // Individual engineer utilization for bar chart
    const chartData = engineersWithCapacity.map(engineer => {
      const status = engineer.capacityInfo.totalAllocated > engineer.maxCapacity ? 'overloaded' : 
                    engineer.capacityInfo.totalAllocated < 30 ? 'underutilized' : 'optimal';
      
      return {
        name: engineer.name.split(' ')[0],
        utilization: Math.round(engineer.capacityInfo.totalAllocated),
        maxCapacity: engineer.maxCapacity,
        status,
        fill: status === 'overloaded' ? '#dc2626' : 
              status === 'underutilized' ? '#ef4444' : '#22c55e'
      };
    });

    setChartData(chartData);
  };



  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg border-gray-200">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          <p className="text-blue-600">{`Utilization: ${data.utilization}%`}</p>
          <p className="text-gray-600">{`Max Capacity: ${data.maxCapacity}%`}</p>
          <p className={`font-medium ${
            data.status === 'overloaded' ? 'text-red-600' : 
            data.status === 'underutilized' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {data.status === 'overloaded' ? 'Overloaded' :
             data.status === 'underutilized' ? 'Under-utilized' : 'Optimal'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded shadow-lg border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600">{`Count: ${data.value}`}</p>
        </div>
      );
    }
    return null;
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-gray-600">Manage your engineering team and projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Engineers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEngineers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgUtilization}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Capacity Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{capacityAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[                
                { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                { id: 'overview', name: 'Overview', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
         
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Capacity Alerts */}
            {capacityAlerts.length > 0 && (
              <Alert className="border-red-200 bg-red-100" variant='destructive'>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className='flex gap-2'>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <h3 className="font-medium text-red-900 mb-3">Capacity Alerts</h3>
                    </div>
                    {capacityAlerts.map((engineer) => (
                      <div key={engineer._id} className="flex justify-between items-center">
                        <span className="text-red-800">{engineer.name}</span>
                        <span className="text-sm text-red-600">
                          {(engineer as any).currentUtilization > engineer.maxCapacity! 
                            ? `Overloaded: ${(engineer as any).currentUtilization}%`
                            : `Underutilized: ${(engineer as any).currentUtilization}%`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <TeamOverview embedded={true} maxRows={5} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Utilization Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    Individual Utilization
                  </CardTitle>
                  <CardDescription>
                    Current utilization levels for each team member
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="utilization" name="Utilization">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Utilization Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 text-green-600 mr-2" />
                    Utilization Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of engineers across utilization ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={utilizationData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="count"
                        >
                          {utilizationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-700">Optimal Utilization</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {utilizationData.find(d => d.name === 'Optimal')?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Engineers (30-80%)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-700">Under-utilized</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {utilizationData.find(d => d.name === 'Under-utilized')?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Engineers (&lt;30%)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-700">Overloaded</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {utilizationData.find(d => d.name === 'Overloaded')?.count || 0}
                  </p>
                  <p className="text-sm text-gray-500">Engineers (&gt;100%)</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;