import { useWebSocketContext } from "../contexts/websocketContext";

interface RecognitionCardProps {
  isRecording: boolean;
}

const RecognitionCard = ({ isRecording }: RecognitionCardProps) => {
  const { lastPrediction } = useWebSocketContext();

  // Extract sign and confidence from the WebSocket prediction
  const displaySign = lastPrediction
    ? {
        sign: lastPrediction.processed_data.prediction.text,
        confidence: lastPrediction.processed_data.prediction.confidence * 100,
      }
    : null;
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceBarColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recognition</h3>

        {isRecording && (
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <span className="text-sm text-blue-600 font-medium">
              Analyzing gesture...
            </span>
          </div>
        )}

        {displaySign ? (
          <div className="space-y-3">
            {/* Recognized Sign */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                "{displaySign.sign}"
              </div>
              <div className="text-sm text-gray-600">Recognized Sign</div>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Confidence
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                    displaySign.confidence
                  )}`}
                >
                  {Math.round(displaySign.confidence)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getConfidenceBarColor(
                    displaySign.confidence
                  )}`}
                  style={{ width: `${displaySign.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : !isRecording ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👋</div>
            <div className="text-gray-500">
              <p className="font-medium">Ready to recognize</p>
              <p className="text-sm">Start recording to see sign recognition</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecognitionCard;
