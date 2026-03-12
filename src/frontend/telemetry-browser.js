/**
 * Browser-side Telemetry Wrapper for Application Insights
 *
 * Provides a simple API for tracking user interactions in the browser.
 * Uses the Application Insights JavaScript SDK (initialized via CDN snippet).
 *
 * Features:
 * - Simple trackClick(eventName, properties) API
 * - Automatic disabling via window.__DISABLE_TELEMETRY flag
 * - Non-blocking - telemetry failures never break UI
 * - Graceful degradation if SDK is not loaded
 */

(function() {
  'use strict';

  // Check if telemetry is disabled globally
  const isTelemetryDisabled = window.__DISABLE_TELEMETRY === true;

  /**
   * Track a user interaction event
   * @param {string} eventName - Name of the event (e.g., "FilterPillClicked")
   * @param {Object} properties - Additional properties to track with the event
   */
  window.trackClick = function(eventName, properties = {}) {
    // Skip if telemetry is disabled
    if (isTelemetryDisabled) {
      return;
    }

    try {
      // Check if Application Insights is available
      if (typeof window.appInsights === 'undefined' || !window.appInsights) {
        console.debug('Application Insights not loaded, skipping telemetry event:', eventName);
        return;
      }

      // Track the event with Application Insights
      window.appInsights.trackEvent({
        name: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        }
      });

      console.debug('Telemetry event tracked:', eventName, properties);
    } catch (error) {
      // Never let telemetry errors break the UI
      console.error('Failed to track telemetry event:', eventName, error);
    }
  };

  /**
   * Track a page view
   * @param {string} pageName - Name of the page
   * @param {Object} properties - Additional properties
   */
  window.trackPageView = function(pageName, properties = {}) {
    if (isTelemetryDisabled) {
      return;
    }

    try {
      if (typeof window.appInsights === 'undefined' || !window.appInsights) {
        console.debug('Application Insights not loaded, skipping page view:', pageName);
        return;
      }

      window.appInsights.trackPageView({
        name: pageName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      });

      console.debug('Page view tracked:', pageName, properties);
    } catch (error) {
      console.error('Failed to track page view:', pageName, error);
    }
  };

  /**
   * Track a custom metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} properties - Additional properties
   */
  window.trackMetric = function(metricName, value, properties = {}) {
    if (isTelemetryDisabled) {
      return;
    }

    try {
      if (typeof window.appInsights === 'undefined' || !window.appInsights) {
        console.debug('Application Insights not loaded, skipping metric:', metricName);
        return;
      }

      window.appInsights.trackMetric({
        name: metricName,
        average: value,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      });

      console.debug('Metric tracked:', metricName, value, properties);
    } catch (error) {
      console.error('Failed to track metric:', metricName, error);
    }
  };

  // Log initialization status
  if (isTelemetryDisabled) {
    console.log('📊 Browser telemetry disabled (window.__DISABLE_TELEMETRY = true)');
  } else {
    console.log('📊 Browser telemetry wrapper initialized');
  }
})();
