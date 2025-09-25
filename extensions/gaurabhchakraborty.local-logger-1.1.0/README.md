# 🤖 AI Usage Tracker - Team Productivity Analytics

[![VS Code Extension](https://img.shields.io/vscode-marketplace/v/GaurabhChakraborty.local-logger?label=VS%20Code%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=GaurabhChakraborty.local-logger)
[![Downloads](https://img.shields.io/vscode-marketplace/d/GaurabhChakraborty.local-logger?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=GaurabhChakraborty.local-logger)
[![Rating](https://img.shields.io/vscode-marketplace/r/GaurabhChakraborty.local-logger?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=GaurabhChakraborty.local-logger)
[![AI Tools](https://img.shields.io/badge/AI%20Tools-Supported-brightgreen)](#supported-ai-tools)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/gaurabh-chakraborty/local-logger-extension/blob/HEAD/LICENSE.md)

> **🎯 The [#1](https://github.com/gaurabh-chakraborty/local-logger-extension/issues/1) VS Code extension for automated AI productivity tracking**  
> Transform your manual AI usage logging into professional team analytics!

**Stop wasting time with manual spreadsheet tracking.** This extension automatically captures your AI development sessions and generates comprehensive productivity reports that help teams measure real ROI from AI tools like GitHub Copilot, Claude, Devin, and more.

## 🏆 Why Teams Choose AI Usage Tracker

✅ **Eliminate Manual Work** - No more manual time logging or CSV data entry  
✅ **Accurate Metrics** - Precise timing and productivity calculations  
✅ **Team Collaboration** - Shared CSV exports for consolidated reporting  
✅ **Professional Reports** - Enterprise-ready analytics and insights  
✅ **Zero Learning Curve** - Works seamlessly with your existing workflow  

## ✨ Core Features

### 🎯 **Automated Session Tracking**
- One-click start/stop session tracking
- Automatic timing with millisecond precision
- Intelligent tool detection and workflow monitoring
- Background tracking without interrupting your work

### 📊 **Real-time Analytics Dashboard**
- Live productivity metrics and time savings calculations
- Session history with detailed breakdowns
- Visual insights into AI tool effectiveness
- Performance trends over time

### 🔄 **Team Collaboration & Export**
- Export to CSV in standard team reporting format
- Automatic sync to shared team files
- Customizable data fields and formats
- Integration with existing team workflows

### 🤖 **Universal AI Tool Support**
Works seamlessly with all popular AI development tools:
- **GitHub Copilot** - Code suggestions and completions
- **Claude (Anthropic)** - AI assistant conversations  
- **Devin Agent** - Autonomous development tasks
- **Cursor AI** - AI-powered code editor
- **ChatGPT** - General AI assistance
- **And many more...**

## 🚀 Quick Start Guide

### 1. Install & Setup
```
1. Install the extension
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Run: "AI Logger: Quick Setup AI Tracking"
4. Configure your name, team, and CSV sync options
```

### 2. 🎯 Track AI Usage Sessions
```
Before using AI tools:
→ Command Palette: "AI Logger: Start AI Session Tracking"
→ Extension automatically begins monitoring your work

After completing AI-assisted work:
→ Command Palette: "AI Logger: End AI Session"
→ Session data automatically saved with timing metrics
```

### 3. 📊 Export & Analyze Results
```
→ Command Palette: "AI Logger: Export AI Usage to CSV"
→ View real-time dashboard: "AI Logger: View Dashboard"
→ Data ready for team spreadsheets and analysis!
```

## � Extension in Action

### 🎮 Command Palette Integration
![Command Palette](https://via.placeholder.com/600x300/1e1e1e/ffffff?text=Command+Palette+-+AI+Logger+Commands)
*Access all AI tracking features directly from VS Code's command palette*

### 📊 Real-time Dashboard
![Dashboard View](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=AI+Usage+Dashboard+-+Live+Analytics)
*Monitor your AI productivity with real-time metrics and insights*

### 📈 Session Tracking Interface
![Session Tracking](https://via.placeholder.com/600x350/1e1e1e/ffffff?text=Session+Setup+-+Easy+Configuration)
*Quick session setup with intelligent defaults and team sync options*

### 📁 CSV Export Results
![CSV Export](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=CSV+Export+-+Professional+Reports)
*Export professional team reports in standard CSV format*

## 🎯 Perfect For These Use Cases

### 💼 **Enterprise Teams**
- Measure ROI from AI tool investments
- Track team productivity improvements
- Generate executive reports on AI adoption
- Optimize AI tool usage across teams

### 🚀 **Development Teams** 
- Monitor GitHub Copilot effectiveness
- Track time savings from AI assistance
- Compare productivity across projects
- Share best practices for AI usage

### 📊 **Project Managers**
- Get data-driven insights into development velocity
- Track actual vs estimated AI time savings
- Monitor team collaboration and tool adoption
- Generate stakeholder reports with real metrics

### 🔬 **Researchers & Analysts**
- Collect usage data for AI productivity studies
- Analyze patterns in AI tool effectiveness
- Generate datasets for research projects
- Track long-term productivity trends

### Dashboard View  
*Real-time productivity insights and analytics*

### CSV Export
*Team-ready data export in standard format*

## 🤖 Supported AI Tools

- **GitHub Copilot** - Auto-detection of completions
- **Devin Agent** - Session-based tracking  
- **Claude** (Anthropic) - Manual logging integration
- **ChatGPT GPT-4o** - Usage pattern tracking
- **Cursor AI** - Tab completion monitoring
- **MCP Server** - Protocol-based detection
- **Windsurf** - Development assistant tracking
- **Custom Tools** - Manual input support

## 📊 Data Collected

The extension automatically captures:

| Metric | Description | Auto-Calculated |
|--------|-------------|----------------|
| Session Duration | Actual time spent working | ✅ |
| Time Savings | % saved vs manual work | ✅ |
| AI Tool Usage | Which tools were used | ✅ |
| File Changes | Files modified during session | ✅ |
| Test Runs | Testing activity detected | ✅ |
| Outcomes | Success/failure descriptions | Manual |

## 📈 Sample Output

```csv
Individual,Team,Date,JIRA ticket,Experiment Summary,Tools Used,Notable Outcomes,Time without AI,Time with AI,% Time with AI,% Time Saved
John Doe,ST7,2025-07-07,WEB-12345,"Create table component",GitHub Copilot,"Generated 80% correctly",4.0,1.5,38%,62%
```

## ⚡ Advanced Features

### Team Synchronization
- **Shared CSV Files** - Automatic sync to team spreadsheets
- **Real-time Updates** - No manual data entry required
- **Consistent Format** - Standardized across team members

### Smart Detection
- **AI Tool Recognition** - Automatically detects tool usage
- **Session Monitoring** - Tracks file changes and activities  
- **Time Accuracy** - Precise session duration tracking

### Analytics Dashboard
- **Productivity Trends** - Visual insights into AI impact
- **Team Comparisons** - Benchmark against team averages
- **Export Options** - Multiple format support

## 🛠️ Configuration

Access via `File > Preferences > Settings` and search for "AI Usage Tracker":

### Personal Defaults
```json
{
  "productivityTracker.aiTracking.defaultIndividual": "Your Name",
  "productivityTracker.aiTracking.defaultTeam": "ST7",
  "productivityTracker.aiTracking.autoDetectTools": true
}
```

### Team Integration  
```json
{
  "productivityTracker.csvExport.teamSheetPath": "/path/to/team/sheet.csv",
  "productivityTracker.csvExport.autoSync": true
}
```

## 🔧 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `AI Logger: Quick Setup` | Initial configuration | - |
| `AI Logger: Start AI Session` | Begin tracking session | - |
| `AI Logger: End AI Session` | Complete and log session | - |
| `AI Logger: Export to CSV` | Generate team data | - |
| `AI Logger: View Dashboard` | Show analytics | - |

## 💼 Use Cases

### Individual Developers
- Track personal AI productivity gains
- Identify most effective AI tools  
- Optimize development workflows
- Generate performance reports

### Development Teams
- Standardize AI usage tracking
- Compare team member productivity
- Measure ROI of AI tool investments
- Generate management reports

### Engineering Managers
- Monitor team AI adoption
- Quantify productivity improvements
- Make data-driven tool decisions
- Track sprint capacity changes

## 🎯 Why This Extension?

### Before: Manual Tracking Problems
❌ Forgetting to log AI usage  
❌ Inaccurate time estimates  
❌ Inconsistent data formats  
❌ Manual calculation errors  
❌ Team synchronization issues  

### After: Automated Excellence  
✅ Never miss a session  
✅ Precise time tracking  
✅ Standardized team data  
✅ Automatic calculations  
✅ Seamless team sync  

## 📋 Requirements

- **VS Code**: Version 1.74.0 or higher
- **Node.js**: For CSV processing (auto-included)
- **File Access**: For team CSV synchronization (optional)

## 🚀 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search "AI Usage Tracker"
4. Click Install

### Manual Installation
1. Download `.vsix` file
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run "Extensions: Install from VSIX"
4. Select downloaded file

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/gaurabh-chakraborty/local-logger-extension/blob/HEAD/CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/gaurabh-chakraborty/ai-usage-tracker
cd ai-usage-tracker
npm install
npm run watch
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/gaurabh-chakraborty/local-logger-extension/blob/HEAD/LICENSE.md) file for details.

## 🆘 Support

- **Documentation**: [Usage Guide](https://github.com/gaurabh-chakraborty/local-logger-extension/blob/HEAD/USAGE_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/gaurabh-chakraborty/ai-usage-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gaurabh-chakraborty/ai-usage-tracker/discussions)

## 🎉 Acknowledgments

Built for development teams who want to measure and optimize their AI-powered productivity. Special thanks to the VS Code team for the excellent extension API.

---

**Ready to automate your AI tracking?** Install now and transform your manual logging into automated analytics! 🚀
