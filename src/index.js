import React from "react";
import ReactDOM from "react-dom/client";
import { AnimeProvider } from "./context/AnimeContext";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <AnimeProvider>
      <App />
    </AnimeProvider>
  </Router>
);
