import "./App.css";
import AppContent from "./components/AppContent";
import { WebSocketProvider } from "./contexts/websocketContext";
import { WS_VIDEO_STREAM_URL } from "./constants/environment";

function App() {
  return (
    <WebSocketProvider url={WS_VIDEO_STREAM_URL} autoConnect={true}>
      <AppContent />
    </WebSocketProvider>
  );
}

export default App;
