// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";
// import styled from "styled-components";
// import { useParams } from "react-router-dom";

// const Container = styled.div`
//     padding: 20px;
//     display: flex;
//     height: 100vh;
//     width: 90%;
//     margin: auto;
//     flex-wrap: wrap;
// `;

// const StyledVideo = styled.video`
//     height: 40%;
//     width: 50%;
// `;

// const Video = ({ peer }) => {
//   const ref = useRef();

//   useEffect(() => {
//     peer.on("stream", stream => {
//       ref.current.srcObject = stream;
//     })
//     return () => {
//       peer.removeAllListeners("stream");
//     };
//   }, [peer]);

//   return (
//     <>

//       <StyledVideo playsInline autoPlay ref={ref} />
//     </>
//   );
// }


// const videoConstraints = {
//   height: window.innerHeight / 2,
//   width: window.innerWidth / 2
// };
// const socket = io("http://localhost:5000/");

// const Room = (props) => {
//   const [peers, setPeers] = useState([]);
//   const userVideo = useRef();
//   const socketRef = useRef();
//   const peersRef = useRef([]);
//   const params = useParams()
//   const roomID = params.id;
//   console.log(peers)

//   useEffect(() => {
//     // socket = io("http://192.168.1.43:5000/");;
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
//       userVideo.current.srcObject = stream;
//       socket.emit("join room", roomID);
//       socket.on("all users", users => {
//         const peers = [];
//         users.forEach(userID => {
//           const peer = createPeer(userID, socket.id, stream);
//           peersRef.current.push({
//             peerID: userID,
//             peer,
//           })
//           peers.push(peer);
//         })
//         setPeers(peers);
//       })

//       socket.on("user joined", payload => {
//         const peer = addPeer(payload.signal, payload.callerID, stream);
//         peersRef.current.push({
//           peerID: payload.callerID,
//           peer,
//         })

//         setPeers(users => [...users, peer]);
//       });
//       socket.on("user disconnected", (userID) => {
//         const peerObj = peersRef.current.find((p) => p.peerID === userID);
//         if (peerObj) {
//           peerObj.peer.destroy(); // Destroy the peer connection
//         }
//         peersRef.current = peersRef.current.filter((p) => p.peerID !== userID);
//         setPeers((users) => users.filter((p) => p !== peerObj.peer));
//       });
//       socket.on("receiving returned signal", payload => {
//         const item = peersRef.current.find(p => p.peerID === payload.id);
//         item.peer.signal(payload.signal);
//       });
//       // Clean up on component unmount
//       return () => {
//         peersRef.current.forEach(({ peer }) => peer.destroy());
//         socket.disconnect();
//       };
//     })
//   }, []);

//   function createPeer(userToSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//     });

//     peer.on("signal", signal => {
//       socket.emit("sending signal", { userToSignal, callerID, signal })
//     })
//     peer.on("error", (err) => console.error("Peer error:", err));

//     peer.on("close", () => {
//       console.log("Peer closed:", callerID);
//       // Clean up peer from state and refs
//       peersRef.current = peersRef.current.filter((p) => p.peerID !== callerID);
//       setPeers((existingPeers) => existingPeers.filter((p) => p !== peer));
//       peer.destroy();
//       // If the user disconnected, remove them from the list of users
//       socket.emit("user disconnected", callerID);
//     });

//     peer.on("connectionStateChange", () => {
//       if (peer.destroyed || peer._pc.connectionState === "failed") {
//         console.warn("Peer connection failed or was closed:", callerID);
//         peer.destroy();
//       }
//     });

//     return peer;
//   }

//   function addPeer(incomingSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//     })

//     peer.on("signal", signal => {
//       socket.emit("returning signal", { signal, callerID })
//     })

//     peer.signal(incomingSignal);

//     return peer;
//   }
//   console.log(peers.length)
//   console.log(userVideo)

//   return (
//     <Container>
//       <StyledVideo muted ref={userVideo} autoPlay playsInline />
//       {peers?.filter(el => el._id !== undefined)?.map((peer, index) => {
//         return (
//           <Video key={index} peer={peer} />
//         );
//       })}
//     </Container>
//   );
// };

// export default Room;

