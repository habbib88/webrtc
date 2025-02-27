import React, {
  createContext,
  useEffect,
  useState,
  useReducer,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { ws } from "../ws";
import { peersReducer } from "../reducers/peerReducer";
import {
  addPeerStreamAction,
  addPeerNameAction,
  removePeerStreamAction,
  addAllPeersAction,
} from "../reducers/peerActions";

import { UserContext } from "./UserContext";

export const RoomContext = createContext({
  peers: {},
  shareScreen: () => {},
  setRoomId: (id) => {},
  screenSharingId: "",
  roomId: "",
});

export const RoomProvider = ({ children }) => {
  const navigate = useNavigate();
  const { userName, userId } = useContext(UserContext);
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [stream, setStream] = useState();
  const [screenSharingId, setScreenSharingId] = useState("");
  const [roomId, setRoomId] = useState("");

  const enterRoom = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };

  const getUsers = ({ participants }) => {
    dispatch(addAllPeersAction(participants));
  };

  const removePeer = (peerId) => {
    dispatch(removePeerStreamAction(peerId));
  };

  const shareScreen = () => {
    if (screenSharingId) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          Object.values(peers).forEach((peer) => {
            peer.replaceTrack(stream.getTracks()[0]);
          });
        });
    } else {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
          Object.values(peers).forEach((peer) => {
            peer.replaceTrack(stream.getTracks()[0]);
          });
          setStream(stream);
        });
    }
  };

  const nameChangedHandler = ({ peerId, userName }) => {
    dispatch(addPeerNameAction(peerId, userName));
  };

  useEffect(() => {
    ws.emit("change-name", { peerId: userId, userName, roomId });
  }, [userName, userId, roomId]);

  useEffect(() => {
    ws.on("room-created", enterRoom);
    ws.on("get-users", getUsers);
    ws.on("user-disconnected", removePeer);
    ws.on("user-started-sharing", (peerId) => setScreenSharingId(peerId));
    ws.on("user-stopped-sharing", () => setScreenSharingId(""));
    ws.on("name-changed", nameChangedHandler);

    return () => {
      ws.off("room-created");
      ws.off("get-users");
      ws.off("user-disconnected");
      ws.off("user-started-sharing");
      ws.off("user-stopped-sharing");
      ws.off("name-changed");
    };
  }, []);

  useEffect(() => {
    if (!stream) return;

    ws.on("user-joined", ({ peerId, userName: name }) => {
      const peer = new SimplePeer({ initiator: true, stream });
      peer.on("stream", (peerStream) => {
        dispatch(addPeerStreamAction(peerId, peerStream));
      });
      dispatch(addPeerNameAction(peerId, name));

      peer.on("signal", (data) => {
        ws.emit("signal", { peerId, data });
      });

      ws.on("signal", ({ peerId: senderId, data }) => {
        if (senderId !== peerId) return;
        peer.signal(data);
      });
    });

    return () => {
      ws.off("user-joined");
    };
  }, [stream]);

  return (
    <RoomContext.Provider
      value={{
        stream,
        peers,
        shareScreen,
        roomId,
        setRoomId,
        screenSharingId,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
