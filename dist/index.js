import { readFileSync } from "node:fs";
function getViteConfiguration() {
  return {
    optimizeDeps: {
      include: [
        "@astrojs/lit/dist/client.js",
        "@astrojs/lit/client-shim.js",
        "@astrojs/lit/hydration-support.js",
        "@webcomponents/template-shadowroot/template-shadowroot.js",
        "@lit-labs/ssr-client/lit-element-hydrate-support.js"
      ],
      exclude: ["@astrojs/lit/server.js"]
    },
    ssr: {
      external: ["lit-element", "@lit-labs/ssr", "@astrojs/lit", "lit/decorators.js"]
    }
  };
}
function getContainerRenderer() {
  return {
    name: "@astrojs/lit",
    serverEntrypoint: "@astrojs/lit/server.js"
  };
}
function index_default() {
  return {
    name: "@astrojs/lit",
    hooks: {
      "astro:config:setup": ({ updateConfig, addRenderer, injectScript }) => {
        injectScript(
          "head-inline",
          readFileSync(new URL("../client-shim.min.js", import.meta.url), { encoding: "utf-8" })
        );
        injectScript("before-hydration", `import '@astrojs/lit/hydration-support.js';`);
        addRenderer({
          name: "@astrojs/lit",
          serverEntrypoint: "@astrojs/lit/server.js",
          clientEntrypoint: "@astrojs/lit/dist/client.js"
        });
        updateConfig({
          vite: getViteConfiguration()
        });
      },
      "astro:build:setup": ({ vite, target }) => {
        if (target === "server") {
          if (!vite.ssr) {
            vite.ssr = {};
          }
          if (!vite.ssr.noExternal) {
            vite.ssr.noExternal = [];
          }
          if (Array.isArray(vite.ssr.noExternal)) {
            vite.ssr.noExternal.push("lit");
          }
        }
      }
    }
  };
}
export {
  index_default as default,
  getContainerRenderer
};
