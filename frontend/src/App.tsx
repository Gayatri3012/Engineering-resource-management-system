// Replace frontend/src/App.tsx:
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navigation from './components/layout/Navigation';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import { useAuth } from './context/AuthContext';
import TeamOverview from './components/manager/TeamOverview';
import EngineerProfile from './components/engineer/EngineerProfile';
import EngineerAssignments from './components/engineer/EngineerAssignments';
import Projects from './components/manager/Projects';
import Assignments from './components/manager/Assignments';

// Layout component that includes navigation
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// App content component that uses auth context
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public route - Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'manager' ? '/manager' : '/engineer'} replace />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Protected Manager Routes */}
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute requiredRole="manager">
            <Layout>
              <Routes>
                <Route path="/" element={<ManagerDashboard />} />
                <Route path="/team" element={<TeamOverview />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/assignments" element={<Assignments />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected Engineer Routes */}
      <Route
        path="/engineer/*"
        element={
          <ProtectedRoute requiredRole="engineer">
            <Layout>
              <Routes>
                <Route path="/" element={<EngineerDashboard />} />
                <Route path="/dashboard" element={<EngineerDashboard />} />
                <Route path="/assignments" element={<EngineerAssignments />} />
                <Route path="/profile" element={<EngineerProfile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.role === 'manager' ? '/manager' : '/engineer')
                : '/login'
            } 
            replace 
          />
        }
      />

      {/* Catch all - redirect to appropriate dashboard or login */}
      <Route
        path="*"
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.role === 'manager' ? '/manager' : '/engineer')
                : '/login'
            } 
            replace 
          />
        }
      />
    </Routes>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="App">
            <AppContent />
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;