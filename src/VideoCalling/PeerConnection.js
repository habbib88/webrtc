import { useEffect, useRef } from "react";
import Peer from "simple-peer";

const usePeerConnection = ({ stream, sendMessage, userVideo, myVideo }) => {
  const connectionRef = useRef();
  // Update local video stream when available
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);
  const callUser = (id, me, name) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
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

  const answerCall = (call, setCallAccepted) => {
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

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    try {
      console.log("Attempting to leave call...");
      // setCallEnded(true);

      // Stop all media tracks to end the video/audio stream
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (err) {
            console.error("Error while stopping track:", err);
          }
        });
        console.log("Media tracks stopped");
      }
    } catch (error) {
      console.error("Error while leaving call:", error);
    }
  };
  return { callUser, answerCall, leaveCall };
};
export default usePeerConnection;
