import React from "react";

const Participant = ({ name }) => {
    return (
        <div className="participant">
            <div className="video-placeholder">
                {/* Replace with video element */}
                <p>{name}</p>
            </div>
            <div className="name">
                <p>{name}</p>

            </div>
        </div>
    );
};

export default Participant;
