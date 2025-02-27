import React, { useState } from "react";
import Participant from "./Participant";
import "./VideoCall.css";

const VideoCall = () => {
  const [participants, setParticipants] = useState([
    { id: 1, name: "Gene" },
    { id: 2, name: "Mila" },
    { id: 3, name: "Siarhei" },
    { id: 4, name: "Anton" },
  ]);

  // Function to add a new participant dynamically
  const addParticipant = () => {
    const newId = participants.length + 1;
    setParticipants([...participants, { id: newId, name: `User ${newId}` }]);
  };

  return (
    <div className="video-call-container">
      <div className="grid">
        {participants.map((participant) => (
          <Participant key={participant.id} name={participant.name} />
        ))}
      </div>
      <div className="controls">
        <button onClick={addParticipant}>Add Participant</button>
        <button>Add Participant</button>
      
      </div>
    </div>
  );
};

export default VideoCall;
