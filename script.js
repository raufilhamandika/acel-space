// Ganti nilai ini untuk mengganti kode pembuka website.
const SECRET_CODE = "140826";

const gate = document.querySelector("#gate");
const siteContent = document.querySelector("#site-content");
const codeForm = document.querySelector("#code-form");
const codeInputs = [...document.querySelectorAll(".code-fields input")];
const codeError = document.querySelector("#code-error");
const wishButton = document.querySelector("#wish-button");
const wishResult = document.querySelector("#wish-result");
const candles = document.querySelector(".candles");
const photoDialog = document.querySelector("#photo-dialog");
const dialogPhoto = document.querySelector("#dialog-photo");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogClose = document.querySelector("#dialog-close");
const chapterLinks = [...document.querySelectorAll(".chapter-link")];
const letterEnvelopeButton = document.querySelector("#letter-envelope-button");
const letterCard = document.querySelector("#letter-card");
const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicStatus = document.querySelector("#music-status");
const musicProgress = document.querySelector("#music-progress-value");
const letterAudioStatus = document.querySelector("#letter-audio-status");
let letterRevealTimeoutId;
let paperAudioContext;
let tonearmCueTimeoutId;
let tonearmCueing = false;
const musicProgressCircumference = 2 * Math.PI * 46;
const tonearmRestAngle = -24;
const tonearmStartAngle = 0;
const tonearmEndAngle = 8;
let gateTransitioning = false;
let gateHideTimeoutId;
let dashboardClearTimeoutId;
let dashboardRevealTimeoutId;
let heroRevealCleanupTimeoutId;

async function createFlowerSprites() {
  const types = ['rose', 'peony', 'lily', 'petal'];
  const loaded = await Promise.all(types.map((type) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const softSprite = document.createElement('canvas');
      softSprite.width = image.naturalWidth;
      softSprite.height = image.naturalHeight;
      const softContext = softSprite.getContext('2d');
      if (!softContext) {
        reject(new Error('Canvas 2D is not available to prepare flower sprites.'));
        return;
      }
      softContext.filter = 'blur(4px)';
      softContext.drawImage(image, 0, 0);
      resolve([[type, image], [`${type}-soft`, softSprite]]);
    };
    image.onerror = () => reject(new Error(`Could not load the ${type} flower PNG.`));
    image.src = `assets/flower-${type}.png`;
  })));
  return new Map(loaded.flat());
}

