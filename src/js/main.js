import '../css/main.css';
import { initNav } from './components/nav.js';
import { initScrollReveal } from './components/scroll-reveal.js';
import { initProductLightbox } from './components/product-lightbox.js';

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

initNav();
initScrollReveal();
initProductLightbox();
