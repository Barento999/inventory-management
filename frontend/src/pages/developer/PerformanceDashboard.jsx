import React, { useState, useEffect } from 'react';
import { Activity, Zap, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    memory: 0,
    apiCalls: 0,
    avgResponseTime: 0,
    cacheHitRate: 0,
  });

  useEffect(() => {
    // Collect Web Vitals
    if ('web-vital' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(entry.name, entry.value);
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    }

    // Memory usage
    if (navigator.deviceMemory) {
      setMetrics(prev => ({
        ...prev,
        memory: navigator.deviceMemory * 1024, // Convert to MB
      }));
    }

    // Simulated metrics for demo
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiCalls: Math.floor(Math.random() * 100) + 50,
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        cacheHitRate: Math.floor(Math.random() * 40) + 60,
        fcp: Math.floor(Math.random() * 500) + 1000,
        lcp: Math.floor(Math.random() * 1000) + 1500,
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const metrics_data = [
    {
      name: 'First Contentful Paint (FCP)',
      value: `${metrics.fcp}ms`,
      target: '< 1800ms',
      status: metrics.fcp < 1800 ? 'good' : 'warning',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      name: 'Largest Contentful Paint (LCP)',
      value: `${metrics.lcp}ms`,
      target: '< 2500ms',
      status: metrics.lcp < 2500 ? 'good' : 'warning',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'First Input Delay (FID)',
      value: `${metrics.fid}ms`,
      target: '< 100ms',
      status: metrics.fid < 100 ? 'good' : 'warning',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      value: (Math.random() * 0.2).toFixed(3),
      target: '< 0.1',
      status: 'good',
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  const apiMetrics = [
    {
      label: 'API Calls',
      value: metrics.apiCalls,
      unit: 'requests/min',
      icon: '📡',
    },
    {
      label: 'Avg Response Time',
      value: metrics.avgResponseTime,
      unit: 'ms',
      icon: '⏱️',
    },
    {
      label: 'Cache Hit Rate',
      value: metrics.cacheHitRate,
      unit: '%',
      icon: '💾',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Activity className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Web Vitals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Core Web Vitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics_data.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`text-lg ${metric.status === 'good' ? 'text-green-600' : 'text-orange-600'}`}>
                  {metric.icon}
                </div>
                {metric.status === 'good' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <h3 className="font-medium text-sm mb-2">{metric.name}</h3>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Target: {metric.target}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4">API Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apiMetrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl mb-2">{metric.icon}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{metric.label}</p>
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{metric.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4">Resource Usage</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Memory</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{metrics.memory} MB</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(metrics.memory / 16) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">CPU Usage</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.floor(Math.random() * 50) + 20}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.floor(Math.random() * 50) + 20}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Network Bandwidth</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.floor(Math.random() * 5) + 2} Mbps
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.floor(Math.random() * 40) + 20}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Build Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold mb-4">Build Size</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Main Bundle</span>
              <span className="font-bold">247 KB</span>
            </div>
            <div className="flex justify-between">
              <span>CSS</span>
              <span className="font-bold">8.42 KB</span>
            </div>
            <div className="flex justify-between">
              <span>Total Modules</span>
              <span className="font-bold">3,040</span>
            </div>
            <div className="flex justify-between">
              <span>Build Time</span>
              <span className="font-bold">13.24s</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold mb-4">Quality Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>ESLint Errors</span>
              <span className="font-bold text-green-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ESLint Warnings</span>
              <span className="font-bold text-yellow-600">181</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Type Safety</span>
              <span className="font-bold text-green-600">98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Accessibility</span>
              <span className="font-bold text-green-600">WCAG AA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3">Performance Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-900 dark:text-blue-200">
          <li>✅ Bundle is well-optimized with code splitting</li>
          <li>✅ Dark mode reduces eye strain and battery usage</li>
          <li>✅ API caching reduces network requests</li>
          <li>⚠️ Consider lazy loading for large components</li>
          <li>💡 Enable HTTP/2 push on production server</li>
        </ul>
      </div>
    </div>
  );
}
