// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import Home from "./PeerCalling";
import About from "./components/JoinRoom";
import PeerJoinRoom from "./components/PeerJoinRoom";
import { WebRTCProvider } from "./Context/RoomContext";
import PeerToPeerWithInvite from "./components/PeerToPeerWithInvite";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/:id" element={<About />} /> */}
        <Route path="/:id" element={<PeerJoinRoom />} />
        <Route path="/invite" element={<PeerToPeerWithInvite />} />
      </Routes>
    </Router>
  );
};

export default App;
