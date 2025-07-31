
interface StatusCardProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
}

// mock languages
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
]

const StatusCard = ({
  selectedLanguage,
  onLanguageChange
}: StatusCardProps) => {
  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[1]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Language Settings</h3>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Target Language
          </label>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Current Selection Display */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Currently translating to:</span>
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
              <span>{selectedLang.flag}</span>
              <span className="font-medium">{selectedLang.name}</span>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Server: ws://localhost:8000</div>
            <div>Model: UniSign v2.1</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusCard 