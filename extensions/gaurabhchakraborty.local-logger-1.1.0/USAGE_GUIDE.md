# AI Usage Tracker - Team Productivity Extension

This VS Code extension automatically tracks AI tool usage and generates data that matches your team's manual CSV tracking format.

## 🚀 Quick Start

### 1. Initial Setup
1. Install the extension
2. Open Command Palette (`Cmd+Shift+P`)
3. Run: `AI Logger: Quick Setup AI Tracking`
4. Fill in your name and team
5. Choose whether to sync with your team's shared CSV file

### 2. Track AI Usage Session
1. Before starting work with AI tools, run: `AI Logger: Start AI Session Tracking`
2. Fill in the required information:
   - Your name (pre-filled from setup)
   - Team (pre-filled from setup)  
   - JIRA ticket (optional)
   - Description of what you're working on
   - AI tools you plan to use
   - Estimated time without AI
3. Work normally with your AI tools
4. When done, run: `AI Logger: End AI Session`
5. Describe the outcomes

### 3. Export Data
- **Manual Export**: `AI Logger: Export AI Usage to CSV`
- **View Dashboard**: `AI Logger: View AI Usage Dashboard`
- **Auto-sync**: If configured, data automatically syncs to your team sheet

## 📊 Data Collected

The extension automatically tracks:
- **Session Duration**: Actual time spent working
- **Files Modified**: Number and names of files changed
- **AI Tool Detection**: Automatically detects when AI tools are used
- **Test Runs**: Counts test executions during session
- **Time Calculations**: Automatically calculates time savings percentages

## 🔧 Configuration

Access settings via VS Code Settings (`Cmd+,`) and search for "productivity":

### Default Values
- `productivityTracker.aiTracking.defaultIndividual`: Your name
- `productivityTracker.aiTracking.defaultTeam`: Your team name

### Team Sync
- `productivityTracker.csvExport.teamSheetPath`: Path to shared CSV file
- `productivityTracker.csvExport.autoSync`: Enable automatic syncing

## 📋 CSV Output Format

The extension generates data in this format (matching your current sheet):

```csv
Individual,Team,Date,JIRA ticket,Experiment Summary,Tools and Model Used,Notable Outcomes,Estimated Time without AI (hours),Estimated Time with AI (hours),% time taken with AI vs no AI,% time saved with AI vs no AI
```

## 🤖 Supported AI Tools

The extension can detect and track:
- GitHub Copilot
- Devin Agent  
- Claude
- ChatGPT GPT-4o
- Cursor
- MCP Server
- Windsurf
- Other (custom input)

## 📈 Key Features

### Automatic Detection
- Detects AI tool suggestions and completions
- Tracks file modifications during sessions
- Monitors test execution
- Calculates actual vs estimated time

### Manual Logging
- Easy session start/stop
- Structured data collection forms
- Outcome tracking
- JIRA ticket integration

### Data Export
- CSV format matching your team sheet
- Copy-paste ready data
- Automatic syncing to shared files
- Dashboard views

## 💡 Best Practices

1. **Start sessions early**: Begin tracking before you start using AI tools
2. **Be descriptive**: Use clear experiment summaries
3. **Track outcomes**: Record what worked and what didn't
4. **Regular exports**: Export data weekly to keep team sheet updated
5. **Use JIRA tickets**: Link sessions to specific work items

## 🔄 Workflow Integration

### Typical Session Flow:
1. Get assigned a task/ticket
2. Start AI session tracking
3. Work with AI tools as normal
4. End session with outcomes
5. Data automatically appears in team format

### Team Synchronization:
- Individual exports for personal tracking
- Automatic sync to shared team CSV
- Dashboard views for team insights
- No manual data entry required

## 🛠️ Troubleshooting

### Can't find commands?
- Check Command Palette with `AI Logger:` prefix
- Ensure extension is activated

### Data not syncing?
- Verify team CSV file path in settings
- Check file permissions
- Ensure auto-sync is enabled

### Missing time calculations?
- End sessions properly to trigger calculations
- Estimated time must be entered as number

## 📞 Support

If you need help:
1. Check this guide first
2. View extension logs in Output panel
3. Check VS Code Developer Tools console
4. Contact your team's extension maintainer

---

This extension eliminates manual data entry while maintaining the exact format your team needs for AI productivity tracking.
