import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const OccupancyChart = ({ parkingData }) => {
  const [chartData, setChartData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (parkingData) {
      // Add current data point to chart history
      setChartData(prev => {
        const newData = [...prev, {
          time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          occupancy: parkingData.utilization_rate
        }];
        
        // Keep only last 10 data points
        return newData.slice(-10);
      });
    }
  }, [parkingData, currentTime]);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Occupancy: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value + '%';
          }
        },
        min: 0,
        max: 100,
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
        backgroundColor: '#3b82f6',
        borderColor: 'white',
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  const lineData = {
    labels: chartData.map(d => d.time),
    datasets: [
      {
        label: 'Occupancy Rate',
        data: chartData.map(d => d.occupancy),
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Available', 'Occupied'],
    datasets: [
      {
        data: [
          parkingData?.available_spaces || 0,
          parkingData?.occupied_spaces || 0
        ],
        backgroundColor: [
          '#10b981', // success-500
          '#ef4444'  // danger-500
        ],
        borderColor: [
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2,
      },
    ],
  };

  if (!parkingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-success-50 rounded-lg">
          <div className="text-2xl font-bold text-success-600">
            {parkingData.available_spaces}
          </div>
          <div className="text-xs text-success-700">Available</div>
        </div>
        <div className="p-3 bg-danger-50 rounded-lg">
          <div className="text-2xl font-bold text-danger-600">
            {parkingData.occupied_spaces}
          </div>
          <div className="text-xs text-danger-700">Occupied</div>
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {parkingData.utilization_rate.toFixed(1)}%
          </div>
          <div className="text-xs text-primary-700">Utilization</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        {chartData.length > 1 ? (
          <Line options={lineOptions} data={lineData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900">
                {parkingData.utilization_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Current Occupancy</div>
              <div className="text-xs text-gray-500 mt-1">
                Chart will update as data changes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Doughnut Chart for Space Distribution */}
      <div className="h-32">
        <Doughnut options={doughnutOptions} data={doughnutData} />
      </div>
    </div>
  );
};

export default OccupancyChart; 