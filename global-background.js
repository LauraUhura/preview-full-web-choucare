/* Global background: Dark corporative static canvas (#0c110d); scroll UI utilities. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('#scroll-progress-bar');
  const header = document.querySelector('.site-header');

  // Fix global dark corporate background #0c110d statically
  root.style.setProperty('--canvas-bg', '#0c110d');
  root.classList.add('has-fluid-canvas');

  let scheduled = false;
  const updateScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const fraction = Math.max(0, Math.min(1, window.scrollY / max));
    if (progress) progress.style.transform = `scaleX(${fraction})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  window.addEventListener('load', updateScroll, { once: true });
  reduced.addEventListener?.('change', updateScroll);
  updateScroll();

  const visual = document.querySelector('.interior .hero-visual');
  if (visual && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    visual.addEventListener('pointermove', e => {
      if (reduced.matches) return;
      const box = visual.getBoundingClientRect();
      visual.style.setProperty('--pointer-x', `${((e.clientX - box.left) / box.width - .5) * 12}px`);
      visual.style.setProperty('--pointer-y', `${((e.clientY - box.top) / box.height - .5) * 12}px`);
    }, { passive: true });
    visual.addEventListener('pointerleave', () => {
      visual.style.setProperty('--pointer-x', '0px');
      visual.style.setProperty('--pointer-y', '0px');
    });
  }

  // Interactive cursor-reactive green bubbles for interior heroes (and home)
  const canTrack = matchMedia('(hover: hover) and (pointer: fine)');
  const interiorHeroes = document.querySelectorAll('.interior-page .wf-hero');
  interiorHeroes.forEach(hero => {
    let aurora = hero.querySelector('.hero-aurora');
    if (!aurora) return;
    let pointer = aurora.querySelector('.hero-aurora-pointer');
    if (!pointer) {
      pointer = document.createElement('div');
      pointer.className = 'hero-aurora-light hero-aurora-pointer';
      aurora.appendChild(pointer);
    }
    if (!canTrack.matches) return;

    let frame = 0, currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    const followPointer = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      pointer.style.setProperty('--aurora-x', `${currentX.toFixed(1)}px`);
      pointer.style.setProperty('--aurora-y', `${currentY.toFixed(1)}px`);
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.5) {
        frame = requestAnimationFrame(followPointer);
      } else {
        frame = 0;
      }
    };

    hero.addEventListener('pointermove', (event) => {
      if (reduced.matches || (event.pointerType && event.pointerType !== 'mouse')) return;
      const bounds = hero.getBoundingClientRect();
      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;
      if (!hero.classList.contains('has-aurora-pointer')) {
        currentX = targetX;
        currentY = targetY;
        hero.classList.add('has-aurora-pointer');
      }
      if (!frame) frame = requestAnimationFrame(followPointer);
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
      hero.classList.remove('has-aurora-pointer');
      cancelAnimationFrame(frame);
      frame = 0;
    });
  });
})();
