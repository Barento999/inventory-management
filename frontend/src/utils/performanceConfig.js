/**
 * Performance configuration and optimization utilities
 */

/**
 * Cache configuration for API responses
 */
export const cacheConfig = {
  // Time in milliseconds
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Debounce time configuration for different operations
 */
export const debounceConfig = {
  SEARCH: 300, // For search inputs
  RESIZE: 200, // For window resize
  SCROLL: 100, // For scroll events
  INPUT: 500, // For form inputs
};

/**
 * Pagination configuration for better performance
 */
export const paginationConfig = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  INFINITE_SCROLL_THRESHOLD: 500, // pixels from bottom
};

/**
 * Image optimization settings
 */
export const imageConfig = {
  formats: ['webp', 'jpeg'],
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
  },
  quality: 80,
  lazyLoadThreshold: '50px', // Intersection Observer rootMargin
};

/**
 * Request timeout configuration
 */
export const requestConfig = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // milliseconds
};

/**
 * Performance budgets (in milliseconds)
 */
export const performanceBudget = {
  pageLoad: 3000,
  firstPaint: 1000,
  largeContentfulPaint: 2500,
  timeToInteractive: 3500,
  apiResponse: 1000,
};

/**
 * Get adaptive configuration based on network connection
 */
export function getAdaptiveConfig(connectionType) {
  const configs = {
    '4g': {
      pageSize: 50,
      cacheTime: cacheConfig.MEDIUM,
      imageQuality: 90,
      prefetchEnabled: true,
    },
    '3g': {
      pageSize: 25,
      cacheTime: cacheConfig.LONG,
      imageQuality: 75,
      prefetchEnabled: false,
    },
    '2g': {
      pageSize: 10,
      cacheTime: cacheConfig.VERY_LONG,
      imageQuality: 60,
      prefetchEnabled: false,
    },
    'slow-2g': {
      pageSize: 5,
      cacheTime: cacheConfig.VERY_LONG,
      imageQuality: 50,
      prefetchEnabled: false,
    },
  };

  return configs[connectionType] || configs['4g'];
}

/**
 * Get mobile-optimized configuration
 */
export function getMobileConfig() {
  return {
    pageSize: 15,
    maxConcurrentRequests: 3,
    imageQuality: 75,
    enableCompression: true,
    enableCaching: true,
  };
}

/**
 * Resource hints for performance
 */
export const resourceHints = [
  {
    rel: 'dns-prefetch',
    href: '//api.example.com', // Replace with actual API domain
  },
  {
    rel: 'preconnect',
    href: '//cdn.example.com', // Replace with actual CDN
  },
];

/**
 * Critical CSS paths for lazy loading
 */
export const criticalPaths = [
  '/index.css',
  '/components/ui/Button.css',
  '/components/ui/Input.css',
];

/**
 * Third-party script loading strategy
 */
export const thirdPartyScripts = [
  {
    src: 'https://cdn.example.com/analytics.js',
    async: true,
    defer: true,
    loadingStrategy: 'defer', // 'defer', 'async', 'worker'
  },
];

/**
 * Generate performance report
 */
export function generatePerformanceReport() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  return {
    navigationTiming: {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domComplete - timing.domLoading,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart,
    },
    navigationTypes: ['navigate', 'reload', 'back_forward', 'reserved'][
      navigation.type
    ],
    memory:
      typeof performance.memory !== 'undefined'
        ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          }
        : null,
  };
}

/**
 * Export performance report for analysis
 */
export function exportPerformanceReport() {
  const report = generatePerformanceReport();
  if (!report) return;

  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`
  );
  element.setAttribute('download', 'performance-report.json');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
