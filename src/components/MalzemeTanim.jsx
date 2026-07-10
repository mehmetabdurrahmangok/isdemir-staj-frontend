import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const MalzemeTanim = () => {
  const [formData, setFormData] = useState({
    kod: "",
    ad: "",
    mensei: "Yerli",
    turId: "",
  });
  const [loading, setLoading] = useState(false);
  const [turler, setTurler] = useState([
    { id: 1, tur: "Cevher" },
    { id: 2, tur: "Ara Ürün" },
    { id: 3, tur: "Katkı" },
  ]);
  const [malzemeler, setMalzemeler] = useState([
    {
      id: 1,
      kod: "MLZ001",
      ad: "Pelet Cevher",
      tur: "Cevher",
      mensei: "Yerli",
    },
    { id: 2, kod: "MLZ002", ad: "Sinter", tur: "Ara Ürün", mensei: "İthal" },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const turRes = await api.get("/turler");
      if (turRes.data && turRes.data.length > 0) setTurler(turRes.data);

      const malRes = await api.get("/malzemeler");
      if (malRes.data && malRes.data.length > 0) setMalzemeler(malRes.data);
    } catch (e) {
      console.warn("Çevrimdışı mod aktif.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/malzemeler", {
        malzeme_kodu: formData.kod,
        malzeme_adi: formData.ad,
        mensei: formData.mensei,
        malzeme_tur_id: formData.turId,
        oper: "SYSTEM", // DB: OPER kolonu arka planda otomatik gönderiliyor
      });
      alert("Malzeme başarıyla kaydedildi.");
      setFormData({ kod: "", ad: "", mensei: "Yerli", turId: "" });
      fetchData();
    } catch (error) {
      alert("Kayıt başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="erp-container" style={{ maxWidth: "980px" }}>
      <h2 className="erp-title">Malzeme Tanımlama Ekranı</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-5 p-4 rounded"
        style={{
          backgroundColor: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <h4 className="mb-4 text-white" style={{ fontSize: "0.9rem" }}>
          [+] Yeni Malzeme Tanımı (DB: MALZEME_TANIM_TBL)
        </h4>
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <label className="form-label">KOD</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: MLZ001"
              value={formData.kod}
              onChange={(e) =>
                setFormData({ ...formData, kod: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">MALZEME ADI</label>
            <input
              type="text"
              className="form-control"
              placeholder="Örn: PELET CEVHER"
              value={formData.ad}
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">MALZEME TÜRÜ</label>
            <select
              className="form-select"
              value={formData.turId}
              onChange={(e) =>
                setFormData({ ...formData, turId: e.target.value })
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
            <label className="form-label">MENŞEİ</label>
            <select
              className="form-select"
              value={formData.mensei}
              onChange={(e) =>
                setFormData({ ...formData, mensei: e.target.value })
              }
            >
              <option value="Yerli">Yerli</option>
              <option value="İthal">İthal</option>
            </select>
          </div>
        </div>
        <div className="text-end">
          <button type="submit" className="btn" disabled={loading}>
            Sisteme Kaydet
          </button>
        </div>

      </form>

      <h4 className="mb-3 text-white" style={{ fontSize: "0.95rem" }}>
        Tanımlı Malzemeler Listesi
      </h4>
      <div className="table-responsive">
        <table className="table table-striped w-100">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>REF</th>
              <th>MALZEME KODU</th>
              <th>MALZEME ADI</th>
              <th>TÜRÜ</th>
              <th>MENŞEİ</th>
            </tr>
          </thead>
          <tbody>
            {malzemeler.map((m, idx) => (
              <tr key={m.id || idx}>
                <td className="font-mono text-muted">#{idx + 1}</td>
                <td className="font-mono fw-bold text-white">{m.kod}</td>
                <td className="fw-semibold text-white">{m.ad}</td>
                <td>
                  <span className="badge-erp">{m.tur}</span>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{m.mensei}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MalzemeTanim;
