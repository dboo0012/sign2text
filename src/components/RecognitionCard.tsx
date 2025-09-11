import { useEffect, useState } from "react";
import { useWebSocketContext } from "../contexts/websocketContext";

interface RecognitionCardProps {
  currentSign: { sign: string; confidence: number } | null;
  isRecording: boolean;
  onWebSocketTranslation?: (translation: string, confidence: number) => void;
}

const RecognitionCard = ({
  currentSign,
  isRecording,
  onWebSocketTranslation,
}: RecognitionCardProps) => {
  const { lastMessage } = useWebSocketContext();
  const [webSocketSign, setWebSocketSign] = useState<{
    sign: string;
    confidence: number;
  } | null>(null);

  // Handle WebSocket messages directly in RecognitionCard
  useEffect(() => {
    if (lastMessage) {
      const messageData = lastMessage as any;
      if (
        messageData.type === "success" &&
        messageData.processed_data?.prediction?.text
      ) {
        const translation = messageData.processed_data.prediction.text;
        const confidence =
          messageData.processed_data.prediction.confidence || 0;

        // Update local state for WebSocket results
        setWebSocketSign({
          sign: translation,
          confidence: confidence * 100,
        });

        // Also notify parent component
        onWebSocketTranslation?.(translation, confidence);
      }
    }
  }, [lastMessage]); // Remove onWebSocketTranslation from dependencies

  // Use WebSocket sign if available, otherwise use the passed currentSign
  const displaySign = webSocketSign || currentSign;
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
                  {displaySign.confidence}%
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

// interface RecognitionCardProps {
//   currentSign: { sign: string; confidence: number } | null
//   isRecording: boolean
// }

// const RecognitionCard = ({
//   currentSign,
//   isRecording
// }: RecognitionCardProps) => {
//   const getConfidenceColor = (confidence: number) => {
//     if (confidence >= 90) return 'text-green-600 bg-green-100'
//     if (confidence >= 70) return 'text-yellow-600 bg-yellow-100'
//     return 'text-red-600 bg-red-100'
//   }

//   const getConfidenceBarColor = (confidence: number) => {
//     if (confidence >= 90) return 'bg-green-500'
//     if (confidence >= 70) return 'bg-yellow-500'
//     return 'bg-red-500'
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//       <div className="space-y-4">
//         <h3 className="text-lg font-semibold text-gray-900">Recognition</h3>

//         {isRecording && (
//           <div className="flex items-center space-x-3">
//             <div className="flex space-x-1">
//               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//               <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//             </div>
//             <span className="text-sm text-blue-600 font-medium">Analyzing gesture...</span>
//           </div>
//         )}

//         {currentSign ? (
//           <div className="space-y-3">
//             {/* Recognized Sign */}
//             <div className="text-center">
//               <div className="text-3xl font-bold text-gray-900 mb-2">
//                 "{currentSign.sign}"
//               </div>
//               <div className="text-sm text-gray-600">Recognized Sign</div>
//             </div>

//             {/* Confidence Score */}
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-gray-700">Confidence</span>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(currentSign.confidence)}`}>
//                   {currentSign.confidence}%
//                 </span>
//               </div>

//               {/* Confidence Bar */}
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className={`h-2 rounded-full transition-all duration-300 ${getConfidenceBarColor(currentSign.confidence)}`}
//                   style={{ width: `${currentSign.confidence}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* Confidence Description */}
//             <div className="text-xs text-gray-500 text-center">
//               {currentSign.confidence >= 90 && "Excellent recognition quality"}
//               {currentSign.confidence >= 70 && currentSign.confidence < 90 && "Good recognition quality"}
//               {currentSign.confidence < 70 && "Low confidence - try adjusting position"}
//             </div>
//           </div>
//         ) : !isRecording ? (
//           <div className="text-center py-8">
//             <div className="text-4xl mb-3">👋</div>
//             <div className="text-gray-500">
//               <p className="font-medium">Ready to recognize</p>
//               <p className="text-sm">Start recording to see sign recognition</p>
//             </div>
//           </div>
//         ) : null}

//         {/* Processing Info */}
//         {(currentSign || isRecording) && (
//           <div className="pt-3 border-t border-gray-100">
//             <div className="flex items-center justify-between text-xs text-gray-500">
//               <span>Processing:</span>
//               <span>{isRecording ? 'Real-time' : 'Complete'}</span>
//             </div>
//             <div className="flex items-center justify-between text-xs text-gray-500">
//               <span>Model:</span>
//               <span>UniSign v2.1</span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default RecognitionCard
