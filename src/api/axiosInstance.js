import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot adresi
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. İSTEK YAKALAYICI (Request Interceptor)
// Giden her isteğin başlığına (Authorization) otomatik olarak Token ekler
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.accessToken) {
        config.headers["Authorization"] = `Bearer ${user.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. YANIT YAKALAYICI (Response Interceptor)
// Sunucudan dönen hata durumlarını (401 ve 403) yönetir
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Erişim Yetkisi Yok (401) ise ve token yenileme denenmemişse
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);

          // Arka planda Refresh Token kullanarak yeni Access Token talep et
          const refreshResponse = await axios.post(
            "http://localhost:8080/api/users/refresh",
            {
              refreshToken: user.refreshToken,
            },
          );

          if (refreshResponse.data && refreshResponse.data.accessToken) {
            // Yeni tokenları hafızaya kaydet
            user.accessToken = refreshResponse.data.accessToken;
            user.refreshToken = refreshResponse.data.refreshToken;
            localStorage.setItem("user", JSON.stringify(user));

            // Başarısız olan asıl isteğe yeni tokenı ekleyip tekrar gönder
            originalRequest.headers["Authorization"] =
              `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token da geçersizse (örn: 1 saati dolduysa) oturumu kapat
        localStorage.removeItem("user");
        toast.error("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }

    // Yetki Yetersizliği Hatası (403 Forbidden)
    if (error.response && error.response.status === 403) {
      toast.error("Bu işlem için yetkiniz bulunmamaktadır!");
    }

    return Promise.reject(error);
  },
);

export default api;
