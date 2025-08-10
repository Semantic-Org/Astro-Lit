# @semantic-org/astro-lit

[![NPM Version](https://img.shields.io/npm/v/%40semantic-ui%2Fastro-lit)](https://www.npmjs.com/package/@semantic-ui/astro-lit)
[![NPM Downloads](https://img.shields.io/npm/dm/%40semantic-ui%2Fastro-lit)](https://www.npmjs.com/package/@semantic-ui/astro-lit)
[![License](https://img.shields.io/npm/l/%40semantic-ui%2Fastro-lit)](https://github.com/Semantic-Org/Astro-Lit/blob/main/LICENSE)

> The official `@astrojs/lit` integration was deprecated in Astro v5. This community-maintained integration enables you to continue using Lit with modern versions of Astro.

This [Astro integration](https://docs.astro.build/en/guides/integrations-guide/) enables server-side rendering and client-side hydration for your [Lit](https://lit.dev/) custom elements.

## Features

*   Server-side rendering (SSR) of Lit components.
*   Client-side hydration with Astro `client:*` directives.
*   Automatic polyfills for Declarative Shadow DOM in unsupported browsers.
*   Support for experimental decorators.

## Installation

### Prerequisites

*   Astro v5.0 or later.
*   Node.js v18.17.1, v20.3.0 or later.

To use the Lit integration, you first install the required package and then update your Astro configuration.

### Procedure

1.  Install the integration package into your project:

    *   **npm**
        ```sh
        $ npm install @semantic-ui/astro-lit
        ```
    *   **pnpm**
        ```sh
        $ pnpm add @semantic-ui/astro-lit
        ```
    *   **yarn**
        ```sh
        $ yarn add @semantic-ui/astro-lit
        ```

2.  Update your `astro.config.mjs` file to include the Lit integration.

    ```js title="astro.config.mjs"
    import { defineConfig } from 'astro/config';
    import lit from '@semantic-ui/astro-lit';
    
    export default defineConfig({
      integrations: [lit()],
    });
    ```

## Usage

To learn about using framework components in Astro, refer to the [Astro Framework Components guide](https://docs.astro.build/en/guides/framework-components/).

### Creating and Using a Lit Component

To use a Lit component, create a component file and then import it into your `.astro` pages.

1.  Create your Lit component. For example, create a new file named `my-element.js` in the `src/components/` directory.

    ```javascript title="src/components/my-element.js"
    import { LitElement, html } from 'lit';
    
    export class MyElement extends LitElement {
      render() {
        return html`<p>Hello world! This is my Lit component.</p>`;
      }
    }
    
    customElements.define('my-element', MyElement);
    ```

2.  Import and use the component in an Astro page. Note that Astro requires you to use the class name, `MyElement`, as the component tag, not the custom element tag name `my-element`.

    ```astro title="src/pages/index.astro"
    ---
    import { MyElement } from '../components/my-element.js';
    ---
    <MyElement />
    ```

### Using Third-Party Lit Components

You can also use third-party web components that are built with Lit. To use a third-party component, import its JavaScript module, which typically registers the custom element as a side effect. Then, you can use the custom element tag directly in your template.

In the following example, you import a third-party button component and use it with its custom HTML tag, `<sbb-button>`:

```astro title="src/pages/buttons.astro"
---
// This import registers the <sbb-button> custom element.
import '@sbb-esta/lyne-elements/button.js';
---
<h1>Third-Party Component Example</h1>

<sbb-button>Click Me</sbb-button>
```

### Client-Side Hydration

To hydrate a component on the client, add an Astro `client:*` directive. These directives determine when the component's JavaScript is sent to the browser.

For example, to hydrate a component only when it becomes visible in the viewport, use the `client:visible` directive:

```astro title="src/pages/index.astro"
---
import { MyElement } from '../components/my-element.js';
---
<MyElement client:visible />
```

For a full list of available directives, refer to the official [Astro Client Directives documentation](https://docs.astro.build/en/reference/directives-reference/#client-directives).

### Using Experimental Decorators

To use experimental decorators in Lit, for example `@customElement` or `@state`, you must enable the `experimentalDecorators` option in your `tsconfig.json` file.

1.  If you do not have one, create a `tsconfig.json` file in the root of your project.
2.  Add the `compilerOptions.experimentalDecorators` setting:

    ```json title="tsconfig.json"
    {
      "compilerOptions": {
        "experimentalDecorators": true
      }
    }
    ```

You can now use decorators in your Lit TypeScript components:

```typescript title="src/components/my-decorator-element.ts"
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("my-decorator-element")
export class MyDecoratorElement extends LitElement {
    @property()
    name = "World";

    override render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}
```

## Troubleshooting

This section describes common issues and their solutions.

### Browser Global Interference

The Lit integration adds browser global properties, for example `window` and `document`, to the global scope during server-side rendering. These globals can interfere with other libraries that check for their existence to determine if they are running in a browser environment. This can cause unexpected behavior or errors with other libraries.

If you use multiple integrations, changing their order in the `astro.config.mjs` file can sometimes resolve the issue.

```javascript title="astro.config.mjs"
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import lit from '@semantic-ui/astro-lit';

export default defineConfig({
  // If vue() causes issues, try placing lit() before it.
  integrations: [lit(), vue()]
});
```

### Component Not Updating in Development

During development, if you make changes to a Lit component and do not see the updates in your browser, you might need to restart the Astro development server.

### Strict Package Manager Errors

When you use a strict package manager like `pnpm`, you can encounter a `ReferenceError: module is not defined` error. To resolve this, create a `.npmrc` file in your project's root directory and add a hoist pattern for Lit dependencies:

```ini title=".npmrc"
public-hoist-pattern[]=*lit*
```

## Contributing

This project is open source and maintained by the community. You are welcome to submit issues and pull requests.

*   To report a bug or request a feature, [open an issue](https://github.com/Semantic-Org/Astro-Lit/issues).
*   To contribute code, please open a pull request.

## License

MIT
