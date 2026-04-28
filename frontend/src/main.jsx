import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId="362883938793-ncao0kr1961ctuob7gome1vde4e54sjo.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
