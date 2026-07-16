import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const MalzemeTanim = () => {
  const [formData, setFormData] = useState({
    kod: "",
    ad: "",
    mensei: "YERLI",
    turId: "",
  });
  
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turler, setTurler] = useState([]);
  const [malzemeler, setMalzemeler] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  
  // Malzeme Detay Sorgulama State'leri
  const [detayKodu, setDetayKodu] = useState("");
  const [detayVeri, setDetayVeri] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Malzeme Detay Getirme Fonksiyonu
  const handleDetayGetir = async () => {
    if (!detayKodu.trim()) {
      toast.error("Lütfen bir malzeme kodu giriniz.");
      return;
    }
    setDetayLoading(true);
    setDetayVeri(null);
    try {
      // Backend'deki doğru adres /api/malzemeler/detay/ şeklindedir
      const res = await api.get(`/malzemeler/detay/${detayKodu.trim()}`);
      if (res.data) {
        setDetayVeri(res.data);
        setIsModalOpen(true);
        toast.success("Detaylar başarıyla getirildi.");
      } else {
        toast.error("Bu koda ait detay bulunamadı.");
      }
    } catch (err) {
      console.error("Detay getirme hatası:", err);
    } finally {
      setDetayLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const turRes = await api.get("/malzemeTurleri");
      if (turRes.data) setTurler(turRes.data);

      const malRes = await api.get("/malzemeler");
      if (malRes.data) setMalzemeler(malRes.data);
    } catch (e) {
      console.error("Veriler çekilirken hata oluştu:", e);
    }
  };

  // Form gönderme (Ekleme / Güncelleme)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // FRONTEND VERİ DOĞRULAMA (DUPLICATE CHECK)
    // Aynı koda veya isme sahip başka bir malzeme var mı kontrolü (Büyük/küçük harf duyarsız)
    //const isDuplicateCode = malzemeler.some(
      //(m) => m.malzemeKodu?.toLowerCase() === formData.kod.trim().toLowerCase() && m.id !== editingId
    //);

    const isDuplicateName = malzemeler.some(
      (m) => m.malzemeAdi?.toLowerCase() === formData.ad.trim().toLowerCase() && m.id !== editingId
    );

    //if (isDuplicateCode) {
      //toast.error("Hata: Bu malzeme kodu sistemde zaten kullanılıyor! Lütfen farklı bir kod giriniz.");
      //return;
    //}

    if (isDuplicateName) {
      toast.error("Hata: Bu malzeme adı sistemde zaten kullanılıyor! Lütfen farklı bir isim giriniz.");
      return;
    }

    setLoading(true);
    
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const activeUser = currentUser?.oper || "SYSTEM";

      const payload = {
        malzemeKodu: formData.kod,
        malzemeAdi: formData.ad,
        malzemeTurId: formData.turId,
        mensei: formData.mensei,
        oper: activeUser,
      };

      if (editingId) {
        await api.put(`/malzemeler/update/${editingId}`, payload);
        toast.success("Malzeme başarıyla güncellendi.");
      } else {
        await api.post("/malzemeler/create", payload);
        toast.success("Malzeme başarıyla eklendi.");
      }
      
      handleCancelEdit();
      fetchData();
    } catch (error) {
      console.error("Kayıt hatası:", error);
      // Hata bildirimi global axiosInstance tarafından yapılıyor
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme moduna geçiş
  const handleEditClick = (m) => {
    setFormData({
      //kod: m.malzemeKodu || "",
      ad: m.malzemeAdi || "",
      mensei: m.mensei || "YERLI",
      turId: m.malzemeTurId || "",
    });
    setEditingId(m.id);
  };

  // Düzenlemeyi iptal etme
  const handleCancelEdit = () => {
    setFormData({ kod: "", ad: "", mensei: "YERLI", turId: "" });
    setEditingId(null);
  };

  // Silme işlemi
  const handleDelete = async (id) => {
    if (!id) {
      toast.error("Geçersiz malzeme ID'si.");
      return;
    }

    if (window.confirm("Bu malzemeyi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/malzemeler/delete/${id}`);
        toast.success("Malzeme başarıyla silindi.");
        fetchData();
      } catch (error) {
        console.error("Silme hatası:", error);
        // Hata bildirimi global axiosInstance tarafından yapılıyor
      }
    }
  };

  const filteredMalzemeler = malzemeler.filter((m) => {
    const aranan = searchQuery.toLowerCase();
    
    // Verilerin boş gelme ihtimaline karşı varsayılan olarak boş metin ("") atıyoruz
    const ad = m.malzemeAdi?.toLowerCase() || "";
    const kod = m.malzemeKodu?.toLowerCase() || "";
    const tur = m.malzemeTurAdi?.toLowerCase() || "";
    const mensei = m.mensei?.toLowerCase() || "";
    
    // Dört farklı alanda arama yapıyoruz
    return ad.includes(aranan) || kod.includes(aranan) || tur.includes(aranan) || mensei.includes(aranan);
  });
  return (
    <div className="erp-container">
      <h2 className="erp-title">Malzeme Tanımlama Ekranı</h2>

      <form
        onSubmit={handleSubmit}
        className="mb-5 p-4 rounded"
        style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}
      >
        <h4 className="mb-4 text-dark" style={{ fontSize: "0.9rem" }}>
          {editingId ? "[-] Malzeme Bilgilerini Güncelle" : "[+] Yeni Malzeme Tanımı"}
        </h4>
        
        <div className="row g-2 mb-3">
          <div className="col-md-3">
            <label className="form-label">MALZEME ADI</label>
            <input
              type="text"
              className="form-control"
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
              onChange={(e) => setFormData({ ...formData, turId: e.target.value })}
              required
            >
              <option value="">Seçiniz...</option>
              {turler.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.malzemeTurAdi ? t.malzemeTurAdi.toUpperCase() : "BİLİNMEYEN TÜR"}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">MENŞEİ</label>
            <select
              className="form-select"
              value={formData.mensei}
              onChange={(e) => setFormData({ ...formData, mensei: e.target.value })}
            >
              <option value="YERLI">Yerli</option>
              <option value="ITHAL">İthal</option>
            </select>
          </div>
        </div>

        <div className="text-end d-flex justify-content-end gap-2">
          {editingId && (
            <button type="button" className="btn btn-secondary-erp" onClick={handleCancelEdit}>
              İptal
            </button>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "İşleniyor..." : (editingId ? "Güncelle" : "Sisteme Kaydet")}
          </button>
        </div>
      </form>

      {/* Malzeme Detay Sorgulama Alanı */}
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <h5 className="mb-3 text-dark" style={{ fontSize: "0.9rem" }}>🔍 Malzeme Detay Sorgulama</h5>
        <div className="d-flex gap-2 align-items-center mb-2" style={{ maxWidth: "400px" }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Malzeme kodu giriniz (Örn: MLZ001)..."
            value={detayKodu}
            onChange={(e) => setDetayKodu(e.target.value)}
          />
          <button 
            type="button" 
            className="btn btn-sm btn-outline-primary text-nowrap" 
            onClick={handleDetayGetir}
            disabled={detayLoading}
          >
            {detayLoading ? "Sorgulanıyor..." : "Detay Getir"}
          </button>
        </div>
        

      </div>

      {/* Arama Kutusu ve Başlık */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <h4 className="mb-0 text-dark" style={{ fontSize: "0.95rem" }}>
          Tanımlı Malzemeler Listesi
        </h4>
        <div style={{ width: "300px" }}>
          Ara:
          <input
            type="text"
            className="form-control form-control-sm mb-0"
            placeholder="Malzeme veya kod ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Scroll Özellikli Tablo */}
      <div 
        className="table-responsive rounded p-1"
        style={{ 
          backgroundColor: "rgba(0,0,0,0.1)", 
          border: "1px solid rgba(255,255,255,0.05)",
          height: "400px",
          overflowY: "scroll" 
        }}
      >
        <table className="table table-striped w-100 m-0">
          <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#1e1e2d" }}>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>KODU</th>
              <th>ADI</th>
              <th>TÜRÜ</th>
              <th>MENŞEİ</th>
              <th>OPER SİCİL</th>
              <th>İŞLEM TARİHİ</th>
              <th className="text-end" style={{ minWidth: "140px" }}>İŞLEM</th>
            </tr>
          </thead>
          <tbody>
            {filteredMalzemeler.length > 0 ? (
              filteredMalzemeler.map((m) => (
                <tr key={m.id}>
                  <td className="font-mono text-muted">#{m.id}</td>
                  <td className="font-mono fw-bold text-dark">{m.malzemeKodu}</td>
                  <td className="fw-semibold text-dark">{m.malzemeAdi}</td>
                  <td>
                    <span className="badge-erp">{m.malzemeTurAdi || "-"}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.mensei}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.oper || "-"}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {m.updatedAt ? new Date(m.updatedAt).toLocaleString("tr-TR") : "-"}
                  </td>
                  <td className="text-end text-nowrap d-flex justify-content-end gap-2">
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline-info py-0 px-2" 
                      style={{ width: "95px" }}
                      onClick={() => handleEditClick(m)}
                    >
                      Düzenle
                    </button>
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline-danger py-0 px-2" 
                      style={{ width: "95px" }}
                      onClick={() => handleDelete(m.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  Arama kriterine uygun malzeme bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detay Modal'ı */}
      {isModalOpen && detayVeri && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#fff", padding: "24px", borderRadius: "12px",
            width: "90%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="mb-0 text-primary fw-bold">
                📦 Malzeme Detayları
              </h5>
              <button 
                type="button"
                className="btn-close" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Kapat"
              ></button>
            </div>
            
            <div className="text-dark">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-semibold">Malzeme Kodu:</span>
                <span className="fw-bold text-primary">{detayVeri.malzemeKodu || "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-semibold">Malzeme Adı:</span>
                <span className="fw-bold">{detayVeri.malzemeAdi || "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-semibold">Türü:</span>
                <span className="badge bg-secondary text-white">{detayVeri.malzemeTurAdi || "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-semibold">Menşei:</span>
                <span className="fw-bold">{detayVeri.mensei || "-"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted fw-semibold">Mevcut Stok:</span>
                <span className="fw-bold text-success fs-5">{detayVeri.mevcutMiktar || 0}</span>
              </div>

              {/* Hareketler Listesi */}
              {detayVeri.hareketler && detayVeri.hareketler.length > 0 ? (
                <div className="mt-3">
                  <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: "0.9rem" }}>Geçmiş Hareketler:</h6>
                  <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "6px" }}>
                    <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: "0.85rem" }}>
                      <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th>Tarih</th>
                          <th>Tür</th>
                          <th className="text-end">Miktar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detayVeri.hareketler.map((h, i) => (
                          <tr key={i}>
                            <td>{new Date(h.hareketTarihi).toLocaleDateString("tr-TR")}</td>
                            <td>
                              <span className={`badge ${h.hareketTuru === 'GELEN' || h.hareketTuru === 'URETIM' ? 'bg-success' : 'bg-danger'}`}>
                                {h.hareketTuru}
                              </span>
                            </td>
                            <td className="text-end fw-bold">{h.miktar}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="alert alert-secondary py-2 mt-3 mb-0 text-center" style={{ fontSize: "0.85rem" }}>
                  Bu malzemeye ait henüz bir hareket bulunmuyor.
                </div>
              )}
              
              <hr className="my-3" />
              <div className="small text-muted bg-light p-2 rounded">
                <div className="mb-1">
                  <strong>İşlem Tarihi:</strong> {detayVeri.updatedAt ? new Date(detayVeri.updatedAt).toLocaleString("tr-TR") : "-"}
                </div>
                <div>
                  <strong>Operatör (Kullanıcı):</strong> {detayVeri.oper || "-"}
                </div>
              </div>
            </div>
            
            <div className="text-end mt-4">
              <button 
                type="button" 
                className="btn btn-secondary px-4" 
                onClick={() => setIsModalOpen(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MalzemeTanim;