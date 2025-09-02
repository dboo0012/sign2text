import { useState } from "react";

interface TranslationCardProps {
  translation: string;
  selectedLanguage: string;
}

const languageNames: { [key: string]: string } = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
};

const TranslationCard = ({
  translation,
  selectedLanguage,
}: TranslationCardProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTextToSpeech = () => {
    if (!translation) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = selectedLanguage === "en" ? "en" : selectedLanguage;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const handleCopyToClipboard = async () => {
    if (!translation) return;

    try {
      await navigator.clipboard.writeText(translation);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleShare = async () => {
    if (!translation) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sign Language Translation",
          text: `Translated: "${translation}"`,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopyToClipboard();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Translation</h3>

        {translation ? (
          <div className="space-y-4">
            {/* Translation Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  "{translation}"
                </div>
                <div className="text-sm text-blue-600">
                  in {languageNames[selectedLanguage] || selectedLanguage}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* Text to Speech */}
              <button
                onClick={handleTextToSpeech}
                disabled={isSpeaking}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-colors ${
                  isSpeaking
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{isSpeaking ? "🔊" : "🔊"}</span>
                <span className="text-xs font-medium">
                  {isSpeaking ? "Speaking..." : "Speak"}
                </span>
              </button>

              {/* Copy to Clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-colors ${
                  copySuccess
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{copySuccess ? "✅" : "📋"}</span>
                <span className="text-xs font-medium">
                  {copySuccess ? "Copied!" : "Copy"}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Translation Quality */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>Translation quality: High</span>
              <span>Source: Google Translate API</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌐</div>
            <div className="text-gray-500">
              <p className="font-medium">No translation yet</p>
              <p className="text-sm">Perform a sign to see translation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;
