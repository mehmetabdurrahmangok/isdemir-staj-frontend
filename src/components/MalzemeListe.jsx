import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const MalzemeListe = () => {
  const mockVeriler = [
    {
      id: 1,
      kod: "MLZ001",
      ad: "Pelet Cevher",
      mensei: "Yerli",
      tur: "Cevher",
      islem: "ALIS",
      miktar: 150,
      hareketTarihi: "2026-07-09",
    },
    {
      id: 2,
      kod: "MLZ002",
      ad: "Sinter",
      mensei: "İthal",
      tur: "Ara Ürün",
      islem: "URETIM",
      miktar: 600,
      hareketTarihi: "2026-07-09",
    },
    {
      id: 3,
      kod: "MLZ003",
      ad: "Kireç Taşı",
      mensei: "Yerli",
      tur: "Katkı",
      islem: "SATIS",
      miktar: 80,
      hareketTarihi: "2026-07-08",
    },
  ];

  const [data, setData] = useState(mockVeriler);
  const [search, setSearch] = useState("");
  const [selectedTur, setSelectedTur] = useState("");
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/malzemeler");
      if (response.data && response.data.length > 0) {
        setData(response.data);
      }
      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.ad.toLowerCase().includes(search.toLowerCase()) ||
      item.kod.toLowerCase().includes(search.toLowerCase());
    const matchesTur = selectedTur === "" || item.tur === selectedTur;
    return matchesSearch && matchesTur;
  });

  // Metrik Hesaplamaları
  const totalFlows = data.length;
  const totalQuantity = data.reduce(
    (sum, item) =>
      sum +
      (item.islem === "SATIS" || item.islem === "TUKETIM"
        ? -item.miktar
        : item.miktar),
    0,
  );
  const activeKinds = Array.from(new Set(data.map((item) => item.tur))).length;

  return (
    <div className="erp-container">
      {/* Başlık ve Bağlantı Rozeti */}
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
          <span
            className={`pulse-led ${isOffline ? "led-orange" : "led-green"}`}
          ></span>
          <span
            className="font-mono"
            style={{
              fontSize: "0.75rem",
              color: isOffline ? "#f59e0b" : "#10b981",
            }}
          >
            {isOffline ? "CH-OFFLINE" : "CH-ONLINE"}
          </span>
        </div>
      </div>

      {/* İstatistik Metrikleri */}
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
              Toplam Hareket Sayısı
            </span>
            <h3
              className="m-0 mt-2 font-mono text-white fw-bold"
              style={{ fontSize: "1.8rem" }}
            >
              {totalFlows}
            </h3>
            <span
              style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 600 }}
            >
              ↑ +14.2% geçen haftaya göre
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
              {totalQuantity}{" "}
              <span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>Adet</span>
            </h3>
            <span
              style={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 600 }}
            >
              ⚡ Sistem doluluk oranı: %68
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
              {activeKinds}{" "}
              <span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>
                Kategori
              </span>
            </h3>
            <span
              style={{ fontSize: "0.68rem", color: "#a1a1aa", fontWeight: 600 }}
            >
              Tüm depolarda aktif
            </span>
          </div>
        </div>
      </div>

      {/* Arama ve Filtre */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-7">
          <label className="form-label">Akıllı Arama</label>
          <input
            type="text"
            className="form-control mb-0"
            placeholder="Malzeme adı, kod veya etiket ile tarayın..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">Kategori Filtresi</label>
          <select
            className="select form-select mb-0"
            value={selectedTur}
            onChange={(e) => setSelectedTur(e.target.value)}
          >
            <option value="">TÜM KATEGORİLER</option>
            {Array.from(new Set(data.map((item) => item.tur))).map((t, idx) => (
              <option key={idx} value={t}>
                {t ? t.toUpperCase() : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rapor Tablosu */}
      <div className="table-responsive">
        <table className="table table-striped w-100">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>REF_NO</th>
              <th style={{ width: "130px" }}>KOD</th>
              <th>MALZEME TANIMI / ADI</th>
              <th style={{ width: "130px" }}>TÜRÜ</th>
              <th style={{ width: "100px" }}>MENŞEİ</th>
              <th style={{ width: "140px" }}>İŞLEM TARİHİ</th>
              <th className="text-end" style={{ width: "180px" }}>
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
                const quantityColor = isNegative
                  ? "var(--danger-accent)"
                  : "var(--success-accent)";

                // Grafik yoğunluk çubuğu hesabı
                const densityPercent = Math.min((item.miktar / 600) * 100, 100);

                return (
                  <tr key={idx} className="align-middle">
                    <td
                      className="font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      #{idx + 1}
                    </td>
                    <td className="font-mono fw-bold text-white">{item.kod}</td>
                    <td>
                      <div className="fw-semibold text-white">{item.ad}</div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Stok kaydı aktif
                      </div>
                    </td>
                    <td>
                      <span className="badge-erp badge-in">{item.tur}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {item.mensei}
                    </td>
                    <td
                      className="font-mono"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.hareketTarihi || "-"}
                    </td>
                    <td className="text-end">
                      <div
                        className="font-mono fw-bold"
                        style={{ color: quantityColor }}
                      >
                        {prefix}
                        {item.miktar} Adet
                      </div>
                      <div className="d-flex justify-content-end">
                        <div
                          className="density-bar-bg"
                          style={{ width: "80px" }}
                        >
                          <div
                            className="density-bar-fill"
                            style={{
                              width: `${densityPercent}%`,
                              backgroundColor: quantityColor,
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
                  className="text-center py-5 font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Arama kriterlerine uygun kayıt bulunamadı.
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
