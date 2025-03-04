// src/index.ts
import { readFileSync } from "node:fs";
function getViteConfiguration() {
  return {
    optimizeDeps: {
      include: [
        "@semantic-org/astro-lit/dist/client.js",
        "@semantic-org/astro-lit/client-shim.js",
        "@semantic-org/astro-lit/hydration-support.js",
        "@webcomponents/template-shadowroot/template-shadowroot.js",
        "@lit-labs/ssr-client/lit-element-hydrate-support.js"
      ],
      exclude: ["@semantic-org/astro-lit/server.js"]
    },
    ssr: {
      external: ["lit-element", "@lit-labs/ssr", "@semantic-org/astro-lit", "lit/decorators.js"]
    }
  };
}
function getContainerRenderer() {
  return {
    name: "@semantic-org/astro-lit",
    serverEntrypoint: "@semantic-org/astro-lit/server.js"
  };
}
function index_default() {
  return {
    name: "@semantic-org/astro-lit",
    hooks: {
      "astro:config:setup": ({ updateConfig, addRenderer, injectScript }) => {
        injectScript(
          "head-inline",
          readFileSync(new URL("../client-shim.min.js", import.meta.url), { encoding: "utf-8" })
        );
        injectScript("before-hydration", `import '@semantic-org/astro-lit/hydration-support.js';`);
        addRenderer({
          name: "@semantic-org/astro-lit",
          serverEntrypoint: "@semantic-org/astro-lit/server.js",
          clientEntrypoint: "@semantic-org/astro-lit/dist/client.js"
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
