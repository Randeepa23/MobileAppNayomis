import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppHead from "./components/AppHead";

// Render the favicon handler component
createRoot(document.getElementById("root")!).render(
  <>
    <AppHead />
    <App />
  </>
);
