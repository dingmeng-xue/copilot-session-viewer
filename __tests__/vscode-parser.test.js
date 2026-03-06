const VsCodeParser = require('../lib/parsers/vscode-parser');

describe('VsCodeParser', () => {
  let parser;

  beforeEach(() => {
    parser = new VsCodeParser();
  });

  describe('canParse', () => {
    it('should return true for valid JSONL format with kind=0 and sessionId', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-session-123',
            requests: []
          }
        }
      ];

      expect(parser.canParse(lines)).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(parser.canParse([])).toBe(false);
    });

    it('should return false for non-array input', () => {
      expect(parser.canParse(null)).toBe(false);
      expect(parser.canParse(undefined)).toBe(false);
      expect(parser.canParse({})).toBe(false);
    });

    it('should return false for lines without kind=0', () => {
      const lines = [
        { kind: 1, k: ['requests'], v: [] }
      ];

      expect(parser.canParse(lines)).toBe(false);
    });

    it('should return false for lines without sessionId', () => {
      const lines = [
        { kind: 0, v: { requests: [] } }
      ];

      expect(parser.canParse(lines)).toBe(false);
    });
  });

  describe('replayMutations', () => {
    it('should handle Initial mutation (kind=0)', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            requests: []
          }
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state).toEqual({
        sessionId: 'test-123',
        requests: []
      });
    });

    it('should handle Set mutation (kind=1)', () => {
      const lines = [
        {
          kind: 0,
          v: { sessionId: 'test-123', requests: [] }
        },
        {
          kind: 1,
          k: ['creationDate'],
          v: '2026-03-05T10:00:00Z'
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.creationDate).toBe('2026-03-05T10:00:00Z');
    });

    it('should handle Push mutation (kind=2) - append items', () => {
      const lines = [
        {
          kind: 0,
          v: { sessionId: 'test-123', requests: [] }
        },
        {
          kind: 2,
          k: ['requests'],
          v: [
            { requestId: 'req-1', message: 'Hello' },
            { requestId: 'req-2', message: 'World' }
          ]
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.requests).toHaveLength(2);
      expect(state.requests[0].requestId).toBe('req-1');
      expect(state.requests[1].requestId).toBe('req-2');
    });

    it('should handle Push mutation (kind=2) with truncation', () => {
      const lines = [
        {
          kind: 0,
          v: { sessionId: 'test-123', requests: [{ id: 1 }, { id: 2 }, { id: 3 }] }
        },
        {
          kind: 2,
          k: ['requests'],
          v: [{ id: 4 }],
          i: 1 // Truncate to index 1 (keep only first item)
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.requests).toHaveLength(2);
      expect(state.requests[0].id).toBe(1);
      expect(state.requests[1].id).toBe(4);
    });

    it('should handle Delete mutation (kind=3)', () => {
      const lines = [
        {
          kind: 0,
          v: { sessionId: 'test-123', tempField: 'temp', requests: [] }
        },
        {
          kind: 3,
          k: ['tempField']
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.tempField).toBeUndefined();
      expect(state.sessionId).toBe('test-123');
    });

    it('should handle nested path Set mutation', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            requests: [{ requestId: 'req-1', response: [] }]
          }
        },
        {
          kind: 1,
          k: ['requests', 0, 'modelId'],
          v: 'gpt-4'
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.requests[0].modelId).toBe('gpt-4');
    });

    it('should handle nested path Push mutation', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            requests: [{ requestId: 'req-1', response: [] }]
          }
        },
        {
          kind: 2,
          k: ['requests', 0, 'response'],
          v: [
            { kind: 'markdownContent', content: 'Hello' },
            { kind: 'markdownContent', content: 'World' }
          ]
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.requests[0].response).toHaveLength(2);
      expect(state.requests[0].response[0].content).toBe('Hello');
    });

    it('should handle complex sequence of mutations', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            creationDate: null,
            requests: []
          }
        },
        {
          kind: 1,
          k: ['creationDate'],
          v: '2026-03-05T10:00:00Z'
        },
        {
          kind: 2,
          k: ['requests'],
          v: [{ requestId: 'req-1', response: [] }]
        },
        {
          kind: 2,
          k: ['requests', 0, 'response'],
          v: [{ kind: 'markdownContent', content: 'Test' }]
        },
        {
          kind: 1,
          k: ['lastMessageDate'],
          v: '2026-03-05T10:05:00Z'
        }
      ];

      const state = parser.replayMutations(lines);

      expect(state.sessionId).toBe('test-123');
      expect(state.creationDate).toBe('2026-03-05T10:00:00Z');
      expect(state.lastMessageDate).toBe('2026-03-05T10:05:00Z');
      expect(state.requests).toHaveLength(1);
      expect(state.requests[0].response).toHaveLength(1);
      expect(state.requests[0].response[0].content).toBe('Test');
    });
  });

  describe('parseJsonl', () => {
    it('should parse JSONL and produce events', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            creationDate: '2026-03-05T10:00:00.000Z',
            requests: [
              {
                requestId: 'req-1',
                timestamp: '2026-03-05T10:01:00.000Z',
                message: { text: 'Hello' },
                modelId: 'gpt-4',
                response: [
                  { kind: 'markdownContent', content: { value: 'Hi there!' } }
                ]
              }
            ]
          }
        }
      ];

      const parsed = parser.parseJsonl(lines);

      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('turns');
      expect(parsed).toHaveProperty('toolCalls');
      expect(parsed).toHaveProperty('allEvents');

      expect(parsed.metadata.sessionId).toBe('test-123');
      expect(parsed.allEvents.length).toBeGreaterThan(0);
    });

    it('should detect parallel subagent invocations', () => {
      const lines = [
        {
          kind: 0,
          v: {
            sessionId: 'test-123',
            creationDate: '2026-03-05T10:00:00.000Z',
            requests: [
              {
                requestId: 'req-1',
                timestamp: '2026-03-05T10:01:00.000Z',
                message: { text: 'Test parallel agents' },
                response: [
                  {
                    kind: 'toolInvocationSerialized',
                    toolCallId: 'agent-1',
                    toolId: 'runSubagent',
                    invocationMessage: 'Run agent one'
                  },
                  {
                    kind: 'toolInvocationSerialized',
                    toolCallId: 'agent-2',
                    toolId: 'runSubagent',
                    invocationMessage: 'Run agent two'
                  }
                ]
              }
            ]
          }
        }
      ];

      const parsed = parser.parseJsonl(lines);

      // Check that subagent.started events are created
      const subagentEvents = parsed.allEvents.filter(e => e.type === 'subagent.started');
      expect(subagentEvents.length).toBeGreaterThan(0);

      // Check that tool invocation events are created
      const toolEvents = parsed.allEvents.filter(e => e.type === 'tool.invocation');
      expect(toolEvents.length).toBeGreaterThanOrEqual(2);
    });
  });
});
