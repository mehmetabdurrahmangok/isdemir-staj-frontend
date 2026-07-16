import React, { useState } from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const PoiRaporSayfasi = () => {
  // Varsayılan tarihleri ayarla (Son 7 gün)
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const defaultEndDate = new Date().toISOString().slice(0, 16);

  const [hareketTuru, setHareketTuru] = useState("GELEN");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  // 1. Pivot Rapor JSON Verisini Getirme Metodu
  const handleSorgula = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // API bizden ISO formatında LocalDateTime bekliyor (Örn: 2026-07-16T10:00:00)
      const formattedStart = startDate + ":00";
      const formattedEnd = endDate + ":00";

      const response = await api.get("/reports/pivot", {
        params: {
          hareketTuru: hareketTuru,
          startDate: formattedStart,
          endDate: formattedEnd,
        },
      });

      if (response.data) {
        setReportData(response.data);
        toast.success("Rapor başarıyla güncellendi.");
      }
    } catch (error) {
      console.error("Pivot veri çekme hatası:", error);
      toast.error("Rapor verileri çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Apache POI Excel Dosyasını İndirme Metodu
  const handleExcelIndir = async () => {
    setExcelLoading(true);
    try {
      const formattedStart = startDate + ":00";
      const formattedEnd = endDate + ":00";

      const response = await api.get("/reports/pivot/excel", {
        params: {
          hareketTuru: hareketTuru,
          startDate: formattedStart,
          endDate: formattedEnd,
        },
        responseType: "blob", // Gelen binary dosyasını okumak için kritik!
      });

      // İndirme işlemi
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Isdemir_Pivot_Raporu_${hareketTuru}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Excel Raporu (POI) başarıyla indirildi.");
    } catch (error) {
      console.error("Excel indirme hatası:", error);
      toast.error("Excel dosyası indirilemedi.");
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="erp-container">
      {/* Başlık Paneli */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
        <h2
          className="m-0 text-dark"
          style={{ fontSize: "1.25rem", fontWeight: 700 }}
        >
          ■ APACHE POI DİNAMİK PİVOT RAPORU
        </h2>
      </div>

      {/* Rapor Filtreleme Formu */}
      <form
        onSubmit={handleSorgula}
        className="mb-5 p-4 rounded"
        style={{
          backgroundColor: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label text-dark-50">İŞLEM TÜRÜ</label>
            <select
              className="form-select"
              value={hareketTuru}
              onChange={(e) => setHareketTuru(e.target.value)}
            >
              <option value="GELEN">GELEN (ALINAN)</option>
              <option value="URETIM">ÜRETİM</option>
              <option value="TUKETIM">TÜKETİM</option>
              <option value="SATIS">SATIŞ (ÇIKAN)</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label text-dark-50">BAŞLANGIÇ TARİHİ</label>
            <input
              type="datetime-local"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label text-dark-50">BİTİŞ TARİHİ</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary w-50"
              disabled={loading}
            >
              {loading ? "Sorgulanıyor..." : "🔍 Sorgula"}
            </button>
            <button
              type="button"
              className="btn btn-success w-50"
              onClick={handleExcelIndir}
              disabled={excelLoading || !reportData}
            >
              {excelLoading ? "İndiriliyor..." : "📊 Excel (POI)"}
            </button>
          </div>
        </div>
      </form>

      {/* Pivot Tablo Alanı */}
      {reportData ? (
        <div
          className="table-responsive rounded p-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.05)",
            maxHeight: "450px",
            overflowY: "auto",
          }}
        >
          <table className="table table-hover w-100 m-0">
            <thead
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                backgroundColor: "#121214",
              }}
            >
              <tr>
                <th style={{ color: "#a1a1aa", textAlign: "left" }}>TARİH</th>
                {reportData.columns.map((col, idx) => (
                  <th
                    key={idx}
                    style={{
                      color: "#a1a1aa",
                      textAlign: "right",
                    }}
                  >
                    {col.headerName.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.rows.length > 0 ? (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {/* İlk sütun tarih verisi */}
                    <td className="font-mono text-dark fw-semibold">
                      {row.tarih}
                    </td>
                    {/* slice(1) kaldırıldı: Dinamik malzeme türü değerleri */}
                    {reportData.columns.map((col, cIdx) => (
                      <td key={cIdx} className="text-end font-mono text-dark">
                        {row.values[col.headerName] !== undefined
                          ? row.values[col.headerName]
                          : 0}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={reportData.columns.length + 1}
                    className="text-center py-4 text-muted"
                  >
                    Bu tarih aralığına uygun kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Alt Toplam Satırı */}
            {reportData.rows.length > 0 && (
              <tfoot
                style={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#1e1e2d",
                }}
              >
                <tr
                  className="fw-bold"
                  style={{ borderTop: "2px solid rgba(255,255,255,0.1)" }}
                >
                  <td className="text-dark">GENEL TOPLAM</td>
                  {reportData.columns.map((col, cIdx) => (
                    <td key={cIdx} className="text-end font-mono text-success">
                      {reportData.rowTotal[col.headerName] !== undefined
                        ? reportData.rowTotal[col.headerName]
                        : 0}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <div className="text-center py-5 text-secondary border border-secondary border-dashed rounded">
          Raporu görüntülemek ve Excel çıktısı almak için yukarıdan kriterleri
          belirleyip "Sorgula" butonuna basın.
        </div>
      )}
    </div>
  );
};

export default PoiRaporSayfasi;
