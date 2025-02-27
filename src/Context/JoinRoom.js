// src/hooks/useRoomConnection.js
import { useState } from "react";

const useRoomConnection = ({ sendMessage, me, callUser }) => {
  const [roomId, setRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);

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

  const handleNewParticipant = (data) => {
    if (data.roomId === roomId && data.userId !== me) {
      setParticipants((prev) => [...prev, data.userId]);
      callUser(data.userId, me, "RoomParticipant");
    }
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

  return { joinRoom, handleNewParticipant, handleLeaveRoom, roomId, participants };
};

export default useRoomConnection;
