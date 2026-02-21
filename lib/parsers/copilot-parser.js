const BaseSessionParser = require('./base-parser');

/**
 * Copilot CLI Session Parser
 * 
 * Parses events from GitHub Copilot CLI (copilot-agent)
 * Format: {type: "session.start", data: {...}, id: "...", parentId: "..."}
 */
class CopilotSessionParser extends BaseSessionParser {
  canParse(events) {
    if (!events || events.length === 0) return false;
    
    // Check for Copilot CLI specific event types
    const copilotEventTypes = [
      'session.start',
      'user.message',
      'assistant.turn_start',
      'assistant.message',
      'tool.execution_start'
    ];
    
    return events.some(e => 
      e.type && copilotEventTypes.some(t => e.type.startsWith(t))
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
    const sessionStart = events.find(e => e.type === 'session.start');
    if (!sessionStart) return null;

    const data = sessionStart.data || {};
    return {
      sessionId: data.sessionId,
      startTime: data.startTime,
      model: data.selectedModel,
      version: data.copilotVersion,
      producer: data.producer,
      cwd: data.context?.cwd,
      gitRoot: data.context?.gitRoot,
      branch: data.context?.branch,
      repository: data.context?.repository
    };
  }

  extractTurns(events) {
    const turns = [];
    let currentTurn = null;

    for (const event of events) {
      if (event.type === 'user.message') {
        // Start new turn
        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = {
          turnId: event.id,
          userMessage: {
            id: event.id,
            content: event.data?.content || '',
            transformedContent: event.data?.transformedContent,
            timestamp: event.timestamp
          },
          assistantMessages: [],
          toolCalls: []
        };
      } else if (event.type === 'assistant.message' && currentTurn) {
        currentTurn.assistantMessages.push({
          id: event.id,
          messageId: event.data?.messageId,
          content: event.data?.content || '',
          toolRequests: event.data?.toolRequests || [],
          reasoningText: event.data?.reasoningText,
          timestamp: event.timestamp
        });
      } else if (event.type.startsWith('tool.execution_') && currentTurn) {
        const toolCallId = event.data?.toolCallId;
        let toolCall = currentTurn.toolCalls.find(tc => tc.toolCallId === toolCallId);
        
        if (!toolCall) {
          toolCall = { toolCallId, events: [] };
          currentTurn.toolCalls.push(toolCall);
        }
        
        toolCall.events.push(event);
        
        if (event.type === 'tool.execution_start') {
          toolCall.name = event.data?.toolName;
          toolCall.arguments = event.data?.arguments;
        } else if (event.type === 'tool.execution_complete') {
          toolCall.result = event.data?.result;
          toolCall.exitCode = event.data?.exitCode;
        }
      }
    }

    // Push last turn
    if (currentTurn) {
      turns.push(currentTurn);
    }

    return turns;
  }

  extractToolCalls(events) {
    const toolCalls = [];
    const toolCallMap = new Map();

    for (const event of events) {
      if (event.type === 'tool.execution_start') {
        const toolCallId = event.data?.toolCallId;
        toolCallMap.set(toolCallId, {
          toolCallId,
          name: event.data?.toolName,
          arguments: event.data?.arguments,
          startEvent: event,
          completeEvent: null
        });
      } else if (event.type === 'tool.execution_complete') {
        const toolCallId = event.data?.toolCallId;
        const toolCall = toolCallMap.get(toolCallId);
        if (toolCall) {
          toolCall.completeEvent = event;
          toolCall.result = event.data?.result;
          toolCall.exitCode = event.data?.exitCode;
          toolCalls.push(toolCall);
        }
      }
    }

    return toolCalls;
  }
}

module.exports = CopilotSessionParser;
