
import React from 'react';
import {  useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (userRole: string) => {
    console.log('Login successful for role:', userRole); 
    if (!userRole) return;
    const redirectPath = userRole === 'manager' ? '/manager' : '/engineer';
    navigate(redirectPath, { replace: true });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ResourceHub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Engineering Resource Management System
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

          {/* Forms */}
        
        <LoginForm onSuccess={handleLoginSuccess} />
        

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div>
                <strong>Manager:</strong> manager@company.com / password123
              </div>
              <div>
                <strong>Engineer:</strong> engineer@company.com / password123
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;