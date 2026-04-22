import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App.tsx";
import "../styles/style.css";

ReactDOM.createRoot(document.querySelector("#app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
