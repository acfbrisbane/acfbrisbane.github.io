const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".primary-nav");
const newsletterForm = document.querySelector("[data-newsletter-form]");
const formNote = document.querySelector("[data-form-note]");
const galleryDialog = document.querySelector("[data-gallery-dialog]");
const galleryPreview = document.querySelector("[data-gallery-preview]");
const galleryClose = document.querySelector("[data-gallery-close]");

// Keep the navigation compact after the visitor begins scrolling.
const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Toggle the mobile navigation and keep its accessible state in sync.
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  });
});

// Reveal sections gently as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Validate the newsletter field without pretending that a subscription was saved.
if (newsletterForm && formNote) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailField = newsletterForm.elements.email;

    if (!emailField.checkValidity()) {
      formNote.textContent = "請輸入有效的電子郵件地址。";
      emailField.focus();
      return;
    }

    formNote.textContent = "謝謝你，電子報訂閱功能即將開放。";
    newsletterForm.reset();
  });
}

// Open event photos in an accessible full-size dialog.
if (galleryDialog && galleryPreview && galleryClose) {
  document.querySelectorAll("[data-gallery-image]").forEach((button) => {
    button.addEventListener("click", () => {
      galleryPreview.src = button.dataset.galleryImage;
      galleryPreview.alt = button.dataset.galleryAlt || "活動照片大圖";
      galleryDialog.showModal();
    });
  });

  galleryClose.addEventListener("click", () => galleryDialog.close());

  galleryDialog.addEventListener("click", (event) => {
    if (event.target === galleryDialog) {
      galleryDialog.close();
    }
  });
}
