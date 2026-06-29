import { useState, useEffect } from "react";
import "./style/index.css";
import Grafic from "./components/Grafic.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ProtectedRoute from "./components/Protected.jsx";
import Profile from "./components/Profile.jsx";
import Admin from "./components/Admin.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
<BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute> <Grafic /> </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute> <Profile /> </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}> <Admin /> </ProtectedRoute>
        } />
      </Routes>

    
    </BrowserRouter>
  );
}



export default App;

