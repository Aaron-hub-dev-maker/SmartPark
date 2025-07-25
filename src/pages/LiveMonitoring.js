import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Wifi,
  Signal,
  Battery,
  RefreshCw
} from 'lucide-react';

const LiveMonitoring = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [parkingStatus, setParkingStatus] = useState({
    total_spaces: 0,
    available_spaces: 0,
    occupied_spaces: 0,
    utilization_rate: 0
  });
  const videoRef = useRef(null);
  const frameIntervalRef = useRef(null);

  // Fetch parking status from backend
  const fetchParkingStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parking-status');
      if (response.ok) {
        const data = await response.json();
        setParkingStatus(data);
        setIsConnected(true);
      }
    } catch (error) {
      console.log('Backend not connected, using fallback data');
      setIsConnected(false);
    }
  };

  // Fetch video frame from backend
  const fetchVideoFrame = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/video-frame');
      if (response.ok) {
        const data = await response.json();
        if (data.frame) {
          setCurrentFrame(`data:image/jpeg;base64,${data.frame}`);
        }
      }
    } catch (error) {
      console.log('Could not fetch video frame from backend');
    }
  };

  useEffect(() => {
    // Update current time
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Fetch parking status every 2 seconds
    const statusTimer = setInterval(fetchParkingStatus, 2000);

    // Fetch video frames every 100ms (10 FPS)
    frameIntervalRef.current = setInterval(fetchVideoFrame, 100);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time parking detection system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="text-sm font-medium text-gray-900">{currentTime}</div>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isConnected ? 'bg-success-50' : 'bg-warning-50'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isConnected ? 'bg-success-500' : 'bg-warning-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              isConnected ? 'text-success-700' : 'text-warning-700'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Live Detection Feed</h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg">
                  <Wifi className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-gray-600">Connected</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg">
                  <Signal className="w-4 h-4 text-success-600" />
                  <span className="text-sm text-gray-600">Good</span>
                </div>
              </div>
            </div>
            
            {/* Video Container */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              {currentFrame ? (
                <img
                  ref={videoRef}
                  src={currentFrame}
                  alt="Live Detection Feed"
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">Connecting to Backend...</p>
                    <p className="text-sm text-gray-400 mt-1">Starting OpenCV processing</p>
                  </div>
                </div>
              )}
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
              
              {/* Video Info Overlay */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">Live Detection</p>
                <p className="text-white/80 text-xs">OpenCV Processing Active</p>
              </div>
              
              {/* Parking Status Overlay */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">
                  Free: {parkingStatus.available_spaces}/{parkingStatus.total_spaces}
                </p>
                <p className="text-white/80 text-xs">
                  {parkingStatus.utilization_rate.toFixed(1)}% Occupied
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detection Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Connection Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backend Status</span>
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Video Feed</span>
                <span className={`text-sm font-medium ${
                  currentFrame ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {currentFrame ? 'Active' : 'Connecting...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm font-medium text-gray-900">{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Parking Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parking Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Spaces</span>
                <span className="text-sm font-medium text-gray-900">{parkingStatus.total_spaces}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="text-sm font-medium text-success-600">{parkingStatus.available_spaces}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="text-sm font-medium text-danger-600">{parkingStatus.occupied_spaces}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Utilization Rate</span>
                  <span className="text-sm font-bold text-primary-600">
                    {parkingStatus.utilization_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="text-sm font-medium text-success-600">OpenCV</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Frame Rate</span>
                <span className="text-sm font-medium text-gray-900">10 FPS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Detection</span>
                <span className="text-sm font-medium text-success-600">Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveMonitoring; 