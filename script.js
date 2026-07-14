document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  /* ==========================================================================
     APERTURE SHUTTER INTRO PRE-LOADER ENGINE
     ========================================================================== */
  const apertureLoader = document.getElementById('aperture-loader');
  const body = document.body;

  if (apertureLoader) {
    if (sessionStorage.getItem('safayet_aperture_intro_played') === 'true') {
      apertureLoader.style.display = 'none';
      apertureLoader.remove();
    } else {
      // Temporarily lock scroll while preloader is active
      body.style.overflow = 'hidden';
      
      // Delay slightly to allow layout calculations, then trigger retraction
      setTimeout(() => {
        apertureLoader.classList.add('opened');
        
        // After blades fully retract (1.5s), fade out the preloader overlay
        setTimeout(() => {
          apertureLoader.classList.add('fade-out');
          body.style.overflow = ''; // Unlock scroll
          
          // Clean up the DOM element after transition completes
          setTimeout(() => {
            apertureLoader.remove();
          }, 1200); // matches the 1.2s CSS transition
        }, 1500);
        
        sessionStorage.setItem('safayet_aperture_intro_played', 'true');
      }, 300);
    }
  }

  /* ==========================================================================
     THEME SWITCHING (LIGHT VS SILENCE)
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('safayet-portfolio-theme');
  if (savedTheme === 'light') {
    body.classList.remove('theme-silence');
    body.classList.add('theme-light');
  } else {
    body.classList.remove('theme-light');
    body.classList.add('theme-silence');
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('theme-silence')) {
      body.classList.remove('theme-silence');
      body.classList.add('theme-light');
      localStorage.setItem('safayet-portfolio-theme', 'light');
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-silence');
      localStorage.setItem('safayet-portfolio-theme', 'silence');
    }
  });


  /* ==========================================================================
     MOBILE NAVIGATION SIDEBAR
     ========================================================================== */
  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const mobileSidebar = document.getElementById('mobile-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openSidebar() {
    mobileSidebar.classList.add('open');
  }

  function closeSidebar() {
    mobileSidebar.classList.remove('open');
  }

  mobileMenuTrigger.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);

  // Close sidebar on link clicks
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });


  /* ==========================================================================
     CINEMATIC HERO PARALLAX & TYPEWRITER ENGINE
     ========================================================================== */
  const slides = document.querySelectorAll('.parallax-slide');
  const indicators = document.querySelectorAll('.indicator-dot');
  let currentSlideIndex = 0;
  let slideInterval;
  
  // Slide headings to typewrite
  const slideTitlesText = [
    "Silence is not the absence of sound, but the presence of stillness.",
    "Light reveals the form, but shadows carve the soul.",
    "Where the tide meets the fog, eternity speaks in whispers."
  ];

  function typeWriter(element, text, speed = 40) {
    element.innerHTML = '';
    let i = 0;
    
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    element.appendChild(cursorSpan);

    function type() {
      if (i < text.length) {
        // Insert text before the cursor
        element.textContent = text.substring(0, i + 1);
        element.appendChild(cursorSpan);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentSlideIndex = index;

    // Trigger typewriter on active slide heading
    const titleElement = document.getElementById(`typewriter-${index + 1}`);
    if (titleElement) {
      typeWriter(titleElement, slideTitlesText[index]);
    }
  }

  function nextSlide() {
    let nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(nextSlide, 8000);
  }

  function stopSlideShow() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

  // Set up indicators
  indicators.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startSlideShow(); // Reset timer on manual click
    });
  });

  // Initialize first typewriter slide
  showSlide(0);
  startSlideShow();

  // Scroll Parallax Fade Effect on scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // As we scroll, fade out slide elements and translate slightly
    const opacity = Math.max(0, 1 - scrollPos / (windowHeight * 0.75));
    const activeSlide = document.querySelector('.parallax-slide.active');
    
    if (activeSlide && scrollPos < windowHeight) {
      const content = activeSlide.querySelector('.slide-content');
      if (content) {
        content.style.opacity = opacity;
        content.style.transform = `translateY(${scrollPos * 0.35}px)`;
      }
    }
  });


  /* ==========================================================================
     BEFORE/AFTER IMAGE SLIDER (TOUCH & DRAG ENGINE)
     ========================================================================== */
  const sliderContainer = document.getElementById('before-after-slider');
  const beforeImgContainer = document.getElementById('before-image-container');
  const beforeImg = beforeImgContainer ? beforeImgContainer.querySelector('.image-before') : null;
  const sliderHandle = document.getElementById('slider-handle');
  let isDraggingSlider = false;

  // Align internal image width to match physical container width to avoid squishing
  function resizeBeforeImage() {
    if (sliderContainer && beforeImg) {
      beforeImg.style.width = sliderContainer.clientWidth + 'px';
    }
  }

  // Run on init and window resize
  resizeBeforeImage();
  window.addEventListener('resize', resizeBeforeImage);

  function moveSlider(clientX) {
    if (!sliderContainer || !sliderHandle || !beforeImgContainer) return;
    const rect = sliderContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    
    // Bounds check
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    // Apply values
    sliderHandle.style.left = `${percentage}%`;
    beforeImgContainer.style.width = `${percentage}%`;
  }

  if (sliderContainer) {
    // Mouse Events
    sliderContainer.addEventListener('mousedown', (e) => {
      isDraggingSlider = true;
      moveSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingSlider) return;
      moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDraggingSlider = false;
    });

    // Touch Events (Mobile Support)
    sliderContainer.addEventListener('touchstart', (e) => {
      isDraggingSlider = true;
      if (e.touches.length > 0) {
        moveSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingSlider) return;
      if (e.touches.length > 0) {
        moveSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingSlider = false;
    });
  }


  /* ==========================================================================
     MOOD-BASED GALLERY SYSTEM (FILTERS)
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');
      
      // Update active button state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter gallery cards
      galleryItems.forEach(item => {
        const itemMood = item.getAttribute('data-mood');
        
        // Remove existing fade animation class
        item.classList.remove('fade-in');

        if (filterValue === 'all' || itemMood === filterValue) {
          item.classList.remove('filtered-out');
          // Force layout reflow to re-trigger CSS keyframe animation
          void item.offsetWidth;
          item.classList.add('fade-in');
        } else {
          item.classList.add('filtered-out');
        }
      });
    });
  });


  /* ==========================================================================
     MANUAL LENS FOCUS SCROLL EFFECT (DESKTOP ONLY)
     ========================================================================== */
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    const galleryImgs = document.querySelectorAll('.gallery-img');
    let isScrollTickPending = false;
    
    function updateLensFocus() {
      const viewportCenter = window.innerHeight / 2;
      const focusRange = window.innerHeight * 0.45; // range within which focusing occurs
      
      galleryImgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const imgCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - imgCenter);
        
        if (distance > focusRange) {
          // Out of range, fully blurred
          img.style.filter = 'blur(8px) saturate(0.8) brightness(0.95)';
          img.style.transform = 'scale(0.98)';
        } else {
          // Linear interpolation from fully blurred to crisp focus
          const ratio = distance / focusRange; // 1 (far) to 0 (exact center)
          
          // Map to blur value: ratio * 8 (from 8px to 0px)
          const blurVal = (ratio * 8).toFixed(2);
          // Map to saturation: 1.15 - ratio * 0.35 (from 0.8 to 1.15)
          const satVal = (1.15 - ratio * 0.35).toFixed(2);
          // Map to scale: 1 - ratio * 0.02 (from 0.98 to 1)
          const scaleVal = (1 - ratio * 0.02).toFixed(3);
          // Map to brightness: 1 - ratio * 0.05 (from 0.95 to 1)
          const brightVal = (1 - ratio * 0.05).toFixed(2);
          
          img.style.filter = `blur(${blurVal}px) saturate(${satVal}) brightness(${brightVal})`;
          img.style.transform = `scale(${scaleVal})`;
        }
      });
      
      isScrollTickPending = false;
    }
    
    window.addEventListener('scroll', () => {
      if (!isScrollTickPending) {
        requestAnimationFrame(updateLensFocus);
        isScrollTickPending = true;
      }
    }, { passive: true });
    
    // Run once on load to establish starting focus positions
    setTimeout(updateLensFocus, 400);
  }


  /* ==========================================================================
     MINIMAL VIEWFINDER & CROP MARKS OVERLAY
     ========================================================================== */
  function createViewfinderHTML(cinematicText = "2.39:1 CINEMATIC") {
    return `
      <div class="viewfinder-overlay">
        <div class="viewfinder-corners">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
        <div class="viewfinder-thirds">
          <div class="third-line horiz-1"></div>
          <div class="third-line horiz-2"></div>
          <div class="third-line vert-1"></div>
          <div class="third-line vert-2"></div>
        </div>
        <div class="viewfinder-crosshair">+</div>
        <div class="viewfinder-meta font-mono">${cinematicText}</div>
      </div>
    `;
  }

  // Inject into all gallery wrappers
  const imgWrappers = document.querySelectorAll('.gallery-img-wrapper');
  imgWrappers.forEach(wrapper => {
    const item = wrapper.closest('.gallery-item');
    let aspectLabel = "2.39:1 CINEMATIC";
    if (item) {
      const camera = item.getAttribute('data-camera') || '';
      if (camera.includes('GFX')) {
        aspectLabel = "4:3 FORMAT";
      } else if (camera.includes('Leica')) {
        aspectLabel = "3:2 FORMAT";
      }
    }
    wrapper.insertAdjacentHTML('beforeend', createViewfinderHTML(aspectLabel));
  });

  // Inject into Zen Mode main image container
  const zenImgContainer = document.querySelector('.zen-image-container');
  if (zenImgContainer) {
    zenImgContainer.insertAdjacentHTML('beforeend', createViewfinderHTML("2.39:1 CINEMATIC"));
  }


  /* ==========================================================================
     INTERACTIVE JOURNEY MAP POPUP
     ========================================================================== */
  const mapDots = document.querySelectorAll('.map-dot');
  const mapPopup = document.getElementById('map-popup');
  const popupCloseBtn = document.getElementById('popup-close-btn');
  const popupImg = document.getElementById('popup-img');
  const popupPlace = document.getElementById('popup-place');
  const popupText = document.getElementById('popup-text');
  const popupLat = document.getElementById('popup-lat');
  const popupLon = document.getElementById('popup-lon');

  // Lat/Lon positions coordinates metadata matching the locations
  const coordinatesList = {
    'dot-tejgaon': { lat: '23.75N', lon: '90.39E' },
    'dot-sreemangal': { lat: '24.30N', lon: '91.73E' },
    'dot-khulna': { lat: '22.84N', lon: '89.54E' },
    'dot-mirpur': { lat: '23.80N', lon: '90.36E' },
    'dot-dhanmondi': { lat: '23.74N', lon: '90.37E' }
  };

  mapDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid body click events closing the card immediately
      
      const dotId = dot.getAttribute('data-id');
      const placeName = dot.getAttribute('data-place');
      const narrative = dot.getAttribute('data-narrative');
      const photoUrl = dot.getAttribute('data-photo');
      const coords = coordinatesList[dotId] || { lat: '23.75N', lon: '90.39E' };

      // Fill values
      if (popupImg) {
        popupImg.src = photoUrl;
        popupImg.alt = placeName;
      }
      if (popupPlace) popupPlace.textContent = placeName;
      if (popupText) popupText.textContent = narrative;
      if (popupLat) popupLat.textContent = coords.lat;
      if (popupLon) popupLon.textContent = coords.lon;

      // Position the popup card dynamically near the dot
      const mapContainer = document.getElementById('map-container');
      if (mapContainer && mapPopup) {
        const containerRect = mapContainer.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();

        // Percentages relative to container
        const leftPercent = ((dotRect.left - containerRect.left + dotRect.width / 2) / containerRect.width) * 100;
        const topPercent = ((dotRect.top - containerRect.top + dotRect.height / 2) / containerRect.height) * 100;

        // Position logic: If dot is on right side, display popup on left side, and vice versa
        if (leftPercent > 50) {
          mapPopup.style.left = `calc(${leftPercent}% - 300px)`;
        } else {
          mapPopup.style.left = `calc(${leftPercent}% + 20px)`;
        }

        // Vertical placement helper
        if (topPercent > 60) {
          mapPopup.style.top = `calc(${topPercent}% - 180px)`;
        } else {
          mapPopup.style.top = `calc(${topPercent}% - 50px)`;
        }

        // Add active state classes
        mapPopup.classList.add('show');
      }
    });
  });

  // Close map popup card
  if (popupCloseBtn) {
    popupCloseBtn.addEventListener('click', () => {
      mapPopup.classList.remove('show');
    });
  }

  // Clicking outside map popup card closes it
  document.addEventListener('click', (e) => {
    if (mapPopup && mapPopup.classList.contains('show') && !mapPopup.contains(e.target)) {
      mapPopup.classList.remove('show');
    }
  });


  /* ==========================================================================
     ZEN MODE STORYTELLING OVERLAY (MODAL)
     ========================================================================== */
  const zenModal = document.getElementById('zen-modal');
  const zenCloseBtn = document.getElementById('zen-close-btn');
  const zenMainImg = document.getElementById('zen-main-img');
  const zenTitle = document.getElementById('zen-title');
  const zenMetaTag = document.getElementById('zen-meta-tag');
  const zenLocation = document.getElementById('zen-location');
  const zenStory = document.getElementById('zen-story');
  
  // EXIF fields
  const exifCamera = document.getElementById('exif-camera');
  const exifLens = document.getElementById('exif-lens');
  const exifAperture = document.getElementById('exif-aperture');
  const exifShutter = document.getElementById('exif-shutter');
  const exifIso = document.getElementById('exif-iso');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Extract custom dataset variables
      const img = item.querySelector('.gallery-img');
      if (!img) return;
      const title = item.getAttribute('data-title');
      const mood = item.getAttribute('data-mood');
      const story = item.getAttribute('data-story');
      const location = item.getAttribute('data-location');
      
      const camera = item.getAttribute('data-camera');
      const lens = item.getAttribute('data-lens');
      const aperture = item.getAttribute('data-aperture');
      const shutter = item.getAttribute('data-shutter');
      const iso = item.getAttribute('data-iso');

      // Bind to modal
      if (zenMainImg) {
        zenMainImg.src = img.src;
        zenMainImg.alt = title;
      }
      if (zenTitle) zenTitle.textContent = title;
      
      // Map mood code to capital presentation titles
      const moodLabelMap = {
        'silence': 'Silence',
        'light': 'Light Play',
        'mist': 'Ethereal Mist'
      };
      if (zenMetaTag) zenMetaTag.textContent = moodLabelMap[mood] || mood;
      
      if (zenLocation) zenLocation.textContent = location;
      if (zenStory) zenStory.textContent = story;

      // Bind EXIF values
      if (exifCamera) exifCamera.textContent = camera || '-';
      if (exifLens) exifLens.textContent = lens || '-';
      if (exifAperture) exifAperture.textContent = aperture || '-';
      if (exifShutter) exifShutter.textContent = shutter || '-';
      if (exifIso) exifIso.textContent = iso || '-';

      // Open Zen overlay
      if (zenModal) {
        zenModal.classList.add('open');
        body.style.overflow = 'hidden'; // Stop background scrolling
      }
    });
  });

  function closeZenModal() {
    if (zenModal) {
      zenModal.classList.remove('open');
      body.style.overflow = ''; // Restore background scrolling
    }
  }

  if (zenCloseBtn) {
    zenCloseBtn.addEventListener('click', closeZenModal);
  }

  // Close zen modal on pressing 'Escape' key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zenModal && zenModal.classList.contains('open')) {
      closeZenModal();
    }
  });

  /* Tactile shutter release interaction for Connect Section buttons */
  const connectButtons = document.querySelectorAll('.connect-btn');
  connectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Small tactile flash
      const shutterFlash = document.createElement('div');
      shutterFlash.style.position = 'fixed';
      shutterFlash.style.top = '0';
      shutterFlash.style.left = '0';
      shutterFlash.style.width = '100vw';
      shutterFlash.style.height = '100vh';
      shutterFlash.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      shutterFlash.style.zIndex = '9999';
      shutterFlash.style.pointerEvents = 'none';
      shutterFlash.style.transition = 'opacity 0.4s ease-out';
      document.body.appendChild(shutterFlash);

      setTimeout(() => {
        shutterFlash.style.opacity = '0';
        setTimeout(() => shutterFlash.remove(), 400);
      }, 50);
    });
  });

  /* ==========================================================================
     SMART AUTO-HIDE NAVBAR (SCROLL DIRECTION)
     ========================================================================== */
  const mainHeader = document.querySelector('.main-header');
  let lastScrollY = window.scrollY;
  const scrollThreshold = 8; // min scroll distance to trigger hide/show

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Always show near the top of the page
    if (currentScrollY < 80) {
      mainHeader.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    // Determine direction with a threshold to prevent jitter
    if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) {
      return;
    }

    if (currentScrollY > lastScrollY) {
      // Scrolling down - hide navbar
      mainHeader.classList.add('nav-hidden');
    } else {
      // Scrolling up - show navbar
      mainHeader.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  /* ==========================================================================
     DYNAMIC CAMERA STATUS INDICATOR (LCD)
     ========================================================================== */
  const cameraLcd = document.getElementById('camera-lcd');
  
  if (cameraLcd) {
    const sectionsToObserve = [
      { id: 'hero', mode: '[ MODE: HERO ]' },
      { id: 'process', mode: '[ MODE: PROCESS ]' },
      { id: 'gallery', mode: '[ MODE: GALLERY ]' },
      { id: 'essays', mode: '[ MODE: ESSAYS ]' },
      { id: 'journey', mode: '[ MODE: GPS_MAP ]' },
      { id: 'connect', mode: '[ MODE: CONNECT ]' }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px', // Trigger when section is around the center viewport region
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const matched = sectionsToObserve.find(sec => sec.id === entry.target.id);
          if (matched && cameraLcd.textContent.trim() !== matched.mode) {
            cameraLcd.textContent = matched.mode;
            
            // Re-trigger the subtle LCD pulse animation
            cameraLcd.classList.remove('pulse-update');
            void cameraLcd.offsetWidth; // force layout reflow
            cameraLcd.classList.add('pulse-update');
          }
        }
      });
    }, observerOptions);

    sectionsToObserve.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) {
        sectionObserver.observe(el);
      }
    });
  }
});
