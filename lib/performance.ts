'use client';

// Performance monitoring utility
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark performance timing
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  }

  // Measure performance between two marks
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window === 'undefined' || !('performance' in window)) return null;
    
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
      
      const entries = performance.getEntriesByName(name, 'measure');
      const latestEntry = entries[entries.length - 1];
      
      if (latestEntry) {
        this.recordMetric(name, latestEntry.duration);
        return latestEntry.duration;
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
    
    return null;
  }

  // Record custom metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
    
    // Keep only last 100 measurements to prevent memory leaks
    const values = this.metrics.get(name)!;
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get performance statistics
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({});
        return;
      }

      const vitals: any = {};

      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.fid = (entry as any).processingStart - entry.startTime;
        });
      }).observe({ type: 'first-input', buffered: true });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.cls = clsValue;
      }).observe({ type: 'layout-shift', buffered: true });

      // FCP (First Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
        });
      }).observe({ type: 'paint', buffered: true });

      // TTFB (Time to First Byte)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.fetchStart;
      }

      setTimeout(() => resolve(vitals), 1000);
    });
  }

  // Report performance data (can be sent to analytics)
  async reportPerformance(): Promise<void> {
    const vitals = await this.getCoreWebVitals();
    const customMetrics = {};
    
    for (const [name, _] of this.metrics) {
      const stats = this.getStats(name);
      if (stats) {
        (customMetrics as any)[name] = stats;
      }
    }

    const report = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      vitals,
      customMetrics,
      navigation: this.getNavigationTiming(),
      resources: this.getResourceTiming()
    };

    // In production, send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Report:', report);
    }
    
    // Example: Send to analytics service
    // analytics.track('performance', report);
  }

  private getNavigationTiming(): any {
    if (typeof window === 'undefined') return {};
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return {};

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      tlsNegotiation: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
      resourceLoading: navigation.loadEventStart - navigation.domContentLoadedEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    };
  }

  private getResourceTiming(): any[] {
    if (typeof window === 'undefined') return [];
    
    const resources = performance.getEntriesByType('resource');
    return resources
      .filter((resource: any) => resource.transferSize > 0)
      .map((resource: any) => ({
        name: resource.name,
        type: this.getResourceType(resource.name),
        size: resource.transferSize,
        duration: resource.duration,
        blocked: resource.domainLookupStart - resource.fetchStart,
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        connect: resource.connectEnd - resource.connectStart,
        send: resource.responseStart - resource.requestStart,
        wait: resource.responseStart - resource.requestStart,
        receive: resource.responseEnd - resource.responseStart
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 20); // Top 20 slowest resources
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    if (['js', 'mjs'].includes(extension || '')) return 'script';
    if (extension === 'css') return 'stylesheet';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(extension || '')) return 'font';
    return 'other';
  }

  // Memory usage monitoring
  getMemoryUsage(): any {
    if (typeof window === 'undefined' || !(performance as any).memory) return null;
    
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.totalJSHeapSize * 100).toFixed(2) + '%'
    };
  }
}

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const measureAsync = async <T>(name: string, asyncFn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - startTime;
      monitor.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      monitor.recordMetric(`${name}_error`, duration);
      throw error;
    }
  };

  const measureSync = <T>(name: string, syncFn: () => T): T => {
    const startTime = performance.now();
    try {
      const result = syncFn();
      const duration = performance.now() - startTime;
      monitor.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      monitor.recordMetric(`${name}_error`, duration);
      throw error;
    }
  };

  return {
    measure: monitor.measure.bind(monitor),
    mark: monitor.mark.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
    getStats: monitor.getStats.bind(monitor),
    measureAsync,
    measureSync,
    reportPerformance: monitor.reportPerformance.bind(monitor),
    getMemoryUsage: monitor.getMemoryUsage.bind(monitor)
  };
}

export default PerformanceMonitor;