import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const MalzemeListe = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTur, setSelectedTur] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal (Detay Ekranı) State'leri
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/malzemeler");

      if (response.data) {
        setData(response.data);
      }
      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDetayClick = async (malzemeKodu) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/malzemeler/detay/${malzemeKodu}`);
      if (response.data) {
        setModalData(response.data);
      }
    } catch (error) {
      alert("Malzeme detayları alınırken bir hata oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  const filteredData = data.filter((item) => {
    const malzemeAdi = item.malzemeAdi || "";
    const malzemeKodu = item.malzemeKodu || "";
    const turAdi = item.malzemeTurAdi || "";

    const matchesSearch = search === "" ||
      malzemeAdi.toLowerCase().includes(search.toLowerCase()) ||
      malzemeKodu.toLowerCase().includes(search.toLowerCase());
      
    const matchesTur = selectedTur === "" || turAdi === selectedTur;

    return matchesSearch && matchesTur;
  });

  const totalFlows = data.length;
  
  const activeKinds = Array.from(
    new Set(data.map((item) => item.malzemeTurAdi).filter(Boolean))
  ).length;

  if (loading) {
    return (
      <div className="erp-container d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-light mb-3" role="status"></div>
          <h4 className="text-white">Veritabanından bilgiler alınıyor...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-container">
      <div
        className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4"
        style={{ borderColor: "rgba(255,255,255,0.08) !important" }}
      >
        <h2
          className="m-0 border-0 p-0 text-white"
          style={{ fontSize: "1.25rem", fontWeight: 700 }}
        >
          ■ ENVANTER GENEL RAPORU
        </h2>
        <div className="d-flex align-items-center">
          <span className={`pulse-led ${isOffline ? "led-orange" : "led-green"}`}></span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.75rem",
              color: isOffline ? "#f59e0b" : "#10b981",
              marginLeft: "8px"
            }}
          >
            {isOffline ? "BAĞLANTI HATASI" : "SİSTEM AKTİF"}
          </span>
        </div>
      </div>

      <div className="row g-3 mb-5">
        <div className="col-md-6">
          <div className="metric-card">
            <span
              style={{
                fontSize: "0.72rem",
                color: "#a1a1aa",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Toplam Kayıtlı Malzeme
            </span>
            <h3
              className="m-0 mt-2 font-mono text-white fw-bold"
              style={{ fontSize: "1.8rem" }}
            >
              {totalFlows}
            </h3>
            <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>
              Veritabanı kayıt sayısı
            </span>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="metric-card">
            <span
              style={{
                fontSize: "0.72rem",
                color: "#a1a1aa",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Aktif Kategori Çeşidi
            </span>
            <h3
              className="m-0 mt-2 font-mono text-white fw-bold"
              style={{ fontSize: "1.8rem" }}
            >
              {activeKinds} <span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Kategori</span>
            </h3>
            <span style={{ fontSize: "0.68rem", color: "#a1a1aa", fontWeight: 600 }}>
              Sistemde tanımlı türler
            </span>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-7">
          <label className="form-label text-white-50">Akıllı Arama</label>
          <input
            type="text"
            className="form-control mb-0"
            placeholder="Malzeme adı veya kod ile arayın..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label text-white-50">Kategori Filtresi</label>
          <select
            className="select form-select mb-0"
            value={selectedTur}
            onChange={(e) => setSelectedTur(e.target.value)}
          >
            <option value="">TÜM KATEGORİLER</option>
            {Array.from(new Set(data.map((item) => item.malzemeTurAdi).filter(Boolean))).map((t, idx) => (
              <option key={idx} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover w-100">
          <thead>
            <tr>
              <th style={{ width: "80px", color: "#a1a1aa" }}>ID</th>
              <th style={{ width: "130px", color: "#a1a1aa" }}>KOD</th>
              <th style={{ color: "#a1a1aa" }}>MALZEME TANIMI / ADI</th>
              <th style={{ width: "130px", color: "#a1a1aa" }}>TÜRÜ</th>
              <th style={{ width: "100px", color: "#a1a1aa" }}>MENŞEİ</th>
              <th className="text-end" style={{ width: "140px", color: "#a1a1aa" }}>
                ANLIK STOK
              </th>
              <th className="text-end" style={{ width: "120px", color: "#a1a1aa" }}>
                İŞLEM
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const mevcutMiktar = item.mevcutMiktar || 0;
                const quantityColor = mevcutMiktar < 0 ? "#ef4444" : "#10b981";
                const densityPercent = Math.min((Math.abs(mevcutMiktar) / 1000) * 100, 100);

                return (
                  <tr key={item.id} className="align-middle">
                    <td className="font-mono text-secondary">#{item.id}</td>
                    <td className="font-mono fw-bold text-white">{item.malzemeKodu || "-"}</td>
                    <td>
                      <div className="fw-semibold text-white">{item.malzemeAdi || "İsimsiz Malzeme"}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-light">{item.malzemeTurAdi || "-"}</span>
                    </td>
                    <td className="text-secondary">{item.mensei || "-"}</td>
                    <td className="text-end">
                      <div className="font-mono fw-bold mb-1" style={{ color: quantityColor }}>
                        {mevcutMiktar}
                      </div>
                      <div className="d-flex justify-content-end">
                        <div style={{ width: "80px", height: "6px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${densityPercent}%`, backgroundColor: quantityColor, transition: "width 0.3s ease" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm btn-outline-info py-0 px-2"
                        onClick={() => handleDetayClick(item.malzemeKodu)}
                        disabled={modalLoading}
                      >
                        Geçmişi İncele
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-5 font-mono text-secondary">
                  Arama kriterlerine uygun malzeme bulunamadı veya veritabanı boş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAY MODALI (HAREKET LOGLARI) */}
      {modalData && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
            backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050, 
            display: "flex", justifyContent: "center", alignItems: "center"
          }}
        >
          <div 
            className="erp-container p-4 animate-fade-in" 
            style={{ width: "90%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
              <div>
                <h3 className="m-0 text-white" style={{ fontSize: "1.2rem" }}>
                  {modalData.malzemeAdi} Detay Raporu
                </h3>
                <span className="font-mono text-muted" style={{ fontSize: "0.85rem" }}>
                  KOD: {modalData.malzemeKodu} | TÜR: {modalData.malzemeTurAdi} | MENŞEİ: {modalData.mensei}
                </span>
              </div>
              <button className="btn btn-outline-danger btn-sm" onClick={closeModal}>✕ Kapat</button>
            </div>

            <div className="metric-card mb-4 d-inline-block px-4 py-2">
              <span style={{ fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase" }}>Anlık Net Stok</span>
              <h4 className="m-0 mt-1 font-mono fw-bold" style={{ color: modalData.mevcutMiktar < 0 ? "#ef4444" : "#10b981" }}>
                {modalData.mevcutMiktar} Adet
              </h4>
            </div>

            <h5 className="text-white mb-3" style={{ fontSize: "1rem" }}>Hareket Geçmişi</h5>
            <div className="table-responsive">
              <table className="table table-dark table-striped table-sm w-100">
                <thead>
                  <tr>
                    <th style={{ color: "#a1a1aa" }}>HAREKET ID</th>
                    <th style={{ color: "#a1a1aa" }}>TARİH</th>
                    <th style={{ color: "#a1a1aa" }}>İŞLEM TÜRÜ</th>
                    <th className="text-end" style={{ color: "#a1a1aa" }}>MİKTAR</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.hareketler && modalData.hareketler.length > 0 ? (
                    modalData.hareketler.map((h) => {
                      const isNegative = h.hareketTuru === "SATIS" || h.hareketTuru === "TUKETIM";
                      const prefix = isNegative ? "-" : "+";
                      const quantityColor = isNegative ? "#ef4444" : "#10b981";
                      const tarihFormatli = new Date(h.hareketTarihi).toLocaleString("tr-TR");

                      return (
                        <tr key={h.id}>
                          <td className="font-mono text-secondary">#{h.id}</td>
                          <td className="font-mono text-white">{tarihFormatli}</td>
                          <td>
                            <span className="badge bg-secondary text-light">{h.hareketTuru}</span>
                          </td>
                          <td className="text-end font-mono fw-bold" style={{ color: quantityColor }}>
                            {prefix}{h.miktar}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">Bu malzemeye ait henüz stok hareketi bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalzemeListe;