import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import MalzemeListe from "./components/MalzemeListe"; // Ana sayfamız (Genel Rapor)
import TurTanim from "./components/TurTanim";
import MalzemeTanim from "./components/MalzemeTanim";
import HareketSayfasi from "./components/HareketSayfasi";
import Login from "./components/Login"; // Giriş Sayfası
import ProtectedRoute from "./components/ProtectedRoute"; // Sayfa Koruma Filtresi
import "./App.css";

function App() {
  // Tarayıcı hafızasından giriş yapmış olan kullanıcı bilgilerini çek
  const userJson = localStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

  

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("user"); // Hafızayı temizle
    window.location.href = "/login"; // Giriş sayfasına yönlendir
  };

  return (
    <Router>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#242424',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid #444',
            fontSize: '0.85rem',
            maxWidth: '400px',
            wordBreak: 'break-word',
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Üst Menü (Yalnızca kullanıcı giriş yapmışsa görünür) */}
      {currentUser && (
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container-fluid justify-content-between px-5">
            <Link className="navbar-brand fw-black" to="/">
              ■ NEURAL.STOK
            </Link>

            {/* Sayfa Linkleri */}
            <div className="navbar-nav d-flex flex-row align-items-center gap-3">
              <Link className="nav-link" to="/">
                Genel Rapor
              </Link>
              <Link className="nav-link" to="/tur-tanim">
                Tür Tanımı
              </Link>
              <Link className="nav-link" to="/malzeme-tanim">
                Malzeme Tanımı
              </Link>
              <Link className="nav-link" to="/hareket-giris">
                Stok Hareketleri
              </Link>

              {/* Kullanıcı Karşılama ve Çıkış Butonu */}
              <span
                className="text-white-50 ms-3 me-2"
                style={{ fontSize: "0.78rem", fontWeight: 600 }}
              >
                👤 {currentUser.adSoyad.toUpperCase()}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline-danger py-1 px-2 border-0"
                style={{ fontSize: "0.75rem", fontWeight: 700 }}
              >
                ÇIKIŞ YAP 🚪
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Sayfa İçerikleri (Korumalı Rotalar) */}
      <div className="main-wrapper">
        <Routes>
          {/* Giriş Rotası */}
          <Route path="/login" element={<Login />} />

          {/* Korumalı Rotalar (ProtectedRoute ile sarmalandı) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MalzemeListe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tur-tanim"
            element={
              <ProtectedRoute>
                <TurTanim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/malzeme-tanim"
            element={
              <ProtectedRoute>
                <MalzemeTanim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hareket-giris"
            element={
              <ProtectedRoute>
                <HareketSayfasi />
              </ProtectedRoute>
            }
          />

          {/* Tanımsız Rotaları Ana Sayfaya Yönlendir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
