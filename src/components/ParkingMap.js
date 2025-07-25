import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReservationModal from './ReservationModal';

const ParkingMap = ({ parkingData }) => {
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedSpaceForReservation, setSelectedSpaceForReservation] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const intervalRef = useRef(null);
  const lastDataRef = useRef(null);

  // Fetch individual parking space data from backend
  const fetchParkingSpaces = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parking-spaces');
      if (response.ok) {
        const data = await response.json();
        
        // Check if data has actually changed to avoid unnecessary re-renders
        const dataString = JSON.stringify(data.spaces);
        if (dataString !== lastDataRef.current) {
          console.log('Parking data updated:', data.spaces?.length, 'spaces');
          console.log('Reserved spaces:', data.spaces?.filter(s => s.is_reserved).length);
          setParkingSpaces(data.spaces || []);
          setLastUpdateTime(Date.now());
          lastDataRef.current = dataString;
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Could not fetch parking spaces from backend, using fallback');
      // Fallback to generated spaces if backend is not available
      generateFallbackSpaces();
    }
  };

  // Fallback function to generate spaces when backend is not available
  const generateFallbackSpaces = () => {
    if (!parkingData || !parkingData.total_spaces) {
      setParkingSpaces([]);
      setIsLoading(false);
      return;
    }
    
    const totalSpaces = parkingData.total_spaces;
    const availableSpaces = parkingData.available_spaces;
    const occupiedSpaces = parkingData.occupied_spaces;
    
    // Calculate grid layout (4 columns, dynamic rows)
    const cols = 4;
    const rows = Math.ceil(totalSpaces / cols);
    
    const spaces = [];
    let availableCount = 0;
    let occupiedCount = 0;
    
    for (let i = 0; i < totalSpaces; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      // Distribute available and occupied spaces
      let status = 'occupied';
      if (availableCount < availableSpaces) {
        status = 'available';
        availableCount++;
      } else if (occupiedCount < occupiedSpaces) {
        status = 'occupied';
        occupiedCount++;
      }
      
      spaces.push({
        id: i + 1,
        status,
        position: { row, col },
        coordinates: {
          x: col * 120,
          y: row * 80,
          width: 100,
          height: 60
        }
      });
    }
    
    setParkingSpaces(spaces);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchParkingSpaces();
    
    // Optimized polling: Start with 1 second, then increase to 3 seconds for stability
    let pollInterval = 1000;
    let pollCount = 0;
    
    const startPolling = () => {
      intervalRef.current = setInterval(() => {
        pollCount++;
        fetchParkingSpaces();
        
        // After 10 quick polls, slow down to reduce server load
        if (pollCount >= 10) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(fetchParkingSpaces, 3000);
        }
      }, pollInterval);
    };
    
    startPolling();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [parkingData]);

  // Optimized status color function with memoization
  const getStatusColor = (status) => {
    if (status === 'available') return 'bg-green-500';
    if (status === 'reserved') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = (status) => {
    if (status === 'available') return 'Available';
    if (status === 'reserved') return 'Reserved';
    return 'Occupied';
  };

  const handleSpaceClick = (space) => {
    setSelectedSpace(space);
  };

  const handleReserveClick = (space) => {
    setSelectedSpaceForReservation(space);
    setShowReservationModal(true);
  };

  const handleReservationSuccess = (reservation) => {
    console.log('Reservation successful:', reservation);
    // Immediate refresh after reservation
    fetchParkingSpaces();
    setSelectedSpace(null);
    // Clear cached data to force update
    lastDataRef.current = null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading parking layout...</p>
        </div>
      </div>
    );
  }

  if (parkingSpaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 text-sm">No parking spaces available</p>
        </div>
      </div>
    );
  }

  // Calculate grid layout based on actual space positions
  const maxX = Math.max(...parkingSpaces.map(space => space.coordinates.x));
  const maxY = Math.max(...parkingSpaces.map(space => space.coordinates.y));
  const cols = Math.ceil((maxX + 120) / 120);
  const rows = Math.ceil((maxY + 80) / 80);

  return (
    <div className="relative">
      {/* Parking Layout - Replicating Live Feed */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Background grid */}
        <div className="absolute inset-0 bg-gray-800 opacity-20"></div>
        
        {/* Parking Spaces */}
        {parkingSpaces.map((space) => (
          <motion.div
            key={`${space.id}-${space.status}-${space.is_reserved}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSpaceClick(space)}
            className={`absolute cursor-pointer transition-all duration-150 ${
              selectedSpace?.id === space.id ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
            }`}
            style={{
              left: `${(space.coordinates.x / (maxX + 120)) * 100}%`,
              top: `${(space.coordinates.y / (maxY + 80)) * 100}%`,
              width: `${(space.coordinates.width / (maxX + 120)) * 100}%`,
              height: `${(space.coordinates.height / (maxY + 80)) * 100}%`,
              minWidth: '40px',
              minHeight: '30px'
            }}
          >
            <div className={`w-full h-full ${getStatusColor(space.status)} rounded border-2 border-white/20 flex items-center justify-center relative`}>
              <span className="text-white font-bold text-xs">{space.id}</span>
              
              {/* Reservation info overlay */}
              {space.is_reserved && space.reservation_info && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  {space.reservation_info.user_name}
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className="absolute -top-1 -right-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(space.status)} border border-white`}></div>
            </div>
          </motion.div>
        ))}
        
        {/* Layout overlay info */}
        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <p className="text-white text-xs font-medium">Live Layout</p>
          <p className="text-white/70 text-xs">Optimized Updates</p>
        </div>
        
        {/* Status overlay */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <p className="text-white text-xs font-medium">
            Free: {parkingData.available_spaces}/{parkingData.total_spaces}
          </p>
          <p className="text-white/70 text-xs">
            {parkingData.utilization_rate.toFixed(1)}% Occupied
          </p>
        </div>
      </div>

      {/* Space Details */}
      {selectedSpace && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white border border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Space #{selectedSpace.id}</h3>
              <p className={`text-sm ${
                selectedSpace.status === 'available' ? 'text-success-600' : 
                selectedSpace.status === 'reserved' ? 'text-warning-600' : 'text-danger-600'
              }`}>
                {getStatusText(selectedSpace.status)}
              </p>
            </div>
            <div className={`w-4 h-4 rounded-full ${getStatusColor(selectedSpace.status)}`}></div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Position:</span>
              <p className="font-medium">X: {selectedSpace.coordinates.x}, Y: {selectedSpace.coordinates.y}</p>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Reservation Actions */}
          {selectedSpace.status === 'available' && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleReserveClick(selectedSpace)}
                className="w-full px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors"
              >
                Reserve This Space
              </button>
            </div>
          )}

          {selectedSpace.status === 'reserved' && selectedSpace.reservation_info && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                <p className="text-sm font-medium text-warning-800">Reserved by: {selectedSpace.reservation_info.user_name}</p>
                <p className="text-xs text-warning-600 mt-1">
                  Duration: {selectedSpace.reservation_info.duration_minutes} minutes
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Available ({parkingData.available_spaces})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Reserved ({parkingData.reserved_spaces || 0})</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Occupied ({parkingData.occupied_spaces})</span>
        </div>
      </div>

      {/* Manual Refresh Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => {
            lastDataRef.current = null;
            fetchParkingSpaces();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Layout</span>
        </button>
      </div>

      {/* Update Status */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Last updated: {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : 'Never'}
        </p>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        spaceId={selectedSpaceForReservation?.id}
        onReserve={handleReservationSuccess}
      />
    </div>
  );
};

export default ParkingMap; 