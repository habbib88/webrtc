import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { ContextProvider } from "./Context/Context";
import "./styles.css";
import { WebRTCProvider } from "./Context/RoomContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
if (typeof process === "undefined") {
  global.process = {
    env: { NODE_ENV: "development" },
    nextTick: (callback) => setTimeout(callback, 0), // Polyfill nextTick with setTimeout
  };
} else if (!process.nextTick) {
  process.nextTick = (callback) => setTimeout(callback, 0);
}

root.render(
  <>
    {/* <ContextProvider> */}
    <App />
    {/* </ContextProvider> */}
  </>
);
