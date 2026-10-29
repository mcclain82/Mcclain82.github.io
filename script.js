const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = navigation.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); toggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });

// Space each character evenly while aligning the tagline to the brand width.
(() => {
  function spaceBrandTaglines() {
    document.querySelectorAll('.header .brand .brand-tag').forEach(tag => {
      if (tag.classList.contains('spaced-tagline')) return;
      const text = tag.textContent.trim().replace(/\s+/g, ' ');
      tag.setAttribute('aria-label', text);
      const letters = Array.from(text, character => {
        const span = document.createElement('span');
        span.textContent = character === ' ' ? '\u00a0' : character;
        span.setAttribute('aria-hidden', 'true');
        return span;
      });
      tag.replaceChildren(...letters);
      tag.classList.add('spaced-tagline');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spaceBrandTaglines, {once:true});
  } else {
    spaceBrandTaglines();
  }
})();
