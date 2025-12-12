import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AuthProvider from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-right" />
    <App />
  </AuthProvider>
);
