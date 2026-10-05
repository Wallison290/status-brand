// Seção 03: a luz dentro de cada círculo acompanha o cursor.
(() => {
  'use strict';
  document.querySelectorAll('.eco3-circle').forEach(circle => {
    circle.addEventListener('pointermove', e => {
      const r = circle.getBoundingClientRect();
      circle.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      circle.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });
})();