function triggerFloralBloom(mode = 'intro', onTransition) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.createElement('div');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return Promise.reject(new Error('Canvas 2D is not available in this browser.'));

  overlay.className = 'floral-bloom';
  overlay.setAttribute('aria-hidden', 'true');
  canvas.className = 'floral-bloom__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  overlay.append(canvas);
  document.body.append(overlay);

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frameId = 0;
  let previousFrame = 0;
  let elapsed = 0;
  let spawnRemainder = 0;
  let phase = mode === 'rain' ? 'rain' : 'hero';
  let particles = [];
  let sprites;
  let transitionStarted = false;
  let resolveAnimation;
  let rejectAnimation;
  const maximumParticles = reduceMotion
    ? 12
    : Math.min(60, Math.max(36, Math.round(window.innerWidth / 18)));
  const flightStart = Math.random() < .5
    ? { x: Math.random() < .5 ? -70 : window.innerWidth + 70, y: Math.random() * window.innerHeight }
    : { x: Math.random() * window.innerWidth, y: Math.random() < .5 ? -70 : window.innerHeight + 70 };
  let centerX = 0;
  let centerY = 0;

  function resizeCanvas() {
    const oldWidth = width;
    const oldHeight = height;
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    centerX = width / 2;
    centerY = height / 2;
    if (oldWidth && oldHeight) {
      particles.forEach((particle) => { particle.x *= width / oldWidth; particle.y *= height / oldHeight; });
    }
  }

  function createParticle(x, y, angle, falling) {
    const depth = Math.random();
    const isPetal = Math.random() < .38;
    const type = isPetal ? 'petal' : ['rose', 'peony', 'lily'][Math.floor(Math.random() * 3)];
    const size = falling
      ? depth < .45
        ? 15 + (depth / .45) * 10
        : depth > .78
          ? 60 + ((depth - .78) / .22) * 40
          : 25 + ((depth - .45) / .33) * 35
      : 16 + depth * 38;
    return {
      x, y,
      vx: falling ? (Math.random() - .5) * (25 + depth * 45) : Math.cos(angle) * (190 + Math.random() * 390),
      vy: falling
        ? (reduceMotion ? 700 : 130 + depth * 175) + Math.random() * (reduceMotion ? 150 : 80 + depth * 110)
        : Math.sin(angle) * (190 + Math.random() * 390),
      size,
      depth,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - .5) * 2.4,
      rotationX: (Math.random() - .5) * Math.PI,
      rotationY: (Math.random() - .5) * Math.PI,
      rotationXSpeed: (Math.random() - .5) * (1.1 + depth * 2.2),
      rotationYSpeed: (Math.random() - .5) * (1.1 + depth * 2.2),
      sway: 14 + Math.random() * 35,
      swaySpeed: .7 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      type,
      life: 0,
      duration: falling ? 3.2 + Math.random() * 1.8 : 1.8 + Math.random() * .9,
      alpha: falling ? .3 + depth * .68 : .72 + Math.random() * .25,
    };
  }

  function drawParticle(particle, dt, time, fade) {
    particle.life += dt;
    particle.rotation += particle.rotationSpeed * dt;
    particle.rotationX += particle.rotationXSpeed * dt;
    particle.rotationY += particle.rotationYSpeed * dt;
    particle.x += particle.vx * dt + Math.sin(time * particle.swaySpeed + particle.phase) * particle.sway * dt;
    particle.y += particle.vy * dt;
    const alpha = (fade ? Math.max(0, 1 - particle.life / particle.duration) : particle.alpha) *
      (.48 + particle.depth * .52);
    const cosX = Math.cos(particle.rotationX);
    const cosY = Math.cos(particle.rotationY);
    const cosZ = Math.cos(particle.rotation);
    const sinX = Math.sin(particle.rotationX);
    const sinY = Math.sin(particle.rotationY);
    const sinZ = Math.sin(particle.rotation);
    const sprite = sprites.get(particle.depth < .38 ? `${particle.type}-soft` : particle.type);
    context.save();
    context.translate(particle.x, particle.y);
    context.transform(
      cosZ * cosY,
      sinZ * cosY,
      cosZ * sinY * sinX - sinZ * cosX,
      sinZ * sinY * sinX + cosZ * cosX,
      0,
      0,
    );
    context.globalAlpha = alpha;
    context.drawImage(sprite, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
    context.restore();
  }

  function finish() {
    window.cancelAnimationFrame(frameId);
    window.removeEventListener('resize', resizeCanvas);
    overlay.remove();
    resolveAnimation();
  }

  function scheduleFrame() {
    frameId = window.requestAnimationFrame((timestamp) => {
      try {
        render(timestamp);
      } catch (error) {
        window.cancelAnimationFrame(frameId);
        window.removeEventListener('resize', resizeCanvas);
        overlay.remove();
        rejectAnimation(error);
      }
    });
  }

  function render(timestamp) {
    if (!previousFrame) previousFrame = timestamp;
    const dt = Math.min((timestamp - previousFrame) / 1000, .05);
    previousFrame = timestamp;
    elapsed += dt;
    context.clearRect(0, 0, width, height);

    if (phase === 'hero') {
      const progress = Math.min(1, elapsed / (reduceMotion ? .08 : 1));
      const ease = 1 - Math.pow(1 - progress, 3);
      const x = flightStart.x + (centerX - flightStart.x) * ease;
      const y = flightStart.y + (centerY - flightStart.y) * ease;
      context.save();
      context.translate(x, y);
      context.rotate(elapsed * 1.4);
      const size = 54 + ease * 28;
      context.drawImage(sprites.get('rose'), -size / 2, -size / 2, size, size);
      context.restore();
      if (progress >= 1) {
        phase = 'burst';
        elapsed = 0;
        for (let index = 0; index < maximumParticles; index += 1) {
          particles.push(createParticle(centerX, centerY, (Math.PI * 2 * index) / maximumParticles, false));
        }
      }
    } else if (phase === 'burst') {
      particles = particles.filter((particle) => {
        drawParticle(particle, dt, elapsed, true);
        return particle.life < particle.duration && particle.x > -particle.size && particle.x < width + particle.size && particle.y > -particle.size && particle.y < height + particle.size;
      });
      if (elapsed >= (reduceMotion ? .08 : 1.7)) {
        phase = 'burst-fade';
        elapsed = 0;
      }
    } else if (phase === 'burst-fade') {
      particles = particles.filter((particle) => {
        drawParticle(particle, dt, elapsed, true);
        return particle.life < particle.duration && particle.x > -particle.size && particle.x < width + particle.size && particle.y > -particle.size && particle.y < height + particle.size;
      });
      overlay.style.opacity = String(Math.max(0, 1 - elapsed / (reduceMotion ? .12 : .75)));
      if (elapsed >= (reduceMotion ? .12 : .75)) { finish(); return; }
    } else if (phase === 'rain') {
      if (!transitionStarted) {
        transitionStarted = true;
        if (typeof onTransition === 'function') onTransition();
      }
      const rainDuration = reduceMotion ? .08 : 2;
      if (elapsed < rainDuration) {
        spawnRemainder += maximumParticles / rainDuration * dt;
        while (spawnRemainder >= 1 && particles.length < maximumParticles) {
          particles.push(createParticle(Math.random() * width, -30 - Math.random() * 80, 0, true));
          spawnRemainder -= 1;
        }
      }
      particles = particles.filter((particle) => {
        drawParticle(particle, dt, elapsed, false);
        return particle.life < particle.duration && particle.y < height + particle.size;
      });
      if (elapsed >= rainDuration) {
        phase = 'rain-fade';
        elapsed = 0;
      }
    } else if (phase === 'rain-fade') {
      particles = particles.filter((particle) => {
        drawParticle(particle, dt, elapsed, true);
        return particle.life < particle.duration && particle.y < height + particle.size;
      });
      overlay.style.opacity = String(Math.max(0, 1 - elapsed / (reduceMotion ? .12 : .75)));
      if (elapsed >= (reduceMotion ? .12 : .75)) { finish(); return; }
    }
    scheduleFrame();
  }

  return new Promise((resolve, reject) => {
    resolveAnimation = resolve;
    rejectAnimation = reject;
    createFlowerSprites().then((loadedSprites) => {
      sprites = loadedSprites;
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      scheduleFrame();
    }).catch((error) => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      overlay.remove();
      rejectAnimation(error);
    });
  });
}
function updateTonearmPivot() {
  if (
    tonearmCueing ||
    backgroundMusic.paused ||
    !Number.isFinite(backgroundMusic.duration) ||
    backgroundMusic.duration <= 0
  ) {
    return;
  }

  const progress = Math.min(
    1,
    Math.max(0, backgroundMusic.currentTime / backgroundMusic.duration),
  );
  const angle = tonearmStartAngle + (tonearmEndAngle - tonearmStartAngle) * progress;
  musicToggle.style.setProperty("--tonearm-angle", `${angle}deg`);
}

