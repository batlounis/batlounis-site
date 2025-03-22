// Image lightbox
// Usage: Add class "lightbox-trigger" to the image and add data-src attribute with the image source
document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxVideo = document.getElementById("lightbox-video");
    const closeBtn = document.getElementById("lightbox-close");
   
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === 'true';

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

        const imgToShow = isDev ? originalSrc : croppedSrc;

        document.getElementById('lightbox').classList.remove('hidden');

        if (filename.endsWith('.mp4') || filename.endsWith('.mov') || filename.endsWith('.webm')) {
          lightboxImg.classList.add('hidden');
          lightboxImg.src = "";

          lightboxVideo.classList.remove('hidden');
          lightboxVideo.src = imgToShow;
          lightboxVideo.muted = true;
          lightboxVideo.playsInline = true;
          lightboxVideo.autoplay = true;
          lightboxVideo.loop = true;

          // Load and play after DOM updates
          setTimeout(() => {
            lightboxVideo.load();
            lightboxVideo.play().catch((e) => {
              console.warn("Lightbox video play failed:", e);
            });
          }, 100);

          // Ensure no controls and fallback attributes
          lightboxVideo.removeAttribute('controls');
          lightboxVideo.setAttribute('autoplay', '');
          lightboxVideo.setAttribute('playsinline', '');
          lightboxVideo.setAttribute('muted', '');
          lightboxVideo.setAttribute('loop', '');
        } else {
          lightboxVideo.classList.add('hidden');
          lightboxVideo.pause();
          lightboxVideo.src = "";

          lightboxImg.classList.remove('hidden');
          lightboxImg.src = imgToShow;
        }

        // Now that the lightbox is visible, pause background videos
        setTimeout(() => {
          document.querySelectorAll("video").forEach(video => {
            if (video !== lightboxVideo) video.pause();
          });
        }, 0);

        document.getElementById('lightbox-caption').textContent =
          isDev ? `${filename} — ${altText}` : altText;
    
        // 🔥 Set license button link dynamically
        const buyButton = document.getElementById('lightbox-buy');
        buyButton.setAttribute('data-photo-filename', filename);
        buyButton.setAttribute('data-photo-url', imgToShow);
    
        buyButton.addEventListener('click', () => {
          if (typeof gtag === 'function') {
            gtag('event', 'click_buy_license', {
              event_category: 'Lead',
              event_label: filename || 'unknown'
            });
          }
        });
      });
    });

    closeBtn.addEventListener("click", () => {
      lightbox.classList.add("hidden");
      lightboxImg.src = "";
      lightboxVideo.pause();
      lightboxVideo.src = "";

      document.querySelectorAll("video").forEach(video => {
        if (video !== lightboxVideo) video.play().catch(() => {});
      });
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.add("hidden");
        lightboxImg.src = "";
        lightboxVideo.pause();
        lightboxVideo.src = "";

        document.querySelectorAll("video").forEach(video => {
          if (video !== lightboxVideo) video.play().catch(() => {});
        });
      }
    });

    // Show captions in dev mode, in the grid
    if (isDev) {
      document.querySelectorAll('.grid-caption').forEach(p => {
        p.classList.remove('hidden');
      });
    }

    const getVisibleVideosByRow = () => {
      const tolerance = 10; // px
      const visibleVideos = Array.from(document.querySelectorAll("video"))
        .filter(v => !v.closest('#lightbox'))
        .map(video => {
          const rect = video.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          const ratio = Math.max(0, visibleHeight) / rect.height;
          return { video, ratio, top: rect.top };
        })
        .filter(v => v.ratio > 0.5);

      // Group videos by row (same top +/- tolerance)
      const grouped = {};
      visibleVideos.forEach(v => {
        const rowKey = Object.keys(grouped).find(key => Math.abs(v.top - key) < tolerance);
        const key = rowKey !== undefined ? rowKey : v.top;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(v.video);
      });

      // Find the topmost visible row
      const topRowKey = Math.min(...Object.keys(grouped));
      return grouped[topRowKey] || [];
    };

    const updateVideoPlayback = () => {
      const visibleRowVideos = getVisibleVideosByRow();
      document.querySelectorAll("video").forEach(video => {
        if (visibleRowVideos.includes(video)) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    };
  
    const observer = new IntersectionObserver(() => updateVideoPlayback(), {
      threshold: Array.from({ length: 11 }, (_, i) => i / 10) // 0.0 to 1.0
    });
  
    document.querySelectorAll("video").forEach(video => {
      observer.observe(video);
    });
  
    // Run immediately
    updateVideoPlayback();
});
