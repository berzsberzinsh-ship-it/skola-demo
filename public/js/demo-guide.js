(function () {
  let popup;
  let current = null;

  function getPopup() {
    if (!popup) {
      popup = document.createElement('div');
      popup.className = 'demo-guide-popup';
      popup.setAttribute('role', 'tooltip');
      document.body.appendChild(popup);
    }
    return popup;
  }

  function label(el) {
    const key = el.getAttribute('data-guide');
    const i18n = window.RVS_I18N;
    return (i18n && i18n.t(key)) || key;
  }

  function place(el, event) {
    const tip = getPopup();
    if (current !== el) {
      tip.textContent = label(el);
      current = el;
    }
    tip.classList.add('is-visible');

    const pad = 14;
    const width = tip.offsetWidth || 220;
    const height = tip.offsetHeight || 48;
    let left = event.clientX + pad;
    let top = event.clientY + pad;
    if (left + width > window.innerWidth - 8) {
      left = event.clientX - width - pad;
    }
    if (top + height > window.innerHeight - 8) {
      top = event.clientY - height - pad;
    }
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function hide() {
    current = null;
    if (popup) popup.classList.remove('is-visible');
  }

  function targetFrom(node) {
    if (!node || !node.closest) return null;
    return node.closest('[data-guide]');
  }

  document.addEventListener(
    'mouseover',
    (event) => {
      const el = targetFrom(event.target);
      if (!el) return;
      place(el, event);
    },
    true
  );

  document.addEventListener(
    'mousemove',
    (event) => {
      const el = targetFrom(event.target);
      if (!el) {
        hide();
        return;
      }
      place(el, event);
    },
    true
  );

  document.addEventListener(
    'mouseout',
    (event) => {
      const el = targetFrom(event.target);
      if (!el) return;
      const next = targetFrom(event.relatedTarget);
      if (next === el) return;
      if (!next) hide();
    },
    true
  );

  window.addEventListener('scroll', hide, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
})();
