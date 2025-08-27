import { useState } from 'react'
import './App.css'
import VideoFeed from './components/VideoFeed'
import StatusCard from './components/StatusCard'
import RecognitionCard from './components/RecognitionCard'
import TranslationCard from './components/TranslationCard'
import HistoryCard from './components/HistoryCard'
import SettingsModal from './components/SettingsModal'
import WebSocketTestComponent from './components/WebSocketTestComponent'
import { WebSocketProvider } from './contexts/websocketContext'
import { Settings, TestTube } from 'lucide-react'

interface Translation {
  id: string
  originalSign: string
  translatedText: string
  timestamp: Date
  confidence: number
}

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [currentSign, setCurrentSign] = useState<{ sign: string; confidence: number } | null>(null)
  const [currentTranslation, setCurrentTranslation] = useState<string>('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTestComponent, setShowTestComponent] = useState(false)
  const [translations, setTranslations] = useState<Translation[]>([
    {
      id: '1',
      originalSign: 'Hello',
      translatedText: 'Hola',
      timestamp: new Date(Date.now() - 60000),
      confidence: 89
    },
    {
      id: '2',
      originalSign: 'Thank you',
      translatedText: 'Gracias',
      timestamp: new Date(Date.now() - 120000),
      confidence: 95
    },
    {
      id: '3',
      originalSign: 'Please',
      translatedText: 'Por favor',
      timestamp: new Date(Date.now() - 180000),
      confidence: 87
    }
  ])

  const handleStartRecording = () => {
    setIsRecording(true)
    // Simulate recognition after 2 seconds
    setTimeout(() => {
      setCurrentSign({ sign: 'Hello I Want to tell you something', confidence: 89 })
      setCurrentTranslation('Hola')
      setIsRecording(false)
    }, 2000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
  }

  const handleAddTranslation = (sign: string, translation: string, confidence: number) => {
    const newTranslation: Translation = {
      id: Date.now().toString(),
      originalSign: sign,
      translatedText: translation,
      timestamp: new Date(),
      confidence
    }
    setTranslations(prev => [newTranslation, ...prev.slice(0, 9)]) // Keep last 10
  }

  return (
    <WebSocketProvider url="ws://localhost:8000/ws/video_stream" autoConnect={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👋</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">sign2text</h1>
                  <p className="text-sm text-gray-600">Real-time WASL Sign Language Recognition</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <span 
                  className='hover:cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors' 
                  onClick={() => setShowTestComponent(!showTestComponent)}
                  title="WebSocket Test"
                >
                  <TestTube />
                </span>
                <span 
                  className='hover:cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors' 
                  onClick={() => setIsSettingsOpen(true)}
                  title="Settings"
                >
                  <Settings />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional rendering based on test mode */}
        {showTestComponent ? (
          <WebSocketTestComponent />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ height: 'calc(100vh - 80px)' }}>
            {/* Left Panel - Video Section */}
            <div className="bg-white border-r border-gray-200 flex flex-col">
              <div className="flex-1 p-6">
                <VideoFeed
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
              </div>
            </div>

            {/* Right Panel - Information Section */}
            <div className="bg-gray-50 p-6 space-y-6 overflow-y-auto">
              <StatusCard
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
              
              <RecognitionCard
                currentSign={currentSign}
                isRecording={isRecording}
              />
              
              <TranslationCard
                translation={currentTranslation}
                selectedLanguage={selectedLanguage}
              />
              
              <HistoryCard translations={translations} />
            </div>
          </div>
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </WebSocketProvider>
  )
}

export default App
