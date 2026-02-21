const CopilotSessionParser = require('./copilot-parser');
const ClaudeSessionParser = require('./claude-parser');
const PiMonoParser = require('./pi-mono-parser');

/**
 * Parser Factory
 * 
 * Automatically detects the session format and returns the appropriate parser
 */
class ParserFactory {
  constructor() {
    this.parsers = [
      new CopilotSessionParser(),
      new ClaudeSessionParser(),
      new PiMonoParser()
    ];
    
    // Name-to-parser mapping
    this.parserMap = {
      'copilot': new CopilotSessionParser(),
      'claude': new ClaudeSessionParser(),
      'pi-mono': new PiMonoParser()
    };
  }

  /**
   * Get parser by name or auto-detect from events
   * @param {string|Array<Object>} nameOrEvents - Parser name or events array
   * @returns {BaseSessionParser|null}
   */
  getParser(nameOrEvents) {
    // If it's a string, get parser by name
    if (typeof nameOrEvents === 'string') {
      return this.parserMap[nameOrEvents] || null;
    }
    
    // Otherwise, auto-detect from events
    const events = nameOrEvents;
    for (const parser of this.parsers) {
      if (parser.canParse(events)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * Parse events using the appropriate parser
   * @param {Array<Object>} events - Raw events from jsonl
   * @returns {Object|null} Parsed session data or null if no parser found
   */
  parse(events) {
    const parser = this.getParser(events);
    if (!parser) {
      return null;
    }
    return parser.parse(events);
  }

  /**
   * Get parser type name
   * @param {Array<Object>} events - Raw events from jsonl
   * @returns {string|null} Parser name ('copilot', 'claude', 'pi-mono') or null
   */
  getParserType(events) {
    const parser = this.getParser(events);
    if (!parser) return null;
    
    if (parser instanceof CopilotSessionParser) return 'copilot';
    if (parser instanceof ClaudeSessionParser) return 'claude';
    if (parser instanceof PiMonoParser) return 'pi-mono';
    
    return 'unknown';
  }
}

module.exports = ParserFactory;
