import React, { useState } from 'react';
import Switch from 'react-switch';
import { Route, Routes} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import './App.css';
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";

function App() {
  const [checked, setChecked] = useState(false);

  const handleChange = (checked) => {
    setChecked(checked);
    // Example: Toggle theme or feature
    document.body.style.backgroundColor = checked ? '#f0f0f0' : '#ffffff';
  };

  return (

       <AuthProvider>
         <Navbar />
         <div className="container mt-4">
           <div className="mb-3">
             <label>
               <span>Toggle Theme: </span>
               <Switch onChange={handleChange} checked={checked} />
             </label>
           </div>
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/" element={<Dashboard />} />
           </Routes>
         </div>
       </AuthProvider>

  );
}

export default App;