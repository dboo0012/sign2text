import VideoFeed from "./VideoFeed";
// import StatusCard from "./StatusCard";
import RecognitionCard from "./RecognitionCard";
import TranslationCard from "./TranslationCard";
// import HistoryCard from "./HistoryCard";
import WebSocketTestComponent from "./WebSocketTestComponent";
import DemoKeypointTester from "./DemoKeypointTester";
import { useWebSocketContext } from "../contexts/websocketContext";

interface MainContentProps {
  showTestComponent: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const MainContent = ({
  showTestComponent,
  isRecording,
  onStartRecording,
  onStopRecording,
  selectedLanguage,
  onLanguageChange,
}: MainContentProps) => {
  const { lastPrediction } = useWebSocketContext();

  // Get the recognized text from WebSocket prediction
  const recognizedText = lastPrediction?.processed_data.prediction.text || "";

  if (showTestComponent) {
    return <WebSocketTestComponent />;
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* Left Panel - Video Section */}
      <div className="bg-white border-r border-gray-200 flex flex-col">
        <div className="flex-1 p-6">
          <VideoFeed
            isRecording={isRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
          />
        </div>
      </div>

      {/* Right Panel - Information Section */}
      <div className="bg-gray-50 p-6 space-y-6 overflow-y-auto">
        <RecognitionCard isRecording={isRecording} />

        <TranslationCard
          recognizedText={recognizedText}
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
        />

        <DemoKeypointTester />

        {/* <HistoryCard translations={translations} /> */}
      </div>
    </div>
  );
};

export default MainContent;
