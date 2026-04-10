// src/index.ts
import { readFileSync } from "node:fs";
function litHydrationPlugin() {
  return {
    name: "astro-lit-hydration",
    transform(code, id, options) {
      if (options?.ssr) return;
      if (!id.includes("type=script")) return;
      if (code.includes("hydration-support")) return;
      return `import '@semantic-ui/astro-lit/hydration-support.js';
` + code;
    }
  };
}
function getViteConfiguration(usePlugin) {
  return {
    plugins: usePlugin ? [litHydrationPlugin()] : [],
    optimizeDeps: {
      include: [
        "@semantic-ui/astro-lit/dist/client.js",
        "@semantic-ui/astro-lit/client-shim.js",
        "@semantic-ui/astro-lit/hydration-support.js",
        "@webcomponents/template-shadowroot/template-shadowroot.js"
      ],
      exclude: ["@semantic-ui/astro-lit/server.js"]
    },
    ssr: {
      external: ["lit-element", "@lit-labs/ssr", "@semantic-ui/astro-lit", "lit/decorators.js"]
    }
  };
}
function litHandlesDeferredHydration() {
  try {
    const resolved = import.meta.resolve("@lit-labs/ssr-client/lit-element-hydrate-support.js");
    const src = readFileSync(new URL(resolved), "utf-8");
    return src.includes("skip-hydration") || src.includes("deferredBySSR");
  } catch {
    return false;
  }
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
        const litNative = litHandlesDeferredHydration();
        if (litNative) {
          injectScript("before-hydration", `import '@lit-labs/ssr-client/lit-element-hydrate-support.js';`);
        } else {
          injectScript(
            "head-inline",
            readFileSync(new URL("../hydration-support-global.js", import.meta.url), { encoding: "utf-8" })
          );
        }
        addRenderer({
          name: "@semantic-ui/astro-lit",
          serverEntrypoint: "@semantic-ui/astro-lit/server.js",
          clientEntrypoint: "@semantic-ui/astro-lit/dist/client.js"
        });
        updateConfig({
          vite: getViteConfiguration(!litNative)
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
