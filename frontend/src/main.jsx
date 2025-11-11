import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css"; // si ton app l'utilise
createRoot(document.getElementById("root")).render(<App />);
