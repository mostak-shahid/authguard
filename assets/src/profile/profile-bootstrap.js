import React from "react";
import { createRoot } from "react-dom/client";
import ProfileApp from "./ProfileApp";

import "../styles/tailwind.css";
// Profile-specific styles (create this file if you need page-specific CSS)
// import "./styles/profile.css";

const container = document.getElementById("plugin-starter-profile-react-app");

if (container) {
    const root = createRoot(container);
    root.render(<ProfileApp />);
} else {
    console.error("Target container '#plugin-starter-profile-react-app' not found in the DOM.");
}