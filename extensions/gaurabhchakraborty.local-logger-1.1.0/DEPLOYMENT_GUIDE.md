# 🚀 Deployment Guide - AI Usage Tracker Extension

This guide walks you through deploying the AI Usage Tracker extension to the VS Code Marketplace.

## Prerequisites

### 1. Install Required Tools

```bash
# Install Visual Studio Code Extension Manager
npm install -g @vscode/vsce

# Verify installation
vsce --version
```

### 2. Create Publisher Account

1. Visit [VS Code Marketplace](https://marketplace.visualstudio.com/manage)
2. Sign in with Microsoft account
3. Create a new publisher if you don't have one
4. Note your publisher ID

### 3. Generate Personal Access Token

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with same Microsoft account
3. Go to User Settings > Personal Access Tokens
4. Create new token with:
   - **Name**: VS Code Extension Publishing
   - **Organization**: All accessible organizations
   - **Scopes**: Marketplace (manage)
5. Copy the token (save it securely!)

## 🛠️ Pre-Deployment Steps

### 1. Update Package.json

```bash
# Ensure publisher matches your account
"publisher": "YourPublisherName"

# Update version if needed
"version": "1.0.0"
```

### 2. Final Quality Check

```bash
# Compile TypeScript
npm run compile

# Run tests
npm test

# Lint code
npm run lint

# Package extension
npm run package
```

### 3. Test Locally

```bash
# Install locally for testing
code --install-extension ai-usage-tracker-1.0.0.vsix

# Test all features:
# - Start AI session
# - End AI session  
# - Export CSV
# - View dashboard
# - Quick setup
```

## 📦 Packaging

### Create Production Package

```bash
# Clean build
npm run clean
npm run compile

# Package with vsce
vsce package

# This creates: ai-usage-tracker-1.0.0.vsix
```

### Verify Package Contents

```bash
# List package contents
vsce ls

# Check package size
ls -lh *.vsix
```

## 🌍 Publishing to Marketplace

### 1. Login to VSCE

```bash
# Login with your token
vsce login YourPublisherName

# When prompted, paste your Personal Access Token
```

### 2. Publish Extension

```bash
# Publish current version
vsce publish

# Or publish with version bump
vsce publish patch   # 1.0.0 -> 1.0.1
vsce publish minor   # 1.0.0 -> 1.1.0
vsce publish major   # 1.0.0 -> 2.0.0
```

### 3. Verify Publication

1. Visit [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Search for your extension
3. Check all details display correctly
4. Install from marketplace to test

## 🔄 Update Workflow

### For Updates/Bug Fixes

```bash
# 1. Make your changes
# 2. Update CHANGELOG.md
# 3. Test changes
npm run test

# 4. Publish patch version
vsce publish patch
```

### For New Features

```bash
# 1. Implement features
# 2. Update documentation
# 3. Update CHANGELOG.md
# 4. Test thoroughly

# 5. Publish minor version
vsce publish minor
```

## 📊 Post-Publication

### Monitor Extension

1. **Marketplace Dashboard**:
   - Visit [publisher dashboard](https://marketplace.visualstudio.com/manage)
   - Monitor downloads, ratings, reviews

2. **GitHub Analytics**:
   - Track repository stars, forks
   - Monitor issue reports
   - Review feature requests

### Respond to Feedback

- **Reviews**: Respond to marketplace reviews
- **Issues**: Address GitHub issues promptly
- **Questions**: Answer user questions

## 🛡️ Security & Best Practices

### Code Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

### Version Management

- Follow [Semantic Versioning](https://semver.org/)
- Update CHANGELOG.md for each release
- Tag releases in Git

### Documentation

- Keep README.md updated
- Maintain usage examples
- Document breaking changes

## 🚨 Troubleshooting

### Common Publishing Issues

1. **Authentication Failed**
   ```bash
   # Re-login with fresh token
   vsce logout
   vsce login YourPublisherName
   ```

2. **Package Too Large**
   ```bash
   # Check .vscodeignore file
   # Remove unnecessary files
   vsce ls
   ```

3. **Missing Required Fields**
   - Check package.json has all required fields
   - Verify icon file exists
   - Ensure license is specified

### Validation Errors

```bash
# Check extension validity
vsce package --allow-star-activation --allow-missing-repository
```

## 📞 Support

### If You Need Help

1. **VS Code Extension API**: [Documentation](https://code.visualstudio.com/api)
2. **VSCE Tool**: [GitHub Repository](https://github.com/microsoft/vscode-vsce)
3. **Publisher Support**: [Azure DevOps Support](https://developercommunity.visualstudio.com/)

### Extension-Specific Support

- **Repository**: [GitHub Issues](https://github.com/gaurabh-chakraborty/ai-usage-tracker)
- **Documentation**: [Usage Guide](USAGE_GUIDE.md)

---

## Quick Reference Commands

```bash
# Development
npm install          # Install dependencies
npm run watch       # Watch mode development
npm run compile     # Compile TypeScript
npm test           # Run tests

# Packaging
vsce package       # Create .vsix file
vsce ls           # List package contents

# Publishing  
vsce login        # Login to marketplace
vsce publish      # Publish to marketplace
vsce unpublish    # Remove from marketplace (use carefully!)

# Local testing
code --install-extension extension.vsix
code --uninstall-extension publisher.extension-name
```

Your extension is now ready for the VS Code Marketplace! 🎉