function updateMusicProgress() {
  if (!Number.isFinite(backgroundMusic.duration) || backgroundMusic.duration <= 0) {
    musicProgress.style.strokeDashoffset = String(musicProgressCircumference);
    return;
  }

  const progress = backgroundMusic.currentTime / backgroundMusic.duration;
  musicProgress.style.strokeDashoffset = String(
    musicProgressCircumference * (1 - progress),
  );
  updateTonearmPivot();
}

// Munculkan bagian halaman dengan lembut saat pengunjung menggulir.
function setupScrollReveals() {
  const revealItems = siteContent.querySelectorAll(
    ".section-heading, .memory-card, .personal-note, " +
      ".gallery-card, .gallery-footnote, .letter-opening, .wish-card, " +
      ".wish-afterthought, .finale > .eyebrow, .finale > h2, .finale-copy, " +
      ".candles, .wish-button, .back-to-top",
  );

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -48px 0px", threshold: 0.12 },
  );

  revealItems.forEach((item) => {
    const staggerGroup = item.closest(".memory-grid, .gallery-grid, .wishes-grid, .finale");
    const siblingIndex = staggerGroup
      ? [...staggerGroup.children].indexOf(item)
      : 0;
    item.style.setProperty("--reveal-delay", `${Math.max(0, siblingIndex) * 85}ms`);
    item.classList.add("scroll-reveal");
    revealObserver.observe(item);
  });
}

