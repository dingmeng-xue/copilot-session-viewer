# Session Event Parsers

Strategy pattern implementation for parsing session events from multiple formats.

## Architecture

```
lib/parsers/
├── base-parser.js       # Base parser interface
├── copilot-parser.js    # Copilot CLI format parser
├── claude-parser.js     # Claude Code format parser
├── pi-mono-parser.js    # Pi-Mono format parser
├── parser-factory.js    # Parser factory (auto-detection)
└── index.js             # Export all parsers
```

## Design Pattern

### Strategy Pattern

- **Strategy Interface**: `BaseSessionParser` defines methods all parsers must implement
- **Concrete Strategies**: `CopilotSessionParser`, `ClaudeSessionParser`, `PiMonoSessionParser` implement specific parsing logic
- **Context**: `ParserFactory` automatically selects the appropriate strategy

### Benefits

1. **Extensible**: Add new formats by simply implementing `BaseSessionParser`
2. **Decoupled**: Parsing logic is separated from consumers
3. **Auto-detection**: `ParserFactory` automatically identifies formats
4. **Unified Interface**: Different formats output the same data structure

## Usage

### Auto-detect Format

```javascript
const { ParserFactory } = require('./lib/parsers');

const events = [...]; // Events read from jsonl
const factory = new ParserFactory();

// Auto-detect and parse
const result = factory.parse(events);

// Get parser type
const parserType = factory.getParserType(events); // 'copilot', 'claude', or 'pi-mono'
```

### Use Specific Parser Directly

```javascript
const { CopilotSessionParser, ClaudeSessionParser, PiMonoSessionParser } = require('./lib/parsers');

// Copilot CLI
const copilotParser = new CopilotSessionParser();
if (copilotParser.canParse(events)) {
  const result = copilotParser.parse(events);
}

// Claude Code
const claudeParser = new ClaudeSessionParser();
if (claudeParser.canParse(events)) {
  const result = claudeParser.parse(events);
}

// Pi-Mono
const piMonoParser = new PiMonoSessionParser();
if (piMonoParser.canParse(events)) {
  const result = piMonoParser.parse(events);
}
```

## Unified Output Format

All parsers output the same data structure:

```javascript
{
  metadata: {
    sessionId: "...",
    startTime: "...",
    model: "...",
    version: "...",
    cwd: "...",
    branch: "...",
    // ...
  },
  turns: [
    {
      turnId: "...",
      userMessage: {
        id: "...",
        content: "...",
        timestamp: "..."
      },
      assistantMessages: [
        {
          id: "...",
          content: "...",
          toolRequests: [...],
          timestamp: "..."
        }
      ],
      toolCalls: [...]
    }
  ],
  toolCalls: [...],
  allEvents: [...] // Raw events
}
```

## Supported Formats

### 1. Copilot CLI Format

**Characteristics:**
- Event types: `session.start`, `user.message`, `assistant.message`, `tool.execution_start`
- Structure: `{type, data: {...}, id, parentId}`
- Tree relationship: Connected via `parentId`

**Example:**
```json
{
  "type": "session.start",
  "data": {
    "sessionId": "...",
    "selectedModel": "claude-sonnet-4.5"
  },
  "id": "...",
  "timestamp": "..."
}
```

### 2. Claude Code Format

**Characteristics:**
- Event types: `user`, `assistant`, `file-history-snapshot`, `queue-operation`
- Structure: `{type, uuid, parentUuid, message: {...}}`
- Tree relationship: Connected via `parentUuid`

**Example:**
```json
{
  "type": "user",
  "uuid": "...",
  "parentUuid": null,
  "sessionId": "...",
  "message": {
    "role": "user",
    "content": "..."
  }
}
```

### 3. Pi-Mono Format

**Characteristics:**
- Event types: `message` (with role), `model_change`, `thinking_change`
- Structure: `{type, role, message, toolResult, timestamp}`
- Flat structure with parentId linkage for tool results

**Example:**
```json
{
  "type": "message",
  "role": "user",
  "message": "...",
  "timestamp": "...",
  "id": "..."
}
```

## Adding New Formats

1. Extend `BaseSessionParser`
2. Implement all required methods
3. Register in `ParserFactory`

```javascript
const BaseSessionParser = require('./base-parser');

class MyCustomParser extends BaseSessionParser {
  canParse(events) {
    // Detection logic
    return events.some(e => e.customField);
  }

  parse(events) {
    return {
      metadata: this.getMetadata(events),
      turns: this.extractTurns(events),
      toolCalls: this.extractToolCalls(events),
      allEvents: events
    };
  }

  getMetadata(events) { /* ... */ }
  extractTurns(events) { /* ... */ }
  extractToolCalls(events) { /* ... */ }
}

// Add to parser-factory.js
this.parsers.push(new MyCustomParser());
```

## Testing

Run example:
```bash
node examples/parser-usage.js
```

## API Documentation

### BaseSessionParser

Base class for all parsers.

#### Methods

- `canParse(events)` - Check if this format can be parsed
- `parse(events)` - Parse events and return unified format
- `getMetadata(events)` - Extract session metadata
- `extractTurns(events)` - Extract conversation turns
- `extractToolCalls(events)` - Extract tool calls

### ParserFactory

Parser factory for automatic format detection.

#### Methods

- `getParser(events)` - Return appropriate parser instance
- `parse(events)` - Auto-detect and parse
- `getParserType(events)` - Return parser type name

## License

MIT
