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
})();