function beginDashboardReveal() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  siteContent.hidden = false;
  siteContent.classList.add("is-transitioning", "is-reveal-pending");
  setupScrollReveals();
  history.replaceState(null, "", "#home");

  gateHideTimeoutId = window.setTimeout(() => {
    gate.hidden = true;
    gate.classList.remove("is-leaving");
    gate.inert = false;
  }, reduceMotion ? 0 : 650);

  dashboardClearTimeoutId = window.setTimeout(() => {
    siteContent.classList.remove("is-transitioning");
  }, reduceMotion ? 0 : 180);

  dashboardRevealTimeoutId = window.setTimeout(() => {
    siteContent.classList.remove("is-reveal-pending");
    siteContent.classList.add("is-revealing-hero");
    heroRevealCleanupTimeoutId = window.setTimeout(() => {
      siteContent.classList.remove("is-revealing-hero");
    }, reduceMotion ? 0 : 2_000);
  }, reduceMotion ? 0 : 750);
}

function distributeCodeDigits(startIndex, digits) {
  let remainingDigits = digits;
  codeInputs.slice(startIndex).forEach((input) => {
    input.value = remainingDigits.slice(0, 2);
    remainingDigits = remainingDigits.slice(2);
  });
  const nextEmptyInput = codeInputs.find((input) => input.value.length < 2);
  (nextEmptyInput ?? codeInputs[codeInputs.length - 1]).focus();
}

codeInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 2);
    if (input.value.length === 2 && index < codeInputs.length - 1) {
      codeInputs[index + 1].focus();
    }
    if (codeError.textContent) codeError.textContent = "";
  });

  input.addEventListener("paste", (event) => {
    const digits = event.clipboardData?.getData("text").replace(/\D/g, "");
    if (!digits) return;

    event.preventDefault();
    distributeCodeDigits(index, digits);
    if (codeError.textContent) codeError.textContent = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      codeInputs[index - 1].focus();
    } else if (event.key === "ArrowLeft" && input.selectionStart === 0 && index > 0) {
      codeInputs[index - 1].focus();
    } else if (
      event.key === "ArrowRight" &&
      input.selectionStart === input.value.length &&
      index < codeInputs.length - 1
    ) {
      codeInputs[index + 1].focus();
    }
  });
});

// Periksa kode; kode yang benar menyembunyikan halaman pembuka.
codeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (gateTransitioning) return;

  const enteredCode = codeInputs.map((input) => input.value).join("");
  if (enteredCode !== SECRET_CODE) {
    codeError.textContent = "Hmm, not quite. Try another little key ♡";
    codeForm.classList.remove("is-shaking");
    void codeForm.offsetWidth;
    codeForm.classList.add("is-shaking");
    const inputToFocus = codeInputs.find((input) => input.value.length < 2) ?? codeInputs[0];
    inputToFocus.focus();
    inputToFocus.select();
    return;
  }

  codeError.textContent = "";
  gateTransitioning = true;
  gate.inert = true;
  gate.classList.add("is-leaving");
  triggerFloralBloom("rain", beginDashboardReveal)
    .then(() => {
      const home = document.querySelector("#home");
      home.setAttribute("tabindex", "-1");
      home.focus({ preventScroll: true });
      gateTransitioning = false;
    })
    .catch((error) => {
      window.clearTimeout(gateHideTimeoutId);
      window.clearTimeout(dashboardClearTimeoutId);
      window.clearTimeout(dashboardRevealTimeoutId);
      window.clearTimeout(heroRevealCleanupTimeoutId);
      gate.hidden = false;
      gate.classList.remove("is-intro-pending", "is-leaving");
      gate.inert = false;
      siteContent.hidden = true;
      siteContent.classList.remove("is-transitioning", "is-reveal-pending", "is-revealing-hero");
      gateTransitioning = false;
      codeError.textContent = "The page could not open. Please try again.";
      console.error("Floral transition failed:", error);
    });
});

