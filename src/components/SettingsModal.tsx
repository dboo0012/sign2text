import { useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState({
    cameraResolution: '640x480',
    frameRate: '30',
    poseDetection: true,
    confidenceThreshold: 70,
    autoTranslate: true,
    soundEnabled: true,
    saveHistory: true,
    darkMode: false,
    gestureTimeout: 999,
    smoothingFactor: 5
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Save settings to localStorage or send to backend
    localStorage.setItem('signLanguageSettings', JSON.stringify(settings))
    console.log('Settings saved:', settings)
    onClose()
  }

  const handleReset = () => {
    const defaultSettings = {
      cameraResolution: '640x480',
      frameRate: '30',
      poseDetection: true,
      confidenceThreshold: 70,
      autoTranslate: true,
      soundEnabled: true,
      saveHistory: true,
      darkMode: false,
      gestureTimeout: 999,
      smoothingFactor: 5
    }
    setSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Background Overlay */}
      <div 
        className="absolute inset-0 bg-white/10 backdrop-blur-md"
        onClick={onClose}
        style={{ backdropFilter: 'blur(16px)' }}
      ></div>
      
      {/* Settings Modal */}
      <div className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 outline-2 outline-black flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Camera Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📹</span>
              Camera Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <select
                  value={settings.cameraResolution}
                  onChange={(e) => handleSettingChange('cameraResolution', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="320x240">320x240 (Low)</option>
                  <option value="640x480">640x480 (Medium)</option>
                  <option value="1280x720">1280x720 (HD)</option>
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Rate (FPS)
                </label>
                <select
                  value={settings.frameRate}
                  onChange={(e) => handleSettingChange('frameRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 FPS</option>
                  <option value="24">24 FPS</option>
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recognition Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🧠</span>
              Recognition Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Pose Detection</label>
                  <p className="text-xs text-gray-500">Enable real-time pose estimation</p>
                </div>
                <button
                  onClick={() => handleSettingChange('poseDetection', !settings.poseDetection)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.poseDetection ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.poseDetection ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold: {settings.confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.confidenceThreshold}
                  onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50% (Loose)</span>
                  <span>95% (Strict)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gesture Timeout: {settings.gestureTimeout}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.gestureTimeout}
                  onChange={(e) => handleSettingChange('gestureTimeout', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Smoothing Factor: {settings.smoothingFactor}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.smoothingFactor}
                  onChange={(e) => handleSettingChange('smoothingFactor', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">⚙️</span>
              App Settings
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Translate</label>
                  <p className="text-xs text-gray-500">Automatically translate recognized signs</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoTranslate', !settings.autoTranslate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoTranslate ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoTranslate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sound Enabled</label>
                  <p className="text-xs text-gray-500">Play audio for translations and notifications</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Save History</label>
                  <p className="text-xs text-gray-500">Keep translation history locally</p>
                </div>
                <button
                  onClick={() => handleSettingChange('saveHistory', !settings.saveHistory)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.saveHistory ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.saveHistory ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                  <p className="text-xs text-gray-500">Switch to dark theme</p>
                </div>
                <button
                  onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              Model Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model Version:</span>
                <span className="font-medium">UniSign v2.1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supported Languages:</span>
                <span className="font-medium">5 Languages</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">2024-01-15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model Size:</span>
                <span className="font-medium">45.2 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 z-20">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal 