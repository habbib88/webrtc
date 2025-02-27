/*
import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import useWebSocket from "react-use-websocket";
const SocketContext = createContext();

const socket = io("http://192.168.1.43:5000/"); // Adjust this URL as needed
const WS_URL = "ws://192.168.1.43:5000"; // Replace with your WebSocket server URL
const ContextProvider = ({ children }) => {
  const { sendMessage, lastMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log("WebSocket connection established"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (e) => console.error("WebSocket error", e),
    shouldReconnect: (closeEvent) => true, // Auto-reconnect on errors
  });

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true }) // Ensure video is included
      .then((currentStream) => {
        console.log("Stream obtained:", currentStream);
        setStream(currentStream);

        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });

    socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);
  // Update local video stream when available
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
*/
import React, { createContext, useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import useWebSocket from "react-use-websocket";
import { startScreenSharing, stopScreenSharing } from "./shareScreen";
const SocketContext = createContext();

const WS_URL = "ws://localhost:5000/"; // Replace with your WebSocket server URL

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [screenStream, setScreenStream] = useState(null);
  const [webCamStream, setWebCamStream] = useState(null);

  //  Join room functionality
  const [isRoom, setIsRoom] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // WebSocket initialization
  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => console.log("WebSocket connection established"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (error) => console.error("WebSocket error:", error),
    shouldReconnect: (closeEvent) => true, // Auto-reconnect on errors
  });

  const ShareScreen = () => {
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
  };
  const ShareScreenStop = async () => {
    stopScreenSharing(
      screenStream,
      setScreenStream,
      webCamStream, // Ensure this is your initial webcam stream
      connectionRef,
      myVideo
    );
  };

  useEffect(() => {
    async function initializationOfStream() {
      // Obtain media stream (audio and video)
      await navigator?.mediaDevices
        ?.getUserMedia({ video: true, audio: true }) // Ensure video is included
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
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);

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
        //join room
        case "newParticipant":
          console.log("Participant", lastMessage);

          if (data.roomId === roomId && data.userId !== me) {
            setParticipants((prev) => [...prev, data.userId]);
            callUser(data.userId, me, "RoomParticipant");
          }
          break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  // Update local video stream when available
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (data) => {
      sendMessage(
        JSON.stringify({
          type: "answerCall",
          signal: data,
          to: call.from,
        })
      );
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
      // Optionally set a state to notify the user
      setCallEnded(true);
    });
    peer.on("signal", (data) => {
      sendMessage(
        JSON.stringify({
          type: "callUser",
          userToCall: id,
          signalData: data,
          from: me,
          name,
        })
      );
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current = null;
  };

  // Join Room
  const joinRoom = (id) => {
    setRoomId(id);
    sendMessage(
      JSON.stringify({
        type: "joinRoom",
        roomId: id,
        userId: me,
      })
    );
  };

  const handleLeaveRoom = () => {
    if (roomId) {
      sendMessage(
        JSON.stringify({
          type: "leaveRoom",
          roomId: roomId,
          userId: me,
        })
      );
    }
    setParticipants([]);
    setRoomId(null);
  };
  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !track.enabled));
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !track.enabled));
    }
  };
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
        ShareScreen,
        ShareScreenStop,
        // for join room
        joinRoom,
        handleLeaveRoom,
        roomId,
        participants,
        isRoom,
        setIsRoom,
        toggleMic,
        toggleCamera,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
//*
