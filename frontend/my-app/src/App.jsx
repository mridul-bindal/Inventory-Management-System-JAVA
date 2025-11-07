import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login.jsx";
import RegisterPage from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Orders from "./components/Orders.jsx";
import Products from "./components/Products.jsx";
import SalesReport from "./components/Sales.jsx";
import Owners from "./components/Owners.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Orders" element={<Orders />} />
        <Route path="/Products" element={<Products/>} />
        <Route path="/Sales" element={<SalesReport/>} />
        <Route path="/Owners" element={<Owners/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
