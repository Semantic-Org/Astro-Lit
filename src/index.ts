import { readFileSync } from 'node:fs';
import type { AstroIntegration, ContainerRenderer } from 'astro';
import type { Plugin } from 'vite';

/**
 * Vite plugin that prepends the hydration support import to any module
 * that imports from 'lit' or 'lit-element'. This ensures the hydration
 * patches and the component definitions end up in the same Vite chunk,
 * sharing one LitElement prototype.
 *
 * Without this, injectScript('page') creates a separate entry point
 * that Vite may split into a different chunk — the patches would target
 * a different LitElement class than the one components use.
 */
function litHydrationPlugin(): Plugin {
	return {
		name: 'astro-lit-hydration',
		transform(code, id, options) {
			// Skip server-side transforms (both dev SSR and production build)
			if (options?.ssr) return;
			// Target only Astro <script> tags. Astro compiles them into
			// virtual modules with IDs like:
			//   /path/Layout.astro?astro&type=script&index=0&lang.ts
			// Skip frontmatter modules (?id=N) and style modules (?type=style).
			if (!id.includes('type=script')) return;
			if (code.includes('hydration-support')) return;
			// Prepend hydration support so it's in the same Vite chunk as the
			// user's component import — sharing one LitElement prototype.
			return `import '@semantic-ui/astro-lit/hydration-support.js';\n` + code;
		},
	};
}

function getViteConfiguration(usePlugin: boolean) {
	return {
		plugins: usePlugin ? [litHydrationPlugin()] : [],
		optimizeDeps: {
			include: [
				'@semantic-ui/astro-lit/dist/client.js',
				'@semantic-ui/astro-lit/client-shim.js',
				'@semantic-ui/astro-lit/hydration-support.js',
				'@webcomponents/template-shadowroot/template-shadowroot.js',
			],
			exclude: ['@semantic-ui/astro-lit/server.js'],
		},
		ssr: {
			external: ['lit-element', '@lit-labs/ssr', '@semantic-ui/astro-lit', 'lit/decorators.js'],
		},
	};
}

/**
 * Check whether the installed @lit-labs/ssr-client already handles deferred
 * hydration natively. If so, we skip our workaround entirely.
 */
function litHandlesDeferredHydration(): boolean {
	try {
		const resolved = import.meta.resolve('@lit-labs/ssr-client/lit-element-hydrate-support.js');
		const src = readFileSync(new URL(resolved), 'utf-8');
		return src.includes('skip-hydration') || src.includes('deferredBySSR');
	} catch {
		return false;
	}
}

export function getContainerRenderer(): ContainerRenderer {
	return {
		name: '@semantic-ui/astro-lit',
		serverEntrypoint: '@semantic-ui/astro-lit/server.js',
	};
}

export default function (): AstroIntegration {
	return {
		name: '@semantic-ui/astro-lit',
		hooks: {
			'astro:config:setup': ({ updateConfig, addRenderer, injectScript }) => {
				// DSD polyfill for browsers that don't support declarative shadow DOM.
				injectScript(
					'head-inline',
					readFileSync(new URL('../client-shim.min.js', import.meta.url), { encoding: 'utf-8' })
				);

				const litNative = litHandlesDeferredHydration();

				if (litNative) {
					// Lit handles deferred hydration natively.
					injectScript('before-hydration', `import '@lit-labs/ssr-client/lit-element-hydrate-support.js';`);
				} else {
					// Inline <script> in <head> sets up the one-shot
					// globalThis.litElementHydrateSupport callback before any
					// module imports lit.
					injectScript(
						'head-inline',
						readFileSync(new URL('../hydration-support-global.js', import.meta.url), { encoding: 'utf-8' })
					);
					// The Vite plugin (litHydrationPlugin) prepends the
					// hydration-support.js import to any module that imports
					// from lit, ensuring they share one chunk.
				}

				addRenderer({
					name: '@semantic-ui/astro-lit',
					serverEntrypoint: '@semantic-ui/astro-lit/server.js',
					clientEntrypoint: '@semantic-ui/astro-lit/dist/client.js',
				});

				updateConfig({
					vite: getViteConfiguration(!litNative),
				});
			},
			'astro:build:setup': ({ vite, target }) => {
				if (target === 'server') {
					if (!vite.ssr) {
						vite.ssr = {};
					}
					if (!vite.ssr.noExternal) {
						vite.ssr.noExternal = [];
					}
					if (Array.isArray(vite.ssr.noExternal)) {
						vite.ssr.noExternal.push('lit');
					}
				}
			},
		},
	};
}
