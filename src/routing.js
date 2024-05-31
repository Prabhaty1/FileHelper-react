import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import Layout from './pages/Layout';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';

export default function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="#" element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}