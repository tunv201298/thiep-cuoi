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

    function activate(panelId) {
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => activate(button.dataset.target));
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
  setupMusic();
})();
