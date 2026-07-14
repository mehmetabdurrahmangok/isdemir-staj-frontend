import axios from "axios";
import toast from "react-hot-toast"; // Yüklediğimiz bildirim kütüphanesi

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 5000, 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Backend'den formatlı ApiError nesnemiz döndüyse:
    if (error.response && error.response.data) {
        const errorData = error.response.data;
        const status = error.response.status;

        if (status === 400 && errorData.details) {
            // Validasyon hataları geldiyse (Birden fazla hata olabilir)
            errorData.details.forEach(detay => {
                 toast.error(detay); // Her bir validasyon hatasını ayrı bildirim göster
            });
        } 
        else if (status === 401) {
            toast.error("Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.");
            // İsterseniz burada localStorage.removeItem("user") ve window.location.href = "/login" yapabilirsiniz.
        }
        else if (status === 403) {
            toast.error("Bu işlemi yapmaya yetkiniz bulunmuyor!");
        }
        else if (status === 404) {
             toast.error(errorData.message || "Aradığınız kayıt bulunamadı.");
        }
        else {
            // Geriye kalan 500 ve diğer hatalar için genel backend mesajı
            let message = errorData.message || "Beklenmeyen bir sunucu hatası oluştu.";
            // Teknik, İngilizce veya çok uzun SQL/Backend mesajlarını kullanıcıya göstermemek için filtreleme
            if (message.toLowerCase().includes("could not extract resultset") || 
                message.includes("SQL") || 
                message.includes("Exception") || 
                message.length > 100) {
                 message = "İşlem sırasında sunucu kaynaklı teknik bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.";
            }
            toast.error(message);
        }
    } else {
        // Sunucu tamamen kapalıysa veya ağ hatası (Network Error) ise
        toast.error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
    }

    return Promise.reject(error);
  }
);

export default api;