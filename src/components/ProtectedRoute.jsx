/*import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Tarayıcı hafızasında (localStorage) kayıtlı bir kullanıcı var mı kontrol et
  const user = localStorage.getItem("user");

  if (!user) {
    // Eğer giriş yapılmamışsa, kullanıcıyı doğrudan giriş ekranına (/login) yönlendir
    return <Navigate to="/login" replace />;
  }

  // Giriş yapılmışsa, gitmek istediği sayfayı (children) aç
  return children;
};

export default ProtectedRoute;*/


import React from "react";

const ProtectedRoute = ({ children }) => {
  // Giriş kontrolünü tamamen devre dışı bıraktık, sayfayı direkt açıyoruz:
  return children;
};

export default ProtectedRoute;
