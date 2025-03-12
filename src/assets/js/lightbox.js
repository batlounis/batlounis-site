
// Image lightbox
// Usage: Add class "lightbox-trigger" to the image and add data-src attribute with the image source
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.getElementById("lightbox-close");
   
    document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
      trigger.addEventListener('click', function () {
        const croppedSrc = this.getAttribute('data-cropped-src');
        const originalSrc = this.getAttribute('data-original-src');
        const altText = this.getAttribute('data-alt') || '';
        const filename = this.getAttribute('data-filename') || '';
    
        const urlParams = new URLSearchParams(window.location.search);
        const isDev = urlParams.get('dev') === 'true';
    
        // Choose which image to show based on dev mode
        const imgToShow = isDev ? originalSrc : croppedSrc;
    
        document.getElementById('lightbox-img').src = imgToShow;
    
        // Caption includes filename in dev mode
        document.getElementById('lightbox-caption').textContent =
          isDev ? `${filename} — ${altText}` : altText;
    
        document.getElementById('lightbox').classList.remove('hidden');
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

    

  // Show captions in dev mode, in the gird
  const urlParams = new URLSearchParams(window.location.search);
  const isDev = urlParams.get('dev') === 'true';
  if (isDev) {
    document.querySelectorAll('.grid-caption').forEach(p => {
      p.classList.remove('hidden');
    });
  }

  });
