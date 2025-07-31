interface Translation {
  id: string
  originalSign: string
  translatedText: string
  timestamp: Date
  confidence: number
}

interface HistoryCardProps {
  translations: Translation[]
}

const HistoryCard = ({ translations }: HistoryCardProps) => {
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const clearHistory = () => {
    // This would be handled by parent component
    console.log('Clear history clicked')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">History</h3>
          {translations.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Translation List */}
        {translations.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {translations.map((translation) => (
              <div
                key={translation.id}
                className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {translation.originalSign} → {translation.translatedText}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadge(translation.confidence)}`}>
                    {translation.confidence}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTimestamp(translation.timestamp)}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(translation.translatedText)}
                      className="hover:text-blue-600 transition-colors"
                      title="Copy translation"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(translation.translatedText)
                        speechSynthesis.speak(utterance)
                      }}
                      className="hover:text-blue-600 transition-colors"
                      title="Speak translation"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <div className="text-gray-500">
              <p className="font-medium">No history yet</p>
              <p className="text-sm">Your translations will appear here</p>
            </div>
          </div>
        )}

        {/* Statistics */}
        {translations.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{translations.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(translations.reduce((acc, t) => acc + t.confidence, 0) / translations.length)}%
                </div>
                <div className="text-xs text-gray-500">Avg Confidence</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {translations.filter(t => t.confidence >= 90).length}
                </div>
                <div className="text-xs text-gray-500">High Quality</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryCard 