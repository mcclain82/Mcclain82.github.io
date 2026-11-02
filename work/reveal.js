// Prepare offscreen projects before they enter view, then reveal each once.
(() => {
  const projects = [...document.querySelectorAll('.projects .project')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate || reducedMotion.matches) return;

  const pending = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const animation = pending.get(entry.target);
      if (animation) animation.play();
    });
  }, { threshold: 0, rootMargin: '0px 0px 40px 0px' });

  projects.forEach(project => {
    // Already visible content must never disappear or jump on page load.
    if (project.getBoundingClientRect().top < window.innerHeight + 40) return;
    const animation = project.animate([
      { opacity: 0, transform: 'translateY(28px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 1400,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      fill: 'both'
    });
    animation.pause();
    animation.currentTime = 0;
    pending.set(project, animation);
    const showImmediately = () => {
      observer.unobserve(project);
      pending.delete(project);
      animation.cancel();
    };
    // Drop the transform after the entrance so the iframe renders normally.
    animation.onfinish = showImmediately;
    project.addEventListener('focusin', showImmediately, { once: true });
    observer.observe(project);
  });

  const showAll = () => {
    observer.disconnect();
    pending.forEach(animation => animation.cancel());
    pending.clear();
  };
  reducedMotion.addEventListener('change', event => {
    if (event.matches) showAll();
  });
  // Restoring a page from browser history should never restore hidden videos.
  window.addEventListener('pageshow', event => {
    if (event.persisted) showAll();
  });
})();
