import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./reset.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element for MagneticDock demo.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
