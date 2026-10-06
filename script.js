// Ganti nilai ini untuk mengganti kode pembuka website.
const SECRET_CODE = "140826";

const gate = document.querySelector("#gate");
const siteContent = document.querySelector("#site-content");
const codeForm = document.querySelector("#code-form");
const codeInput = document.querySelector("#secret-code");
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
const musicWidget = document.querySelector("#music-widget");
const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicStatus = document.querySelector("#music-status");
const letterAudioStatus = document.querySelector("#letter-audio-status");
let letterRevealTimeoutId;
let paperAudioContext;

// Munculkan bagian halaman dengan lembut saat pengunjung menggulir.
function setupScrollReveals() {
  const revealItems = siteContent.querySelectorAll(
    ".hero-copy, .hero-art, .section-heading, .memory-card, .personal-note, " +
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

// Periksa kode; kode yang benar menyembunyikan halaman pembuka.
codeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (codeInput.value.trim() !== SECRET_CODE) {
    codeError.textContent = "Hmm, not quite. Try another little key ♡";
    codeForm.classList.remove("is-shaking");
    void codeForm.offsetWidth;
    codeForm.classList.add("is-shaking");
    codeInput.select();
    return;
  }

  codeError.textContent = "";
  gate.hidden = true;
  siteContent.hidden = false;
  musicWidget.hidden = false;
  setupScrollReveals();
  document.querySelector("#home").setAttribute("tabindex", "-1");
  document.querySelector("#home").focus({ preventScroll: true });
  history.replaceState(null, "", "#home");
});

// Hapus pesan salah saat pengunjung mulai mengetik lagi.
codeInput.addEventListener("input", () => {
  if (codeError.textContent) codeError.textContent = "";
});

// Mulai musik hanya setelah pengunjung menekan tombol, sesuai aturan autoplay browser.
musicToggle.addEventListener("click", async () => {
  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicToggle.setAttribute("aria-pressed", "true");
      musicToggle.setAttribute("aria-label", "Jeda One Only oleh Pamungkas");
      musicToggle.title = "Jeda One Only oleh Pamungkas";
      musicStatus.textContent = "Memutar One Only oleh Pamungkas.";
    } catch {
      musicStatus.textContent =
        "Musik tidak dapat diputar. Pastikan file Pamungkas - One Only.mp3 tersedia.";
    }
    return;
  }

  backgroundMusic.pause();
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Putar One Only oleh Pamungkas");
  musicToggle.title = "Putar One Only oleh Pamungkas";
  musicStatus.textContent = "Musik dijeda.";
});

backgroundMusic.addEventListener("ended", () => {
  musicToggle.setAttribute("aria-pressed", "false");
  musicToggle.setAttribute("aria-label", "Putar One Only oleh Pamungkas");
  musicToggle.title = "Putar One Only oleh Pamungkas";
  musicStatus.textContent = "Musik selesai.";
});

backgroundMusic.addEventListener("error", () => {
  musicToggle.setAttribute("aria-pressed", "false");
  musicStatus.textContent =
    "Musik tidak dapat dimuat. Pastikan file Pamungkas - One Only.mp3 tersedia.";
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
