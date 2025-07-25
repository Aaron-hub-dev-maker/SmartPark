import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Camera, 
  Bell, 
  Database,
  Monitor
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    detection: {
      sensitivity: 75,
      fps: 30,
      enableNotifications: true,
      autoSave: true
    },
    camera: {
      resolution: '1080p',
      quality: 'high',
      enableRecording: true,
      storageLimit: 50
    },
    system: {
      autoRestart: false,
      backupFrequency: 'daily',
      logLevel: 'info',
      maintenanceMode: false
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      sound: true
    }
  });

  const [activeTab, setActiveTab] = useState('detection');

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic
    console.log('Settings saved:', settings);
  };

  const tabs = [
    { id: 'detection', label: 'Detection', icon: Monitor },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'system', label: 'System', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderDetectionSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detection Sensitivity
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.detection.sensitivity}
            onChange={(e) => handleSettingChange('detection', 'sensitivity', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium text-gray-900 w-12">
            {settings.detection.sensitivity}%
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FPS (Frames Per Second)
        </label>
        <select
          value={settings.detection.fps}
          onChange={(e) => handleSettingChange('detection', 'fps', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={15}>15 FPS</option>
          <option value={30}>30 FPS</option>
          <option value={60}>60 FPS</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
            <p className="text-sm text-gray-500">Receive alerts for parking events</p>
          </div>
          <button
            onClick={() => handleSettingChange('detection', 'enableNotifications', !settings.detection.enableNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.detection.enableNotifications ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.detection.enableNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto Save</label>
            <p className="text-sm text-gray-500">Automatically save detection data</p>
          </div>
          <button
            onClick={() => handleSettingChange('detection', 'autoSave', !settings.detection.autoSave)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.detection.autoSave ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.detection.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCameraSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resolution
        </label>
        <select
          value={settings.camera.resolution}
          onChange={(e) => handleSettingChange('camera', 'resolution', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4k">4K</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality
        </label>
        <select
          value={settings.camera.quality}
          onChange={(e) => handleSettingChange('camera', 'quality', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Enable Recording</label>
            <p className="text-sm text-gray-500">Record video feeds for analysis</p>
          </div>
          <button
            onClick={() => handleSettingChange('camera', 'enableRecording', !settings.camera.enableRecording)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.camera.enableRecording ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.camera.enableRecording ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Storage Limit (GB)
        </label>
        <input
          type="number"
          value={settings.camera.storageLimit}
          onChange={(e) => handleSettingChange('camera', 'storageLimit', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto Restart</label>
            <p className="text-sm text-gray-500">Automatically restart system daily</p>
          </div>
          <button
            onClick={() => handleSettingChange('system', 'autoRestart', !settings.system.autoRestart)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.system.autoRestart ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.system.autoRestart ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
            <p className="text-sm text-gray-500">Pause system for maintenance</p>
          </div>
          <button
            onClick={() => handleSettingChange('system', 'maintenanceMode', !settings.system.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.system.maintenanceMode ? 'bg-warning-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.system.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Backup Frequency
        </label>
        <select
          value={settings.system.backupFrequency}
          onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Log Level
        </label>
        <select
          value={settings.system.logLevel}
          onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
            <p className="text-sm text-gray-500">Receive alerts via email</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.email ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
            <p className="text-sm text-gray-500">Receive alerts via SMS</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'sms', !settings.notifications.sms)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.sms ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
            <p className="text-sm text-gray-500">Receive alerts via push notifications</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.push ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
            <p className="text-sm text-gray-500">Play sound for notifications</p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', 'sound', !settings.notifications.sound)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.sound ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.sound ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'detection':
        return renderDetectionSettings();
      case 'camera':
        return renderCameraSettings();
      case 'system':
        return renderSystemSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderDetectionSettings();
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure system preferences and options</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="card">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 