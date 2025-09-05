import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { getConfig } from "./src/lib/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: Array.isArray(env.VITE_ALLOWED_HOSTS) 
        ? env.VITE_ALLOWED_HOSTS 
        : env.VITE_ALLOWED_HOSTS?.split(",") || getConfig().allowedHosts,
      proxy: {
        "/api": {
          target: env.VITE_SERVER_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __APP_ENV__: env, // inject env into client if needed
    },
  };
});
