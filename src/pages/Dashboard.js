import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Clock, 
  TrendingUp, 
  Activity,
  Calendar,
  Eye,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ParkingMap from '../components/ParkingMap';
import RecentActivity from '../components/RecentActivity';
import OccupancyChart from '../components/OccupancyChart';

const Dashboard = () => {
  const [parkingData, setParkingData] = useState({
    total_spaces: 0,
    available_spaces: 0,
    occupied_spaces: 0,
    utilization_rate: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const lastDataRef = useRef(null);

  const fetchParkingData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parking-status');
      if (!response.ok) {
        throw new Error('Failed to fetch parking data');
      }
      const data = await response.json();
      
      // Check if data has actually changed to avoid unnecessary re-renders
      const dataString = JSON.stringify(data);
      if (dataString !== lastDataRef.current) {
        console.log('Dashboard data updated:', data);
        setParkingData(data);
        setLastUpdated(new Date());
        lastDataRef.current = dataString;
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching parking data:', err);
      setError('Failed to load parking data. Please check if the backend is running.');
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchParkingData();
    setIsLoading(false);

    // Optimized polling: Start with 1.5 seconds, then increase to 4 seconds for stability
    let pollCount = 0;
    
    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        pollCount++;
        fetchParkingData();
        
        // After 8 quick polls, slow down to reduce server load
        if (pollCount >= 8) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(fetchParkingData, 4000);
        }
      }, 1500);
    };
    
    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const stats = [
    {
      title: 'Available Spaces',
      value: parkingData.available_spaces,
      total: parkingData.total_spaces,
      icon: Car,
      color: 'green',
      change: parkingData.available_spaces > 0 ? `+${parkingData.available_spaces}` : '0',
      changeType: 'positive'
    },
    {
      title: 'Reserved Spaces',
      value: parkingData.reserved_spaces || 0,
      icon: Clock,
      color: 'orange',
      change: parkingData.reserved_spaces > 0 ? `${parkingData.reserved_spaces} active` : 'None',
      changeType: 'neutral'
    },
    {
      title: 'Occupancy Rate',
      value: `${parkingData.utilization_rate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'blue',
      change: parkingData.utilization_rate > 50 ? 'High' : 'Low',
      changeType: parkingData.utilization_rate > 70 ? 'negative' : 'positive'
    },
    {
      title: 'Total Spaces',
      value: parkingData.total_spaces,
      icon: Activity,
      color: 'gray',
      change: 'Configured',
      changeType: 'neutral'
    }
  ];

  const quickActions = [
    {
      title: 'Live Monitoring',
      description: 'View real-time camera feeds',
      icon: Eye,
      color: 'primary',
      path: '/live-monitoring'
    },
    {
      title: 'Analytics',
      description: 'Detailed reports and insights',
      icon: BarChart3,
      color: 'success',
      path: '/analytics'
    },
    {
      title: 'Settings',
      description: 'Configure system preferences',
      icon: Settings,
      color: 'warning',
      path: '/settings'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchParkingData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time parking system overview from the live feed</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">{lastUpdated.toLocaleTimeString()}</div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1 bg-success-50 rounded-full">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-success-700">Live</span>
          </div>
          <button 
            onClick={fetchParkingData}
            className="flex items-center space-x-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-600">Current parking system status from the live feed</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} delay={index * 0.1} />
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Parking Map Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2"
        >
          <div className="card h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Parking Layout</h2>
                <p className="text-gray-600 mt-1">Interactive map showing current space availability from the live feed</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Available ({parkingData.available_spaces})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-sm text-gray-600">Reserved ({parkingData.reserved_spaces || 0})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Occupied ({parkingData.occupied_spaces})</span>
                </div>
              </div>
            </div>
            <div className="h-full overflow-hidden">
              <ParkingMap parkingData={parkingData} />
            </div>
          </div>
        </motion.div>

        {/* Sidebar Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Recent Activity */}
          <div className="card h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </button>
            </div>
            <div className="h-full overflow-hidden">
              <RecentActivity parkingData={parkingData} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3 rounded-lg border border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 text-left`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${action.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics</h2>
                          <p className="text-gray-600">Real-time occupancy trends from the live feed</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Occupancy</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Live Data</span>
              </div>
            </div>
            <div className="h-64">
              <OccupancyChart parkingData={parkingData} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Space Utilization</h3>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Real-time</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Spaces</span>
                <span className="text-sm font-medium text-success-600">{parkingData.available_spaces}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(parkingData.available_spaces / parkingData.total_spaces) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupied Spaces</span>
                <span className="text-sm font-medium text-danger-600">{parkingData.occupied_spaces}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-danger-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(parkingData.occupied_spaces / parkingData.total_spaces) * 100}%` }}
                ></div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Utilization Rate</span>
                  <span className="text-sm font-bold text-primary-600">{parkingData.utilization_rate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 