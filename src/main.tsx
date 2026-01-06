import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "@/contexts/AuthContext";

// Remove service workers antigos e limpa caches (caso PWA tenha sido ativado antes)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .catch(() => {});

  if ("caches" in window) {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
