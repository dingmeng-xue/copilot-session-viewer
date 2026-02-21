const BaseSessionParser = require('./base-parser');

/**
 * Claude Code Session Parser
 * 
 * Parses events from Anthropic Claude Code CLI
 * Format: {type: "user"|"assistant", uuid: "...", parentUuid: "...", message: {...}}
 */
class ClaudeSessionParser extends BaseSessionParser {
  canParse(events) {
    if (!events || events.length === 0) return false;
    
    // Check for Claude Code specific structure
    return events.some(e => 
      e.type && ['user', 'assistant'].includes(e.type) &&
      e.uuid && Object.prototype.hasOwnProperty.call(e, 'parentUuid') && e.sessionId
    );
  }

  parse(events) {
    return {
      metadata: this.getMetadata(events),
      turns: this.extractTurns(events),
      toolCalls: this.extractToolCalls(events),
      allEvents: events
    };
  }

  getMetadata(events) {
    const firstUserMessage = events.find(e => e.type === 'user');
    if (!firstUserMessage) return null;

    // Extract model from assistant messages
    const firstAssistant = events.find(e => e.type === 'assistant' && e.message?.model);
    const model = firstAssistant?.message?.model || 'unknown';

    return {
      sessionId: firstUserMessage.sessionId,
      startTime: firstUserMessage.timestamp,
      model: model,
      version: firstUserMessage.version,
      producer: 'claude-code',
      cwd: firstUserMessage.cwd,
      gitRoot: null, // Not available in Claude format
      branch: firstUserMessage.gitBranch,
      repository: null // Not available in Claude format
    };
  }

  extractTurns(events) {
    const turns = [];
    const messageEvents = events.filter(e => 
      ['user', 'assistant'].includes(e.type) &&
      e.type !== 'file-history-snapshot' &&
      e.type !== 'queue-operation'
    );

    // Build parent-child tree
    const eventMap = new Map();
    for (const event of messageEvents) {
      eventMap.set(event.uuid, event);
    }

    // Find root user messages (no parentUuid or parent is not a message)
    const rootMessages = messageEvents.filter(e => 
      e.type === 'user' && (!e.parentUuid || !eventMap.has(e.parentUuid))
    );

    for (const userMsg of rootMessages) {
      const turn = {
        turnId: userMsg.uuid,
        userMessage: {
          id: userMsg.uuid,
          content: this._extractMessageContent(userMsg.message),
          timestamp: userMsg.timestamp
        },
        assistantMessages: [],
        toolCalls: []
      };

      // Find all children of this user message
      this._collectAssistantResponses(userMsg.uuid, eventMap, turn);

      turns.push(turn);
    }

    return turns;
  }

  _collectAssistantResponses(parentUuid, eventMap, turn) {
    for (const [_uuid, event] of eventMap.entries()) {
      if (event.parentUuid === parentUuid) {
        if (event.type === 'assistant') {
          const assistantMsg = {
            id: event.uuid,
            messageId: event.message?.id,
            content: this._extractMessageContent(event.message),
            model: event.message?.model,
            timestamp: event.timestamp
          };

          // Extract tool calls from content
          const toolUseBlocks = this._extractToolUse(event.message);
          if (toolUseBlocks.length > 0) {
            assistantMsg.toolRequests = toolUseBlocks;
            turn.toolCalls.push(...toolUseBlocks.map(t => ({
              toolCallId: t.id,
              name: t.name,
              arguments: t.input,
              parentUuid: event.uuid
            })));
          }

          turn.assistantMessages.push(assistantMsg);

          // Recursively collect children (follow-up messages)
          this._collectAssistantResponses(event.uuid, eventMap, turn);
        }
      }
    }
  }

  _extractMessageContent(message) {
    if (!message || !message.content) return '';
    
    if (typeof message.content === 'string') {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      return message.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');
    }

    return '';
  }

  _extractToolUse(message) {
    if (!message || !message.content || !Array.isArray(message.content)) {
      return [];
    }

    return message.content
      .filter(block => block.type === 'tool_use')
      .map(block => ({
        id: block.id,
        name: block.name,
        input: block.input
      }));
  }

  extractToolCalls(events) {
    const toolCalls = [];

    for (const event of events) {
      if (event.type === 'assistant' && event.message?.content) {
        const toolUseBlocks = this._extractToolUse(event.message);
        
        for (const tool of toolUseBlocks) {
          toolCalls.push({
            toolCallId: tool.id,
            name: tool.name,
            arguments: tool.input,
            parentUuid: event.uuid,
            timestamp: event.timestamp,
            // Claude format doesn't have separate execution events
            // Tool result would be in a following user message with tool_result
            result: null,
            exitCode: null
          });
        }
      }
    }

    return toolCalls;
  }
}

module.exports = ClaudeSessionParser;
