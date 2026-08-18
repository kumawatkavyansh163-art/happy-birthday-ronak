/* ============================================================
   HAPPY BIRTHDAY RONAK — APP SCRIPT
   Sections:
   1. Config & state
   2. Galaxy (Three.js) background + parallax
   3. Constellation signature (SVG line -> heart)
   4. Loading sequence
   5. Scene animations (GSAP + ScrollTrigger)
   6. Cake interaction
   7. Gift interaction
   8. Fireworks + balloons (finale)
   9. Music controller
   10. Replay system
   11. Boot
============================================================ */

(() => {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     1. CONFIG & STATE
  --------------------------------------------------------- */
  const LETTER_MESSAGE =
`Dear Ronak,
 
  This is for my forever and ever buddyyy

 Bhai dhekh mere ko letter ita likhna nhi aatha thoo thoda khrab hoga per padh lena .

You always with me when i need you the most you always stood with mee in my bad timess.

Thank you for always beliving me when no one does ,you are that person that gives me confidence when i look down on myself.

Your support, your frindship and the love you gave me i cannot express in words . it cannot be expressed it can  only be felt.

i dont have a older brother but you always fulfilled that role in my life

You are not just my best buddyyyyy.

You are my older brother  .

I hope this year of your life comes with great memories and happiest moments .

Happy Birthday.

— Kavyansh ❤`;

  const state = {
    played: {},          // which one-shot scene animations have already run
    musicMode: 'bg',      // 'bg' | 'uplift'
    isMuted: true,
    typewriterTimer: null,
    fireworksActive: false,
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------------------------------------------------------
     2. GALAXY BACKGROUND (Three.js)
  --------------------------------------------------------- */
  const Galaxy = (() => {
    let renderer, scene, camera, starField, nebulaField;
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    const baseZ = 60;

    function init() {
      const canvas = $('#galaxy-canvas');
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
      camera.position.z = baseZ;

      starField = buildStars(4200, 220, 0.55, 1.6);
      nebulaField = buildStars(500, 140, 2.5, 5, true);
      scene.add(starField, nebulaField);

      window.addEventListener('resize', onResize);
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });

      animate();
    }

    function buildStars(count, spread, minSize, maxSize, tinted = false) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const palette = [
        new THREE.Color('#ffffff'),
        new THREE.Color('#a996ff'),
        new THREE.Color('#38e6c5'),
        new THREE.Color('#ff6f91'),
      ];

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * spread;
        positions[i3 + 1] = (Math.random() - 0.5) * spread;
        positions[i3 + 2] = (Math.random() - 0.5) * spread;

        const c = tinted
          ? palette[1 + Math.floor(Math.random() * 3)]
          : palette[Math.random() > 0.85 ? Math.floor(Math.random() * palette.length) : 0];
        colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: minSize + Math.random() * (maxSize - minSize),
        vertexColors: true,
        transparent: true,
        opacity: tinted ? 0.35 : 0.9,
        sizeAttenuation: true,
        depthWrite: false,
      });

      return new THREE.Points(geometry, material);
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e) {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    }
    function onTouchMove(e) {
      if (!e.touches[0]) return;
      mouseX = (e.touches[0].clientX / window.innerWidth) - 0.5;
      mouseY = (e.touches[0].clientY / window.innerHeight) - 0.5;
    }

    function animate() {
      requestAnimationFrame(animate);

      starField.rotation.y += 0.0006;
      starField.rotation.x += 0.0002;
      nebulaField.rotation.y -= 0.0003;

      targetRotX += (mouseY * 0.4 - targetRotX) * 0.02;
      targetRotY += (mouseX * 0.4 - targetRotY) * 0.02;
      camera.rotation.x = targetRotX;
      camera.rotation.y = targetRotY;

      renderer.render(scene, camera);
    }

    // Cinematic dolly zoom used during the birthday reveal
    function zoomPulse() {
      gsap.to(camera.position, {
        z: baseZ - 18,
        duration: 3.2,
        ease: 'power2.out',
        yoyo: true,
        onComplete: () => gsap.to(camera.position, { z: baseZ, duration: 6, ease: 'sine.inOut' }),
      });
    }

    function resetCamera() {
      gsap.killTweensOf(camera.position);
      camera.position.z = baseZ;
    }

    return { init, zoomPulse, resetCamera };
  })();

  /* ---------------------------------------------------------
     3. CONSTELLATION SIGNATURE (SVG line -> heart)
  --------------------------------------------------------- */
  const Constellation = (() => {
    const svg = $('#constellation-svg');
    const path = $('#constellation-path');
    const pointsGroup = $('#constellation-points');
    let points = [];

    function ensureGradientDef() {
      if ($('#constellation-gradient')) return;
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c5cff"/>
          <stop offset="50%" stop-color="#38e6c5"/>
          <stop offset="100%" stop-color="#ff6f91"/>
        </linearGradient>`;
      svg.prepend(defs);
    }

    function sizeSvg() {
      svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    }

    // A star-point per scene, roughly at that scene's vertical center.
    function buildScenePoints() {
      points = $$('.scene').map((scene, i) => {
        const rect = scene.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const cx = (window.innerWidth * (0.2 + 0.6 * ((i % 3) / 2))) ;
        const cy = rect.top + scrollY + rect.height / 2;
        return { x: cx, y: cy, docY: cy };
      });
    }

    // Heart-shaped points laid out in *viewport* space for the finale resolve.
    function heartPoints(count = 14) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.42;
      const scale = Math.min(window.innerWidth, window.innerHeight) * 0.017;
      const pts = [];
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        pts.push({ x: cx + x * scale, y: cy + y * scale });
      }
      return pts;
    }

    function render(progress) {
      // progress: 0..1 across the whole scrollable experience
      const scrollY = window.scrollY || window.pageYOffset;
      let visible;

      if (progress < 0.82) {
        const count = Math.max(1, Math.round(progress / 0.82 * points.length));
        visible = points.slice(0, count).map(p => ({ x: p.x, y: p.docY - scrollY }));
      } else {
        // Resolve into the heart as the ending scene approaches.
        const heartT = (progress - 0.82) / 0.18;
        const hp = heartPoints();
        visible = hp.map(p => ({ x: p.x, y: p.y }));
        pointsGroup.style.opacity = Math.min(1, heartT * 1.4);
      }

      if (progress < 0.82) pointsGroup.style.opacity = 1;

      const d = visible.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      path.setAttribute('d', d);

      pointsGroup.innerHTML = visible.map(p =>
        `<circle class="constellation-point" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.8"></circle>`
      ).join('');
    }

    function init() {
      ensureGradientDef();
      sizeSvg();
      buildScenePoints();
      window.addEventListener('resize', () => { sizeSvg(); buildScenePoints(); });

      ScrollTrigger.create({
        trigger: '#experience',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => render(self.progress),
      });
    }

    function reset() {
      path.setAttribute('d', '');
      pointsGroup.innerHTML = '';
    }

    return { init, reset, buildScenePoints };
  })();

  /* ---------------------------------------------------------
     4. LOADING SEQUENCE
  --------------------------------------------------------- */
  function runLoadingSequence(onDone) {
    const fill = $('#loading-bar-fill');
    const percentLabel = $('#loading-percent');
    const proxy = { v: 0 };

    document.body.style.overflow = 'hidden';

    gsap.to(proxy, {
      v: 100,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(proxy.v);
        fill.style.width = `${val}%`;
        percentLabel.textContent = `${val}%`;
      },
      onComplete: () => {
        gsap.to('#scene-loading', {
          opacity: 0,
          duration: 0.9,
          ease: 'power2.inOut',
          onComplete: () => {
            $('#scene-loading').style.display = 'none';
            document.body.style.overflow = '';
            onDone && onDone();
          },
        });
      },
    });
  }

  /* ---------------------------------------------------------
     5. SCENE ANIMATIONS
  --------------------------------------------------------- */
  function playOnce(key, fn) {
    if (state.played[key]) return;
    state.played[key] = true;
    fn();
  }

  function initIntroScene() {
    ScrollTrigger.create({
      trigger: '#scene-intro',
      start: 'top 70%',
      onEnter: () => playOnce('intro', () => {
        gsap.fromTo('.eyebrow--intro', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
        gsap.fromTo('#intro-line', { opacity: 0, y: 24, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, delay: 0.2, ease: 'power3.out' });
      }),
    });
  }

  function initRevealScene() {
    ScrollTrigger.create({
      trigger: '#scene-reveal',
      start: 'top 60%',
      onEnter: () => playOnce('reveal', () => {
        const tl = gsap.timeline();
        tl.to('.reveal-title .letter, .reveal-name .letter', {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          ease: 'back.out(1.7)',
          stagger: 0.045,
        })
        .add(() => {
          burstParticles();
          launchConfetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
          Galaxy.zoomPulse();
        }, '-=0.4');
      }),
    });
  }

  function burstParticles() {
    const host = $('#reveal-particles');
    const rect = host.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < 40; i++) {
      const p = document.createElement('span');
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      frag.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 220;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 1.4 + Math.random(),
        ease: 'power2.out',
        onStart: () => gsap.set(p, { opacity: 1 }),
      });
    }
    host.appendChild(frag);
    setTimeout(() => { host.innerHTML = ''; }, 2600);
  }

  function initLetterScene() {
    ScrollTrigger.create({
      trigger: '#scene-letter',
      start: 'top 55%',
      onEnter: () => playOnce('letter', () => typeWriter(LETTER_MESSAGE)),
    });
  }

  function typeWriter(text) {
    const el = $('#letter-text');
    el.textContent = '';
    let i = 0;
    clearInterval(state.typewriterTimer);

    state.typewriterTimer = setInterval(() => {
      el.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length) {
        clearInterval(state.typewriterTimer);
        $('#typewriter-cursor').style.opacity = '0.5';
      }
    }, 22);
  }

  function initGalleryScene() {
    ScrollTrigger.batch('.gallery-item', {
      start: 'top 85%',
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      }),
    });
  }

  function initEndingScene() {
    ScrollTrigger.create({
      trigger: '#scene-ending',
      start: 'top 70%',
      onEnter: () => playOnce('ending', () => {
        gsap.fromTo('.ending-line', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.25, ease: 'power2.out' });
        gsap.fromTo('.ending-sign', { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.6 });
        gsap.fromTo('#pulse-heart', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1, delay: 0.9, ease: 'back.out(1.8)' });
      }),
    });
  }

  /* ---------------------------------------------------------
     6. CAKE INTERACTION
  --------------------------------------------------------- */
  function initCakeScene() {
    const blowBtn = $('#blow-btn');
    const hint = $('#cake-hint');

    blowBtn.addEventListener('click', () => {
      if (state.played.cakeBlown) return;
      state.played.cakeBlown = true;

      gsap.to('.candle__flame', {
        opacity: 0,
        scaleY: 0.2,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => $$('.candle__flame').forEach(f => f.classList.add('is-out')),
      });

      spawnSmoke();
      launchConfetti({ particleCount: 160, spread: 120, origin: { y: 0.6 } });
      launchConfetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
      launchConfetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });

      hint.textContent = 'Your wish is on its way. 🎉';
      blowBtn.disabled = true;
      blowBtn.style.opacity = '0.6';

      Music.switchToUplift();
    });
  }

  function spawnSmoke() {
    const host = $('#cake-smoke');
    for (let i = 0; i < 6; i++) {
      const puff = document.createElement('span');
      puff.className = 'smoke-puff';
      puff.style.left = `${50 + (Math.random() * 30 - 15)}%`;
      host.appendChild(puff);
      gsap.to(puff, {
        y: -60 - Math.random() * 30,
        x: (Math.random() - 0.5) * 40,
        opacity: 0.5,
        scale: 2.2,
        duration: 2 + Math.random(),
        delay: i * 0.08,
        ease: 'power1.out',
        onStart: () => gsap.set(puff, { opacity: 0.6 }),
        onComplete: () => puff.remove(),
      });
    }
  }

  /* ---------------------------------------------------------
     7. GIFT INTERACTION
  --------------------------------------------------------- */
  function initGiftScene() {
    const box = $('#gift-box');
    const light = $('.gift-light');
    const message = $('#gift-message');
    const hint = $('#gift-hint');

    box.addEventListener('click', () => {
      if (state.played.giftOpen) return;
      state.played.giftOpen = true;

      box.classList.add('is-open');
      gsap.to(light, { opacity: 1, scale: 1.4, duration: 1.2, ease: 'power2.out' });
      gsap.to(message, { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power2.out' });
      hint.style.opacity = '0';

      spawnFloatingHearts();
      launchConfetti({ particleCount: 100, spread: 90, origin: { y: 0.55 }, colors: ['#f4c869', '#ff6f91', '#7c5cff'] });
    });
  }

  function spawnFloatingHearts() {
    const host = $('#gift-hearts');
    for (let i = 0; i < 14; i++) {
      const h = document.createElement('span');
      h.textContent = '❤';
      h.style.left = `${40 + Math.random() * 20}%`;
      host.appendChild(h);
      gsap.to(h, {
        y: -220 - Math.random() * 80,
        x: (Math.random() - 0.5) * 140,
        opacity: 0,
        duration: 2.6 + Math.random(),
        delay: i * 0.06,
        ease: 'power1.out',
        onStart: () => gsap.set(h, { opacity: 1 }),
        onComplete: () => h.remove(),
      });
    }
  }

  /* ---------------------------------------------------------
     8. FIREWORKS + BALLOONS (finale)
  --------------------------------------------------------- */
  const Fireworks = (() => {
    let canvas, ctx, particles = [], rafId = null;

    function init() {
      canvas = $('#fireworks-canvas');
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    function launchRocket() {
      const x = Math.random() * canvas.width;
      const y = canvas.height * (0.2 + Math.random() * 0.3);
      const colors = ['#7c5cff', '#38e6c5', '#f4c869', '#ff6f91', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const count = 46;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 2 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life -= 0.012;
      });
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }
    function start() {
      if (state.fireworksActive) return;
      state.fireworksActive = true;
      tick();
      launchRocket();
      const interval = setInterval(() => {
        if (!state.fireworksActive) { clearInterval(interval); return; }
        launchRocket();
      }, 700);
      Fireworks._interval = interval;
    }
    function stop() {
      state.fireworksActive = false;
      clearInterval(Fireworks._interval);
      cancelAnimationFrame(rafId);
      particles = [];
      ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    return { init, start, stop };
  })();

  function spawnBalloons() {
    const host = $('#balloons');
    const colors = ['#7c5cff', '#38e6c5', '#f4c869', '#ff6f91'];
    host.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const b = document.createElement('span');
      b.className = 'balloon';
      b.style.left = `${5 + i * 9 + Math.random() * 4}%`;
      b.style.background = `linear-gradient(160deg, ${colors[i % colors.length]}, rgba(255,255,255,0.15))`;
      host.appendChild(b);
      gsap.to(b, {
        y: -window.innerHeight - 200,
        x: `+=${(Math.random() - 0.5) * 80}`,
        duration: 8 + Math.random() * 4,
        delay: i * 0.3,
        ease: 'power1.out',
        repeat: -1,
      });
    }
  }

  function initFinaleScene() {
    ScrollTrigger.create({
      trigger: '#scene-finale',
      start: 'top 60%',
      onEnter: () => playOnce('finale', () => {
        gsap.fromTo('.finale-title, .finale-subtitle, .finale-credit',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power2.out' });
        Fireworks.start();
        spawnBalloons();
        launchConfetti({ particleCount: 200, spread: 160, origin: { y: 0.4 } });
      }),
      onLeaveBack: () => { Fireworks.stop(); },
    });
  }

  function launchConfetti(opts) {
    if (typeof confetti === 'function') confetti(opts);
  }

  /* ---------------------------------------------------------
     9. MUSIC CONTROLLER
  --------------------------------------------------------- */
  const Music = (() => {
    const bg = $('#bg-music');
    const uplift = $('#uplift-music');
    const btn = $('#music-toggle');
    const iconPlay = $('.control-btn__icon--play');
    const iconWave = $('.control-btn__icon--wave');

    function activeTrack() {
      return state.musicMode === 'bg' ? bg : uplift;
    }

    function play() {
      const track = activeTrack();
      track.volume = 0;
      track.play().catch(() => {});
      gsap.to(track, { volume: 0.5, duration: 1.2 });
      state.isMuted = false;
      iconPlay.hidden = true;
      iconWave.hidden = false;
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Pause music');
    }

    function pause() {
      gsap.to(activeTrack(), {
        volume: 0, duration: 0.6,
        onComplete: () => activeTrack().pause(),
      });
      state.isMuted = true;
      iconPlay.hidden = false;
      iconWave.hidden = true;
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Play music');
    }

    function toggle() {
      state.isMuted ? play() : pause();
    }

    function switchToUplift() {
      if (state.musicMode === 'uplift') return;
      const wasPlaying = !state.isMuted;
      gsap.to(bg, {
        volume: 0, duration: 1,
        onComplete: () => {
          bg.pause();
          state.musicMode = 'uplift';
          if (wasPlaying) play();
        },
      });
    }

    function reset() {
      [bg, uplift].forEach(t => { t.pause(); t.currentTime = 0; t.volume = 0; });
      state.musicMode = 'bg';
      state.isMuted = true;
      iconPlay.hidden = false;
      iconWave.hidden = true;
      btn.setAttribute('aria-pressed', 'false');
    }

    function init() {
      btn.addEventListener('click', toggle);
    }

    return { init, play, pause, toggle, switchToUplift, reset };
  })();

  /* ---------------------------------------------------------
     10. REPLAY SYSTEM
  --------------------------------------------------------- */
  function resetSceneVisuals() {
    gsap.set('.reveal-title .letter, .reveal-name .letter', { opacity: 0, y: 40, rotateX: -60 });
    gsap.set('.eyebrow--intro, #intro-line', { opacity: 0, y: 20 });
    clearInterval(state.typewriterTimer);
    $('#letter-text').textContent = '';
    $('#typewriter-cursor').style.opacity = '1';
    gsap.set('.gallery-item', { opacity: 0, y: 50, scale: 0.94 });
    $$('.candle__flame').forEach(f => f.classList.remove('is-out'));
    gsap.set('.candle__flame', { opacity: 1, scaleY: 1 });
    $('#blow-btn').disabled = false;
    $('#blow-btn').style.opacity = '1';
    $('#cake-hint').textContent = 'Tap the button to make your wish come true.';
    $('#gift-box').classList.remove('is-open');
    gsap.set('.gift-light', { opacity: 0, scale: 1 });
    gsap.set('#gift-message', { opacity: 0, y: 14 });
    $('#gift-hint').style.opacity = '1';
    Fireworks.stop();
    $('#balloons').innerHTML = '';
    gsap.set('.finale-title, .finale-subtitle, .finale-credit', { opacity: 0, y: 24 });
    gsap.set('.ending-line, .ending-sign, #pulse-heart', { opacity: 0 });

    Constellation.reset();
    Galaxy.resetCamera();
  }

  function replayExperience() {
    state.played = {};
    resetSceneVisuals();
    Music.reset();

    ScrollTrigger.getAll().forEach(st => st.refresh());
    window.scrollTo({ top: 0, behavior: 'auto' });

    $('#scene-loading').style.display = 'flex';
    gsap.set('#scene-loading', { opacity: 1 });
    $('#loading-bar-fill').style.width = '0%';
    $('#loading-percent').textContent = '0%';

    runLoadingSequence(() => {
      Music.play();
    });
  }

  /* ---------------------------------------------------------
     11. BOOT
  --------------------------------------------------------- */
  function bindReplayButtons() {
    $('#replay-btn').addEventListener('click', replayExperience);
    $('#replay-btn-end').addEventListener('click', replayExperience);
  }

  function bindStartOverlay() {
    const overlay = $('#start-overlay');
    overlay.addEventListener('click', () => {
      overlay.classList.add('is-hidden');
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => { overlay.style.display = 'none'; },
      });

      runLoadingSequence(() => {
        Music.play();
      });
    }, { once: true });
  }

  function initAllScenes() {
    initIntroScene();
    initRevealScene();
    initLetterScene();
    initGalleryScene();
    initCakeScene();
    initGiftScene();
    initFinaleScene();
    initEndingScene();
  }

  document.addEventListener('DOMContentLoaded', () => {
    Galaxy.init();
    Fireworks.init();
    Constellation.init();
    Music.init();
    initAllScenes();
    bindReplayButtons();
    bindStartOverlay();

    gsap.set('.reveal-title .letter, .reveal-name .letter', { opacity: 0, y: 40, rotateX: -60 });
    gsap.set('.gallery-item', { opacity: 0, y: 50, scale: 0.94 });
    gsap.set('.gift-light', { opacity: 0 });
    gsap.set('#gift-message', { opacity: 0, y: 14 });
    gsap.set('.finale-title, .finale-subtitle, .finale-credit', { opacity: 0, y: 24 });
    gsap.set('.ending-line, .ending-sign, #pulse-heart', { opacity: 0 });
  });
})();
