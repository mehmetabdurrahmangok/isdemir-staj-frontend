import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Spring Boot varsayılan adresi ve api prefix'i
  timeout: 5000, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;