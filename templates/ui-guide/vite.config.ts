import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), !process.env.STORYBOOK && reactRouter()].filter(
    Boolean,
  ),
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3069,
  },
});
