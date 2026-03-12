/**
 * Application Insights Telemetry Module
 *
 * This module initializes and configures Application Insights for telemetry tracking.
 * Must be required BEFORE any other modules (especially Express) in server.js.
 *
 * Features:
 * - Auto-collection of requests, dependencies, exceptions, and performance counters
 * - Custom event and metric tracking
 * - Automatic disabling in test environments
 * - Support for manual disabling via DISABLE_TELEMETRY env var
 */

const appInsights = require('applicationinsights');

// Determine if telemetry should be disabled
const isTestEnvironment = process.env.NODE_ENV === 'test';
const isDisabled = process.env.DISABLE_TELEMETRY === 'true' || isTestEnvironment;

// Default connection string (can be overridden via env var)
const DEFAULT_CONNECTION_STRING = 'InstrumentationKey=39f4fbf1-d82f-42c3-b4ef-ea92a1fd82cb;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=7d4bb432-f2f5-4526-a5e6-31901e5a2db2';

let client = null;

if (!isDisabled) {
  try {
    // Get connection string from environment or use default
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || DEFAULT_CONNECTION_STRING;

    // Setup and start Application Insights
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(false) // Disable console tracking to avoid noise
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(false) // Disable live metrics for local dev tool
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .start();

    client = appInsights.defaultClient;

    // Set context properties
    client.context.tags[client.context.keys.cloudRole] = 'copilot-session-viewer';
    client.context.tags[client.context.keys.cloudRoleInstance] = require('os').hostname();

    console.log('✅ Application Insights telemetry initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Application Insights:', error.message);
    // Continue without telemetry rather than crashing
    client = createNoOpClient();
  }
} else {
  // Return no-op client for test environment or when disabled
  client = createNoOpClient();

  if (isTestEnvironment) {
    console.log('📊 Telemetry disabled (test environment)');
  } else {
    console.log('📊 Telemetry disabled (DISABLE_TELEMETRY=true)');
  }
}

/**
 * Creates a no-op client that safely ignores all telemetry calls
 * Used when telemetry is disabled or in test environments
 */
function createNoOpClient() {
  return {
    trackEvent: () => {},
    trackMetric: () => {},
    trackException: () => {},
    trackTrace: () => {},
    trackDependency: () => {},
    trackRequest: () => {},
    flush: (callback) => {
      if (callback) callback();
    }
  };
}

/**
 * Track a custom event
 * @param {string} name - Event name
 * @param {Object} properties - Event properties
 */
function trackEvent(name, properties = {}) {
  if (client && client.trackEvent) {
    client.trackEvent({
      name,
      properties
    });
  }
}

/**
 * Track a custom metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} properties - Additional properties
 */
function trackMetric(name, value, properties = {}) {
  if (client && client.trackMetric) {
    client.trackMetric({
      name,
      value,
      properties
    });
  }
}

/**
 * Track an exception
 * @param {Error} error - Error object
 * @param {Object} properties - Additional properties
 */
function trackException(error, properties = {}) {
  if (client && client.trackException) {
    client.trackException({
      exception: error,
      properties
    });
  }
}

/**
 * Flush telemetry data (useful for short-lived processes)
 * @returns {Promise<void>}
 */
function flush() {
  return new Promise((resolve) => {
    if (client && client.flush) {
      client.flush({
        callback: () => resolve()
      });
    } else {
      resolve();
    }
  });
}

// Export the client and helper functions
module.exports = {
  client,
  trackEvent,
  trackMetric,
  trackException,
  flush,
  isEnabled: !isDisabled
};
