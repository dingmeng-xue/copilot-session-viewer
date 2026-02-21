/**
 * Base Session Parser Interface
 * 
 * All session parsers must implement these methods
 */
class BaseSessionParser {
  /**
   * Detect if this parser can handle the given events
   * @param {Array<Object>} _events - Raw events from jsonl
   * @returns {boolean}
   */
  canParse(_events) {
    throw new Error('canParse() must be implemented');
  }

  /**
   * Parse raw events into normalized format
   * @param {Array<Object>} _events - Raw events from jsonl
   * @returns {Object} Parsed session data
   */
  parse(_events) {
    throw new Error('parse() must be implemented');
  }

  /**
   * Get session metadata (sessionId, startTime, model, etc.)
   * @param {Array<Object>} _events - Raw events
   * @returns {Object} Session metadata
   */
  getMetadata(_events) {
    throw new Error('getMetadata() must be implemented');
  }

  /**
   * Extract turns (user message + assistant response pairs)
   * @param {Array<Object>} _events - Raw events
   * @returns {Array<Object>} Array of turns
   */
  extractTurns(_events) {
    throw new Error('extractTurns() must be implemented');
  }

  /**
   * Extract tool calls/executions
   * @param {Array<Object>} _events - Raw events
   * @returns {Array<Object>} Array of tool calls
   */
  extractToolCalls(_events) {
    throw new Error('extractToolCalls() must be implemented');
  }
}

module.exports = BaseSessionParser;
