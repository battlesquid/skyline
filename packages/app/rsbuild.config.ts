import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/rspack";

export default defineConfig({
    plugins: [
        pluginReact(),
    ],
    html: {
        template: "./index.html",
    },
    source: {
        entry: {
            index: "./src/index.tsx",
        },
    },
    tools: {
        rspack: {
            resolve: {
                fallback: {
                    module: false
                }
            },
            plugins: [
                tanstackRouter({
                    target: "react",
                    autoCodeSplitting: true
                })
            ]
        }
    }
});
