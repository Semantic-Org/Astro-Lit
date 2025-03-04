// src/index.ts
import { readFileSync } from "node:fs";
function getViteConfiguration() {
  return {
    optimizeDeps: {
      include: [
        "@semantic-ui/astro-lit/dist/client.js",
        "@semantic-ui/astro-lit/client-shim.js",
        "@semantic-ui/astro-lit/hydration-support.js",
        "@webcomponents/template-shadowroot/template-shadowroot.js",
        "@lit-labs/ssr-client/lit-element-hydrate-support.js"
      ],
      exclude: ["@semantic-ui/astro-lit/server.js"]
    },
    ssr: {
      external: ["lit-element", "@lit-labs/ssr", "@semantic-ui/astro-lit", "lit/decorators.js"]
    }
  };
}
function getContainerRenderer() {
  return {
    name: "@semantic-ui/astro-lit",
    serverEntrypoint: "@semantic-ui/astro-lit/server.js"
  };
}
function index_default() {
  return {
    name: "@semantic-ui/astro-lit",
    hooks: {
      "astro:config:setup": ({ updateConfig, addRenderer, injectScript }) => {
        injectScript(
          "head-inline",
          readFileSync(new URL("../client-shim.min.js", import.meta.url), { encoding: "utf-8" })
        );
        injectScript("before-hydration", `import '@semantic-ui/astro-lit/hydration-support.js';`);
        addRenderer({
          name: "@semantic-ui/astro-lit",
          serverEntrypoint: "@semantic-ui/astro-lit/server.js",
          clientEntrypoint: "@semantic-ui/astro-lit/dist/client.js"
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
