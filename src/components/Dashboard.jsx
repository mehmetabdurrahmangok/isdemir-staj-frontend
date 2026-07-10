import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const Dashboard = () => {
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
      miktar: 480,
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
  const [turler, setTurler] = useState([
    { id: 1, tur: "Cevher" },
    { id: 2, tur: "Ara Ürün" },
    { id: 3, tur: "Katkı" },
  ]);
  const [search, setSearch] = useState("");
  const [selectedTur, setSelectedTur] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  // Form states
  const [malzemeForm, setMalzemeForm] = useState({
    kod: "",
    ad: "",
    mensei: "Yerli",
    turId: "",
  });
  const [hareketForm, setHareketForm] = useState({
    malzemeId: "",
    islem: "ALIS",
    miktar: "",
    depo: "ANA DEPO",
  });
  const [turForm, setTurForm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/malzemeler");
      if (response.data && response.data.length > 0) {
        setData(response.data);
      }
      const turResponse = await api.get("/turler");
      if (turResponse.data && turResponse.data.length > 0) {
        setTurler(turResponse.data);
      }
      setIsOffline(false);
    } catch (error) {
      setIsOffline(true);
    }
  };

  const handleMalzemeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/malzemeler", malzemeForm);
      setMalzemeForm({ kod: "", ad: "", mensei: "Yerli", turId: "" });
      setActivePanel(null);
      fetchData();
    } catch (error) {
      alert("Hata");
    } finally {
      setLoading(false);
    }
  };

  const handleHareketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/hareketler", hareketForm);
      setHareketForm({
        malzemeId: "",
        islem: "ALIS",
        miktar: "",
        depo: "ANA DEPO",
      });
      setActivePanel(null);
      fetchData();
    } catch (error) {
      alert("Hata");
    } finally {
      setLoading(false);
    }
  };

  const handleTurSubmit = async (e) => {
    e.preventDefault();
    if (!turForm.trim()) return;
    setLoading(true);
    try {
      await api.post("/turler", { tur: turForm });
      setTurForm("");
      setActivePanel(null);
      fetchData();
    } catch (error) {
      alert("Hata");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.ad.toLowerCase().includes(search.toLowerCase()) ||
      item.kod.toLowerCase().includes(search.toLowerCase());
    const matchesTur = selectedTur === "" || item.tur === selectedTur;
    return matchesSearch && matchesTur;
  });

  // Metrik Kartı İstatistikleri
  const totalFlows = data.length;
  const totalQuantity = data.reduce(
    (sum, item) => sum + (item.islem === "SATIS" ? -item.miktar : item.miktar),
    0,
  );
  const activeKinds = Array.from(new Set(data.map((item) => item.tur))).length;

  return (
    <div className="erp-container">
      {/* Üst Logo ve Durum Işığı */}
      <div
        className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4"
        style={{ borderColor: "rgba(255,255,255,0.08) !important" }}
      >
        <h2
          className="m-0 border-0 p-0 text-white"
          style={{ fontSize: "1.25rem", fontWeight: 700 }}
        >
          ■ NEURAL.STOK
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

      {/* METRİK KARTLARI (Stripe Tarzı İstatistikler) */}
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
              Aktif Malzeme Türü
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

      {/* AKSİYON BUTONLARI */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <button
          className={`btn ${activePanel === "malzeme" ? "" : "btn-secondary-erp"}`}
          onClick={() =>
            setActivePanel(activePanel === "malzeme" ? null : "malzeme")
          }
        >
          {activePanel === "malzeme" ? "✕ Paneli Kapat" : "[+] Malzeme Ekle"}
        </button>
        <button
          className={`btn ${activePanel === "hareket" ? "" : "btn-secondary-erp"}`}
          onClick={() =>
            setActivePanel(activePanel === "hareket" ? null : "hareket")
          }
        >
          {activePanel === "hareket" ? "✕ Paneli Kapat" : "[+] Hareketi İşle"}
        </button>
        <button
          className={`btn ${activePanel === "tur" ? "" : "btn-secondary-erp"}`}
          onClick={() => setActivePanel(activePanel === "tur" ? null : "tur")}
        >
          {activePanel === "tur" ? "✕ Paneli Kapat" : "[+] Yeni Tür Ekle"}
        </button>
      </div>

      {/* FORM PANELLERİ */}
      {activePanel === "malzeme" && (
        <div
          className="p-4 mb-4 border border-secondary bg-dark rounded-3 animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.08) !important" }}
        >
          <h4
            className="mb-3 text-white"
            style={{ fontSize: "1rem", fontWeight: 600 }}
          >
            Yeni Malzeme Kayıt Protokolü
          </h4>
          <form onSubmit={handleMalzemeSubmit}>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Kod</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MLZ100"
                  value={malzemeForm.kod}
                  onChange={(e) =>
                    setMalzemeForm({ ...malzemeForm, kod: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Malzeme Adı</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Sac levha vb."
                  value={malzemeForm.ad}
                  onChange={(e) =>
                    setMalzemeForm({ ...malzemeForm, ad: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Türü</label>
                <select
                  className="form-select"
                  value={malzemeForm.turId}
                  onChange={(e) =>
                    setMalzemeForm({ ...malzemeForm, turId: e.target.value })
                  }
                  required
                >
                  <option value="">Seçiniz...</option>
                  {turler.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tur.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Menşei</label>
                <select
                  className="form-select"
                  value={malzemeForm.mensei}
                  onChange={(e) =>
                    setMalzemeForm({ ...malzemeForm, mensei: e.target.value })
                  }
                >
                  <option value="Yerli">Yerli</option>
                  <option value="İthal">İthal</option>
                </select>
              </div>
            </div>
            <div className="text-end mt-3">
              <button type="submit" className="btn btn-sm" disabled={loading}>
                Malzemeyi Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {activePanel === "hareket" && (
        <div
          className="p-4 mb-4 border border-secondary bg-dark rounded-3 animate-fade-in"
          style={{ borderColor: "rgba(255,255,255,0.08) !important" }}
        >
          <h4
            className="mb-3 text-white"
            style={{ fontSize: "1rem", fontWeight: 600 }}
          >
            Stok Giriş-Çıkış Formu
          </h4>
          <form onSubmit={handleHareketSubmit}>
            <div className="row g-2">
              <div className="col-md-3">
                <label className="form-label">Malzeme</label>
                <select
                  className="form-select"
                  value={hareketForm.malzemeId}
                  onChange={(e) =>
                    setHareketForm({
                      ...hareketForm,
                      malzemeId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Seçiniz...</option>
                  {data.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.ad} ({m.kod})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">İşlem</label>
                <select
                  className="form-select"
                  value={hareketForm.islem}
                  onChange={(e) =>
                    setHareketForm({ ...hareketForm, islem: e.target.value })
                  }
                >
                  <option value="ALIS">GİRİŞ (ALIŞ)</option>
                  <option value="SATIS">ÇIKIŞ (SATIŞ)</option>
                  <option value="TRANSFER">TRANSFER</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Miktar</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={hareketForm.miktar}
                  onChange={(e) =>
                    setHareketForm({ ...hareketForm, miktar: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Depo</label>
                <input
                  type="text"
                  className="form-control"
                  value={hareketForm.depo}
                  onChange={(e) =>
                    setHareketForm({ ...hareketForm, depo: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="text-end mt-3">
              <button type="submit" className="btn btn-sm" disabled={loading}>
                Hareketi İşle
              </button>
            </div>
          </form>
        </div>
      )}

      {activePanel === "tur" && (
        <div
          className="p-4 mb-4 border border-secondary bg-dark rounded-3 animate-fade-in"
          style={{
            maxWidth: "500px",
            borderColor: "rgba(255,255,255,0.08) !important",
          }}
        >
          <h4
            className="mb-3 text-white"
            style={{ fontSize: "1rem", fontWeight: 600 }}
          >
            Yeni Malzeme Türü Tanımla
          </h4>
          <form onSubmit={handleTurSubmit}>
            <div className="mb-3">
              <label className="form-label">Tür Adı</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: Sinter, Kok, Cevher"
                value={turForm}
                onChange={(e) => setTurForm(e.target.value)}
                required
              />
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-sm" disabled={loading}>
                Kategori Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ARAMA VE SÜZME PANELI */}
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
            className="form-select mb-0"
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

      {/* PREMIUM ENVANTER TABLOSU */}
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
                MİKTAR / YOĞUNLUK
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, idx) => {
                const isNegative =
                  item.islem === "SATIS" || item.islem === "CIKIS";
                const prefix = isNegative ? "-" : "+";
                const quantityColor = isNegative
                  ? "var(--danger-accent)"
                  : "var(--success-accent)";

                // CSS Sparkline yoğunluk hesabı (Maksimum 600 adete göre çubuk uzunluğu ayarlanır)
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
                      <span
                        className="badge-erp badge-in"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.03)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        {item.tur}
                      </span>
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
                      {/* CSS Mini Bar Grafik */}
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

export default Dashboard;