// Room.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    if (!peer) return;
    const handleStream = (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    };

    if (peer) {
      peer.on("stream", handleStream);

      return () => {
        peer.off("stream", handleStream);
      };
    }
  }, [peer]);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const Room = () => {
  const [peers, setPeers] = useState([{ peerID: null, peer: null }]);
  const userVideo = useRef();
  const socketRef = useRef();
  const peersRef = useRef([]);
  const { id: roomID } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize Socket.IO
    const socket = io("http://localhost:7000", {
      transports: ["websocket"], // Force WebSocket transport to avoid polling
      reconnection: true,        // Enable automatic reconnection
    })
    socketRef.current = socket;

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        // Join the specified room
        socket.emit("join room", roomID);

        // Receive the list of existing users in the room
        socket.on("all users", (users) => {
          const peers = [{ peerID: null, peer: null }];
          users.forEach((userID) => {
            const peer = createPeer(userID, socket.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({ peerID: userID, peer });
          });
          setPeers(peers);
        });

        // When a new user joins, create a new peer
        socket.on("user joined", (payload) => {
          const { callerID } = payload;
          const peer = addPeer(payload.signal, callerID, stream);
          peersRef.current.push({
            peerID: callerID,
            peer,
          });
          setPeers((users) => [...users, {
            peerID: callerID,
            peer,
          }]);
        });

        // When a user disconnects, remove their peer
        socket.on("user disconnected", (userID) => {
          const peerObj = peersRef.current.find((p) => p.peerID === userID);
          console.log(peerObj)

          if (peerObj) {
            delete peerObj.peer
            peersRef.current = peersRef.current.filter(
              (p) => p.peerID !== userID
            );
            setPeers((users) => users.filter((p) => p.peerID !== peerObj.peerID));
          }
          console.log(`User leave ${userID}`, peersRef)

        });

        // When receiving a returned signal, signal the corresponding peer
        socket.on("receiving returned signal", (payload) => {
          const { id, signal } = payload;
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj && peerObj.peer) {
            try {
              peerObj.peer.signal(signal);
            } catch (error) {
              console.error(
                `Error signaling peer ${id}:`,
                error.message
              );
            }
          }
        });

        // Handle incoming signals for new users joining
        socket.on("user signal", ({ callerID, signal }) => {
          const peerObj = peersRef.current.find(
            (p) => p.peerID === callerID
          );

          if (peerObj && peerObj.peer) {
            try {
              peerObj.peer.signal(signal);
            } catch (error) {
              console.error(
                `Error signaling peer ${callerID}:`,
                error.message
              );
            }
          }
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      peersRef.current.forEach(({ peer }) => peer.peer?.destroy());
    };
  }, []);

  useEffect(() => {
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason && event.reason.message.includes("_readableState")) {
        console.warn("Suppressed unhandled _readableState error", event.reason);
        event.preventDefault(); // Suppress the error from displaying
      }
    });

  }, [])
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off(); // Remove all socket listeners
        socketRef.current.disconnect();
      }

      peersRef.current.forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.removeAllListeners();
          peerObj.peer.destroy();
          peerObj.peer = null; // Nullify to fully clean up
        }
      });
    };
  }, []);

  // Function to create a new peer as the initiator
  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    // Handle signaling data
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    // Handle peer errors
    peer.on("error", (err) => {
      console.error("Peer error (createPeer):", err);
    });

    // Handle connection state changes
    peer.on("connectionStateChange", (state) => {
      if (state === "failed" || state === "closed" || state === "disconnected") {
        console.warn(`Peer connection ${state}:`, userToSignal);
        peer.destroy();
        removePeer(userToSignal);
      }
    });

    return peer;
  };

  // Function to add a peer when another user joins
  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    // Handle signaling data
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", {
        callerID,
        signal,
      });
    });

    // Handle peer errors
    peer.on("error", (err) => {
      console.error("Peer error (addPeer):", err);
    });

    // Handle connection state changes
    peer.on("connectionStateChange", (state) => {
      if (state === "failed" || state === "closed" || state === "disconnected") {
        console.warn(`Peer connection ${state}:`, callerID);
        peer.destroy();
        removePeer(callerID);
      }
    });

    // Signal the incoming connection
    try {
      peer.signal(incomingSignal);
    } catch (error) {

      console.error(
        `Error signaling incoming peer ${callerID}:`,
        error.message
      );
    }

    return peer;
  };

  // Function to remove a peer by their ID
  const removePeer = (userID) => {
    const peerObj = peersRef.current.find((p) => p.peerID === userID);

    if (peerObj && peerObj.peer) {
      // peerObj.peer.destroy();
      // peerObj.peer.removeAllListeners();  // Extra safeguard for event listeners
      peersRef.current = peersRef.current.filter(
        (p) => p.peerID !== userID
      );
      setPeers((users) => users.filter((p) => p.peerID !== peerObj.userID));
      socketRef.current.emit("LeavingRoom", { userID })
      navigate(`/`, { replace: true }) // Navigate to home page after leaving the room
    }
  };

  return (
    <>
      <Container>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer, index) => (
          <div key={index}>
            <button onClick={() => removePeer(peer.peerID)}>Leave the room</button>
            <Video peer={peer.peer} />
          </div>
        ))}
      </Container>

    </>
  );
};

export default Room;