// Mulai musik hanya setelah pengunjung menekan tombol, sesuai aturan autoplay browser.
musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
    } catch {
      musicStatus.textContent =
        "Musik tidak dapat diputar. Pastikan file audio tersedia.";
    }
    return;
  }

  backgroundMusic.pause();
  musicStatus.textContent = "Musik dijeda.";
});

backgroundMusic.addEventListener("play", () => {
  window.clearTimeout(tonearmCueTimeoutId);
  tonearmCueing = true;
  musicToggle.classList.add("is-playing");
  musicToggle.style.setProperty("--tonearm-angle", `${tonearmStartAngle}deg`);
  musicToggle.setAttribute("aria-pressed", "true");
  musicToggle.setAttribute("aria-label", "Jeda musik");
  musicStatus.textContent = "Musik sedang diputar.";
  tonearmCueTimeoutId = window.setTimeout(() => {
    tonearmCueing = false;
    updateTonearmPivot();
  }, 1000);
});

backgroundMusic.addEventListener("pause", () => {
  window.clearTimeout(tonearmCueTimeoutId);
  tonearmCueing = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.style.setProperty("--tonearm-angle", `${tonearmRestAngle}deg`);
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Putar musik");
});

backgroundMusic.addEventListener("ended", () => {
  window.clearTimeout(tonearmCueTimeoutId);
  tonearmCueing = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.style.setProperty("--tonearm-angle", `${tonearmRestAngle}deg`);
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Putar musik");
  musicStatus.textContent = "Musik selesai.";
});

backgroundMusic.addEventListener("timeupdate", updateMusicProgress);
backgroundMusic.addEventListener("loadedmetadata", updateMusicProgress);
backgroundMusic.addEventListener("durationchange", updateMusicProgress);
backgroundMusic.addEventListener("seeked", updateMusicProgress);

backgroundMusic.addEventListener("error", () => {
  window.clearTimeout(tonearmCueTimeoutId);
  tonearmCueing = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.style.setProperty("--tonearm-angle", `${tonearmRestAngle}deg`);
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Putar musik");
  musicStatus.textContent =
    "Musik tidak dapat dimuat. Pastikan file audio tersedia.";
});

// Isi dan buka jendela foto memakai data dari kartu galeri di HTML.
document.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("click", () => {
    dialogPhoto.src = card.dataset.image;
    dialogPhoto.alt = card.dataset.photoAlt;
    dialogTitle.textContent = card.dataset.title;
    dialogDescription.textContent = card.dataset.description;
    photoDialog.showModal();
  });
});

// Tutup jendela foto lewat tombol atau dengan mengeklik area luarnya.
dialogClose.addEventListener("click", () => photoDialog.close());

photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});

// Balik kartu wishes dan perbarui sisi yang dibaca teknologi bantu.
document.querySelectorAll(".wish-card").forEach((card, index) => {
  card.addEventListener("click", () => {
    const isFlipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-expanded", String(isFlipped));
    card.setAttribute(
      "aria-label",
      `${isFlipped ? "Tutup" : "Buka"} harapan ${index + 1}`,
    );
    card.querySelector(".wish-card-front").setAttribute("aria-hidden", String(isFlipped));
    card.querySelector(".wish-card-back").setAttribute("aria-hidden", String(!isFlipped));
  });
});

// Tombol penutup memadamkan lilin dan menampilkan pesan kecil.
wishButton.addEventListener("click", () => {
  const blownOut = candles.classList.toggle("is-blown");
  wishButton.setAttribute("aria-pressed", String(blownOut));
  wishResult.textContent = blownOut
    ? "Wish made? Semoga semesta mendengarnya. ♡"
    : "The candles are glowing again. Make another wish.";
});

