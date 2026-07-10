import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // FastAPI adresi
  timeout: 1000, // EĞER BACKEND 1 SANİYE İÇİNDE CEVAP VERMEZSE BEKLEMEYİ BIRAK (Performans için kritik)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
