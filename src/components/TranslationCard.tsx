import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { translateText } from "../utils/openai/openai";
import { useWebSocketContext } from "../contexts/websocketContext";

interface TranslationCardProps {
  recognizedText: string; // Text from props (fallback)
  selectedLanguage: string;
}

const languageNames: { [key: string]: string } = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ms: "Malay",
  ar: "Arabic",
};

const TranslationCard = ({
  recognizedText,
  selectedLanguage,
}: TranslationCardProps) => {
  const { lastMessage } = useWebSocketContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [webSocketText, setWebSocketText] = useState<string>("");

  // Track last translated text to avoid redundant API calls
  const lastTranslatedRef = useRef<{
    text: string;
    language: string;
    result: string;
  }>({
    text: "",
    language: "",
    result: "",
  });

  // Listen to WebSocket messages for recognition results
  useEffect(() => {
    if (lastMessage) {
      const messageData = lastMessage as any;
      if (
        messageData.type === "success" &&
        messageData.processed_data?.prediction?.text
      ) {
        const translation = messageData.processed_data.prediction.text;
        setWebSocketText(translation);
      }
    }
  }, [lastMessage]);

  // Use WebSocket text if available, otherwise use prop text
  const currentRecognizedText = webSocketText || recognizedText;

  // Memoize the display text to prevent unnecessary re-renders
  const displayText = useMemo(() => {
    const textToUse = currentRecognizedText;
    if (!textToUse) return "";

    if (!translationEnabled || selectedLanguage === "en") {
      return textToUse;
    }

    return translatedText || textToUse;
  }, [
    currentRecognizedText,
    translationEnabled,
    selectedLanguage,
    translatedText,
  ]);

  // Optimized translation function with caching
  const performTranslation = useCallback(
    async (text: string, targetLang: string) => {
      // Check if we already have this translation cached
      if (
        lastTranslatedRef.current.text === text &&
        lastTranslatedRef.current.language === targetLang &&
        lastTranslatedRef.current.result
      ) {
        setTranslatedText(lastTranslatedRef.current.result);
        return;
      }

      setIsTranslating(true);
      try {
        const result = await translateText(
          text,
          languageNames[targetLang] || targetLang
        );

        // Cache the result
        lastTranslatedRef.current = {
          text,
          language: targetLang,
          result,
        };

        setTranslatedText(result);
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  // Only trigger translation when necessary conditions are met
  useEffect(() => {
    const textToTranslate = currentRecognizedText;
    if (!translationEnabled || !textToTranslate || selectedLanguage === "en") {
      // Reset translation state when not needed
      if (translatedText) {
        setTranslatedText("");
      }
      if (isTranslating) {
        setIsTranslating(false);
      }
      return;
    }

    // Debounce translation requests to avoid rapid API calls
    const timeoutId = setTimeout(() => {
      performTranslation(textToTranslate, selectedLanguage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [
    translationEnabled,
    currentRecognizedText,
    selectedLanguage,
    performTranslation,
  ]);

  // Clear cache when translation is disabled
  useEffect(() => {
    if (!translationEnabled) {
      lastTranslatedRef.current = { text: "", language: "", result: "" };
    }
  }, [translationEnabled]);

  const handleTextToSpeech = () => {
    if (!displayText) return;

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(displayText);
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
    if (!displayText) return;

    try {
      await navigator.clipboard.writeText(displayText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleShare = async () => {
    if (!displayText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sign Language Translation",
          text: `Translated: "${displayText}"`,
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Translation</h3>

          {/* Translation Toggle */}
          <button
            onClick={() => setTranslationEnabled(!translationEnabled)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              translationEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {translationEnabled ? "Translation On" : "Translation Off"}
          </button>
        </div>

        {currentRecognizedText ? (
          <div className="space-y-4">
            {/* Translation Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                {isTranslating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600">Translating...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-900 mb-2">
                      "{displayText}"
                    </div>
                    <div className="text-sm text-blue-600">
                      {translationEnabled
                        ? `Translated to ${
                            languageNames[selectedLanguage] || selectedLanguage
                          }`
                        : "Original Recognition"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* Text to Speech */}
              <button
                onClick={handleTextToSpeech}
                disabled={isSpeaking || isTranslating || !displayText}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-colors ${
                  isSpeaking
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isTranslating || !displayText}
                className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-colors ${
                  copySuccess
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isTranslating || !displayText}
                className="flex flex-col items-center space-y-1 p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-xl">💬</span>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>

            {/* Translation Quality */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>
                {translationEnabled
                  ? "Translation quality: High"
                  : "Direct recognition"}
              </span>
              <span>
                {translationEnabled ? "Source: OpenAI API" : "WebSocket Server"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌐</div>
            <div className="text-gray-500">
              <p className="font-medium">No recognition yet</p>
              <p className="text-sm">
                Use demo tester or record a sign to see results
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;
