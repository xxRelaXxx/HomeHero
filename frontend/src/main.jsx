import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

/*
  main.jsx = punto di ingresso (Vite/React).
  Nei tuoi appunti: qui monti <App /> nel #root. :contentReference[oaicite:2]{index=2}
*/
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Nuovo concetto (commentato): Router per cambiare pagina senza ricaricare */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
