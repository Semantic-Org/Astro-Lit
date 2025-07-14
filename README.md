# @semantic-org/astro-lit

> First party support for Lit was included up until Astro 5 but was removed. This community version preserves Lit SSR rendering for newer versions of Lit.

This **[Astro integration](https://astro.build/integrations/)** enables server-side rendering and client-side hydration for your [Lit](https://lit.dev/) custom elements.

## How To Use

```javascript
import lit from '@semantic-ui/astro-lit';

export default defineConfig({
  integrations: [
    lit(), // add lit as integration
  ],
});
```

## License

MIT
