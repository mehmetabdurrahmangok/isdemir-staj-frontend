import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import MalzemeListe from "./components/MalzemeListe"; // Ana sayfamız (Genel Rapor)
import TurTanim from "./components/TurTanim";
import MalzemeTanim from "./components/MalzemeTanim";
import HareketSayfasi from "./components/HareketSayfasi";
import "./App.css";

function App() {
  return (
    <Router>
      {/* Üst Menü  */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid justify-content-between px-5">
          <Link className="navbar-brand fw-black" to="/">
            ■ NEURAL.STOK
          </Link>
          <div className="navbar-nav d-flex flex-row">
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
          </div>
        </div>
      </nav>

      {/* Sayfa İçerikleri */}
      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<MalzemeListe />} />
          <Route path="/tur-tanim" element={<TurTanim />} />
          <Route path="/malzeme-tanim" element={<MalzemeTanim />} />
          <Route path="/hareket-giris" element={<HareketSayfasi />} />
          <Route path="*" element={<MalzemeListe />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
