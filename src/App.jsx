import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import MalzemeListe from "./components/MalzemeListe";
import TurTanim from "./components/TurTanim";
import MalzemeTanim from "./components/MalzemeTanim";
import HareketSayfasi from "./components/HareketSayfasi";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PoiRaporSayfasi from "./components/PoiRaporSayfasi";

import "./App.css";

function AppContent() {
  const location = useLocation();

  const currentUser = {
    adSoyad: "Admin",
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Login ekranında sadece Login componentini göster
  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid justify-content-between px-4">
          <Link className="navbar-brand fw-bold" to="/">
            ■ İSDEMİR.STOK
          </Link>

          <div className="d-flex align-items-center gap-3">
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              👤 {currentUser.adSoyad}
            </span>

            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger"
            >
              ÇIKIŞ YAP
            </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR + CONTENT */}
      <div className="app-layout">
        {/* SOL MENÜ */}
        <aside className="sidebar">
          <div className="sidebar-title">MENÜ</div>

          <Link className="sidebar-link" to="/">
            📊 Genel Rapor
          </Link>

          <Link className="sidebar-link" to="/tur-tanim">
            📑 Tür Tanımı
          </Link>

          <Link className="sidebar-link" to="/malzeme-tanim">
            📦 Malzeme Tanımı
          </Link>

          <Link className="sidebar-link" to="/hareket-giris">
            🔄 Stok Hareketleri
          </Link>



          {/* YENİ MENÜ LİNKİ: */}
          <Link className="sidebar-link" to="/poi-rapor">
            📊 POI Rapor Sayfası
          </Link>
        </aside>

        {/* SAĞ TARAF */}
        <main className="content-area">
          <Routes>
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
            <Route
              path="/poi-rapor"
              element={
                <ProtectedRoute>
                  <PoiRaporSayfasi />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <AppContent />
    </Router>
  );
}

export default App;
