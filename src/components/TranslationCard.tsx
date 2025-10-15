import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { translateText } from "../utils/openai/openai";
import { useWebSocketContext } from "../contexts/websocketContext";
import { MODEL_DISPLAY_NAMES, MODELS } from "../types/models";
import ReactCountryFlag from "react-country-flag";

interface TranslationCardProps {
  recognizedText: string; // Text from props (fallback)
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languageNames: { [key: string]: string } = {
  en: "English",
  ms: "Bahasa Malaysia",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ar: "Arabic",
  ja: "Japanese",
  ko: "Korean",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  pt: "Portuguese",
  it: "Italian",
  ru: "Russian",
};

// Language options with country codes for flags
const languages = [
  { code: "ms", name: "Bahasa Malaysia", countryCode: "MY" },
  { code: "en", name: "English", countryCode: "US" },
  { code: "es", name: "Spanish", countryCode: "ES" },
  { code: "fr", name: "French", countryCode: "FR" },
  { code: "de", name: "German", countryCode: "DE" },
  { code: "zh", name: "Chinese", countryCode: "CN" },
  { code: "ar", name: "Arabic", countryCode: "SA" },
  { code: "ja", name: "Japanese", countryCode: "JP" },
  { code: "ko", name: "Korean", countryCode: "KR" },
  { code: "th", name: "Thai", countryCode: "TH" },
  { code: "vi", name: "Vietnamese", countryCode: "VN" },
  { code: "id", name: "Indonesian", countryCode: "ID" },
  { code: "pt", name: "Portuguese", countryCode: "PT" },
  { code: "it", name: "Italian", countryCode: "IT" },
  { code: "ru", name: "Russian", countryCode: "RU" },
];

const TranslationCard = ({
  recognizedText,
  selectedLanguage,
  onLanguageChange,
}: TranslationCardProps) => {
  const { lastMessage } = useWebSocketContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [webSocketText, setWebSocketText] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleTextToSpeech = () => {
    if (!displayText) {
      console.log("TTS Error - No display text detected");
      return;
    }

    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(displayText);

    // Map language codes to proper BCP 47 tags for better compatibility
    const languageMap: { [key: string]: string } = {
      en: "en-US",
      ms: "ms-MY",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      zh: "zh-CN",
      ar: "ar-SA",
      ja: "ja-JP",
      ko: "ko-KR",
      th: "th-TH",
      vi: "vi-VN",
      id: "id-ID",
      pt: "pt-PT",
      it: "it-IT",
      ru: "ru-RU",
    };

    utterance.lang = languageMap[selectedLanguage] || "en-US";
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    // Small delay to ensure cancellation completes
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, 100);
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

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Language:
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <ReactCountryFlag
                  countryCode={
                    languages.find((lang) => lang.code === selectedLanguage)
                      ?.countryCode || "US"
                  }
                  svg
                  style={{
                    width: "1.2em",
                    height: "1.2em",
                  }}
                />
                <span>
                  {languages.find((lang) => lang.code === selectedLanguage)
                    ?.name || "Select Language"}
                </span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 ${
                      selectedLanguage === lang.code
                        ? "bg-blue-50 text-blue-900"
                        : ""
                    }`}
                  >
                    <ReactCountryFlag
                      countryCode={lang.countryCode}
                      svg
                      style={{
                        width: "1.2em",
                        height: "1.2em",
                      }}
                    />
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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

            {/* Model Information */}
            <div className="flex items-center justify-center text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>
                {translationEnabled
                  ? `Model: ${MODEL_DISPLAY_NAMES[MODELS.OPENAI]}`
                  : `Model: ${MODEL_DISPLAY_NAMES[MODELS.SLR]}`}
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
