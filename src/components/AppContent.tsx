import { useState } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import Header from "./Header";
import MainContent from "./MainContent";
import SettingsModal from "./SettingsModal";

const AppContent = () => {
  const { isConnected } = useWebSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ms");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTestComponent, setShowTestComponent] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
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
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </div>
  );
};

export default AppContent;
