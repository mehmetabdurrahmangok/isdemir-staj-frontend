import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";

const TurTanim = () => {
  const [tur, setTur] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null); // Akordeon kontrolü

  const [turler, setTurler] = useState([
    {
      id: 1,
      tur: "Cevher",
      uretilen: "Sıvı Ham Demir",
      tesis: "Yüksek Fırınlar (Blast Furnace)",
      kaynak:
        "Yerli Sivas-Divriği & Malatya-Hekimhan madenleri ve Brezilya/Avustralya ithalatı.",
    },
    {
      id: 2,
      tur: "Kömür",
      uretilen: "Metalürjik Kok Kömürü",
      tesis: "Kok Bataryaları",
      kaynak:
        "Zonguldak yerli taş kömürü havzası ve Kolombiya/Avustralya ithal koklaşabilir kömürleri.",
    },
    {
      id: 3,
      tur: "Sinter",
      uretilen: "Yüksek Fırın Şarj Malzemesi",
      tesis: "Sinterleme Tesisi",
      kaynak:
        "İsdemir Sinter Fabrikasında demir cevheri tozları ve kireçtaşının pişirilmesiyle tesis içi üretilir.",
    },
    {
      id: 4,
      tur: "Toz",
      uretilen: "Geri Kazanılmış Hammadde / Briket",
      tesis: "Toz Tutma ve Geri Kazanım",
      kaynak:
        "Haddehane ve fırın baca filtre sistemlerinden geri dönüştürülür.",
    },
  ]);

  useEffect(() => {
    fetchTurler();
  }, []);

  const fetchTurler = async () => {
    try {
      const res = await api.get("/turler");
      if (res.data && res.data.length > 0) {
        setTurler(res.data);
      }
    } catch (e) {
      console.warn("Mock tür bilgileri aktif.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tur.trim()) return;
    setLoading(true);
    try {
      // Veritabanının beklediği şemaya uygun gönderim (MALZEME_TURU ve OPER)
      await api.post("/turler", {
        malzeme_turu: tur,
        oper: "SYSTEM", // DB: OPER kolonu arka planda otomatik gönderiliyor
      });
      alert("Yeni tür başarıyla kaydedildi.");
      setTur("");
      fetchTurler();
    } catch (error) {
      alert("Kayıt başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  // İsdemir üretim akış detayları sözlüğü
  const FLOW_DETAILS = {
    cevher: {
      nelerYapilir: "Cevher, yüksek sıcaklıkta kok kömürü ve sinter ile reaksiyona sokularak ergimiş Sıvı Demir (Pik Demir) haline getirilir. Bu sıvı demir daha sonra Çelikhanede çeliğe dönüştürülür.",
      neredenBulunur: "Yerli kaynak olarak Sivas (Divriği) ve Malatya (Hekimhan) maden sahalarından tren yollarıyla taşınır. Yüksek fırın kalitesini dengelemek için Brezilya ve Avustralya'dan gemilerle limana getirilen ithal pelet cevherler de harmanlanır."
    },
    kömür: {
      nelerYapilir: "Fırınlarda doğrudan kömür yakılamayacağı için, koklaşabilir kömürler kok bataryalarında 1000°C'de havasız ortamda pişirilerek gözenekli ve yüksek mukavemetli Kok Kömürü üretilir. Fırının hem yakıtı hem de indirgeyici maddesidir.",
      neredenBulunur: "Zonguldak taş kömürü havzasından tedarik edilir. Koklaşma kalitesini artırmak amacıyla çoğunlukla Avustralya, ABD ve Kolombiya'dan ithal edilen metalürjik kömürlerle karıştırılarak kullanılır."
    },
    sinter: {
      nelerYapilir: "Fırın içerisinde gaz geçirgenliğini artırmak için çok ince toz cevherler doğrudan fırına atılamaz. Sinter tesisinde toz cevherler, kireçtaşı ve kok tozuyla harmanlanıp pişirilerek fırına uygun gözenekli sinter keki haline getirilir.",
      neredenBulunur: "İsdemir bünyesinde yer alan 1. ve 2. Sinter Tesislerinde (tesis içi) kesintisiz olarak üretilir."
    },
    toz: {
      nelerYapilir: "Çelik üretimi esnasında baca gazı filtrelerinde biriken demir ve çinko tozları toplanarak briket haline getirilir ve sinterleme sürecine geri beslenerek hammadde kaybı önlenir.",
      neredenBulunur: "Yüksek Fırın baca gazı temizleme tesisleri ve Çelikhane ikincil toz toplama sistemlerinden (tesis içi geri kazanım) sağlanır."
    }
  };

  const getIsdemirFlowDetails = (turAdi) => {
    const matchedKey = Object.keys(FLOW_DETAILS).find(key => turAdi.toLowerCase().includes(key));
    return FLOW_DETAILS[matchedKey] || {
      nelerYapilir: "İsdemir fabrikası genelinde ikincil haddehane girdisi veya refrakter malzemesi olarak değerlendirilir.",
      neredenBulunur: "Tesis içi stok sahalarından veya yerli tedarikçilerden sağlanır."
    };
  };

  const toggleAccordion = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="erp-container" style={{ maxWidth: "950px" }}>
      <h2 className="erp-title">Malzeme Tür Tanımlama</h2>

      <div className="row g-4">
        {/* Sol Kolon - Veritabanı Uyumlu Form */}
        <div
          className="col-md-5 border-end border-secondary pe-4"
          style={{ borderColor: "rgba(255,255,255,0.08) !important" }}
        >
          <h4 className="mb-4 text-white" style={{ fontSize: "0.95rem" }}>
            [+] Yeni Tür Tanımı (DB: MALZEME_TUR_TANIM_TBL)
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
            <button type="submit" className="btn w-100" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Tür Tanımını Ekle"}
            </button>
          </form>

        </div>

        {/* Sağ Kolon - Tıklanınca Açılan Akordeon Liste */}
        <div className="col-md-7 ps-4">
          <h4 className="mb-4 text-white" style={{ fontSize: "0.95rem" }}>
            Türler ve İsdemir Akış Detayları (Tıklayarak Açın)
          </h4>

          <div className="d-flex flex-column gap-3">
            {turler.map((t, idx) => {
              const details = getIsdemirFlowDetails(t.tur);
              const isExpanded = expandedIdx === idx;

              return (
                <div
                  key={idx}
                  className="rounded"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    overflow: "hidden",
                  }}
                >
                  {/* Akordeon Başlık Kısmı */}
                  <div
                    className="p-3 d-flex justify-content-between align-items-center cursor-pointer"
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleAccordion(idx)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge-erp">{t.tur.toUpperCase()}</span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {t.tesis || "İsdemir Birimi"}
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {isExpanded ? "▲ Kapat" : "▼ Detaylar"}
                    </span>
                  </div>

                  {/* Akordeon Detay Alanı (Animasyonlu ve Açılır) */}
                  {isExpanded && (
                    <div
                      className="p-3 border-top border-secondary animate-fade-in"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.15)",
                        borderColor: "rgba(255,255,255,0.05) !important",
                      }}
                    >
                      <div className="mb-3">
                        <strong
                          className="text-white d-block mb-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          İSDEMİR'DE NELER ÜRETİLİR / NE İŞE YARAR?
                        </strong>
                        <p
                          className="m-0"
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.4",
                          }}
                        >
                          {details.nelerYapilir}
                        </p>
                      </div>
                      <div>
                        <strong
                          className="text-white d-block mb-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          NEREDEN VE NASIL TEMİN EDİLİR?
                        </strong>
                        <p
                          className="m-0"
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            lineHeight: "1.4",
                          }}
                        >
                          {t.kaynak || details.neredenBulunur}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurTanim;
