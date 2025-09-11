import { useState } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import type { Translation } from "../types/translation";

export const useAppState = () => {
  const { isConnected } = useWebSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ms");
  const [currentSign, setCurrentSign] = useState<{
    sign: string;
    confidence: number;
  } | null>(null);
  const [currentTranslation, setCurrentTranslation] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTestComponent, setShowTestComponent] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([
    {
      id: "1",
      originalSign: "Hello",
      translatedText: "Hola",
      timestamp: new Date(Date.now() - 60000),
      confidence: 89,
    },
    {
      id: "2",
      originalSign: "Thank you",
      translatedText: "Gracias",
      timestamp: new Date(Date.now() - 120000),
      confidence: 95,
    },
    {
      id: "3",
      originalSign: "Please",
      translatedText: "Por favor",
      timestamp: new Date(Date.now() - 180000),
      confidence: 87,
    },
  ]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Remove automatic stop - let user control recording manually
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Only set recognition results when user manually stops recording
    setCurrentSign({
      sign: "Hello I Want to tell you something",
      confidence: 89,
    });
    setCurrentTranslation("Hola");
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleToggleTestComponent = () => {
    setShowTestComponent(!showTestComponent);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // const handleAddTranslation = (
  //   sign: string,
  //   translation: string,
  //   confidence: number
  // ) => {
  //   const newTranslation: Translation = {
  //     id: Date.now().toString(),
  //     originalSign: sign,
  //     translatedText: translation,
  //     timestamp: new Date(),
  //     confidence,
  //   };
  //   setTranslations((prev) => [newTranslation, ...prev.slice(0, 9)]); // Keep last 10
  // };

  return {
    state: {
      isConnected,
      isRecording,
      selectedLanguage,
      currentSign,
      currentTranslation,
      isSettingsOpen,
      showTestComponent,
      translations,
    },
    handlers: {
      handleStartRecording,
      handleStopRecording,
      handleLanguageChange,
      handleToggleTestComponent,
      handleOpenSettings,
      handleCloseSettings,
    },
    setters: {
      setTranslations,
    },
  };
};
