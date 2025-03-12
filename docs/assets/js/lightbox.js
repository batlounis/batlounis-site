
// Image lightbox
// Usage: Add class "lightbox-trigger" to the image and add data-src attribute with the image source
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");

    document.querySelectorAll(".lightbox-trigger").forEach(el => {
      el.addEventListener("click", e => {
        e.preventDefault();
        const src = el.getAttribute("data-src");
        lightboxImg.src = src;
        lightbox.classList.remove("hidden");
      });
    });

    closeBtn.addEventListener("click", () => {
      lightbox.classList.add("hidden");
      lightboxImg.src = "";
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.add("hidden");
        lightboxImg.src = "";
      }
    });
  });
