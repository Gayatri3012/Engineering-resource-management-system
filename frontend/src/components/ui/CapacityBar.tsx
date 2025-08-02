import React from 'react';

interface CapacityBarProps {
  current: number;
  max: number;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CapacityBar: React.FC<CapacityBarProps> = ({ 
  current, 
  max, 
  className = '', 
  showText = true,
  size = 'md'
}) => {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const available = Math.max(max - current, 0);
  
  // Determine color based on capacity utilization
  const getColorClasses = (percentage: number) => {
    if (percentage >= 90) {
      return 'bg-red-500'; // High utilization - red
    } else if (percentage >= 70) {
      return 'bg-yellow-500'; // Medium utilization - yellow
    } else {
      return 'bg-green-500'; // Low utilization - green
    }
  };

  const getBackgroundColorClasses = (percentage: number) => {
    if (percentage >= 90) {
      return 'bg-red-100'; // High utilization - light red
    } else if (percentage >= 70) {
      return 'bg-yellow-100'; // Medium utilization - light yellow
    } else {
      return 'bg-green-100'; // Low utilization - light green
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-6';
      default:
        return 'h-4';
    }
  };

  const getTextSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className={`flex justify-between items-center mb-1 ${getTextSize(size)}`}>
          <span className="text-gray-700 font-medium">
            {current}% / {max}%
          </span>
          <span className="text-gray-500">
            {available}% available
          </span>
        </div>
      )}
      
      <div className={`w-full ${getBackgroundColorClasses(percentage)} rounded-full overflow-hidden ${getSizeClasses(size)}`}>
        <div
          className={`${getColorClasses(percentage)} ${getSizeClasses(size)} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showText && size !== 'sm' && (
        <div className={`flex justify-center mt-1 ${getTextSize(size)}`}>
          <span className={`font-medium ${
            percentage >= 90 ? 'text-red-600' :
            percentage >= 70 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {percentage.toFixed(1)}% utilized
          </span>
        </div>
      )}
    </div>
  );
};

export default CapacityBar;