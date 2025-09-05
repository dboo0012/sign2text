import { useState } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import Header from "./Header";
import MainContent from "./MainContent";
import SettingsModal from "./SettingsModal";
import type { Translation } from "../types/translation";

const AppContent = () => {
  const { isConnected } = useWebSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("es");
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
  };

  const handleStopRecording = () => {
    setIsRecording(false);
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

  // Note: setTranslations available for future use
  // const handleAddTranslation = (sign: string, translation: string, confidence: number) => {
  //   const newTranslation: Translation = {
  //     id: Date.now().toString(),
  //     originalSign: sign,
  //     translatedText: translation,
  //     timestamp: new Date(),
  //     confidence,
  //   };
  //   setTranslations((prev) => [newTranslation, ...prev.slice(0, 9)]);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isConnected={isConnected}
        onToggleTestComponent={handleToggleTestComponent}
        onOpenSettings={handleOpenSettings}
      />

      <MainContent
        showTestComponent={showTestComponent}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        currentSign={currentSign}
        currentTranslation={currentTranslation}
        translations={translations}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </div>
  );
};

export default AppContent;
