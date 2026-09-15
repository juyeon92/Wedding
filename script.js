(() => {
  "use strict";

  // 갤러리 이미지 목록은 여기에서 수정하세요.
  // 현재는 images/optimized 안의 웹용 축소 이미지를 사용합니다.
  // images/gallery 폴더를 직접 사용할 경우 getImagePath 함수의 경로도 함께 수정하세요.
  const galleryImages = [
    "0044.jpg",
    "0078.jpg",
    "0113 마트중.jpg",
    "0136 마트우.jpg",
    "0170 마트좌.jpg",
    "0197.jpg",
    "0203 마트좌.jpg",
    "0210 마트중.jpg",
    "0217 마트우.jpg",
    "0236.jpg",
    "0299.jpg",
    "0310 우.jpg",
    "0374.jpg",
    "0460.jpg",
    "0461.jpg",
    "0496.jpg",
    "0510 우.jpg",
    "0527.jpg",
    "0652.jpg",
    "0676 우.jpg",
    "0709.jpg",
    "0724 마트메인좌.jpg",
    "0734 마트우-상.jpg",
    "0745 마트우-하.jpg",
    "0757.jpg",
    "0764 우.jpg",
    "0781.jpg",
  ];

  const STORAGE_KEY = "yoongyu-juyeon-guestbook";
  let visibleMessageCount = 10;
  let currentGalleryIndex = 0;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const safeText = (value) => String(value ?? "").replace(/[<>&"']/g, (char) => {
    const map = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });

  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function initMusic() {
    const button = $(".music-button");
    const audio = $("#weddingMusic");
    if (!button || !audio) return;

    button.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          await audio.play();
          button.classList.add("is-playing");
          button.querySelector(".music-icon").textContent = "Ⅱ";
        } else {
          audio.pause();
          button.classList.remove("is-playing");
          button.querySelector(".music-icon").textContent = "♪";
        }
      } catch (error) {
        showToast("음악 파일을 찾을 수 없습니다");
      }
    });
  }

  function getImagePath(fileName) {
    return fileName.startsWith("gallery/") ? `images/${fileName}` : `images/optimized/${fileName}`;
  }

  function initGallery() {
    const grid = $("#galleryGrid");
    const lightbox = $("#lightbox");
    const lightboxImage = $("#lightboxImage");
    const closeButton = $(".lightbox-close");
    const prevButton = $(".lightbox-prev");
    const nextButton = $(".lightbox-next");
    if (!grid || !lightbox || !lightboxImage) return;

    grid.innerHTML = galleryImages
      .map((fileName, index) => {
        const src = getImagePath(fileName);
        return `
          <button class="gallery-item" type="button" data-index="${index}" aria-label="갤러리 사진 ${index + 1} 확대 보기">
            <img src="${safeText(src)}" alt="갤러리 사진 ${index + 1}" loading="lazy" />
          </button>
        `;
      })
      .join("");

    const updateNavButtons = () => {
      if (prevButton) prevButton.hidden = currentGalleryIndex === 0;
      if (nextButton) nextButton.hidden = currentGalleryIndex === galleryImages.length - 1;
    };

    const showImage = (index) => {
      if (index < 0 || index >= galleryImages.length) return;
      currentGalleryIndex = index;
      lightboxImage.src = getImagePath(galleryImages[currentGalleryIndex]);
      updateNavButtons();
    };

    grid.addEventListener("click", (event) => {
      const item = event.target.closest(".gallery-item");
      if (!item) return;
      showImage(Number(item.dataset.index));
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "";
      document.body.style.overflow = "";
    };

    closeButton?.addEventListener("click", closeLightbox);
    prevButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      showImage(currentGalleryIndex - 1);
    });
    nextButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      showImage(currentGalleryIndex + 1);
    });
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
      if (event.key === "ArrowLeft" && lightbox.classList.contains("is-open")) showImage(currentGalleryIndex - 1);
      if (event.key === "ArrowRight" && lightbox.classList.contains("is-open")) showImage(currentGalleryIndex + 1);
    });
  }

  function initAccounts() {
    $$(".account-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".account-card");
        const isOpen = card.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
      });
    });

    $$(".copy-button").forEach((button) => {
      button.addEventListener("click", async () => {
        const account = button.dataset.account || "";
        try {
          await navigator.clipboard.writeText(account);
          showToast("복사되었습니다");
        } catch (error) {
          const temp = document.createElement("textarea");
          temp.value = account;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          temp.remove();
          showToast("복사되었습니다");
        }
      });
    });
  }

  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveMessages(messages) {
    try {
      // localStorage 방식은 같은 기기/브라우저에서만 유지되며,
      // 여러 하객이 함께 보는 실제 방명록은 Firebase/Supabase 같은 DB 연동이 필요함.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      showToast("저장 공간을 확인해주세요");
    }
  }

  function formatDate(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function renderMessages() {
    const list = $("#messageList");
    const moreButton = $("#moreButton");
    if (!list || !moreButton) return;

    const messages = loadMessages();
    const visible = messages.slice(0, visibleMessageCount);

    list.innerHTML = visible
      .map((item) => `
        <article class="message-card">
          <div class="message-meta">
            <span class="message-name">${safeText(item.name)}</span>
            <time class="message-date">${safeText(formatDate(item.createdAt))}</time>
          </div>
          <p class="message-text">${safeText(item.message)}</p>
        </article>
      `)
      .join("");

    moreButton.style.display = messages.length > visibleMessageCount ? "block" : "none";
  }

  function initGuestbook() {
    const form = $("#guestbookForm");
    const error = $("#formError");
    const moreButton = $("#moreButton");
    if (!form || !error || !moreButton) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#guestName")?.value.trim();
      const password = $("#guestPassword")?.value.trim();
      const message = $("#guestMessage")?.value.trim();

      if (!name || !password || !message) {
        error.textContent = "이름, 비밀번호, 축하 메시지를 모두 입력해주세요.";
        return;
      }

      const messages = loadMessages();
      messages.unshift({
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}`,
        name,
        password,
        message,
        createdAt: new Date().toISOString(),
      });
      saveMessages(messages);
      visibleMessageCount = 10;
      error.textContent = "";
      form.reset();
      renderMessages();
      showToast("메시지가 남겨졌습니다");
    });

    moreButton.addEventListener("click", () => {
      visibleMessageCount += 10;
      renderMessages();
    });

    renderMessages();
  }

  document.addEventListener("DOMContentLoaded", () => {
    try {
      initMusic();
      initGallery();
      initAccounts();
      initGuestbook();
    } catch (error) {
      console.error("Invitation script error:", error);
    }
  });
})();
