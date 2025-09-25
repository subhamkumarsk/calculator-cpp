# Changelog

All notable changes to the "AI Usage Tracker" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-07

### 🚀 Enhanced Marketplace Release

#### Fixed
- **Package Name**: Updated package name from "ai-usage-tracker" to "local-logger" to match marketplace extension
- **Marketplace Links**: Fixed all badge URLs and links to use correct extension identifier

#### Enhanced
- **Marketplace Presentation**: Improved extension description and overview
- **Professional Screenshots**: Added placeholder images for marketplace gallery
- **Enhanced Documentation**: Better README with use cases and features
- **VS Code Marketplace Badges**: Added download and rating badges
- **User Experience**: Clearer quick start guide and command descriptions

#### Added
- **Use Case Examples**: Enterprise teams, development teams, project managers, researchers
- **Visual Gallery**: Command palette, dashboard, session tracking, and CSV export previews
- **Professional Branding**: Enhanced marketplace presence with comprehensive overview

## [1.0.0] - 2025-07-07

### 🎉 Initial Release - AI Usage Tracking

#### Added
- **AI Session Tracking**: Start/stop AI usage sessions with structured data collection
- **Multi-AI Tool Support**: 
  - GitHub Copilot integration
  - Devin Agent tracking
  - Claude (Anthropic) logging
  - ChatGPT GPT-4o monitoring
  - Cursor AI detection
  - MCP Server integration
  - Windsurf tracking
  - Custom tool support
- ⚙️ **Comprehensive Settings**: Full configuration support via VS Code settings
- 🎯 **Smart Filtering**: Exclude patterns for common build directories
- 📈 **Enhanced Logging**: Structured logging with categories and timestamps
- 🧩 **Command Palette**: Full command support for all operations
- 📋 **Activity Summary**: Statistical overview in exported reports
- 🔄 **Auto Export**: Optional daily log exports
- 🎨 **Better UI**: Icons, colors, and improved user experience

### Changed
- 🔄 **Complete Rewrite**: Modernized codebase with TypeScript best practices
- 📝 **Command Names**: Updated from `my-logger.*` to `localLogger.*`
- 🗂️ **File Structure**: JSON-based log entries for better parsing
- 📊 **Export Format**: Enhanced with summaries and categorization

### Fixed
- 🐛 **Recursive Logging**: Prevented extension from logging its own output
- 🔧 **File Path Handling**: Better relative path resolution for workspace files
- ⚡ **Performance**: Optimized event listeners and file operations

### Removed
- 🗑️ **Legacy Format**: Old plain text log format (still supported for import)

## [0.0.2] - Previous Version

### Added
- Basic activity logging
- Simple daily summary export
- Output channel integration

### Features
- Document events (open, save, close, edit)
- Editor events (switch, selection)
- Terminal events (open, close)
- Basic log file export

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
