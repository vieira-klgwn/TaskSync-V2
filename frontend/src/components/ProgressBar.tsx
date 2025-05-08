
// ProgressBar component for displaying visual progress indicators
import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  
  // Determine color based on percentage
  let colorClass = 'bg-gray-300'; // Default color
  if (validPercentage >= 75) {
    colorClass = 'bg-green-500'; // High progress
  } else if (validPercentage >= 50) {
    colorClass = 'bg-blue-500'; // Medium progress
  } else if (validPercentage >= 25) {
    colorClass = 'bg-yellow-500'; // Low progress
  } else {
    colorClass = 'bg-red-500'; // Very low progress
  }
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${colorClass}`}
        style={{ width: `${validPercentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
