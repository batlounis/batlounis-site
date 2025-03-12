
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

        // GA event
        if (typeof gtag === 'function') {
          gtag('event', 'click_photo', {
            event_category: 'Photo',
            event_label: filename
          });
        }
    
        const urlParams = new URLSearchParams(window.location.search);
        const isDev = urlParams.get('dev') === 'true';
    
        const imgToShow = isDev ? originalSrc : croppedSrc;
    
        document.getElementById('lightbox-img').src = imgToShow;
        document.getElementById('lightbox-caption').textContent =
          isDev ? `${filename} — ${altText}` : altText;
    
        // 🔥 Set license button link dynamically
        const buyButton = document.getElementById('lightbox-buy');
        const baseHref = buyButton.href.split('?')[0];
        const existingParams = new URLSearchParams(buyButton.href.split('?')[1]);
        existingParams.set('image', filename);
        buyButton.href = `${baseHref}?${existingParams.toString()}`;
    
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

  const buyBtn = document.getElementById('lightbox-buy');
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'click_buy_license', {
          event_category: 'Conversion',
          event_label: currentFilename || 'unknown'
        });
      }
    });
  }