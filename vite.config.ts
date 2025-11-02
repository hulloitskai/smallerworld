import reactPlugin from "@vitejs/plugin-react";
import { createReadStream, existsSync } from "fs";
import Mime from "mime";
import path, { join } from "path";
import { visualizer as visualizerPlugin } from "rollup-plugin-visualizer";
import autoImportPlugin from "unplugin-auto-import/vite";
import iconsPlugin from "unplugin-icons/vite";
import { type PluginOption, resolveConfig, type UserConfig } from "vite";
import { defineConfig } from "vite";
import environmentPlugin from "vite-plugin-environment";
import fullReloadPlugin from "vite-plugin-full-reload";
import { ViteImageOptimizer as imageOptimizerPlugin } from "vite-plugin-image-optimizer";
// @ts-expect-error Package does not provide types.
import { isoImport as isomorphicImportPlugin } from "vite-plugin-iso-import";
import { VitePWA as pwaPlugin } from "vite-plugin-pwa";
import rubyPlugin from "vite-plugin-ruby";

import { imports } from "./config/auto-import";

interface ViteRubyEnv {
  VITE_RUBY_ROOT: string;
  VITE_RUBY_PUBLIC_DIR: string;
  VITE_RUBY_PUBLIC_OUTPUT_DIR: string;
}

export default defineConfig(
  async ({ command, mode, isPreview }): Promise<UserConfig> => {
    // == Resolve Vite Ruby configurations
    const { base, env } = await resolveConfig(
      {
        configFile: false,
        plugins: [rubyPlugin()],
      },
      command,
      mode,
      undefined,
      isPreview,
    );
    const { VITE_RUBY_ROOT, VITE_RUBY_PUBLIC_DIR } = env as ViteRubyEnv;
    const publicDir = path.join(VITE_RUBY_ROOT, VITE_RUBY_PUBLIC_DIR);

    // == Plugins
    const plugins: PluginOption = [
      environmentPlugin(
        { RAILS_ENV: "development" },
        { defineOn: "import.meta.env" },
      ),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      isomorphicImportPlugin(),
      autoImportPlugin({
        dts: join(__dirname, "typings/generated/auto-import.d.ts"),
        imports,
      }),
      iconsPlugin({ compiler: "jsx", jsx: "react" }),
      imageOptimizerPlugin({ includePublic: false }),
      reactPlugin(),
      rubyPlugin(),
      pwaPlugin({
        registerType: "autoUpdate",
        manifest: false,
        strategies: "injectManifest",
        injectRegister: null,
        injectManifest: {
          swSrc: "app/entrypoints/sw.ts",
          modifyURLPrefix: {
            "": base,
          },
        },
        srcDir: "entrypoints",
        filename: "sw.ts",
        devOptions: {
          enabled: true,
          type: "module",
        },
      }),
      fullReloadPlugin(
        [
          "config/routes.rb",
          "config/routes/**/*.rb",
          "app/models/**/*.rb",
          "app/serializers/**/*.rb",
          "app/views/**/*.{html,html.erb}",
          "app/controllers/**/*.rb",
        ],
        { delay: 200 },
      ),
    ];

    // == Filesystem fallback
    // For serving static assets referenced by the SSR server.
    plugins.push({
      name: "filesystem-fallback",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) {
            return next();
          }
          const filePath = path.join(publicDir, req.url);
          if (!existsSync(filePath)) {
            return next();
          }
          const contentType = Mime.getType(filePath);
          if (!contentType) {
            return next();
          }
          res.setHeader("Content-Type", contentType);
          createReadStream(filePath).pipe(res);
        });
      },
    });

    // == Visualizer
    const visualize = process.env.VITE_VISUALIZE;
    if (visualize && ["1", "true", "t"].includes(visualize.toLowerCase())) {
      plugins.push(
        visualizerPlugin({
          filename: "tmp/vite_visualize.html",
          open: true,
        }),
      );
    }

    // == Config
    return {
      clearScreen: false,
      resolve: {
        alias: [
          {
            find: "lodash",
            replacement: "lodash-es",
          },
        ],
      },
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Suppress "Module level directives cause errors when bundled"
            // warnings.
            if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
              return;
            }
            warn(warning);
          },
        },
      },
      ssr: {
        noExternal:
          process.env.RAILS_ENV === "production"
            ? true
            : ["@microsoft/clarity", "@wordpress/wordcount"],
      },
      plugins,
    };
  },
);
