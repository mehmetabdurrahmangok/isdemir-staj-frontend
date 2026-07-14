import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Kayıt modu açık/kapalı
  const [username, setUsername] = useState("");
  const [adSoyad, setAdSoyad] = useState(""); // Kayıt için ad soyad
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Şifre doğrulama
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Sanal kullanıcı veritabanını tarayıcıda ilklendir
  useEffect(() => {
    const users = localStorage.getItem("usersList");
    if (!users) {
      // Varsayılan yöneticiyi listeye ekliyoruz
      const initialUsers = [
        {
          id: 1,
          username: "admin",
          password: "123",
          adSoyad: "İSDEMİR Yöneticisi",
          rol: "ADMIN",
        },
      ];
      localStorage.setItem("usersList", JSON.stringify(initialUsers));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend'deki giriş endpoint'ine istek at
      const response = await api.post("/users/login", {
        email: username,
        password: password,
      });

      if (response.data) {
        // Gelen kullanıcı bilgilerini ve tokenları tarayıcı hafızasına yaz
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Giriş yapılırken sunucu bağlantı hatası oluştu!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle uyuşmuyor!");
      return;
    }

    setLoading(true);

    try {
      // Backend'deki kayıt olma endpoint'ine istek at
      const response = await api.post("/users/register", {
        email: username,
        password: password,
        adSoyad: adSoyad,
        oper: "USER", // Kayıt olanlar varsayılan USER rolünde olur
      });

      if (response.data) {
        setSuccess(
          "Kayıt işleminiz başarıyla tamamlandı! Giriş yapabilirsiniz.",
        );
        setIsRegistering(false); // Giriş ekranına geri yönlendir
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Kayıt işlemi sırasında bir hata oluştu veya bu e-posta zaten kullanımda!",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setAdSoyad("");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "80vh",
        backgroundColor: "transparent",
      }}
    >
      <div
        className="card p-5 shadow-lg border-secondary text-white"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(30, 30, 45, 0.65)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo ve Başlık */}
        <div className="text-center mb-4">
          <h2
            className="fw-black m-0"
            style={{ fontSize: "1.8rem", letterSpacing: "1px" }}
          >
            ■ NEURAL.STOK
          </h2>
          <p
            className="text-muted mt-2"
            style={{ fontSize: "0.8rem", textTransform: "uppercase" }}
          >
            {isRegistering ? "Yeni Kayıt Oluştur" : "Envanter Yönetim Portalı"}
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div
            className="alert alert-danger py-2 text-center"
            style={{
              fontSize: "0.8rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#f87171",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Başarı Mesajı */}
        {success && (
          <div
            className="alert alert-success py-2 text-center"
            style={{
              fontSize: "0.8rem",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              borderColor: "rgba(16, 185, 129, 0.3)",
              color: "#34d399",
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* FORMLAR */}
        {!isRegistering ? (
          /* GİRİŞ FORMU */
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                KULLANICI ADI
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                ŞİFRE
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading}
              style={{ height: "42px", fontWeight: 700, fontSize: "0.9rem" }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  GİRİŞ YAPILIYOR...
                </>
              ) : (
                "SİSTEME GİRİŞ YAP"
              )}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={toggleMode}
                className="btn btn-link text-white-50 p-0 border-0 bg-transparent text-decoration-none"
                style={{ fontSize: "0.8rem", fontWeight: 500 }}
              >
                Hesabınız yok mu?{" "}
                <span className="text-success fw-bold">Kayıt Olun</span>
              </button>
            </div>
          </form>
        ) : (
          /* KAYIT FORMU */
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                KULLANICI ADI
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Kullanıcı adınızı belirleyin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                AD SOYAD
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Adınızı ve soyadınızı yazın"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                ŞİFRE
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Şifrenizi yazın"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <div className="mb-4">
              <label
                className="form-label text-white-50"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                ŞİFRE TEKRARI
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Şifrenizi tekrar yazın"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading}
              style={{ height: "42px", fontWeight: 700, fontSize: "0.9rem" }}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  KAYIT YAPILIYOR...
                </>
              ) : (
                "HESABI OLUŞTUR VE KAYDOL"
              )}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={toggleMode}
                className="btn btn-link text-white-50 p-0 border-0 bg-transparent text-decoration-none"
                style={{ fontSize: "0.8rem", fontWeight: 500 }}
              >
                Zaten hesabınız var mı?{" "}
                <span className="text-success fw-bold">Giriş Yapın</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
