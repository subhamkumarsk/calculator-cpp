# 👋 Welcome to AI Usage Tracker!

Thank you for installing the AI Usage Tracker extension! This guide will help you get started in just a few minutes.

## 🚀 Quick Start (2 minutes)

### Step 1: Initial Setup
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type: **"AI Logger: Quick Setup"**
3. Fill in your details:
   - Your name
   - Your team (e.g., ST7, Engineering, etc.)
   - Choose if you want team CSV sync

✅ **Setup complete!** Your defaults are now saved.

### Step 2: Start Your First Session
1. Before using any AI tools, press `Ctrl+Alt+S` (or use Command Palette: **"AI Logger: Start AI Session"**)
2. Fill in the session details:
   - What you're working on (e.g., "Create login component")
   - Which AI tools you'll use
   - Estimated time without AI
3. Click OK to start tracking

### Step 3: Work Normally
- Use your AI tools as usual (Copilot, Claude, etc.)
- The extension tracks everything automatically
- You'll see "AI Session Active" in the status bar

### Step 4: End Your Session
1. When done, press `Ctrl+Alt+E` (or Command Palette: **"AI Logger: End AI Session"**)
2. Describe what you accomplished
3. Your data is automatically calculated and saved!

### Step 5: Export Your Data
- Press `Ctrl+Alt+X` to export to CSV
- Choose "Copy to Current Sheet" to paste into your team spreadsheet
- Or save as a new file

## 📊 What Gets Tracked Automatically

- ⏱️ **Session Duration**: Precise timing from start to finish
- 📁 **File Changes**: Which files you worked on
- 🤖 **AI Tool Usage**: Automatic detection of AI assistance
- 🧪 **Test Runs**: Testing activity during your session
- 📈 **Time Savings**: Calculated percentages vs manual work

## 🎯 Your Data Format

The extension generates data that matches your existing team format:

```csv
Your Name,ST7,2025-07-07,WEB-12345,"Create login component",GitHub Copilot,"Generated 90% of code correctly",4.0,1.2,30%,70%
```

This can be directly pasted into your team's tracking spreadsheet!

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac | Command Palette |
|--------|---------------|-----|----------------|
| Start Session | `Ctrl+Alt+S` | `Cmd+Alt+S` | AI Logger: Start AI Session |
| End Session | `Ctrl+Alt+E` | `Cmd+Alt+E` | AI Logger: End AI Session |
| Export CSV | `Ctrl+Alt+X` | `Cmd+Alt+X` | AI Logger: Export to CSV |
| View Dashboard | `Ctrl+Alt+D` | `Cmd+Alt+D` | AI Logger: View Dashboard |

## 🤖 Supported AI Tools

The extension automatically detects and tracks:

- **GitHub Copilot** ✅
- **Devin Agent** ✅  
- **Claude (Anthropic)** ✅
- **ChatGPT GPT-4o** ✅
- **Cursor AI** ✅
- **MCP Server** ✅
- **Windsurf** ✅
- **Custom Tools** ✅

## 🔧 Configuration (Optional)

You can customize the extension in VS Code Settings:

1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "productivity tracker"
3. Adjust settings like:
   - Default team name
   - Auto-sync options
   - AI tool detection

## 💡 Pro Tips

### For Individual Use
- Start sessions before significant AI-assisted work
- Be descriptive in your experiment summaries
- Review your dashboard weekly to see productivity trends

### For Teams
- Set up shared CSV sync for automatic team data
- Use consistent JIRA ticket formats
- Share productivity insights in team meetings

### For Managers
- Export weekly reports for sprint reviews
- Track team AI adoption rates
- Measure productivity improvements over time

## 📈 Understanding Your Dashboard

Press `Ctrl+Alt+D` to view your productivity dashboard:

- **Total Sessions**: How many AI sessions you've tracked
- **Average Time Saved**: Your productivity improvement percentage
- **Most Used Tools**: Which AI tools you rely on most
- **Recent Sessions**: Your latest tracking data

## 🔄 Workflow Integration

### Typical Development Session:
1. Get assigned a task/ticket
2. **Start AI session** (`Ctrl+Alt+S`)
3. Work with AI tools as normal
4. **End session** (`Ctrl+Alt+E`) with outcomes
5. Continue with next task

### Team Data Flow:
1. Individual sessions tracked automatically
2. Export to team CSV when needed
3. Team dashboard shows collective insights
4. Managers get productivity reports

## 🆘 Need Help?

### Common Questions

**Q: I forgot to start a session, can I add it manually?**
A: Yes! Start a session and manually adjust the estimated times based on your actual work.

**Q: Can I track multiple AI tools in one session?**
A: Absolutely! Select multiple tools when starting your session.

**Q: How do I share data with my team?**
A: Use "Export to CSV" and choose "Copy to Current Sheet" to paste into your team spreadsheet.

**Q: Will this slow down VS Code?**
A: No! The extension runs efficiently in the background with minimal resource usage.

### Still Need Help?

- 📖 **Full Guide**: [Usage Guide](USAGE_GUIDE.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/gaurabh-chakraborty/ai-usage-tracker/issues)
- 💬 **Ask Questions**: [GitHub Discussions](https://github.com/gaurabh-chakraborty/ai-usage-tracker/discussions)

## 🎉 You're All Set!

You're now ready to automatically track your AI usage and measure productivity improvements! 

**Start your first session now**: Press `Ctrl+Alt+S` and begin tracking your AI-powered development! 

---

*Transform your manual logging into automated insights - one session at a time! 🚀*
