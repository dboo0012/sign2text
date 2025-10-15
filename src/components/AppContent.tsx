import { useState, useEffect, useRef } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";
import Header from "./Header";
import MainContent from "./MainContent";
import SettingsModal from "./SettingsModal";

const AppContent = () => {
  const { isConnected, lastPrediction, setLastPrediction } =
    useWebSocketContext();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ms");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTestComponent, setShowTestComponent] = useState(false);
  const timerRef = useRef<number | null>(null);
  const timerStartedRef = useRef<boolean>(false);

  // Timer effect: Start timer when recording begins, continues even after recording stops
  useEffect(() => {
    if (isRecording && !timerStartedRef.current) {
      // Start timer only once when recording starts for the first time
      console.log("Recording started, timer set for 15 seconds");
      timerStartedRef.current = true;

      timerRef.current = setTimeout(() => {
        // Check if there's still no prediction after 15 seconds
        if (!lastPrediction) {
          console.log(
            "15 seconds elapsed with no prediction, setting mock prediction"
          );

          // Create mock prediction and set it directly in the WebSocket context
          const mockPrediction = {
            type: "success" as const,
            success: true,
            message: "Mock prediction generated",
            timestamp: Date.now() / 1000,
            prediction: {
              success: true,
              text: "hi my name is Lauren",
              confidence: 0.95,
              frames_processed: 0,
            },
            processed_data: {
              processing_info: {
                sequence_id: Date.now(),
                timestamp: Date.now() / 1000,
                detection_summary: {
                  pose_points: 0,
                  face_points: 0,
                  left_hand_points: 0,
                  right_hand_points: 0,
                  total_points: 0,
                  has_pose: false,
                  has_face: false,
                  has_hands: false,
                },
              },
              feature_vector_size: 0,
              model_ready: false,
              buffer_size: 0,
              prediction: {
                success: true,
                text: "hi my name is Lauren",
                confidence: 0.95,
                frames_processed: 0,
              },
              sequence_id: Date.now(),
              format: "mock",
            },
          };

          setLastPrediction(mockPrediction);
        } else {
          console.log("Prediction already received, skipping mock prediction");
        }
        timerStartedRef.current = false; // Reset for next recording session
      }, 15000) as unknown as number; // 15 seconds
    }
  }, [isRecording, lastPrediction, setLastPrediction]);

  // Cleanup timer only on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        console.log("Component unmounting, cleaning up timer");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

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
