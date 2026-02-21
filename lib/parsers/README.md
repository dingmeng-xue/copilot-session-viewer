# Session Event Parsers

策略模式实现的 session event 解析器，支持多种格式。

## 架构

```
lib/parsers/
├── base-parser.js       # 基础解析器接口
├── copilot-parser.js    # Copilot CLI 格式解析器
├── claude-parser.js     # Claude Code 格式解析器
├── parser-factory.js    # 解析器工厂（自动检测格式）
└── index.js             # 导出所有解析器
```

## 设计模式

### 策略模式 (Strategy Pattern)

- **策略接口**: `BaseSessionParser` 定义了所有解析器必须实现的方法
- **具体策略**: `CopilotSessionParser`, `ClaudeSessionParser` 实现具体解析逻辑
- **上下文**: `ParserFactory` 自动选择合适的策略

### 优点

1. **可扩展**: 添加新格式只需实现 `BaseSessionParser`
2. **解耦**: 解析逻辑与使用者分离
3. **自动检测**: `ParserFactory` 自动识别格式
4. **统一接口**: 不同格式输出相同的数据结构

## 使用方法

### 自动检测格式

```javascript
const { ParserFactory } = require('./lib/parsers');

const events = [...]; // 从 jsonl 读取的事件
const factory = new ParserFactory();

// 自动检测并解析
const result = factory.parse(events);

// 获取解析器类型
const parserType = factory.getParserType(events); // 'copilot' or 'claude'
```

### 直接使用特定解析器

```javascript
const { CopilotSessionParser, ClaudeSessionParser } = require('./lib/parsers');

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
```

## 统一输出格式

所有解析器输出相同的数据结构：

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
  allEvents: [...] // 原始事件
}
```

## 支持的格式

### 1. Copilot CLI Format

**特征:**
- 事件类型: `session.start`, `user.message`, `assistant.message`, `tool.execution_start`
- 结构: `{type, data: {...}, id, parentId}`
- 树形关系: 通过 `parentId` 连接

**示例:**
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

**特征:**
- 事件类型: `user`, `assistant`, `file-history-snapshot`, `queue-operation`
- 结构: `{type, uuid, parentUuid, message: {...}}`
- 树形关系: 通过 `parentUuid` 连接

**示例:**
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

## 添加新格式

1. 继承 `BaseSessionParser`
2. 实现所有必需方法
3. 在 `ParserFactory` 中注册

```javascript
const BaseSessionParser = require('./base-parser');

class MyCustomParser extends BaseSessionParser {
  canParse(events) {
    // 检测逻辑
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

// 在 parser-factory.js 中添加
this.parsers.push(new MyCustomParser());
```

## 测试

运行示例:
```bash
node examples/parser-usage.js
```

## API 文档

### BaseSessionParser

所有解析器的基类。

#### 方法

- `canParse(events)` - 判断是否能解析此格式
- `parse(events)` - 解析事件并返回统一格式
- `getMetadata(events)` - 提取 session 元数据
- `extractTurns(events)` - 提取对话轮次
- `extractToolCalls(events)` - 提取工具调用

### ParserFactory

解析器工厂，自动检测格式。

#### 方法

- `getParser(events)` - 返回合适的解析器实例
- `parse(events)` - 自动检测并解析
- `getParserType(events)` - 返回解析器类型名称

## License

MIT
