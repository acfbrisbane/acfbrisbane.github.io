const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".primary-nav");
const newsletterForm = document.querySelector("[data-newsletter-form]");
const formNote = document.querySelector("[data-form-note]");
const galleryDialog = document.querySelector("[data-gallery-dialog]");
const galleryPreview = document.querySelector("[data-gallery-preview]");
const galleryClose = document.querySelector("[data-gallery-close]");
const newsletterEndpoint = "https://script.google.com/macros/s/AKfycbzjcUDpyz3WwZ48votvsiATw0gVkbkaTsLQ9g623kM4ZmMn6aNquVVvnfcpwTfj4o2bnA/exec";

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

// Validate and submit newsletter subscriptions to the connected Google Sheet.
if (newsletterForm && formNote) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailField = newsletterForm.elements.email;
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    const email = emailField.value.trim().toLowerCase();

    if (!emailField.checkValidity()) {
      formNote.textContent = "請輸入有效的電子郵件地址。";
      formNote.dataset.status = "error";
      emailField.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    formNote.textContent = "正在送出訂閱資料…";
    formNote.dataset.status = "loading";

    try {
      const formData = new URLSearchParams({
        email,
        subscribedAt: new Date().toISOString(),
        source: "acfbrisbane.github.io",
      });

      // Apps Script returns an opaque response across origins, so successful delivery
      // is determined by the completed request rather than reading the response body.
      await fetch(newsletterEndpoint, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      newsletterForm.reset();
      formNote.textContent = "訂閱成功！謝謝你加入澳洲職場人布里斯本。";
      formNote.dataset.status = "success";
    } catch (error) {
      formNote.textContent = "目前無法完成訂閱，請稍後再試。";
      formNote.dataset.status = "error";
      emailField.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
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

// Filter job-tips cards by work type (求職攻略頁面).
const tipsFilter = document.querySelector("[data-tips-filter]");
const tipsGrid = document.querySelector("[data-tips-grid]");

if (tipsFilter && tipsGrid) {
  const filterButtons = tipsFilter.querySelectorAll("[data-filter]");
  const tipCards = tipsGrid.querySelectorAll("[data-category]");

  // In the 「全部」 view, long articles start collapsed with a 閱讀全文 toggle.
  const articleCards = Array.from(tipCards).filter((card) => !card.classList.contains("tip-card-placeholder"));
  articleCards.forEach((card) => {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tip-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "閱讀全文 ↓";
    toggle.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "收合 ↑" : "閱讀全文 ↓";
      if (!open) card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    card.appendChild(toggle);
  });

  const setCollapsed = (collapsed) => {
    tipsGrid.classList.toggle("is-collapsed-view", collapsed);
    articleCards.forEach((card) => {
      card.classList.remove("is-open");
      const toggle = card.querySelector(".tip-toggle");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "閱讀全文 ↓";
    });
  };
  setCollapsed(tipsFilter.querySelector(".active")?.dataset.filter === "all");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;
      tipCards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
      setCollapsed(filter === "all");
    });
  });
}
