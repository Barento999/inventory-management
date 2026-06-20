import { useEffect, useRef } from 'react';

/**
 * Performance monitoring hook
 * Tracks page load times, API response times, and component render times
 */
export function usePerformanceMonitoring(componentName) {
  const renderTimeRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Record component render time
    renderTimeRef.current = Date.now() - startTimeRef.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTimeRef.current}ms`);
    }
  }, [componentName]);

  return {
    renderTime: renderTimeRef.current,
  };
}

/**
 * Measure API response time
 */
export function measureApiTime(name, fn) {
  const start = performance.now();
  return Promise.resolve(fn()).then(result => {
    const duration = performance.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${name} took ${duration.toFixed(2)}ms`);
    }
    return result;
  });
}

/**
 * Core Web Vitals monitoring
 */
export function useCoreWebVitals() {
  useEffect(() => {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Vitals] LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        return () => lcpObserver.disconnect();
      } catch (e) {
        console.error('LCP monitoring error:', e);
      }
    }
  }, []);

  useEffect(() => {
    // First Input Delay (FID) / Interaction to Next Paint (INP)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Vitals] FID: ${entry.processingDuration}ms`);
            }
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        return () => fidObserver.disconnect();
      } catch (e) {
        console.error('FID monitoring error:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[Vitals] CLS: ${entry.value}`);
              }
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        return () => clsObserver.disconnect();
      } catch (e) {
        console.error('CLS monitoring error:', e);
      }
    }
  }, []);
}

/**
 * Memory monitoring (Chrome DevTools only)
 */
export function useMemoryMonitoring() {
  useEffect(() => {
    if ('memory' in performance && process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memory = performance.memory;
        const usedMemory = (memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMemory = (memory.totalJSHeapSize / 1048576).toFixed(2);
        console.log(`[Memory] ${usedMemory}MB / ${totalMemory}MB`);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);
}

/**
 * Track page visibility and pause updates when hidden
 */
export function usePageVisibility(callback) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[Visibility] Page hidden');
        callback?.(false);
      } else {
        console.log('[Visibility] Page visible');
        callback?.(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [callback]);
}

/**
 * Lazy load images with Intersection Observer
 */
export function useLazyLoadImages() {
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
      return () => imageObserver.disconnect();
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }, []);
}

/**
 * Network information monitoring
 */
export function useNetworkInformation() {
  const getConnectionType = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';
    
    const type = connection.effectiveType;
    return type; // '4g', '3g', '2g', 'slow-2g'
  };

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return;

    const handleChange = () => {
      const type = connection.effectiveType;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Network] Connection type: ${type}, Downlink: ${connection.downlink}Mbps`);
      }
    };

    connection.addEventListener('change', handleChange);
    return () => connection.removeEventListener('change', handleChange);
  }, []);

  return { connectionType: getConnectionType() };
}
