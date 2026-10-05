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
  setupScrollReveals();
  document.querySelector("#home").setAttribute("tabindex", "-1");
  document.querySelector("#home").focus({ preventScroll: true });
  history.replaceState(null, "", "#home");
});

// Hapus pesan salah saat pengunjung mulai mengetik lagi.
codeInput.addEventListener("input", () => {
  if (codeError.textContent) codeError.textContent = "";
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

// Tandai wish yang disukai dan ubah keterangan pada kartu.
document.querySelectorAll(".wish-card").forEach((card) => {
  card.setAttribute("aria-pressed", "false");
  card.addEventListener("click", () => {
    const selected = card.classList.toggle("is-kept");
    card.setAttribute("aria-pressed", String(selected));
    card.querySelector(".wish-hint").innerHTML = selected
      ? 'SAVED FOR A RAINY DAY <span aria-hidden="true">♡</span>'
      : 'A WISH FOR YOU <span aria-hidden="true">↗</span>';
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

// Open or close the letter from its sealed-envelope button.
letterEnvelopeButton.addEventListener("click", () => {
  const isOpening = letterEnvelopeButton.getAttribute("aria-expanded") !== "true";

  letterEnvelopeButton.setAttribute("aria-expanded", String(isOpening));
  letterEnvelopeButton.setAttribute(
    "aria-label",
    isOpening ? "Tutup surat untuk Acel" : "Buka surat untuk Acel",
  );
  letterEnvelopeButton.classList.toggle("is-open", isOpening);
  letterCard.hidden = !isOpening;
  letterCard.classList.toggle("is-revealed", isOpening);

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
