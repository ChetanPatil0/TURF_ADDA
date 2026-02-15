import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import 'leaflet/dist/leaflet.css';

import { Slide, ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Slide}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;



//https://grok.com/share/c2hhcmQtMg_1c6a84ee-546b-4c96-b114-2c9b91eaafb2