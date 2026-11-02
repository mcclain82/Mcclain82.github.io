// Animate each project once; content stays visible if animation is unavailable.
(() => {
  const projects = [...document.querySelectorAll('.projects .project')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || reducedMotion.matches) return;

  const animations = new Set();
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => projects.indexOf(a.target) - projects.indexOf(b.target));
    visible.forEach((entry, index) => {
      observer.unobserve(entry.target);
      // Don't move a video the visitor has already focused or scrolled past.
      if (entry.target.contains(document.activeElement) || entry.boundingClientRect.top < 0) return;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(80px) scale(0.95)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {
        duration: 1600,
        delay: window.matchMedia('(min-width: 601px)').matches ? Math.min(index, 1) * 180 : 0,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });
      animations.add(animation);
      animation.onfinish = animation.oncancel = () => animations.delete(animation);
      entry.target.addEventListener('focusin', () => animation.cancel(), { once: true });
    });
  }, { threshold: 0.08 });

  projects.forEach(project => observer.observe(project));
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
  });
})();
