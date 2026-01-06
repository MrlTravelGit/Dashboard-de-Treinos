import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";

<<<<<<< HEAD
// Remove service workers antigos e limpa caches (caso PWA tenha sido ativado antes)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});

  if ("caches" in window) {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {});
  }
=======
// Se um Service Worker antigo (PWA) ficou registrado, ele pode quebrar o app em produção.
// Isso remove registros anteriores e evita tela em branco após login.
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => {
      // Alguns SWs deixam cache antigo. Limpar ajuda a evitar assets quebrados.
      if ("caches" in window) {
        return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
      }
    })
    .catch(() => {
      // silencioso: não impede o app de rodar
    });
>>>>>>> eac2424c (v14)
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
