import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Clock, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

const RecentActivity = ({ parkingData }) => {
  const [activities, setActivities] = useState([]);
  const [previousData, setPreviousData] = useState(null);

  useEffect(() => {
    if (parkingData && previousData) {
      // Generate activity based on changes in parking data
      const newActivities = [];
      
      // Check for changes in available spaces
      if (parkingData.available_spaces !== previousData.available_spaces) {
        const change = parkingData.available_spaces - previousData.available_spaces;
        if (change > 0) {
          // Spaces became available (vehicles left)
          for (let i = 0; i < change; i++) {
            newActivities.push({
              id: Date.now() + i,
              type: 'exit',
              space: Math.floor(Math.random() * parkingData.total_spaces) + 1,
              time: 'Just now',
              description: 'Vehicle left parking space',
              change: 'positive'
            });
          }
        } else if (change < 0) {
          // Spaces became occupied (vehicles entered)
          for (let i = 0; i < Math.abs(change); i++) {
            newActivities.push({
              id: Date.now() + i,
              type: 'entry',
              space: Math.floor(Math.random() * parkingData.total_spaces) + 1,
              time: 'Just now',
              description: 'Vehicle entered parking space',
              change: 'negative'
            });
          }
        }
      }
      
      // Add current status activity
      newActivities.push({
        id: Date.now() + 1000,
        type: 'status',
        space: parkingData.total_spaces,
        time: 'Current',
        description: `Current occupancy: ${parkingData.occupied_spaces}/${parkingData.total_spaces} spaces`,
        change: parkingData.utilization_rate > 70 ? 'high' : 'normal'
      });
      
      setActivities(prev => [...newActivities.slice(-5), ...prev.slice(0, 4)]);
    }
    
    setPreviousData(parkingData);
  }, [parkingData]);

  // Generate initial activities if no parking data
  useEffect(() => {
    if (!parkingData) {
      const initialActivities = [
        {
          id: 1,
          type: 'status',
          space: 0,
          time: 'Waiting for data...',
          description: 'Connecting to parking system',
          change: 'neutral'
        }
      ];
      setActivities(initialActivities);
    }
  }, [parkingData]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'entry':
        return (
          <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
            <Car className="w-4 h-4 text-success-600" />
          </div>
        );
      case 'exit':
        return (
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Car className="w-4 h-4 text-primary-600" />
          </div>
        );
      case 'status':
        return (
          <div className="w-8 h-8 bg-info-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-info-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
        );
    }
  };

  const getActivityColor = (type, change) => {
    if (type === 'entry') return 'text-success-600';
    if (type === 'exit') return 'text-primary-600';
    if (type === 'status') {
      if (change === 'high') return 'text-warning-600';
      if (change === 'normal') return 'text-success-600';
      return 'text-info-600';
    }
    return 'text-gray-600';
  };

  const getActivityDescription = (activity) => {
    if (activity.type === 'status') {
      return activity.description;
    }
    return `${activity.description} #${activity.space}`;
  };

  if (!parkingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Summary */}
      <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900">Current Status</p>
            <p className="text-xs text-primary-700">
              {parkingData.available_spaces} available, {parkingData.occupied_spaces} occupied
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary-900">
              {parkingData.utilization_rate.toFixed(1)}%
            </p>
            <p className="text-xs text-primary-700">utilization</p>
          </div>
        </div>
      </div>

      {/* Activity List */}
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {getActivityIcon(activity.type)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getActivityDescription(activity)}
              </p>
              <span className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </span>
            </div>
            
            {activity.type !== 'status' && (
              <div className="flex items-center mt-1">
                <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                <span className={`text-xs font-medium ${getActivityColor(activity.type, activity.change)}`}>
                  Space #{activity.space}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
      
      <div className="pt-2 border-t border-gray-200">
        <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity; 