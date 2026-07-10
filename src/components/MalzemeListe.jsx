import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const MalzemeListe = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTur, setSelectedTur] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("http://localhost:8080/api/malzeme");

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

  // DÜZELTME: item.ad yerine item.adi kullanılıyor
  const filteredData = data.filter((item) => {
    const matchesSearch = search === "" ||
      (item.adi && item.adi.toLowerCase().includes(search.toLowerCase())) ||
      (item.kod && item.kod.toLowerCase().includes(search.toLowerCase()));
      
    const matchesTur = selectedTur === "" || item.tur === selectedTur;

    const matchesUpdate = item.matchesUpdate;
    

    return matchesSearch && matchesTur;
  });

  const totalFlows = data.length;
  
  const totalQuantity = data.reduce(
    (sum, item) =>
      sum +
      (item.islem === "SATIS" || item.islem === "CIKIS" || item.islem === "TUKETIM"
        ? -(item.miktar || 0)
        : (item.miktar || 0)),
    0
  );

  const activeKinds = Array.from(
    new Set(data.map((item) => item.tur).filter(Boolean))
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
      {/* Başlık ve Durum Göstergesi */}
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

      {/* Üst İstatistik Kartları */}
      <div className="row g-3 mb-5">
        <div className="col-md-4">
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
              Toplam Kayıt Sayısı
            </span>
            <h3
              className="m-0 mt-2 font-mono text-white fw-bold"
              style={{ fontSize: "1.8rem" }}
            >
              {totalFlows}
            </h3>
            <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}>
              Gerçek zamanlı veri
            </span>
          </div>
        </div>
        
        <div className="col-md-4">
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
              Net Stok Hacmi
            </span>
            <h3
              className="m-0 mt-2 font-mono text-white fw-bold"
              style={{ fontSize: "1.8rem" }}
            >
              {totalQuantity} <span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Adet</span>
            </h3>
            <span style={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 600 }}>
              Giriş/Çıkış hesaplanmış net değer
            </span>
          </div>
        </div>
        
        <div className="col-md-4">
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
              Tüm depolarda aktif
            </span>
          </div>
        </div>
      </div>

      {/* Arama ve Filtreleme Bölümü */}
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
            {Array.from(new Set(data.map((item) => item.tur).filter(Boolean))).map((t, idx) => (
              <option key={idx} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Veri Tablosu */}
      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover w-100">
          <thead>
            <tr>
              <th style={{ width: "80px", color: "#a1a1aa" }}>ID</th>
              <th style={{ width: "130px", color: "#a1a1aa" }}>KOD</th>
              <th style={{ color: "#a1a1aa" }}>MALZEME TANIMI / ADI</th>
              <th style={{ width: "130px", color: "#a1a1aa" }}>TÜRÜ</th>
              <th style={{ width: "100px", color: "#a1a1aa" }}>MENŞEİ</th>
              <th style={{ width: "140px", color: "#a1a1aa" }}>İŞLEM TARİHİ</th>
              <th className="text-end" style={{ width: "180px", color: "#a1a1aa" }}>
                MİKTAR / HAREKET
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const isNegative =
                  item.islem === "SATIS" ||
                  item.islem === "CIKIS" ||
                  item.islem === "TUKETIM";
                const prefix = isNegative ? "-" : "+";
                const quantityColor = isNegative ? "#ef4444" : "#10b981";

                const densityPercent = Math.min(((item.miktar || 0) / 600) * 100, 100);

                return (
                  <tr key={item.id || idx} className="align-middle">
                    <td className="font-mono text-secondary">
                      #{item.id || idx + 1}
                    </td>
                    <td className="font-mono fw-bold text-white">
                      {item.kod || "-"}
                    </td>
                    <td>
                      {/* DÜZELTME: item.ad yerine item.adi kullanılıyor */}
                      <div className="fw-semibold text-white">
                        {item.adi || "İsimsiz Malzeme"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#a1a1aa" }}>
                        İşlem Tipi: {item.islem || "Bilinmiyor"}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-light">
                        {item.tur || "-"}
                      </span>
                    </td>
                    <td className="text-secondary">
                      {item.mensei || "-"}
                    </td>
                    <td className="font-mono text-secondary">
                      {item.hareketTarihi || "-"}
                    </td>
                    <td className="text-end">
                      <div
                        className="font-mono fw-bold mb-1"
                        style={{ color: quantityColor }}
                      >
                        {prefix}{item.miktar || 0} Adet
                      </div>
                      <div className="d-flex justify-content-end">
                        <div
                          style={{
                            width: "80px",
                            height: "6px",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${densityPercent}%`,
                              backgroundColor: quantityColor,
                              transition: "width 0.3s ease"
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-5 font-mono text-secondary"
                >
                  Arama kriterlerine uygun malzeme bulunamadı veya veritabanı boş.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MalzemeListe;
