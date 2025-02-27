
import React, { useContext, useEffect, useState } from 'react';
import { Grid, Typography, Paper, makeStyles } from '@material-ui/core';
import { SocketContext } from '../Context/Context';
import "./VideoPlayer.css";

const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call, toggleMic,
    toggleCamera,
  } = useContext(SocketContext);
  const classes = useStyles();

  // State to manage microphone and camera
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  function toggleMic1() {
    setIsMicEnabled((prev) => !prev);
    toggleMic()
  }
  function toggleCamera1() {
    setIsCameraEnabled((prev) => !prev);
    toggleCamera()
  }
  return (
    <>

      <div>

        <Grid container className={classes.gridContainer}>
          {stream && (
            <Paper className={classes.paper}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
                <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
              </Grid>
            </Paper>
          )}
          {callAccepted && !callEnded && (
            <Paper className={classes.paper}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
                <video playsInline ref={userVideo} autoPlay className={classes.video} />

              </Grid>
            </Paper>
          )}
        </Grid>
        <div>
          <button onClick={toggleMic1}>
            {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button onClick={toggleCamera1}>
            {isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
        </div>
      </div>


    </>
  );
};

export default VideoPlayer;
