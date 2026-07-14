import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const TurTanim = () => {
  // Form ve Veri Durumları (States)
  const [tur, setTur] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [turler, setTurler] = useState([]);
  
  // Arama Durumu
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTurler();
  }, []);

  const fetchTurler = async () => {
    try {
      const res = await api.get("/malzemeTurleri");
      if (res.data && res.data.length > 0) {
        setTurler(res.data);
      } else {
        setTurler([]);
      }
    } catch (e) {
      console.warn("Türler çekilirken hata oluştu:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tur.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/malzemeTurleri/update/${editingId}`, {
          malzemeTurAdi: tur,
          oper: "SYSTEM",
        });
        toast.success("Tür başarıyla güncellendi.");
      } else {
        await api.post("/malzemeTurleri/create", {
          malzemeTurAdi: tur,
          oper: "SYSTEM",
        });
        toast.success("Yeni tür başarıyla kaydedildi.");
      }
      handleCancelEdit();
      fetchTurler();
    } catch (error) {
      // Hata bildirimi global axiosInstance tarafından yapılıyor
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setTur(item.malzemeTurAdi);
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setTur("");
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu türü silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/malzemeTurleri/delete/${id}`);
        toast.success("Tür silindi.");
        fetchTurler();
      } catch (error) {
        // Hata bildirimi global axiosInstance tarafından yapılıyor
      }
    }
  };

  // İsdemir Üretim Akış Detayları
  const FLOW_DETAILS = {
    cevher: { nelerYapilir: "Cevher, yüksek sıcaklıkta kok kömürü ve sinter ile reaksiyona sokularak ergimiş Sıvı Demir haline getirilir.", neredenBulunur: "Yerli kaynaklar ve ithal pelet cevherler harmanlanır." },
    kömür: { nelerYapilir: "Koklaşabilir kömürler kok bataryalarında havasız ortamda pişirilerek Kok Kömürü üretilir.", neredenBulunur: "Zonguldak taş kömürü havzası ve ithal kömürlerle karıştırılır." },
    sinter: { nelerYapilir: "Toz cevherler, kireçtaşı ve kok tozuyla harmanlanıp pişirilerek gözenekli sinter keki haline getirilir.", neredenBulunur: "İsdemir bünyesinde yer alan Sinter Tesislerinde üretilir." },
    toz: { nelerYapilir: "Demir ve çinko tozları toplanarak briket haline getirilir ve sinterleme sürecine geri beslenir.", neredenBulunur: "Baca gazı temizleme tesisleri ve toz toplama sistemlerinden sağlanır." }
  };

  const getIsdemirFlowDetails = (turAdi) => {
    if (!turAdi) return { nelerYapilir: "", neredenBulunur: "" };
    const matchedKey = Object.keys(FLOW_DETAILS).find(key => turAdi.toLowerCase().includes(key));
    return FLOW_DETAILS[matchedKey] || {
      nelerYapilir: "İkincil hammadde veya yardımcı malzeme olarak değerlendirilir.",
      neredenBulunur: "Tesis içi stok sahalarından veya yerli tedarikçilerden sağlanır."
    };
  };

  // Arama Filtresi (Büyük/Küçük harf duyarsız)
  const filteredTurler = turler.filter((t) =>
    t.malzemeTurAdi && t.malzemeTurAdi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="erp-container" style={{ maxWidth: "950px" }}>
      <h2 className="erp-title">Malzeme Tür Tanımlama</h2>

      <div className="row g-4">
        {/* SOL KOLON: Form Alanı */}
        <div className="col-md-5 border-end border-secondary pe-4" style={{ borderColor: "rgba(255,255,255,0.08) !important" }}>
          <h4 className="mb-4 text-white" style={{ fontSize: "0.95rem" }}>
            {editingId ? "[-] Tür Tanımını Güncelle" : "[+] Yeni Tür Tanımı"}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Tür Adı</label>
              <input
                type="text"
                className="form-control"
                placeholder="Örn: SİNTER, KÖMÜR"
                value={tur}
                onChange={(e) => setTur(e.target.value)}
                required
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn w-100" disabled={loading}>
                {loading ? "İşleniyor..." : (editingId ? "Güncelle" : "Tür Tanımını Ekle")}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary-erp" onClick={handleCancelEdit}>
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SAĞ KOLON: Arama ve Liste Alanı */}
        <div className="col-md-7 ps-4">
          <h4 className="mb-3 text-white" style={{ fontSize: "0.95rem" }}>
            Türler ve Akış Detayları
          </h4>

          {/* Akıllı Arama Kutusu */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control mb-0"
              placeholder="Türlerde ara... (Örn: Sinter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Sıkı sınırları olan, zorunlu scroll (kaydırma) bloğu */}
          <div 
            className="rounded p-2" 
            style={{ 
              backgroundColor: "rgba(0,0,0,0.1)", 
              border: "1px solid rgba(255,255,255,0.05)",
              height: "450px", 
              overflowY: "scroll" 
            }}
          >
            {filteredTurler.length > 0 ? (
              <ul className="list-unstyled m-0 d-flex flex-column gap-2">
                {filteredTurler.map((t) => {
                  const details = getIsdemirFlowDetails(t.malzemeTurAdi);
                  // Akordeon kontrolünü doğrudan t.id ile yapıyoruz
                  const isExpanded = expandedIdx === t.id;
                  
                  return (
                    <li key={t.id} className="rounded" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div 
                        className="p-3 d-flex justify-content-between align-items-center cursor-pointer" 
                        onClick={() => setExpandedIdx(expandedIdx === t.id ? null : t.id)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge-erp">{t.malzemeTurAdi ? t.malzemeTurAdi.toUpperCase() : "BİLİNMİYOR"}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted me-2" style={{ fontSize: "0.8rem" }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                          <button type="button" className="btn btn-sm btn-outline-info py-0 px-2" onClick={(e) => { e.stopPropagation(); handleEditClick(t); }}>Düzenle</button>
                          <button type="button" className="btn btn-sm btn-outline-danger py-0 px-2" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>Sil</button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 border-top border-secondary animate-fade-in" style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: "rgba(255,255,255,0.05) !important" }}>
                          <div className="mb-2">
                            <strong className="text-white d-block mb-1" style={{ fontSize: "0.75rem" }}>İSDEMİR'DE NELER ÜRETİLİR / NE İŞE YARAR?</strong>
                            <p className="m-0" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{details.nelerYapilir}</p>
                          </div>
                          <div>
                            <strong className="text-white d-block mb-1" style={{ fontSize: "0.75rem" }}>NEREDEN VE NASIL TEMİN EDİLİR?</strong>
                            <p className="m-0" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{details.neredenBulunur}</p>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center p-4 text-muted" style={{ fontSize: "0.9rem" }}>
                Arama kriterine uygun malzeme türü bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurTanim;