import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "skyline",
    tags: [
      {
        tag: "script",
        attrs: {
          src: "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js",
        },
        append: false,
      },
    ],
  }
});
