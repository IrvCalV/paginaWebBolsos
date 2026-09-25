# SofArt -- sitio multipágina para venta de bolsos de piel

Sitio estático (sin backend) para una marca de bolsos de piel para mujer y
hombre, estilo deluxe. A diferencia de los templates anteriores (media
kit de una sola página), este es un sitio de **varias páginas** con
navegación real entre ellas. Construido con [Vite](https://vitejs.dev)
como servidor de desarrollo y empaquetador multipágina -- el resultado
del build es HTML/CSS/JS plano, listo para cualquier hosting estático.

## Uso

```bash
npm install
npm run dev       # servidor de desarrollo con recarga en caliente
npm run build     # genera las 4 páginas en dist/
npm run preview   # sirve dist/ localmente para probar el build
```

## Páginas

- `index.html` -- Inicio: hero con transición cruzada entre 3 fotos,
  categorías (Mujer / Hombre), piezas destacadas, historia de marca,
  newsletter.
- `mujer.html` -- Catálogo Mujer: banner + 3 modelos (Aurora, Mégane,
  Valentina) + cuidado del cuero.
- `hombre.html` -- Catálogo Hombre: banner + 3 modelos (Roma, Marchetti,
  Sterling) + cuidado del cuero.
- `contacto.html` -- Correo, WhatsApp, showroom, horario y mapa (placeholder).

## Fotos

Todas las fotos son de **Unsplash** (licencia libre, sin atribución
requerida) -- se verificó que cada URL carga antes de usarla. Son solo
placeholder: reemplázalas por fotografía real del producto en cuanto la
tengas. Las URLs viven directamente en los `src`/`data-img` de cada
`index.html`/`mujer.html`/`hombre.html`, no hay carpeta de assets locales
para las fotos de producto.

## Cómo funcionan las transiciones de imagen

- **Hero (`hero-slider.css`)**: 3 fotos superpuestas, cada una con la
  misma animación CSS de 18s pero con `animation-delay` escalonado --
  así se van cruzando en loop sin JavaScript. Cada foto además tiene un
  zoom lento (Ken Burns) independiente.
- **Tarjetas de producto (`product-card.css`)**: zoom sutil de la imagen
  + un scrim con el botón "Ver detalle" que aparece al hacer hover.
- **Quick view (`product-lightbox.js` + `lightbox.css`)**: al hacer clic
  en "Ver detalle" se abre un modal compartido por página que cruza por
  opacidad entre la foto del producto y una foto de detalle del cuero
  (reutilizada en los 6 modelos), en automático cada 3.5s, con puntos
  para cambiar a mano.

## Estructura

```
index.html / mujer.html / hombre.html / contacto.html   4 paginas
public/                       favicon
src/
  css/
    base/                      reset y variables.css (tokens de color, tipografía, espaciado)
    components/                nav, botones, hero-slider, product-card, lightbox, scroll-reveal, footer
    main.css                   layout compartido entre las 4 paginas
  js/
    components/                nav.js, scroll-reveal.js, product-lightbox.js
    main.js                    inicializa los tres, se importa igual en las 4 paginas
```

## Qué personalizar antes de publicar

- **Nombre de marca**: "SofArt" en el `.nav-brand` y `.footer-brand`
  de las 4 páginas, y en el `<title>`.
- **Fotos**: todos los `src`/`data-img`/`data-detail-img` apuntando a
  `images.unsplash.com` -- sustitúyelos por las fotos reales del producto.
- **Productos**: cada `.product-card` tiene sus datos en los atributos
  `data-name`, `data-price`, `data-desc`, `data-img`, `data-detail-img` --
  edítalos ahí (se usan tanto para la tarjeta como para el quick view).
- **Historia de marca**: sección `.story` en `index.html`.
- **Contacto**: correo, WhatsApp, dirección y horario en `contacto.html`.

## Despliegue

`npm run build` genera `dist/` con las 4 páginas. Se puede desplegar tal
cual en Netlify, Vercel, Cloudflare Pages o GitHub Pages y apuntar un
dominio propio -- no requiere servidor ni base de datos.
