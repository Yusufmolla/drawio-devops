import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const isDebug = mode === "debug";

    return {
        base: env.VITE_APP_BASE_URL || "./",
        build: {
            outDir: "dist",
            emptyOutDir: true,
            sourcemap: isDebug,
            minify: isDebug ? false : "esbuild",
            cssMinify: isDebug ? false : "esbuild",
            rolldownOptions: {
                input: {
                    hub: resolve(__dirname, "hub.html"),
                    commit: resolve(__dirname, "commit.html"),
                    createfile: resolve(__dirname, "createfile.html")
                }
            }
        },
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
                "@utils": resolve(__dirname, "src/utils"),
                "@styles": resolve(__dirname, "src/styles"),
                "@components": resolve(__dirname, "src/components"),
                "@bindings": resolve(__dirname, "src/bindings")
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true
                }
            }
        }
    };
});