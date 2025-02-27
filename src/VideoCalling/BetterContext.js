import React, { createContext, useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import useWebSocket from "react-use-websocket";
import { startScreenSharing, stopScreenSharing } from "../Context/shareScreen";
import useWebSocketConnection from "./WebSocketConnection";
import usePeerConnection from "./PeerConnection";

const SocketContext = createContext();
// Replace with your WebSocket server URL

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [screenStream, setScreenStream] = useState(null);
  const [webCamStream, setWebCamStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    async function initializationOfStream() {
      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          setWebCamStream(currentStream);

          if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
          }
        })
        .catch((err) => {
          console.error("Error accessing media devices:", err);
        });
    }
    initializationOfStream();
  }, []);

  // Handle incoming messages from WebSocket
  function handleIncomingMessage(data) {
    switch (data.type) {
      case "me":
        setMe(data.id);
        break;
      case "callUser":
        setCall({
          isReceivingCall: true,
          from: data.from,
          name: data.name,
          signal: data.signal,
        });
        break;
      case "callAccepted":
        setCallAccepted(true);
        connectionRef.current?.signal(data.signal);
        break;
      default:
        break;
    }
  }

  const { sendMessage, lastMessage, readyState } = useWebSocketConnection(
    handleIncomingMessage
  );

  const { callUser, answerCall, leaveCall } = usePeerConnection({
    stream,
    sendMessage,
    userVideo,
    myVideo,
  });
  // const joinRoom = (id) => {
  //   setRoomId(id);
  //   sendMessage(
  //     JSON.stringify({
  //       type: "joinRoom",
  //       roomId: id,
  //       userId: me,
  //     })
  //   );
  // };
  function shareScreen() {
    startScreenSharing({
      setScreenStream,
      connectionRef,
      myVideo,
      stream,
      webCamStream,
    })
      .then(() => console.log("Wellcome"))
      .catch((error) => console.error("Error sharing screen:", error));

    console.log("sharing screen stopped");
  }

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        // joinRoom,
        roomId,
        setRoomId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
