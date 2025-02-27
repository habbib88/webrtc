import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const WebRTCContext = createContext();

export const useWebRTC = () => useContext(WebRTCContext);

export const WebRTCProvider = ({ children }) => {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [myPeerId, setMyPeerId] = useState(null);
  const [ROOM_ID, setROOM_ID] = useState(null);
  const socket = useRef(null); // Use useRef for the socket instance
  const peerInstance = useRef(null);

  // Initialize socket and peer connections
  useEffect(() => {
    socket.current = io("http://192.168.1.43:5000/"); // Initialize the socket instance
    peerInstance.current = new Peer(undefined);

    // Get user media and setup listeners
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        // Handle incoming calls
        peerInstance.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userStream) => {
            setPeers((prevPeers) => ({
              ...prevPeers,
              [call.peer]: { stream: userStream, call },
            }));
          });
        });

        // Emit join event with peer ID when peer is open
        peerInstance.current.on("open", (id) => {
          setMyPeerId(id);
          if (ROOM_ID) {
            console.log("Wellcome");

            socket.current.emit("join-room", ROOM_ID, id); // Emit join-room event
          }
        });

        // Listen for new user connections
        socket.current.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });

        // Handle user disconnections
        socket.current.on("user-disconnected", (userId) => {
          if (peers[userId]) {
            peers[userId].call.close();
            setPeers((prevPeers) => {
              const { [userId]: _, ...rest } = prevPeers;
              return rest;
            });
          }
        });
      });

    return () => {
      socket.current?.disconnect();
      peerInstance.current?.destroy();
    };
  }, [ROOM_ID, peers]); // Re-run if ROOM_ID changes or peers update

  const connectToNewUser = (userId, stream) => {
    const call = peerInstance.current.call(userId, stream);
    call.on("stream", (userStream) => {
      setPeers((prevPeers) => ({
        ...prevPeers,
        [userId]: { stream: userStream, call },
      }));
    });
    call.on("close", () => {
      setPeers((prevPeers) => {
        const { [userId]: _, ...rest } = prevPeers;
        return rest;
      });
    });
  };

  return (
    <WebRTCContext.Provider value={{ peers, stream, myPeerId, setROOM_ID }}>
      {children}
    </WebRTCContext.Provider>
  );
};
