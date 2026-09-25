// Fades + slides elements up as they enter the viewport.
//
// Usage:
//   <div data-reveal>...</div>                 reveals as one unit
//   <div data-reveal-group>                     reveals each direct child
//     <div>...</div>                            one after another
//     <div>...</div>
//   </div>
//
// Elements already in view (e.g. the hero, above the fold) reveal
// immediately on load since the observer fires as soon as it attaches.
export function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('reveal'));

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}
