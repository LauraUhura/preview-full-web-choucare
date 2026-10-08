/* Interacciones progresivas del piloto 03C: ninguna es necesaria para leer contenido. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notice = document.querySelector('#preview-notice');
  const noticeText = document.querySelector('#preview-message');
  const noticeDismiss = document.querySelector('#preview-dismiss');
  const progress = document.querySelector('#scroll-progress-bar');
  const header = document.querySelector('.site-header');
  const sections = [...document.querySelectorAll('.home-section[data-section]')];
  let noticeTrigger = null;

  const mobileLayout = window.matchMedia('(max-width: 48rem)');
  const mobileCarousels = [...document.querySelectorAll('.evidence-grid, .editorial-grid, .need-grid, .partner-cloud')];
  const syncCarouselTabStops = () => {
    mobileCarousels.forEach((carousel) => { carousel.tabIndex = mobileLayout.matches ? 0 : -1; });
  };
  syncCarouselTabStops();
  mobileLayout.addEventListener?.('change', syncCarouselTabStops);
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('#primary-nav');
  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menú');
    };
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (open) mobileNav.querySelector('a, button')?.focus();
    });
    mobileNav.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
    mobileLayout.addEventListener?.('change', closeMenu);
    root.classList.add('mobile-menu-ready');
  }

  const footerGroups = [...document.querySelectorAll('.footer-group')];
  if (footerGroups.length) {
    const syncFooterGroups = () => {
      footerGroups.forEach((group) => { group.open = !mobileLayout.matches; });
    };
    syncFooterGroups();
    mobileLayout.addEventListener?.('change', syncFooterGroups);
  }

  const partnerRail = document.querySelector('.partner-cloud');
  if (partnerRail) {
    const originalCards = [...partnerRail.children];
    const desktopRailLabel = partnerRail.getAttribute('aria-label');
    let clones = [];
    let cycle = 0;
    let autoPosition = 0;
    let frame = 0;
    let lastTime = 0;
    let inView = false;
    let hovered = false;
    let dragStart = null;
    let resumeTimer = 0;
    const active = () => mobileLayout.matches && !reduced.matches;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; partnerRail.classList.remove('is-auto'); };
    const measureCycle = () => {
      cycle = clones.length ? clones[0].offsetLeft - originalCards[0].offsetLeft : 0;
    };
    const tick = (time) => {
      if (!active() || !inView || hovered || dragStart || document.hidden) { stop(); return; }
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      if (cycle > 0) {
        autoPosition += elapsed * .022;
        if (autoPosition >= cycle) autoPosition -= cycle;
        partnerRail.scrollLeft = autoPosition;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (active() && inView && !hovered && !dragStart && !resumeTimer && !document.hidden && !frame) {
        partnerRail.classList.add('is-auto');
        autoPosition = partnerRail.scrollLeft;
        frame = requestAnimationFrame(tick);
      }
    };
    const pause = (delay = 0) => {
      stop();
      clearTimeout(resumeTimer);
      resumeTimer = delay ? window.setTimeout(() => { resumeTimer = 0; start(); }, delay) : 0;
    };
    const sync = () => {
      pause();
      partnerRail.setAttribute('aria-label', mobileLayout.matches ? 'Aliados de Choucair; desliza horizontalmente para ver los cuatro logos' : desktopRailLabel);
      if (active()) {
        if (!clones.length) {
          clones = originalCards.slice(0, 4).map((card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.inert = true;
            clone.querySelector('img').alt = '';
            partnerRail.append(clone);
            return clone;
          });
        }
        measureCycle();
        start();
      } else {
        clones.forEach((clone) => clone.remove());
        clones = [];
        cycle = 0;
        partnerRail.classList.remove('is-auto');
        partnerRail.scrollLeft = 0;
      }
    };
    partnerRail.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') { hovered = true; pause(); }
    });
    partnerRail.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') { hovered = false; pause(1600); }
    });
    partnerRail.addEventListener('pointerdown', (event) => {
      pause();
      if (!mobileLayout.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
      dragStart = { x: event.clientX, left: partnerRail.scrollLeft };
      partnerRail.setPointerCapture(event.pointerId);
      partnerRail.classList.add('is-dragging');
      event.preventDefault();
    });
    partnerRail.addEventListener('pointermove', (event) => {
      if (dragStart) partnerRail.scrollLeft = dragStart.left - (event.clientX - dragStart.x);
    });
    const endDrag = () => {
      dragStart = null;
      partnerRail.classList.remove('is-dragging');
      if (!hovered) pause(3000);
    };
    partnerRail.addEventListener('pointerup', endDrag);
    partnerRail.addEventListener('pointercancel', endDrag);
    partnerRail.addEventListener('lostpointercapture', endDrag);
    partnerRail.addEventListener('wheel', () => pause(2500), { passive: true });
    partnerRail.addEventListener('focusin', () => pause());
    partnerRail.addEventListener('focusout', () => pause(1600));
    mobileLayout.addEventListener?.('change', sync);
    reduced.addEventListener?.('change', sync);
    window.addEventListener('resize', measureCycle, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start(); else stop();
      }, { threshold: .05 }).observe(partnerRail);
    } else inView = true;
    sync();
  }

  const closeNotice = () => {
    if (notice.hidden) return;
    notice.hidden = true;
    noticeTrigger?.focus();
  };
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNotice();
  });

  document.querySelectorAll('[data-preview-target]').forEach((button) => {
    button.addEventListener('click', () => {
      noticeTrigger = button;
      const page = button.getAttribute('data-preview-target');
      noticeText.textContent = `El contenido de ${page} aún no está disponible.`;
      notice.hidden = false;
      noticeDismiss.focus();
    });
  });
  noticeDismiss?.addEventListener('click', closeNotice);

  const industryTags = document.querySelector('.industry-tag-viewport');
  if (industryTags) {
    const tagRail = industryTags.closest('.industry-tag-rail');
    const previousTagButton = tagRail.querySelector('.industry-tag-arrow--previous');
    const nextTagButton = tagRail.querySelector('.industry-tag-arrow--next');
    const updateTagEdge = () => {
      const maxScroll = industryTags.scrollWidth - industryTags.clientWidth;
      const atEnd = industryTags.scrollLeft >= maxScroll - 1;
      tagRail.classList.toggle('is-not-overflowing', maxScroll <= 1);
      tagRail.classList.toggle('is-at-end', maxScroll > 1 && atEnd);
      previousTagButton.disabled = maxScroll <= 1 || industryTags.scrollLeft <= 1;
      nextTagButton.disabled = maxScroll <= 1 || atEnd;
    };
    const moveTags = (direction) => industryTags.scrollBy({ left: direction * industryTags.clientWidth * .78, behavior: reduced.matches ? 'auto' : 'smooth' });
    previousTagButton.addEventListener('click', () => moveTags(-1));
    nextTagButton.addEventListener('click', () => moveTags(1));
    const updateRailMode = () => {
      const manual = window.matchMedia('(max-width: 48rem), (prefers-reduced-motion: reduce)').matches;
      const wasManual = tagRail.classList.contains('is-manual');
      tagRail.classList.toggle('is-manual', manual);
      if (manual !== wasManual) industryTags.scrollLeft = 0;
      updateTagEdge();
    };
    let dragStart = null;
    industryTags.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragStart = { x: event.clientX, scrollLeft: industryTags.scrollLeft };
      industryTags.setPointerCapture(event.pointerId);
      industryTags.classList.add('is-dragging');
      event.preventDefault();
    });
    industryTags.addEventListener('pointermove', (event) => {
      if (!dragStart) return;
      industryTags.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x);
    });
    const endTagDrag = () => { dragStart = null; industryTags.classList.remove('is-dragging'); };
    industryTags.addEventListener('pointerup', endTagDrag);
    industryTags.addEventListener('pointercancel', endTagDrag);
    industryTags.addEventListener('lostpointercapture', endTagDrag);
    industryTags.addEventListener('scroll', updateTagEdge, { passive: true });
    window.addEventListener('resize', updateRailMode, { passive: true });
    industryTags.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const distance = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? industryTags.clientWidth : 1);
      const maxScroll = industryTags.scrollWidth - industryTags.clientWidth;
      if ((distance > 0 && industryTags.scrollLeft < maxScroll - 1) || (distance < 0 && industryTags.scrollLeft > 1)) {
        event.preventDefault();
        industryTags.scrollLeft += distance;
      }
    }, { passive: false });
    root.classList.add('industry-rail-enhanced');
    updateRailMode();
    document.fonts?.ready.then(updateRailMode);
  }

  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const updateBackToTop = () => {
      const visible = window.scrollY > 600;
      backToTop.classList.toggle('is-visible', visible);
      backToTop.tabIndex = visible ? 0 : -1;
      backToTop.setAttribute('aria-hidden', String(!visible));
    };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }));
    updateBackToTop();
  }

  if ('IntersectionObserver' in window && !reduced.matches) {
    const headings = [...document.querySelectorAll('.home-section h1, .home-section h2:not(.visually-hidden)')];
    const titleObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    headings.forEach((heading) => {
      const label = heading.textContent.replace(/\s+/gu, ' ').trim();
      let letterIndex = 0;
      const splitLetters = (element) => {
        [...element.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const fragment = document.createDocumentFragment();
            (node.textContent.match(/\s+|[^\s]+/gu) || []).forEach((part) => {
              if (/^\s+$/u.test(part)) { fragment.append(document.createTextNode(part)); return; }
              const word = document.createElement('span');
              word.className = 'title-word';
              word.setAttribute('aria-hidden', 'true');
              [...part].forEach((character) => {
                const letter = document.createElement('span');
                letter.className = `title-letter${(letterIndex + 1) % 2 === 0 ? ' is-even' : ''}`;
                letter.style.setProperty('--letter-delay', `${letterIndex * 40}ms`);
                letter.textContent = character;
                word.append(letter);
                letterIndex += 1;
              });
              fragment.append(word);
            });
            node.replaceWith(fragment);
          } else if (node.nodeType === Node.ELEMENT_NODE) splitLetters(node);
        });
      };
      splitLetters(heading);
      heading.setAttribute('aria-label', label);
      heading.classList.remove('reveal');
      heading.classList.add('title-assembly');
      titleObserver.observe(heading);
    });
    root.classList.add('has-title-assembly');
  }

  if ('IntersectionObserver' in window) {
    if (!reduced.matches) {
      root.classList.add('has-motion');
      const reveal = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -7% 0px', threshold: .08 });
      document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));
    }
  }

  // El texto final queda en el HTML; el conteo solo modifica la copia visual.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const formatStat = (value, decimals, prefix, suffix) => {
      const factor = 10 ** decimals;
      const units = Math.floor(value / factor);
      const fraction = value % factor;
      const thousands = String(units).replace(/\B(?=(\d{3})+(?!\d))/gu, '.');
      return `${prefix}${thousands}${decimals ? `,${String(fraction).padStart(decimals, '0')}` : ''}${suffix}`;
    };
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const visual = entry.target.querySelector('.stat-count');
        const original = visual?.textContent.trim();
        const parts = /^(\+?)(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d+))?(%)?$/u.exec(original || '');
        if (!parts) return;
        const [, prefix, integer, fraction = '', suffix = ''] = parts;
        const decimals = fraction.length;
        const finalValue = Number(integer.replaceAll('.', '') + fraction);
        if (!Number.isSafeInteger(finalValue)) return;
        visual.textContent = formatStat(0, decimals, prefix, suffix);
        const duration = 1500;
        let start;
        const tick = (time) => {
          if (start === undefined) start = time;
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          visual.textContent = progress < 1
            ? formatStat(Math.round(finalValue * eased), decimals, prefix, suffix)
            : original;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .2 });
    document.querySelectorAll('.evidence-plate').forEach((card) => countObserver.observe(card));
  }

  const canTrack = window.matchMedia('(pointer: fine)');
  const heroStage = document.querySelector('.hero-stage');
  const auroraPointer = heroStage?.querySelector('.hero-aurora-pointer');
  if (heroStage && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroStage.classList.toggle('is-aurora-paused', !entry.isIntersecting);
    }, { rootMargin: '100px' }).observe(heroStage);
  }
  if (heroStage && auroraPointer && canTrack.matches && !reduced.matches) {
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const followPointer = () => {
      currentX += (targetX - currentX) * .18;
      currentY += (targetY - currentY) * .18;
      auroraPointer.style.setProperty('--aurora-x', `${currentX.toFixed(1)}px`);
      auroraPointer.style.setProperty('--aurora-y', `${currentY.toFixed(1)}px`);
      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .5) frame = requestAnimationFrame(followPointer);
      else frame = 0;
    };
    heroStage.addEventListener('pointermove', (event) => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      const bounds = heroStage.getBoundingClientRect();
      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;
      if (!heroStage.classList.contains('has-aurora-pointer')) {
        currentX = targetX;
        currentY = targetY;
        heroStage.classList.add('has-aurora-pointer');
      }
      if (!frame) frame = requestAnimationFrame(followPointer);
    }, { passive: true });
    heroStage.addEventListener('pointerleave', () => {
      heroStage.classList.remove('has-aurora-pointer');
      cancelAnimationFrame(frame);
      frame = 0;
    });
  }
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && canTrack.matches && !reduced.matches) {
    heroVisual.addEventListener('pointermove', (event) => {
      const box = heroVisual.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 12;
      const y = ((event.clientY - box.top) / box.height - .5) * 12;
      heroVisual.style.setProperty('--pointer-x', `${x.toFixed(1)}px`);
      heroVisual.style.setProperty('--pointer-y', `${y.toFixed(1)}px`);
    }, { passive: true });
    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--pointer-x', '0px');
      heroVisual.style.setProperty('--pointer-y', '0px');
    });
  }


})();
