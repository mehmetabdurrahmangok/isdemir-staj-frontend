import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const HareketSayfasi = () => {
  const [malzemeler, setMalzemeler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hareketler, setHareketler] = useState([
    {
      id: 1,
      kod: "MLZ001",
      ad: "Pelet Cevher",
      islem: "GELEN",
      miktar: 150,
      depo: "A SAHASI",
      tarih: "2026-07-09",
    },
    {
      id: 2,
      kod: "MLZ002",
      ad: "Sinter",
      islem: "URETIM",
      miktar: 300,
      depo: "SİNTER DEPO",
      tarih: "2026-07-09",
    },
  ]);
  const [formData, setFormData] = useState({
    malzemeId: "",
    islem: "GELEN",
    miktar: "",
    depo: "ANA DEPO",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const malRes = await api.get("/malzemeler");
      if (malRes.data && malRes.data.length > 0) setMalzemeler(malRes.data);

      const harRes = await api.get("/hareketler");
      if (harRes.data && harRes.data.length > 0) setHareketler(harRes.data);
    } catch (e) {
      setMalzemeler([
        { id: 1, kod: "MLZ001", ad: "Pelet Cevher" },
        { id: 2, kod: "MLZ002", ad: "Sinter" },
        { id: 3, kod: "MLZ003", ad: "Kireç Taşı" },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Veritabanı sütunlarıyla (MLZ_ID, HAREKET_TURU, MIKTAR, OPER vb.) tam eşleme
      await api.post("/hareketler", {
        mlz_id: formData.malzemeId,
        hareket_turu: formData.islem,
        miktar: formData.miktar,
        depo: formData.depo,
        oper: "SYSTEM", // DB: OPER kolonu arka planda otomatik gönderiliyor
      });
      alert("Stok hareketi başarıyla işlendi.");
      setFormData({
        malzemeId: "",
        islem: "GELEN",
        miktar: "",
        depo: "ANA DEPO",
      });
      fetchData();
    } catch (e) {
      alert("Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-container" style={{ maxWidth: "980px" }}>
      <h2 className="erp-title">Stok Hareket Yönetimi</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-5 p-4 rounded"
        style={{
          backgroundColor: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <h4 className="mb-4 text-white" style={{ fontSize: "0.9rem" }}>
          [+] Yeni Stok Hareketi Tanımla
        </h4>
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <label className="form-label">MALZEME</label>
            <select
              className="form-select"
              value={formData.malzemeId}
              onChange={(e) =>
                setFormData({ ...formData, malzemeId: e.target.value })
              }
              required
            >
              <option value="">Seçiniz...</option>
              {malzemeler.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ad} ({m.kod})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">HAREKET TÜRÜ</label>
            <select
              className="form-select"
              value={formData.islem}
              onChange={(e) =>
                setFormData({ ...formData, islem: e.target.value })
              }
            >
              <option value="GELEN">GELEN (ALINAN)</option>
              <option value="URETIM">ÜRETİM</option>
              <option value="TUKETIM">TÜKETİM</option>
              <option value="SATIS">SATIŞ (ÇIKAN)</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">MİKTAR</label>
            <input
              type="number"
              className="form-control"
              placeholder="Miktar"
              value={formData.miktar}
              onChange={(e) =>
                setFormData({ ...formData, miktar: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">DEPO / LOKASYON</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: B SAHASI"
              value={formData.depo}
              onChange={(e) =>
                setFormData({ ...formData, depo: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="text-end">
          <button type="submit" className="btn" disabled={loading}>
            Hareketi Kaydet
          </button>
        </div>
      </form>


      <h4 className="mb-3 text-white" style={{ fontSize: "0.95rem" }}>
        Son Stok Hareket Logları
      </h4>
      <div className="table-responsive">
        <table className="table table-striped w-100">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>REF</th>
              <th>MALZEME</th>
              <th>HAREKET</th>
              <th>DEPO</th>
              <th>TARİH</th>
              <th className="text-end">MİKTAR</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.map((h, idx) => {
              const isNegative = h.islem === "SATIS" || h.islem === "TUKETIM";
              const prefix = isNegative ? "-" : "+";
              const quantityColor = isNegative
                ? "var(--danger-accent)"
                : "var(--success-accent)";

              return (
                <tr key={h.id || idx}>
                  <td className="font-mono text-muted">#{idx + 1}</td>
                  <td className="fw-semibold text-white">
                    {h.ad} ({h.kod})
                  </td>
                  <td>
                    <span className="badge-erp">{h.islem}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{h.depo}</td>
                  <td className="font-mono text-muted">{h.tarih}</td>
                  <td
                    className="text-end font-mono fw-bold"
                    style={{ color: quantityColor }}
                  >
                    {prefix}
                    {h.miktar} Adet
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HareketSayfasi;
