import React, { useState, useEffect } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

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

  // Seçilen rapor tarihini ve raporlama yöntemini (Kümülatif vs Günlük) tutan değişkenler
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reportType, setReportType] = useState("cumulative");
  const [filterSearchInReport, setFilterSearchInReport] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("tarih-azalan");

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

    // Negatif veya sıfır değer girilmesini engelle
    if (Number(formData.miktar) <= 0) {
      toast.error("Hata: Miktar 0 veya negatif olamaz! Lütfen geçerli bir miktar giriniz.");
      return;
    }

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
        toast.success("Stok hareketi başarıyla güncellendi.");
      } else {
        await api.post("/malzemeHareketleri/create", payload);
        toast.success("Stok hareketi başarıyla işlendi.");
      }
      handleCancelEdit();
      fetchData();
    } catch (e) {
      console.error("Kayıt hatası:", e);
      // Hata bildirimi global axiosInstance tarafından yapılıyor
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
      toast.error("Geçersiz hareket ID'si.");
      return;
    }

    if (
      window.confirm(
        "Bu stok hareketini silmek istediğinize emin misiniz? (Bu işlem ana malzemeyi etkilemez)",
      )
    ) {
      try {
        await api.delete(`/malzemeHareketleri/delete/${id}`);
        toast.success("Hareket başarıyla silindi.");
        fetchData();
      } catch (error) {
        console.error("Silme işlemi hatası:", error);
        // Hata bildirimi global axiosInstance tarafından yapılıyor
      }
    }
  };

  const handleExcelExport = () => {
    try {
      // 1. Tarih kriterine göre hareket loglarını filtrele
      const filtrelenmisHareketler = hareketler.filter((h) => {
        const hareketTarihStr = h.hareketTarihi.split("T")[0]; // YYYY-MM-DD formatı

        if (reportType === "cumulative") {
          // O güne kadarki tüm hareket kayıtları
          return (
            new Date(h.hareketTarihi) <= new Date(reportDate + "T23:59:59")
          );
        } else {
          // Sadece o gün yapılmış olan hareket kayıtları
          return hareketTarihStr === reportDate;
        }
      });

      // YENİ EKLEME: Sürgü aktifse ve arama kutusunda yazı varsa Excel'i filtrele
      let nihaiHareketler = filtrelenmisHareketler;
      if (filterSearchInReport && searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        nihaiHareketler = filtrelenmisHareketler.filter((h) => {
          const ad = h.malzeme?.malzemeAdi?.toLowerCase() || "";
          const kod = h.malzeme?.malzemeKodu?.toLowerCase() || "";
          const tur = h.hareketTuru?.toLowerCase() || "";
          return (
            ad.includes(searchLower) ||
            kod.includes(searchLower) ||
            tur.includes(searchLower)
          );
        });
      }

      // 2. CSV metnini oluşturma (Sütunlar noktalı virgülle ayrılır)
      let csvContent =
        "Hareket ID;Malzeme Kodu;Malzeme Adi;Islem Turu;Islem Tarihi;Miktar\n";

      nihaiHareketler.forEach((h) => {
        const isNegative =
          h.hareketTuru === "SATIS" || h.hareketTuru === "TUKETIM";
        const miktarDegeri = isNegative ? `-${h.miktar}` : `+${h.miktar}`;
        const tarihFormatli = new Date(h.hareketTarihi).toLocaleString("tr-TR");

        csvContent += `${h.id};${h.malzeme?.malzemeKodu || "-"};${h.malzeme?.malzemeAdi || "-"};${h.hareketTuru};${tarihFormatli};${miktarDegeri}\n`;
      });

      // 3. UTF-8 BOM ile tarayıcıdan indirtme
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dosyaEki =
        reportType === "cumulative" ? "KUMULATIF_LOGLAR" : "GUNLUK_LOGLAR";
      link.setAttribute("download", `Isdemir_${dosyaEki}_${reportDate}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Excel oluşturma hatası:", error);
      toast.error("Excel raporu oluşturulamadı.");
    }
  };

  const filteredHareketler = hareketler.filter((h) => {
    const searchLower = searchQuery.toLowerCase();
    const ad = h.malzeme?.malzemeAdi?.toLowerCase() || "";
    const kod = h.malzeme?.malzemeKodu?.toLowerCase() || "";
    const tur = h.hareketTuru?.toLowerCase() || "";

    return (
      ad.includes(searchLower) ||
      kod.includes(searchLower) ||
      tur.includes(searchLower)
    );
  });

  const sortedHareketler = [...filteredHareketler].sort((a, b) => {
    if (sortOption === "tarih-azalan") {
      return new Date(b.hareketTarihi) - new Date(a.hareketTarihi);
    } else if (sortOption === "tarih-artan") {
      return new Date(a.hareketTarihi) - new Date(b.hareketTarihi);
    } else if (sortOption === "miktar-azalan") {
      return b.miktar - a.miktar;
    } else if (sortOption === "miktar-artan") {
      return a.miktar - b.miktar;
    }
    return 0;
  });

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
          {editingId
            ? "[-] Stok Hareketini Güncelle"
            : "[+] Yeni Stok Hareketi Tanımla"}
        </h4>
        <div className="row g-2 mb-3">
          <div className="col-md-4">
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
                  {m.malzemeAdi} ({m.malzemeKodu})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
            <label className="form-label">MİKTAR</label>
            <input
              type="number"
              className="form-control"
              min="0.01"
              step="any"
              value={formData.miktar}
              onChange={(e) =>
                setFormData({ ...formData, miktar: e.target.value })
              }
              required
            />
          </div>
        </div>
        <div className="text-end d-flex justify-content-end gap-2">
          {editingId && (
            <button
              type="button"
              className="btn btn-secondary-erp"
              onClick={handleCancelEdit}
            >
              İptal
            </button>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading
              ? "İşleniyor..."
              : editingId
                ? "Hareketi Güncelle"
                : "Hareketi Kaydet"}
          </button>
        </div>
      </form>

      {/* 1. EXCEL RAPORLAMA KONTROL PANELİ */}
      <div
        className="row g-3 mb-4 align-items-end border-top border-secondary pt-3"
        style={{ borderColor: "rgba(255,255,255,0.05) !important" }}
      >
        <div className="col-md-3">
          <label className="form-label text-white-50">Log Rapor Türü</label>
          <select
            className="form-select mb-0"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="cumulative">O Güne Kadar (Kümülatif Log)</option>
            <option value="daily">Sadece O Gün (Günlük Log)</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label text-white-50">Rapor Tarihi</label>
          <input
            type="date"
            className="form-control mb-0"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>
        <div
          className="col-md-3 d-flex align-items-center justify-content-center"
          style={{ height: "38px" }}
        >
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="filterSearchCheck"
              checked={filterSearchInReport}
              onChange={(e) => setFilterSearchInReport(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label
              className="form-check-label text-white-50 ms-2"
              htmlFor="filterSearchCheck"
              style={{ fontSize: "0.82rem", cursor: "pointer" }}
            >
              Arama Kriterini Filtrele (
              {searchQuery ? `"${searchQuery}"` : "Tümü"})
            </label>
          </div>
        </div>
        <div className="col-md-3">
          <button
            type="button"
            className="btn btn-outline-success w-100 mb-0 d-flex align-items-center justify-content-center gap-2"
            onClick={handleExcelExport}
            style={{ height: "38px", fontWeight: 600 }}
          >
            📊 Hareket Excelini İndir
          </button>
        </div>
      </div>

      {/* 2. BAŞLIK VE ARAMA PANELİ */}
      <div className="d-flex justify-content-between align-items-end mb-3">
        <h4 className="mb-0 text-white" style={{ fontSize: "0.95rem" }}>
          Son Stok Hareket Logları
        </h4>
        <div className="d-flex gap-2" style={{ width: "450px" }}>
          <select
            className="form-select form-select-sm mb-0"
            style={{ width: "170px" }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="tarih-azalan">Tarih: En Yeni</option>
            <option value="tarih-artan">Tarih: En Eski</option>
            <option value="miktar-azalan">Miktar: En Yüksek</option>
            <option value="miktar-artan">Miktar: En Düşük</option>
          </select>
          Arama:
          <input
            type="text"
            className="form-control form-control-sm mb-0 flex-grow-1"
            placeholder="Malzeme, kod veya işlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div
        className="table-responsive rounded p-1"
        style={{
          backgroundColor: "rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.05)",
          height: "400px",
          overflowY: "scroll",
        }}
      >
        <table className="table table-striped w-100 m-0">
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "#1e1e2d",
            }}
          >
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>MALZEME</th>
              <th>HAREKET</th>
              <th>TARİH</th>
              <th className="text-end">MİKTAR</th>
              <th className="text-end" style={{ minWidth: "140px" }}>
                İŞLEM
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedHareketler.length > 0 ? (
              sortedHareketler.map((h) => {
                const isNegative =
                  h.hareketTuru === "SATIS" || h.hareketTuru === "TUKETIM";
                const prefix = isNegative ? "-" : "+";
                const quantityColor = isNegative
                  ? "var(--danger-accent)"
                  : "var(--success-accent)";
                const tarihFormatli = new Date(h.hareketTarihi).toLocaleString(
                  "tr-TR",
                );

                return (
                  <tr key={h.id}>
                    <td className="font-mono text-muted">#{h.id}</td>
                    <td className="fw-semibold text-white">
                      {h.malzeme?.malzemeAdi} ({h.malzeme?.malzemeKodu})
                    </td>
                    <td>
                      <span className="badge-erp">{h.hareketTuru}</span>
                    </td>
                    <td className="font-mono text-muted">{tarihFormatli}</td>
                    <td
                      className="text-end font-mono fw-bold"
                      style={{ color: quantityColor }}
                    >
                      {prefix}
                      {h.miktar}
                    </td>
                    <td className="text-end text-nowrap d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info py-0 px-2"
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
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  Arama veya sıralama kriterine uygun hareket bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HareketSayfasi;