// Mainkan gesekan kertas sintetis tanpa mengambil file audio dari luar.
async function playPaperRustle() {
  try {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      throw new Error("Web Audio tidak tersedia di browser ini.");
    }

    paperAudioContext ??= new AudioContextConstructor();
    await paperAudioContext.resume();

    const duration = 0.38;
    const buffer = paperAudioContext.createBuffer(
      1,
      Math.floor(paperAudioContext.sampleRate * duration),
      paperAudioContext.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
    }

    const source = paperAudioContext.createBufferSource();
    const filter = paperAudioContext.createBiquadFilter();
    const volume = paperAudioContext.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1250;
    filter.Q.value = 0.7;
    volume.gain.setValueAtTime(0.0001, paperAudioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.06, paperAudioContext.currentTime + 0.035);
    volume.gain.exponentialRampToValueAtTime(0.0001, paperAudioContext.currentTime + duration);
    source.connect(filter);
    filter.connect(volume);
    volume.connect(paperAudioContext.destination);
    source.start();
    source.stop(paperAudioContext.currentTime + duration);
    letterAudioStatus.textContent = "Surat dibuka dengan suara gesekan kertas.";
  } catch (error) {
    letterAudioStatus.textContent = error.message;
  }
}

function burstConfetti() {
  const opening = letterEnvelopeButton.closest(".letter-opening");
  const colors = ["#ffd1dc", "#f6a9c3", "#ffe0e8", "#f7b8c9", "#fff0f3"];

  for (let index = 0; index < 30; index += 1) {
    const piece = document.createElement("span");
    piece.className = "letter-confetti";
    piece.setAttribute("aria-hidden", "true");
    piece.style.setProperty("--confetti-x", `${(Math.random() - 0.5) * 250}px`);
    piece.style.setProperty("--confetti-y", `${-35 - Math.random() * 150}px`);
    piece.style.setProperty("--confetti-rotation", `${Math.random() * 540 - 270}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    opening.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

// Buka atau tutup amplop, lalu munculkan surat setelah animasi kertas selesai.
letterEnvelopeButton.addEventListener("click", () => {
  const isOpening = letterEnvelopeButton.getAttribute("aria-expanded") !== "true";
  const letterSection = letterEnvelopeButton.closest(".letter-section");

  window.clearTimeout(letterRevealTimeoutId);
  letterEnvelopeButton.setAttribute("aria-expanded", String(isOpening));
  letterEnvelopeButton.setAttribute(
    "aria-label",
    isOpening ? "Tutup surat untuk Acel" : "Buka surat untuk Acel",
  );
  letterEnvelopeButton.classList.toggle("is-open", isOpening);
  letterSection.classList.toggle("is-open", isOpening);
  letterCard.hidden = true;
  letterCard.classList.remove("is-revealed");

  if (isOpening) {
    burstConfetti();
    void playPaperRustle();
    letterRevealTimeoutId = window.setTimeout(() => {
      if (letterEnvelopeButton.getAttribute("aria-expanded") !== "true") return;
      letterCard.hidden = false;
      letterCard.classList.add("is-revealed");
    }, 1450);
  }

  const actionLabel = letterEnvelopeButton.querySelector(".envelope-action");
  actionLabel.innerHTML = isOpening
    ? 'Close the letter <span aria-hidden="true">↑</span>'
    : 'Open your letter <span aria-hidden="true">↗</span>';
});

// Tandai menu bab yang sedang terlihat saat pengunjung menggulir halaman.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (visibleSection) {
      chapterLinks.forEach((link) => {
        const isActive = link.hash === `#${visibleSection.target.id}`;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }
  },
  { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.2, 0.5] },
);

document
  .querySelectorAll("#home, #memories, #gallery, #letter, #wishes")
  .forEach((section) => sectionObserver.observe(section));

gate.inert = true;
gate.classList.add("is-intro-pending");
triggerFloralBloom("intro")
  .then(() => {
    gate.classList.remove("is-intro-pending");
    gate.inert = false;
  })
  .catch((error) => {
    gate.inert = false;
    gate.classList.remove("is-intro-pending");
    console.error("Floral intro failed:", error);
  });
