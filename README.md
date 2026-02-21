# 🤖 Copilot Session Viewer

[![npm version](https://img.shields.io/npm/v/@qiaolei81/copilot-session-viewer.svg)](https://www.npmjs.com/package/@qiaolei81/copilot-session-viewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**AI-Powered Session Log Analysis Tool for GitHub Copilot CLI**

A modern web-based viewer for analyzing GitHub Copilot CLI session logs with virtual scrolling, infinite loading, time analysis, and AI-powered insights.

### Session List
![Session List](https://raw.githubusercontent.com/qiaolei81/copilot-session-viewer/main/docs/images/homepage.png)

### Session Detail — Event Stream with Virtual Scrolling
![Session Detail](https://raw.githubusercontent.com/qiaolei81/copilot-session-viewer/main/docs/images/session-detail.png)

### Time Analysis — Gantt Timeline & Sub-Agent Breakdown
![Time Analysis](https://raw.githubusercontent.com/qiaolei81/copilot-session-viewer/main/docs/images/time-analysis.png)

---

## ⚡ Quick Start

### Try without installing (recommended)

```bash
npx -y @qiaolei81/copilot-session-viewer@latest
```

Then open http://localhost:3838

### Install globally

```bash
npm install -g @qiaolei81/copilot-session-viewer
copilot-session-viewer
```

### Requirements

- Node.js ≥ 18.0.0
- GitHub Copilot CLI (for generating session data)

---

## ✨ Features

### 🎯 **Core Capabilities**
- **📊 Session Management** - View, export, and import session archives
- **🔍 Event Analysis** - Real-time log parsing with filtering and search
- **⏱️ Time Analysis** - Execution timelines and performance metrics
- **🚀 Virtual Scrolling** - Handle 1000+ events smoothly
- **♾️ Infinite Scroll** - Progressive session loading for better performance
- **🤖 AI Insights** - LLM-powered session analysis

### 🎨 **User Experience**
- **🌙 Dark Theme** - GitHub-inspired interface
- **📱 Responsive** - Works on desktop, tablet, and mobile
- **⚡ Fast** - Optimized virtual rendering and lazy loading
- **🔐 Secure** - Local-first with no data sharing

### 🛠️ **Technical Features**
- **Vue 3** - Reactive virtual scrolling
- **Express.js** - Robust backend API
- **ZIP Import/Export** - Session sharing capabilities
- **Multi-format Support** - Directory and JSONL sessions

---

## 🚀 How It Works

1. **Generate Sessions** - Use GitHub Copilot CLI to create session logs
2. **Auto-Discovery** - Sessions are automatically detected in `~/.copilot/session-state/`
3. **Browse & Analyze** - View sessions with infinite scroll and detailed event streams
4. **Time Analysis** - Analyze turn durations, tool usage, and sub-agent performance
5. **AI Insights** - Generate comprehensive session analysis with Copilot

```bash
# Example: Generate a session with Copilot CLI
copilot --model claude-sonnet-4.5 -p "Help me refactor this code"

# Start the viewer
npx @qiaolei81/copilot-session-viewer

# Browse sessions at http://localhost:3838
```

---

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[API Documentation](docs/API.md)** - REST endpoints and responses
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and local development
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Changelog](CHANGELOG.md)** - Release history

---

## 🧪 Testing & Coverage

This project includes comprehensive unit and E2E test coverage with detailed reporting.

### Running Tests

```bash
# Unit tests only
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests only
npm run test:e2e

# E2E tests with coverage
npm run test:e2e:coverage

# Run all tests (unit + E2E)
npm run test:all

# Run all tests with combined coverage report
npm run test:coverage:all
```

### Coverage Reports

The `test:coverage:all` command generates comprehensive coverage reports by:
1. Running Jest unit tests with coverage
2. Running Playwright E2E tests with coverage (using built-in Coverage API)
3. Converting V8 coverage format to Istanbul format
4. Merging unit and E2E coverage data
5. Generating combined HTML reports

**Coverage Report Locations:**
- **Combined Coverage**: `./coverage/combined/index.html` - Merged unit + E2E coverage
- **Unit Test Coverage**: `./coverage/unit/index.html` - Jest unit tests only
- **LCOV Report**: `./coverage/lcov.info` - For CI/CD integration

**Coverage Collection:**
- **Unit tests**: Automatically collected by Jest for all server-side code
- **E2E tests**: Uses Playwright's built-in Coverage API to collect browser JavaScript coverage
- **Merge tool**: Uses `nyc` to merge Istanbul-formatted coverage data
- **Conversion**: V8 coverage from Playwright is converted using `v8-to-istanbul`

### Test Structure

```
__tests__/
├── unit/                    # Jest unit tests
│   ├── server.test.js
│   └── ...
└── e2e/                     # Playwright E2E tests
    ├── fixtures.js          # Test fixtures with coverage hooks
    ├── global-setup.js      # Global test setup
    ├── helpers/
    │   └── coverage.js      # Coverage collection helpers
    └── *.spec.js            # E2E test specs
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Vue 3 + EJS Templates)               │
│  • Virtual Scroller (vue-virtual-scroller)      │
│  • Infinite Scroll (JavaScript)                 │
│  • GitHub-inspired Dark Theme                   │
└─────────────────────────────────────────────────┘
                      ↕ HTTP/API
┌─────────────────────────────────────────────────┐
│  Backend (Node.js + Express)                    │
│  • Session Repository & File Watcher            │
│  • JSONL Streaming Parser                       │
│  • Paginated API Endpoints                      │
└─────────────────────────────────────────────────┘
                      ↕ File System
┌─────────────────────────────────────────────────┐
│  Data Layer (~/.copilot/session-state/)         │
│  • events.jsonl (event streams)                 │
│  • workspace.yaml (metadata)                    │
│  • copilot-insight.md (AI analysis)              │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases

### **For Developers**
- Debug GitHub Copilot CLI sessions
- Analyze conversation patterns and tool usage
- Export sessions for team collaboration
- Performance optimization insights

### **For Teams**
- Share interesting Copilot sessions
- Analyze team AI usage patterns
- Document complex problem-solving sessions
- Training and best practice development

### **For Researchers**
- Study human-AI interaction patterns
- Analyze tool usage effectiveness
- Session data mining and analysis
- AI conversation flow research

---

## 🤝 Contributing

This project welcomes contributions! See our [Development Guide](docs/DEVELOPMENT.md) for:

- Setting up the development environment
- Code style guidelines
- Testing procedures
- Contribution workflow

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

**Built with AI assistance** - This project was developed using GitHub Copilot and Claude AI for code generation, documentation, and architectural decisions.

**Key Dependencies:**
- [Vue 3](https://vuejs.org/) - Reactive frontend framework
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller) - High-performance virtual scrolling
- [Express.js](https://expressjs.com/) - Web application framework
- [EJS](https://ejs.co/) - Templating engine

---

<div align="center">

**[🏠 Homepage](https://github.com/qiaolei81/copilot-session-viewer)** •
**[📖 Docs](docs/)** •
**[🐛 Issues](https://github.com/qiaolei81/copilot-session-viewer/issues)** •
**[💬 Discussions](https://github.com/qiaolei81/copilot-session-viewer/discussions)**

Made with ❤️ for the GitHub Copilot CLI community

</div>