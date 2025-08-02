import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Settings, Save, X, Plus, Trash2 } from 'lucide-react';

interface ProfileFormData {
  name: string;
  department: string;
  seniority: string;
  maxCapacity: number;
  skills: string[];
}

const EngineerProfile: React.FC = () => {
  const { user, updateUserProfile } = useAuth(); // Assuming updateUserProfile exists in AuthContext
  const { fetchAssignments, fetchProjects } = useApp();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    department: '',
    seniority: '',
    maxCapacity: 100,
    skills: []
  });

  // Initialize form data when user changes or editing starts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        seniority: user.seniority || '',
        maxCapacity: user.maxCapacity || 100,
        skills: user.skills ? [...user.skills] : []
      });
      fetchAssignments();
      fetchProjects();
    }
  }, [user, isEditingProfile]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle form submission
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      

      // Call update function (you'll need to implement this in your AuthContext)
      await updateUserProfile(formData);
      
      setIsEditingProfile(false);
      
      
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setNewSkill('');
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        seniority: user.seniority || '',
        maxCapacity: user.maxCapacity || 100,
        skills: user.skills ? [...user.skills] : []
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-6">
      {/* Skills & Profile */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditingProfile ? (
          // Display Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills listed</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{user.name || 'Not specified'}</span>
                </div>
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{user.department || 'Not specified'}</span>
                </div>
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Seniority:</span>
                  <span className="font-medium capitalize">{user.seniority}</span>
                </div>
                <div className="flex justify-start gap-3">
                  <span className="text-gray-600">Employment:</span>
                  <span className="font-medium">
                    {user.maxCapacity === 100 ? 'Full-time' : 'Part-time'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Personal Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seniority Level
                  </label>
                  <select
                    value={formData.seniority}
                    onChange={(e) => handleInputChange('seniority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select seniority level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Capacity (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxCapacity}
                    onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set to less than 100% for part-time employment
                  </p>
                </div>
              </div>

              {/* Skills Management */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Skills</h3>
                
                {/* Add new skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Skills list */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                      >
                        <span className="text-sm">{skill}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerProfile;