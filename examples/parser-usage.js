const { ParserFactory } = require('../lib/parsers');

// Example: Parse Copilot CLI session
function parseCopilotSession() {
  const copilotEvents = [
    {
      type: 'session.start',
      data: {
        sessionId: '12345',
        startTime: '2026-02-20T00:00:00Z',
        selectedModel: 'claude-sonnet-4.5',
        copilotVersion: '0.0.411',
        context: {
          cwd: '/path/to/project',
          branch: 'main'
        }
      },
      id: 'evt-1',
      timestamp: '2026-02-20T00:00:00Z'
    },
    {
      type: 'user.message',
      data: {
        content: 'Hello',
        transformedContent: 'Hello'
      },
      id: 'evt-2',
      timestamp: '2026-02-20T00:00:01Z',
      parentId: 'evt-1'
    },
    {
      type: 'assistant.message',
      data: {
        messageId: 'msg-1',
        content: 'Hi there!',
        toolRequests: []
      },
      id: 'evt-3',
      timestamp: '2026-02-20T00:00:02Z',
      parentId: 'evt-2'
    }
  ];

  const factory = new ParserFactory();
  const result = factory.parse(copilotEvents);
  
  console.log('=== Copilot Session ===');
  console.log('Parser type:', factory.getParserType(copilotEvents));
  console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
  console.log('Turns:', result.turns.length);
  console.log('First turn:', JSON.stringify(result.turns[0], null, 2));
}

// Example: Parse Claude Code session
function parseClaudeSession() {
  const claudeEvents = [
    {
      type: 'user',
      uuid: 'uuid-1',
      parentUuid: null,
      sessionId: 'session-123',
      timestamp: '2026-02-20T00:00:00Z',
      cwd: '/path/to/project',
      gitBranch: 'main',
      version: '2.1.42',
      message: {
        role: 'user',
        content: 'Analyze this code'
      }
    },
    {
      type: 'assistant',
      uuid: 'uuid-2',
      parentUuid: 'uuid-1',
      sessionId: 'session-123',
      timestamp: '2026-02-20T00:00:01Z',
      message: {
        id: 'msg-1',
        role: 'assistant',
        model: 'claude-opus-4.6',
        content: [
          { type: 'text', text: "I'll analyze the code." },
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'read_file',
            input: { path: 'src/main.js' }
          }
        ]
      }
    }
  ];

  const factory = new ParserFactory();
  const result = factory.parse(claudeEvents);
  
  console.log('\n=== Claude Code Session ===');
  console.log('Parser type:', factory.getParserType(claudeEvents));
  console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
  console.log('Turns:', result.turns.length);
  console.log('First turn:', JSON.stringify(result.turns[0], null, 2));
  console.log('Tool calls:', result.toolCalls.length);
}

// Run examples
if (require.main === module) {
  parseCopilotSession();
  parseClaudeSession();
}

module.exports = {
  parseCopilotSession,
  parseClaudeSession
};
