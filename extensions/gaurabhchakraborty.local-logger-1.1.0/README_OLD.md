# 🧩 VS Code Local Logger Extension

A comprehensive VS Code extension that tracks and logs your development activity with multiple export formats, configurable log levels, and intuitive controls.

## ✨ Features

### 📊 Activity Tracking
- **Document Events**: File open, save, close, and edit operations
- **Editor Events**: Editor switches and text selections
- **Terminal Events**: Terminal creation and destruction
- **Smart Filtering**: Exclude patterns for node_modules, .git, and other unwanted files

### 🎛️ Flexible Configuration
- **Log Levels**: Info, Warning, Error with filtering capabilities
- **Export Formats**: Plain text, Markdown, and JSON
- **Toggle Control**: Easy on/off switching via status bar or commands
- **Event Categories**: Enable/disable specific event types
- **Auto Export**: Optional daily log exports

### 🎨 User Interface
- **Status Bar Integration**: Visual logging status with one-click toggle
- **Output Channel**: Real-time activity feed with timestamps and icons
- **Command Palette**: Full command support for all operations
- **Configuration UI**: All settings accessible via VS Code preferences

## 🚀 Quick Start

1. **Install the extension**
2. **Open VS Code** - logging starts automatically
3. **View logs** in the "Local Logger" output channel
4. **Toggle logging** by clicking the status bar icon
5. **Export logs** using `Ctrl+Shift+P` → "Local Logger: Export Logs"

## 📋 Available Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Local Logger: Toggle Logging` | Enable/disable activity logging | Status bar click |
| `Local Logger: Export Logs` | Export logs in chosen format | Command palette |
| `Local Logger: Process Daily Logs` | Legacy export command | Command palette |
| `Local Logger: Clear Current Logs` | Clear all current log data | Command palette |
| `Local Logger: Open Log File` | Open raw log file | Command palette |

## ⚙️ Configuration

Access via File → Preferences → Settings → Extensions → Local Logger

### Core Settings
```json
{
  "localLogger.enabled": true,
  "localLogger.logLevel": "info",
  "localLogger.exportFormat": "md",
  "localLogger.showInStatusBar": true
}
```

### Event Categories
```json
{
  "localLogger.logDocumentEvents": true,
  "localLogger.logEditorEvents": true,
  "localLogger.logTerminalEvents": true
}
```

### Advanced Options
```json
{
  "localLogger.autoExportDaily": false,
  "localLogger.excludePatterns": [
    "**/node_modules/**",
    "**/.git/**",
    "**/out/**",
    "**/dist/**"
  ]
}
```

## 📊 Export Formats

### Markdown (Default)
```markdown
# 📊 Local Logger Report - 2025-07-07

## 📈 Summary
- **Total Events**: 42
- **Info**: 40 | **Warnings**: 2 | **Errors**: 0
- **Categories**: document, editor, terminal

## 📋 Detailed Logs
### Document Events
- **10:30:15** 📝 Document opened: src/extension.ts
- **10:31:22** 📝 Document saved: src/extension.ts
```

### JSON
```json
[
  {
    "timestamp": "2025-07-07T10:30:15.123Z",
    "level": "info",
    "message": "Document opened: src/extension.ts",
    "category": "document"
  }
]
```

### Plain Text
```
Local Logger Report - 2025-07-07
==================================================

Summary:
Total Events: 42
Info: 40 | Warnings: 2 | Errors: 0
Categories: document, editor, terminal

Detailed Logs:
--------------------

[10:30:15] [INFO] [DOCUMENT] Document opened: src/extension.ts
```

## 🎯 Use Cases

- **Development Analytics**: Track your coding patterns and productivity
- **Project Auditing**: Monitor file access and modification history
- **Team Insights**: Share development activity reports
- **Debugging Sessions**: Correlate issues with recent file changes
- **Time Tracking**: Understand how you spend time across different files

## 🔧 Advanced Features

### Status Bar Integration
- 🟢 `$(record) Logger` - Logging enabled
- 🟡 `$(debug-pause) Logger` - Logging disabled

### Smart Filtering
Automatically excludes common build directories and version control files while allowing custom patterns.

### Log Levels
- **Info**: General activity (file opens, saves, etc.)
- **Warning**: Potential issues or unusual events
- **Error**: Failed operations or critical issues

## �️ Development

### Building from Source
```bash
npm install
npm run compile
```

### Running Tests
```bash
npm run test
```

### Packaging
```bash
npm run package
```

## 📝 License

MIT - see [LICENSE.md](LICENSE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/gaurabh-chakraborty/local-logger-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gaurabh-chakraborty/local-logger-extension/discussions)

---

**Happy Logging!** 🎉

