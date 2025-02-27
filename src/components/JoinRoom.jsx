import React, { useContext, useState } from "react";
import { SocketContext } from "../Context/Context";

const App = () => {
    const {
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
        joinRoom,
        handleLeaveRoom,
        roomId,
        participants,
    } = useContext(SocketContext);

    const [roomInput, setRoomInput] = useState("");
    console.log(me)

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Video Call Application</h2>

            {/* Room Controls */}
            <div style={{ marginBottom: "20px" }}>
                {roomId ? (
                    <>
                        <h3>Room ID: {roomId}</h3>
                        <button onClick={handleLeaveRoom}>Leave Room</button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            placeholder="Enter Room ID"
                        />
                        <button onClick={() => joinRoom(roomInput)}>Join Room</button>
                    </>
                )}
            </div>

            {/* Participant List */}
            {roomId && (
                <div style={{ marginBottom: "20px" }}>
                    <h4>Participants:</h4>
                    <ul>
                        {participants.map((participantId) => (
                            <li key={participantId}>{participantId}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Call Actions */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {call.isReceivingCall && !callAccepted && (
                    <div>
                        <h4>{call.name} is calling...</h4>
                        <button onClick={answerCall}>Answer</button>
                    </div>
                )}
                {callAccepted && !callEnded ? (
                    <button onClick={leaveCall}>End Call</button>
                ) : (
                    <button onClick={() => callUser(me)}>Call</button>
                )}
            </div>

            {/* Screen Sharing Controls */}
            <div style={{ marginBottom: "20px" }}>
                <button onClick={ShareScreen}>Start Screen Sharing</button>
                <button onClick={ShareScreenStop}>Stop Screen Sharing</button>
            </div>

            {/* Video Elements */}
            <div style={{ display: "flex", justifyContent: "center" }}>
                {/* User's own video */}
                {stream && (
                    <div style={{ marginRight: "10px" }}>
                        <h4>Your Video</h4>
                        <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
                    </div>
                )}

                {/* User's peer video */}
                {callAccepted && !callEnded && (
                    <div>
                        <h4>Peer's Video</h4>
                        <video playsInline ref={userVideo} autoPlay style={{ width: "300px" }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
