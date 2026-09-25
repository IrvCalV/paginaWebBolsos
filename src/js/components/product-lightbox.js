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
// One shared #product-modal in the page gets its text/images filled in
// from whichever card was clicked. The two images inside the modal
// cross-fade automatically (setInterval + an `is-active` class whose
// opacity transition is defined in lightbox.css) and can also be
// switched by hand with the dots.
export function initProductLightbox() {
  const modal = document.querySelector('#product-modal');
  if (!modal) return;

  const panel = modal.querySelector('.product-modal-panel');
  const slides = modal.querySelectorAll('.product-modal-slide');
  const dots = modal.querySelectorAll('.product-modal-dot');
  const caption = modal.querySelector('.product-modal-caption');
  const nameEl = modal.querySelector('.product-modal-name');
  const priceEl = modal.querySelector('.product-modal-price');
  const descEl = modal.querySelector('.product-modal-desc');
  const ctaEl = modal.querySelector('.product-modal-cta');

  let autoplay = null;
  let activeIndex = 0;

  const setActive = (index) => {
    activeIndex = index;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplay = window.setInterval(() => setActive((activeIndex + 1) % slides.length), 3500);
  };

  const stopAutoplay = () => {
    if (autoplay) window.clearInterval(autoplay);
    autoplay = null;
  };

  const open = (card) => {
    const { name, price, desc, img, detailImg, detailCaption } = card.dataset;

    slides[0].querySelector('img').src = img;
    slides[0].querySelector('img').alt = name;
    slides[1].querySelector('img').src = detailImg;
    slides[1].querySelector('img').alt = detailCaption || 'Detalle del material';
    caption.textContent = detailCaption || 'Detalle del material';
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

  document.querySelectorAll('.product-quickview').forEach((button) => {
    button.addEventListener('click', () => open(button.closest('.product-card')));
  });

  modal.querySelector('.product-modal-close')?.addEventListener('click', close);

  modal.addEventListener('click', (event) => {
    if (!panel.contains(event.target)) close();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      setActive(i);
      startAutoplay();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.dataset.open === 'true') close();
  });
}
