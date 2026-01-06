import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192.png",
        "pwa-512.png",
        "pwa-512-maskable.png"
      ],

      manifest: {
        name: "Dashboard de Treinos",
        short_name: "Treinos",
        description: "Controle de treinos com fichas personalizadas",
        theme_color: "#0B1220",
        background_color: "#0B1220",

        display: "standalone",   // 🔑 ESSENCIAL
        start_url: "/",          // 🔑 ESSENCIAL
        scope: "/",              // 🔑 ESSENCIAL

        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
