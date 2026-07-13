import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const HareketSayfasi = () => {
  const [malzemeler, setMalzemeler] = useState([]);
  const [hareketler, setHareketler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    malzemeId: "",
    islem: "GELEN",
    miktar: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const malRes = await api.get("/malzemeler");
      if (malRes.data) setMalzemeler(malRes.data);

      const harRes = await api.get("/malzemeHareketleri");
      if (harRes.data) setHareketler(harRes.data);
    } catch (e) {
      console.error("Veriler çekilirken hata:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        malzemeId: formData.malzemeId,
        hareketTuru: formData.islem,
        miktar: formData.miktar,
        hareketTarihi: new Date().toISOString(),
        oper: "SYSTEM",
      };

      if (editingId) {
        await api.put(`/malzemeHareketleri/update/${editingId}`, payload);
        alert("Stok hareketi başarıyla güncellendi.");
      } else {
        await api.post("/malzemeHareketleri/create", payload);
        alert("Stok hareketi başarıyla işlendi.");
      }
      handleCancelEdit();
      fetchData();
    } catch (e) {
      console.error("Kayıt hatası:", e);
      alert("İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (h) => {
    setFormData({
      malzemeId: h.malzeme?.id || "",
      islem: h.hareketTuru,
      miktar: h.miktar,
    });
    setEditingId(h.id);
  };

  const handleCancelEdit = () => {
    setFormData({ malzemeId: "", islem: "GELEN", miktar: "" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert("Geçersiz hareket ID'si.");
      return;
    }
    
    if (window.confirm("Bu stok hareketini silmek istediğinize emin misiniz? (Bu işlem ana malzemeyi etkilemez)")) {
      try {
        await api.delete(`/malzemeHareketleri/delete/${id}`);
        alert("Hareket başarıyla silindi.");
        fetchData();
      } catch (error) {
        console.error("Silme işlemi hatası:", error);
        alert("Silme işlemi başarısız oldu. Sunucu ile bağlantınızı kontrol edin.");
      }
    }
  };

  return (
    <div className="erp-container" style={{ maxWidth: "980px" }}>
      <h2 className="erp-title">Stok Hareket Yönetimi</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-5 p-4 rounded"
        style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}
      >
        <h4 className="mb-4 text-white" style={{ fontSize: "0.9rem" }}>
          {editingId ? "[-] Stok Hareketini Güncelle" : "[+] Yeni Stok Hareketi Tanımla"}
        </h4>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">MALZEME</label>
            <select
              className="form-select"
              value={formData.malzemeId}
              onChange={(e) => setFormData({ ...formData, malzemeId: e.target.value })}
              required
            >
              <option value="">Seçiniz...</option>
              {malzemeler.map((m) => (
                <option key={m.id} value={m.id}>{m.malzemeAdi} ({m.malzemeKodu})</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">HAREKET TÜRÜ</label>
            <select
              className="form-select"
              value={formData.islem}
              onChange={(e) => setFormData({ ...formData, islem: e.target.value })}
            >
              <option value="GELEN">GELEN (ALINAN)</option>
              <option value="URETIM">ÜRETİM</option>
              <option value="TUKETIM">TÜKETİM</option>
              <option value="SATIS">SATIŞ (ÇIKAN)</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">MİKTAR</label>
            <input
              type="number"
              className="form-control"
              value={formData.miktar}
              onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="text-end d-flex justify-content-end gap-2">
          {editingId && (
            <button type="button" className="btn btn-secondary-erp" onClick={handleCancelEdit}>
              İptal
            </button>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "İşleniyor..." : (editingId ? "Hareketi Güncelle" : "Hareketi Kaydet")}
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
              <th style={{ width: "80px" }}>ID</th>
              <th>MALZEME</th>
              <th>HAREKET</th>
              <th>TARİH</th>
              <th className="text-end">MİKTAR</th>
              <th className="text-end">İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.length > 0 ? (
              hareketler.map((h) => {
                const isNegative = h.hareketTuru === "SATIS" || h.hareketTuru === "TUKETIM";
                const prefix = isNegative ? "-" : "+";
                const quantityColor = isNegative ? "var(--danger-accent)" : "var(--success-accent)";
                const tarihFormatli = new Date(h.hareketTarihi).toLocaleString("tr-TR");

                return (
                  <tr key={h.id}>
                    <td className="font-mono text-muted">#{h.id}</td>
                    <td className="fw-semibold text-white">
                      {h.malzeme?.malzemeAdi} ({h.malzeme?.malzemeKodu})
                    </td>
                    <td><span className="badge-erp">{h.hareketTuru}</span></td>
                    <td className="font-mono text-muted">{tarihFormatli}</td>
                    <td className="text-end font-mono fw-bold" style={{ color: quantityColor }}>
                      {prefix}{h.miktar}
                    </td>
                    <td className="text-end">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-info me-2 py-0 px-2" 
                        onClick={() => handleEditClick(h)}
                      >
                        Düzenle
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger py-0 px-2" 
                        onClick={() => handleDelete(h.id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="text-center text-muted py-4">Kayıtlı hareket bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HareketSayfasi;