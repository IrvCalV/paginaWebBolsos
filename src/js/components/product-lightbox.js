// Quick view modal for a product card.
//
// Markup contract:
//   <article class="product-card"
//     data-name="Aurora"
//     data-price="$3,450 MXN"
//     data-desc="..."
//     data-img="https://.../foto-producto.jpg"
//     data-detail-img="https://.../detalle-cuero.jpg"
//     data-detail-caption="Detalle del cuero">
//     ...
//     <button class="product-quickview" type="button">Ver detalle</button>
//   </article>
//
// For a product with more than two photos, add data-images with the full,
// ordered, comma-separated list instead (data-img/data-detail-img are then
// ignored). Products that only set data-img + data-detail-img keep working
// exactly as before -- data-images is optional.
//
// One shared #product-modal in the page gets its slides rebuilt from
// whichever card was clicked. Slides cross-fade automatically (setInterval
// + an `is-active` class whose opacity transition is defined in
// lightbox.css) and can also be switched by hand with the prev/next
// buttons or the dots -- any manual interaction just resets the timer.
export function initProductLightbox() {
  const modal = document.querySelector('#product-modal');
  if (!modal) return;

  const panel = modal.querySelector('.product-modal-panel');
  const slidesContainer = modal.querySelector('.product-modal-slides');
  const dotsContainer = modal.querySelector('.product-modal-dots');
  const prevBtn = modal.querySelector('.product-modal-prev');
  const nextBtn = modal.querySelector('.product-modal-next');
  const caption = modal.querySelector('.product-modal-caption');
  const nameEl = modal.querySelector('.product-modal-name');
  const priceEl = modal.querySelector('.product-modal-price');
  const descEl = modal.querySelector('.product-modal-desc');
  const ctaEl = modal.querySelector('.product-modal-cta');

  let autoplay = null;
  let activeIndex = 0;
  let slideEls = [];
  let dotEls = [];

  const setActive = (index) => {
    activeIndex = (index + slideEls.length) % slideEls.length;
    slideEls.forEach((slide, i) => slide.classList.toggle('is-active', i === activeIndex));
    dotEls.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
  };

  const stopAutoplay = () => {
    if (autoplay) window.clearInterval(autoplay);
    autoplay = null;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (slideEls.length < 2) return;
    autoplay = window.setInterval(() => setActive(activeIndex + 1), 3500);
  };

  const goTo = (index) => {
    setActive(index);
    startAutoplay();
  };

  const buildSlides = (images, names) => {
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    slideEls = images.map((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'product-modal-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = names[i] || '';
      slide.appendChild(img);
      slidesContainer.appendChild(slide);
      return slide;
    });

    dotEls = images.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'product-modal-dot';
      dot.setAttribute('aria-label', `Foto ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const hasNav = images.length > 1;
    prevBtn.hidden = !hasNav;
    nextBtn.hidden = !hasNav;
    dotsContainer.hidden = !hasNav;
  };

  const open = (card) => {
    const { name, price, desc, img, images, detailImg, detailCaption } = card.dataset;

    const urls = images
      ? images.split(',').map((url) => url.trim()).filter(Boolean)
      : [img, detailImg].filter(Boolean);
    const names = urls.map((_, i) => (i === 0 ? name : `${name} -- foto ${i + 1}`));

    buildSlides(urls, names);
    caption.textContent = !images && detailCaption ? detailCaption : '';
    caption.hidden = !caption.textContent;

    nameEl.textContent = name;
    priceEl.textContent = price;
    descEl.textContent = desc;
    ctaEl.href = `mailto:contacto@sofart.com?subject=${encodeURIComponent(`Disponibilidad: ${name}`)}`;

    setActive(0);
    modal.dataset.open = 'true';
    document.body.classList.add('modal-open');
    startAutoplay();
  };

  const close = () => {
    modal.dataset.open = 'false';
    document.body.classList.remove('modal-open');
    stopAutoplay();
  };

  // Un solo listener en la foto completa -- antes solo el boton "Ver
  // detalle" (visible nada mas al hacer hover) abria el modal, lo que en
  // touch obligaba a un doble tap. El boton sigue en el DOM para teclado:
  // activarlo dispara un click que burbujea hasta aqui igual.
  document.querySelectorAll('.product-photo').forEach((photo) => {
    photo.addEventListener('click', () => open(photo.closest('.product-card')));
  });

  modal.querySelector('.product-modal-close')?.addEventListener('click', close);

  modal.addEventListener('click', (event) => {
    if (!panel.contains(event.target)) close();
  });

  prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
  nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

  document.addEventListener('keydown', (event) => {
    if (modal.dataset.open !== 'true') return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') goTo(activeIndex - 1);
    if (event.key === 'ArrowRight') goTo(activeIndex + 1);
  });
}
