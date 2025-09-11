import "./App.css";
import AppContent from "./components/AppContent";
import { WebSocketProvider } from "./contexts/websocketContext";

function App() {
  return (
    <WebSocketProvider
      url="ws://localhost:8000/ws/video_stream"
      autoConnect={true}
    >
      <AppContent />
    </WebSocketProvider>
  );
}

export default App;
