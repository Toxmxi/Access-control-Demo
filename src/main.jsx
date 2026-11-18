import React from "react";
import { createRoot } from "react-dom/client";
import User from "./User.jsx";
import "./index.css";

// Mounts the authentication flow as the root of the React application.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <User />
  </React.StrictMode>,
);
