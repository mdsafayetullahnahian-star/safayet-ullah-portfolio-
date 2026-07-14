/**
 * CINEMATIC PHOTOGRAPHY PORTFOLIO - PERFORMANCE MONITOR
 * Simple, non-blocking telemetry that measures image load times,
 * resource delivery efficiency, and interaction response times.
 * Outputs reports in a clean, scannable format to the console.
 */
(() => {
  'use strict';

  // Styling for console reports
  const logStyles = {
    header: 'background: #0d0d0f; color: #fff; padding: 4px 8px; border-radius: 3px; font-weight: bold; font-family: monospace;',
    success: 'color: #10b981; font-weight: bold; font-family: monospace;',
    warning: 'color: #f59e0b; font-weight: bold; font-family: monospace;',
    info: 'color: #6366f1; font-family: monospace;',
    metric: 'color: #a78bfa; font-weight: bold; font-family: monospace;',
    sub: 'color: #9ca3af; font-size: 0.9em; font-family: monospace;'
  };

  const imageLoadTracker = new Map();

  /**
   * Monitor image loading durations via standard Performance Resource Timing
   */
  function initImageResourceTracking() {
    // Collect existing resource timings first
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
      if (resource.initiatorType === 'img' || /\.(jpg|jpeg|png|webp|gif|svg)/i.test(resource.name)) {
        logResourceTiming(resource);
      }
    });

    // Create observer for subsequent image loads
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.initiatorType === 'img' || /\.(jpg|jpeg|png|webp|gif|svg)/i.test(entry.name)) {
              logResourceTiming(entry);
            }
          });
        });
        observer.observe({ type: 'resource', buffered: true });
      } catch (e) {
        console.warn('PerformanceObserver for resource tracking not supported or failed to initialize.');
      }
    }
  }

  /**
   * Format and print resource loading performance
   */
  function logResourceTiming(entry) {
    // Avoid double logging
    if (imageLoadTracker.has(entry.name)) return;
    imageLoadTracker.set(entry.name, true);

    const url = new URL(entry.name, window.location.href);
    const filename = url.pathname.split('/').pop() || url.pathname;
    const duration = entry.duration.toFixed(1);
    const sizeKb = entry.transferSize ? (entry.transferSize / 1024).toFixed(1) + ' KB' : 'cached/unknown';
    
    let speedRating = logStyles.success;
    if (entry.duration > 1000) {
      speedRating = logStyles.warning;
    }

    console.groupCollapsed(`%c📷 Image Loaded: ${filename} (%c${duration}ms%c)`, logStyles.sub, speedRating, logStyles.sub);
    console.log(`%cSource URL:%c ${entry.name}`, logStyles.sub, 'font-family: monospace;');
    console.log(`%cDuration:%c   ${duration}ms`, logStyles.sub, speedRating);
    console.log(`%cTransfer Size:%c ${sizeKb}`, logStyles.sub, logStyles.info);
    console.log(`%cFetch Protocol:%c ${entry.nextHopProtocol || 'HTTP/1.1 or cache'}`, logStyles.sub, logStyles.info);
    console.groupEnd();
  }

  /**
   * Track UI interaction responsiveness
   * Intercept clicks on critical interactive areas and measure latency of handler execution
   */
  function initInteractionTracking() {
    const interactiveSelectors = [
      '.nav-link',
      '.mobile-nav-link',
      '.filter-btn',
      '.gallery-item',
      '.map-dot',
      '.connect-btn',
      '#theme-toggle',
      '#popup-close-btn',
      '#zen-close-btn'
    ];

    document.addEventListener('click', (event) => {
      const target = event.target;
      
      // Find matching selector
      let matchedSelector = null;
      let matchedElement = null;

      for (const selector of interactiveSelectors) {
        const element = target.closest(selector);
        if (element) {
          matchedSelector = selector;
          matchedElement = element;
          break;
        }
      }

      if (!matchedElement) return;

      const startTime = performance.now();
      
      // We use requestAnimationFrame to detect when the browser finishes processing
      // the event handler and schedules a repaint. This approximates interaction responsiveness.
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        let elementDesc = matchedElement.id ? `#${matchedElement.id}` : matchedElement.className.split(' ').join('.');
        
        // Truncate class list description if too long
        if (elementDesc.length > 40) {
          elementDesc = elementDesc.substring(0, 37) + '...';
        }

        let latencyStyle = logStyles.success;
        let healthText = 'CRISP';
        if (duration > 100) {
          latencyStyle = logStyles.warning;
          healthText = 'SLUGGISH';
        }

        console.log(
          `%c⚡ Interaction [%c${matchedSelector}%c] on %c${elementDesc}%c -> %c${duration.toFixed(2)}ms%c [%c${healthText}%c]`,
          logStyles.sub,
          logStyles.info,
          logStyles.sub,
          logStyles.metric,
          logStyles.sub,
          latencyStyle,
          logStyles.sub,
          latencyStyle,
          logStyles.sub
        );
      });
    }, { capture: true, passive: true });
  }

  /**
   * Generate an initial Page Load Performance Summary
   */
  function printPagePerformanceSummary() {
    if (!window.performance || !window.performance.timing) return;

    // Use requestIdleCallback or setTimeout to run when page is completely idle
    const runSummary = () => {
      const t = window.performance.timing;
      const pageLoadTime = t.loadEventEnd - t.navigationStart;
      const domReadyTime = t.domInteractive - t.navigationStart;
      const dnsTime = t.domainLookupEnd - t.domainLookupStart;
      const tcpTime = t.connectEnd - t.connectStart;
      const serverResponseTime = t.responseEnd - t.requestStart;

      console.log('%c LENS & SILENCE PERFORMANCE AUDIT REPORT ', logStyles.header);
      console.log(`%cPage Load Time:           %c${pageLoadTime}ms`, logStyles.sub, pageLoadTime > 2000 ? logStyles.warning : logStyles.success);
      console.log(`%cDOM Content Interactive:   %c${domReadyTime}ms`, logStyles.sub, domReadyTime > 1000 ? logStyles.warning : logStyles.success);
      console.log(`%cServer Response (TTFB):   %c${serverResponseTime}ms`, logStyles.sub, serverResponseTime > 400 ? logStyles.warning : logStyles.success);
      console.log(`%cConnection Setup (TCP):   %c${tcpTime}ms`, logStyles.sub, logStyles.info);
      console.log(`%cDNS Resolution:            %c${dnsTime}ms`, logStyles.sub, logStyles.info);
      console.log('%c----------------------------------------', logStyles.sub);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(runSummary);
    } else {
      setTimeout(runSummary, 2000);
    }
  }

  // Initialize tracking
  window.addEventListener('load', () => {
    printPagePerformanceSummary();
    initImageResourceTracking();
    initInteractionTracking();
  });
})();
