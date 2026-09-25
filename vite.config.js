import { defineConfig } from 'vite';
import { resolve } from 'path';

// base: './' keeps every asset path relative. Multi-page site: each
// .html file below becomes its own build entry so `npm run build`
// outputs all four pages into dist/.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        mujer: resolve(process.cwd(), 'mujer.html'),
        hombre: resolve(process.cwd(), 'hombre.html'),
        contacto: resolve(process.cwd(), 'contacto.html'),
      },
    },
  },
});
