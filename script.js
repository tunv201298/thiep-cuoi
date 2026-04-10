(function () {
  const revealSelector = '.reveal,.reveal-l,.reveal-r,.reveal-s';

  function setupReveal(root) {
    if (!root) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    root.querySelectorAll(revealSelector).forEach((el) => {
      if (!el.classList.contains('vis')) {
        obs.observe(el);
      }
    });
  }

  // Preload lazy images 600px before they enter viewport
  function setupEagerLazy() {
    if (!('IntersectionObserver' in window)) return;
    const imgObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          img.removeAttribute('loading');
          imgObs.unobserve(img);
        }
      });
    }, { rootMargin: '600px 0px' });

    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      imgObs.observe(img);
    });
  }

  function addFloatingHearts() {
    document.querySelectorAll('.hero').forEach((hero) => {
      const positions = [
        [15, 30, '2s'],
        [76, 56, '3.2s'],
        [88, 20, '1.7s'],
        [12, 72, '4s'],
      ];

      positions.forEach(([left, top, delay]) => {
        const heart = document.createElement('div');
        heart.className = 'float-heart';
        heart.textContent = '♡';
        heart.style.cssText = `left:${left}%;top:${top}%;animation-delay:${delay};`;
        hero.appendChild(heart);
      });
    });
  }

  function addPetals() {
    const petals = ['🌸', '🌺', '🌷', '❀', '✿'];
    let count = 0;

    function spawnPetal() {
      if (count >= 18) return;
      count += 1;

      const petal = document.createElement('div');
      petal.className = 'petal';

      const x = Math.random() * 100;
      const duration = 6 + Math.random() * 8;
      const delay = Math.random() * 4;
      const drift = (Math.random() - 0.5) * 200;

      petal.style.cssText = `left:${x}vw;--px:${drift}px;animation-duration:${duration}s;animation-delay:${delay}s;`;
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      document.body.appendChild(petal);

      setTimeout(() => {
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDelay = '0s';
      }, (duration + delay) * 1000);
    }

    for (let i = 0; i < 18; i += 1) {
      spawnPetal();
    }
  }

  function setupTabs() {
    const buttons = Array.from(document.querySelectorAll('.switch-btn'));
    const panels = Array.from(document.querySelectorAll('[data-panel]'));
    if (!buttons.length || !panels.length) return;

    function activate(panelId, options = {}) {
      const { scroll = true } = options;

      buttons.forEach((button) => {
        const active = button.dataset.target === panelId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        const active = panel.id === panelId;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });

      const activePanel = document.getElementById(panelId);
      setupReveal(activePanel);
      if (scroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => activate(button.dataset.target));
    });

    const tabParam = new URLSearchParams(window.location.search).get('ban_thiep');
    const panelMap = {
      vuquy: 'vu-quy-panel',
      thanhhon: 'thanh-hon-panel',
    };
    const defaultPanel = panelMap[(tabParam || '').toLowerCase()];
    if (defaultPanel) {
      activate(defaultPanel, { scroll: false });
    }
  }

  function setupGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guestName = (
      params.get('guest')
      || params.get('name')
      || params.get('khach')
      || params.get('invitee')
      || ''
    ).trim();

    document.querySelectorAll('[data-guest-name]').forEach((el) => {
      el.textContent = guestName;
      el.classList.toggle('is-empty', !guestName);
    });
  }

  function setupSliders() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      const track = slider.querySelector('.memory-track');
      const slides = Array.from(slider.querySelectorAll('.memory-slide'));
      const section = slider.closest('.memory-gallery');
      const thumbs = section ? Array.from(section.querySelectorAll('.memory-thumb')) : [];
      const prevBtn = slider.querySelector('[data-prev]');
      const nextBtn = slider.querySelector('[data-next]');
      let index = 0;

      if (!track || !slides.length) return;

      function render(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;

        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('active', slideIndex === index);
        });

        thumbs.forEach((thumb, thumbIndex) => {
          const active = thumbIndex === index;
          thumb.classList.toggle('active', active);
          thumb.setAttribute('aria-selected', String(active));
        });
      }

      prevBtn?.addEventListener('click', () => render(index - 1));
      nextBtn?.addEventListener('click', () => render(index + 1));

      thumbs.forEach((thumb, thumbIndex) => {
        thumb.addEventListener('click', () => render(thumbIndex));
      });

      let touchStartX = 0;

      track.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0]?.clientX || 0;
      }, { passive: true });

      track.addEventListener('touchend', (event) => {
        const touchEndX = event.changedTouches[0]?.clientX || 0;
        const delta = touchEndX - touchStartX;

        if (Math.abs(delta) < 40) return;
        render(index + (delta < 0 ? 1 : -1));
      }, { passive: true });

      render(0);
    });
  }

  function setupParentDividers() {
    document.querySelectorAll('.parent-col p').forEach((el) => {
      if (el.querySelector('.parent-divider') || el.querySelector('.parent-names')) return;

      const normalizedHtml = el.innerHTML.replace(/<br\s*\/?>/gi, '<br>');
      const parts = normalizedHtml
        .split('<br>')
        .map((part) => part.replace(/&nbsp;/gi, ' ').trim());

      const dividerIndex = parts.findIndex((part) => {
        return /^(?:\d|thon|thôn|xa|xã|phuong|phường|quan|quận|tp|thanh pho|thành phố|duong|đường)/i.test(part);
      });

      if (dividerIndex <= 0) return;

      const nameLines = parts.slice(0, dividerIndex).filter(Boolean).join('<br>');
      const addressLines = parts.slice(dividerIndex).filter(Boolean).join('<br>');

      el.innerHTML = [
        `<span class="parent-names">${nameLines}</span>`,
        '<span class="parent-divider" aria-hidden="true"></span>',
        `<span class="parent-address">${addressLines}</span>`,
      ].join('');
    });
  }

  function setupRandomImages() {
    // All available images split by group
    const heroPool = [
      'WIN_2326.webp','WIN_2355.webp','WIN_2362.webp','WIN_2422.webp',
      'WIN_2442.webp','WIN_2486.webp','WIN_2536.webp','WIN_2562.webp',
      'WIN_2588.webp','WIN_2611.webp',
    ];
    const galleryPool = [
      'WIN_1738.webp','WIN_1744.webp','WIN_1755.webp','WIN_1764.webp',
      'WIN_1866.webp','WIN_1891.webp','WIN_1910.webp','WIN_1927.webp',
      'WIN_1964.webp','WIN_2003.webp','WIN_2018.webp','WIN_2023.webp',
      'WIN_2091.webp','WIN_2100.webp','WIN_2104.webp','WIN_2165.webp',
      'WIN_2198.webp','WIN_2246.webp',
    ];
    const bandPool = [
      'WIN_2003.webp','WIN_2018.webp','WIN_2023.webp','WIN_2091.webp',
      'WIN_2100.webp','WIN_2104.webp','WIN_2165.webp','WIN_2198.webp',
      'WIN_2246.webp','WIN_2326.webp','WIN_2355.webp','WIN_2362.webp',
    ];
    const tlPool = [
      'WIN_2003.webp','WIN_2018.webp','WIN_2023.webp','WIN_2165.webp',
      'WIN_2198.webp','WIN_2246.webp',
    ];

    function pick(pool, exclude) {
      const filtered = pool.filter((f) => !exclude.includes(f));
      return filtered[Math.floor(Math.random() * filtered.length)];
    }

    const used = [];

    function assign(selector, pool) {
      const el = document.querySelector(selector);
      if (!el) return;
      const img = pick(pool, used);
      if (!img) return;
      used.push(img);
      el.src = `./img/${img}`;
    }

    assign('[data-random-hero="vuquy"]', heroPool);
    assign('[data-random-hero="thanhhon"]', heroPool);
    assign('[data-random-gallery="vuquy-1"]', galleryPool);
    assign('[data-random-gallery="vuquy-2"]', galleryPool);
    assign('[data-random-gallery="thanhhon-1"]', galleryPool);
    assign('[data-random-gallery="thanhhon-2"]', galleryPool);
    assign('[data-random-band="vuquy-main"]', bandPool);
    assign('[data-random-band="vuquy-sub1"]', bandPool);
    assign('[data-random-band="vuquy-sub2"]', bandPool);
    assign('[data-random-band="thanhhon-main"]', bandPool);
    assign('[data-random-band="thanhhon-sub1"]', bandPool);
    assign('[data-random-band="thanhhon-sub2"]', bandPool);
    assign('[data-random-tl="vuquy"]', tlPool);
    assign('[data-random-tl="thanhhon"]', tlPool);
  }

  function setupCountdown() {
    // Target: Lễ Vu Quy 23/05/2026 10:00 (earlier event)
    const target = new Date('2026-05-23T10:00:00');

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');
    if (!dEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
        return;
      }
      const totalSecs = Math.floor(diff / 1000);
      dEl.textContent = pad(Math.floor(totalSecs / 86400));
      hEl.textContent = pad(Math.floor((totalSecs % 86400) / 3600));
      mEl.textContent = pad(Math.floor((totalSecs % 3600) / 60));
      sEl.textContent = pad(totalSecs % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  function setupGiftPopup() {
    const btn = document.getElementById('gift-box-btn');
    const modal = document.getElementById('qr-modal');
    const closeBtn = document.getElementById('qr-close');
    const backdrop = document.getElementById('qr-backdrop');
    if (!btn || !modal) return;

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      btn.focus();
    }

    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  // ── Lightbox ──
  function setupLightbox() {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Xem ảnh phóng to');
    lb.innerHTML = `
      <div id="lb-backdrop"></div>
      <button id="lb-close" type="button" aria-label="Đóng">&#10005;</button>
      <button id="lb-prev" type="button" aria-label="Ảnh trước">&#8249;</button>
      <div id="lb-img-wrap"><img id="lb-img" src="" alt="" /></div>
      <button id="lb-next" type="button" aria-label="Ảnh tiếp theo">&#8250;</button>
    `;
    document.body.appendChild(lb);

    const lbEl = lb;
    const lbImg = lb.querySelector('#lb-img');
    const lbClose = lb.querySelector('#lb-close');
    const lbPrev = lb.querySelector('#lb-prev');
    const lbNext = lb.querySelector('#lb-next');
    const lbBackdrop = lb.querySelector('#lb-backdrop');

    let pool = [];
    let current = 0;

    function getClickableImages() {
      return Array.from(document.querySelectorAll(
        '.memory-slide img, .gallery2 img, .spotlight-photo img, .photo-band img, .g2-item img, .hero-img'
      ));
    }

    function open(src, alt, allImgs, idx) {
      pool = allImgs.map((i) => ({ src: i.src, alt: i.alt }));
      current = idx;
      lbImg.src = src;
      lbImg.alt = alt || '';
      lbEl.classList.add('active');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
      updateNav();
    }

    function close() {
      lbEl.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateNav() {
      lbPrev.style.display = pool.length > 1 ? '' : 'none';
      lbNext.style.display = pool.length > 1 ? '' : 'none';
    }

    function navigate(dir) {
      current = (current + dir + pool.length) % pool.length;
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = pool[current].src;
        lbImg.alt = pool[current].alt || '';
        lbImg.style.opacity = '1';
      }, 150);
    }

    lbClose.addEventListener('click', close);
    lbBackdrop.addEventListener('click', close);
    lbPrev.addEventListener('click', () => navigate(-1));
    lbNext.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
      if (!lbEl.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Touch swipe
    let touchX = 0;
    lbImg.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lbImg.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 40) navigate(delta < 0 ? 1 : -1);
    }, { passive: true });

    // Attach click to all clickable images (delegated)
    document.addEventListener('click', (e) => {
      const img = e.target.closest('.memory-slide img, .gallery2 img, .spotlight-photo img, .photo-band img, .g2-item img');
      if (!img) return;
      const allImgs = getClickableImages();
      const idx = allImgs.indexOf(img);
      open(img.src, img.alt, allImgs, idx >= 0 ? idx : 0);
    });
  }

  function setupMusic() {
    const gate = document.getElementById('intro-gate');
    const enterBtn = document.getElementById('enter-btn');
    const btn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    if (!gate || !enterBtn || !btn || !audio) return;

    audio.loop = true;
    audio.volume = 0.45;
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.muted = false;
    audio.load();

    let playing = false;

    const playIcon = '<svg viewBox="0 0 24 24" class="note-icon"><path d="M8 5v14l11-7z"/></svg>';
    const pauseIcon = '<svg viewBox="0 0 24 24" class="note-icon"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

    function syncButton() {
      btn.classList.toggle('playing', playing);
      btn.innerHTML = (playing ? pauseIcon : playIcon) + '<span class="ripple"></span>';
    }

    function playAudio() {
      return audio.play().then(() => {
        playing = true;
        syncButton();
      }).catch(() => { });
    }

    function pauseAudio() {
      audio.pause();
      playing = false;
      syncButton();
    }

    function hideGate() {
      gate.classList.add('opening');
      window.setTimeout(() => {
        gate.classList.add('hidden');
      }, 1350);
    }

    syncButton();

    enterBtn.addEventListener('click', () => {
      enterBtn.disabled = true;
      playAudio().finally(hideGate);
    }, { once: true });

    btn.addEventListener('click', () => {
      if (playing) {
        pauseAudio();
        return;
      }
      playAudio();
    });

    audio.addEventListener('playing', () => {
      playing = true;
      syncButton();
    });

    audio.addEventListener('pause', () => {
      playing = false;
      syncButton();
    });
  }

  setupReveal(document);
  addFloatingHearts();
  addPetals();
  setupTabs();
  setupGuestName();
  setupSliders();
  setupParentDividers();
  setupMusic();
  // setupRandomImages();
  setupCountdown();
  setupGiftPopup();
  setupLightbox();
  setupEagerLazy();
})();
