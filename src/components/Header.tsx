import { Settings, TestTube } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  onToggleTestComponent: () => void;
  onOpenSettings: () => void;
}

const Header = ({
  isConnected,
  onToggleTestComponent,
  onOpenSettings,
}: HeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">👋</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">sign2text</h1>
              <p className="text-sm text-gray-600">
                Real-time WASL Sign Language Recognition
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <span
              className="hover:cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
              onClick={onToggleTestComponent}
              title="WebSocket Test"
            >
              <TestTube />
            </span>
            <span
              className="hover:cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
              onClick={onOpenSettings}
              title="Settings"
            >
              <Settings />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
