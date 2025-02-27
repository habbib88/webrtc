export const startScreenSharing = async ({
  setScreenStream,
  connectionRef,
  myVideo,
  stream,
}) => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    console.log("screen stream started successfully", stream);
    setScreenStream(screenStream);

    // Replace the video track in the existing peer connection
    if (connectionRef.current) {
      console.log(
        "dsfgsdfg sdfg .current.getSenders());",
        connectionRef.current
      );

      if (connectionRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const currentVideoTrack = stream.getVideoTracks()[0]; // Original camera video track

        if (videoTrack) {
          console.log("Replacing track with:", videoTrack);
          // Use the simple-peer `replaceTrack` API
          connectionRef.current.replaceTrack(
            currentVideoTrack, // The track to replace
            videoTrack, // The new track
            stream // The stream that contains the original track
          );
        } else {
          console.error("No video track found in screen stream");
        }
      }

      // Trigger renegotiation if needed
      connectionRef.current.onnegotiationneeded = async () => {
        try {
          const offer = await connectionRef.current.createOffer();
          await connectionRef.current.setLocalDescription(offer);
          // Send the offer to the remote peer and wait for their answer.
        } catch (error) {
          console.error("Error during renegotiation:", error);
        }
      };
    }

    if (myVideo.current) {
      myVideo.current.srcObject = screenStream;
    }

  } catch (error) {
    console.error("Error accessing screen media:", error);
  }
};

export const stopScreenSharing = (
  screenStream,
  setScreenStream,
  webcamStream, // Ensure this is your initial webcam stream
  connectionRef,
  myVideo
) => {
  if (screenStream) {
    // Stop all tracks in the screen stream
    screenStream.getTracks().forEach((track) => track.stop());
    setScreenStream(null); // Clear the screen stream
  }

  // Switch back to the webcam stream
  if (webcamStream && connectionRef.current) {
    const videoTrack = webcamStream.getVideoTracks()[0]; // Get the original video track from the webcam stream

    if (videoTrack) {
      console.log("Switching back to webcam track");

      // Replace the screen track with the original webcam track
      connectionRef.current.replaceTrack(
        connectionRef.current.streams[0].getVideoTracks()[0], // This should be the current screen sharing track
        videoTrack, // New webcam video track
        webcamStream // The original webcam stream
      );
      console.log(connectionRef);
    } else {
      console.error("No video track found in the original webcam stream");
    }
    // Set the local video element to display the webcam stream
    if (myVideo.current) {
      myVideo.current.srcObject = webcamStream;
    }
  } else {
    console.log("----------------", webcamStream, connectionRef.current);

    console.error("Webcam stream is undefined or invalid.");
  }
};
