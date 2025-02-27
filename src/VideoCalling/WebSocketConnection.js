import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
const WS_URL = "ws://localhost:5000/"; // Replace with your WebSocket server URL

const useWebSocketConnection = (handleIncomingMessage) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log("WebSocket connection established"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (error) => console.error("WebSocket error:", error),
    shouldReconnect: (closeEvent) => true,
  });
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      handleIncomingMessage(data);
    }
  }, [lastMessage, handleIncomingMessage]);

  return { sendMessage };
};

export default useWebSocketConnection;
