import React from "react";
import { Typography, AppBar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import VideoPlayer from "./components/VideoPlayer";
import Sidebar from "./components/Sidebar";
import Notifications from "./components/Notifications";
import { v1 as uuid } from "uuid";
import { Link } from "react-router-dom";
import VideoCall from "./components/VideoCall";
const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 15,
    margin: "30px 100px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "600px",
    border: "2px solid black",

    [theme.breakpoints.down("xs")]: {
      width: "90%",
    },
  },
  image: {
    marginLeft: "15px",
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
}));

const PeerCalling = () => {
  const classes = useStyles();
  const id = uuid();
  return (
    <div className={classes.wrapper}>
      <>
        <AppBar className={classes.appBar} position="static" color="inherit">
          <Typography variant="h2" align="center">
            Video Chat
          </Typography>
        </AppBar>
        <VideoPlayer />
        <Sidebar>
          <Notifications />
        </Sidebar>
        {/* <VideoCall /> */}
      </>
      <Link to={`/${id}`}>Create room</Link>
    </div>
  );
};

export default PeerCalling;
