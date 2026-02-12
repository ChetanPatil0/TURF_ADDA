import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material";
import theme from "./theme.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MessageModalProvider } from "./context/MessageModalContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <MessageModalProvider>
          <App />
        </MessageModalProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
