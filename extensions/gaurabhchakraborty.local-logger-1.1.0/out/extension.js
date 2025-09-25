"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
// Global state
let state;
function activate(context) {
    // Initialize extension state
    initializeExtension(context);
    // Load existing data
    loadExistingData(context);
    // Register commands
    registerCommands(context);
    // Setup event listeners
    setupEventListeners(context);
    // Setup enhanced AI detection
    // enhanceEventListeners(context);
    // Setup status bar
    setupStatusBar(context);
    // Show welcome message
    logInfo('Local Logger Extension activated successfully!', 'system');
    // Check for auto-export on startup
    checkAutoExport();
    // Auto-save data every 5 minutes
    const saveInterval = setInterval(() => {
        saveData(context);
    }, 5 * 60 * 1000);
    context.subscriptions.push({
        dispose: () => clearInterval(saveInterval)
    });
}
exports.activate = activate;
function initializeExtension(context) {
    const storagePath = context.globalStoragePath;
    if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
    }
    const config = vscode.workspace.getConfiguration('localLogger');
    state = {
        isLoggingEnabled: config.get('enabled', true),
        outputChannel: vscode.window.createOutputChannel("Local Logger"),
        logFilePath: path.join(storagePath, 'activity.log'),
        statusBarItem: vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100),
        disposables: [],
        aiUsageEntries: [],
        csvExportPath: path.join(storagePath, 'ai-usage-log.csv')
    };
    // Show output channel if logging is enabled
    if (state.isLoggingEnabled) {
        state.outputChannel.show(true);
    }
    // Load existing data
    loadExistingData(context);
}
function registerCommands(context) {
    const commands = [
        vscode.commands.registerCommand('localLogger.processLogs', processLogs),
        vscode.commands.registerCommand('localLogger.toggleLogging', toggleLogging),
        vscode.commands.registerCommand('localLogger.clearLogs', clearLogs),
        vscode.commands.registerCommand('localLogger.openLogFile', openLogFile),
        vscode.commands.registerCommand('localLogger.exportLogs', exportLogs),
        vscode.commands.registerCommand('localLogger.startAISession', startAISession),
        vscode.commands.registerCommand('localLogger.endAISession', endAISession),
        vscode.commands.registerCommand('localLogger.exportToCSV', exportToCSV),
        vscode.commands.registerCommand('localLogger.viewAIUsageDashboard', viewAIUsageDashboard),
        vscode.commands.registerCommand('localLogger.quickSetup', quickSetup),
        vscode.commands.registerCommand('localLogger.quickSetup', quickSetup)
    ];
    commands.forEach(disposable => {
        context.subscriptions.push(disposable);
        state.disposables.push(disposable);
    });
}
function setupEventListeners(context) {
    const config = vscode.workspace.getConfiguration('localLogger');
    // Document events
    if (config.get('logDocumentEvents', true)) {
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
            if (shouldLogFile(doc.fileName)) {
                logInfo(`Document opened: ${getRelativePath(doc.fileName)}`, 'document');
            }
        }), vscode.workspace.onDidCloseTextDocument(doc => {
            if (shouldLogFile(doc.fileName)) {
                logInfo(`Document closed: ${getRelativePath(doc.fileName)}`, 'document');
            }
        }), vscode.workspace.onDidSaveTextDocument(doc => {
            if (shouldLogFile(doc.fileName)) {
                logInfo(`Document saved: ${getRelativePath(doc.fileName)}`, 'document');
            }
        }), vscode.workspace.onDidChangeTextDocument(event => {
            const fileName = event.document.fileName;
            // Prevent recursive logging from our own output channel
            if (fileName.includes('extension-output-') && fileName.includes('local-logger')) {
                return;
            }
            if (shouldLogFile(fileName) && event.contentChanges.length > 0) {
                const changeCount = event.contentChanges.length;
                logInfo(`Document modified: ${getRelativePath(fileName)} (${changeCount} changes)`, 'document');
            }
        }));
    }
    // Editor events
    if (config.get('logEditorEvents', true)) {
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && shouldLogFile(editor.document.fileName)) {
                logInfo(`Editor switched to: ${getRelativePath(editor.document.fileName)}`, 'editor');
            }
        }), vscode.window.onDidChangeTextEditorSelection(event => {
            if (shouldLogFile(event.textEditor.document.fileName)) {
                const selection = event.selections[0];
                if (!selection.isEmpty) {
                    logInfo(`Text selected in: ${getRelativePath(event.textEditor.document.fileName)} (${selection.start.line + 1}:${selection.start.character + 1} - ${selection.end.line + 1}:${selection.end.character + 1})`, 'editor');
                }
            }
        }));
    }
    // Terminal events
    if (config.get('logTerminalEvents', true)) {
        context.subscriptions.push(vscode.window.onDidOpenTerminal(terminal => {
            logInfo(`Terminal opened: ${terminal.name}`, 'terminal');
        }), vscode.window.onDidCloseTerminal(terminal => {
            logInfo(`Terminal closed: ${terminal.name}`, 'terminal');
        }));
    }
    // Configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('localLogger')) {
            const newConfig = vscode.workspace.getConfiguration('localLogger');
            const wasEnabled = state.isLoggingEnabled;
            state.isLoggingEnabled = newConfig.get('enabled', true);
            if (wasEnabled !== state.isLoggingEnabled) {
                updateStatusBar();
                logInfo(`Logging ${state.isLoggingEnabled ? 'enabled' : 'disabled'} via settings`, 'system');
            }
            logInfo('Configuration updated', 'system');
        }
    }));
}
function setupStatusBar(context) {
    const config = vscode.workspace.getConfiguration('localLogger');
    if (config.get('showInStatusBar', true)) {
        state.statusBarItem.command = 'localLogger.toggleLogging';
        state.statusBarItem.tooltip = 'Click to toggle Local Logger';
        updateStatusBar();
        state.statusBarItem.show();
        context.subscriptions.push(state.statusBarItem);
    }
}
function updateStatusBar() {
    if (state.isLoggingEnabled) {
        state.statusBarItem.text = '$(record) Logger';
        state.statusBarItem.color = '#00ff00';
    }
    else {
        state.statusBarItem.text = '$(debug-pause) Logger';
        state.statusBarItem.color = '#ff9900';
    }
}
function shouldLogFile(fileName) {
    if (!state.isLoggingEnabled)
        return false;
    const config = vscode.workspace.getConfiguration('localLogger');
    const excludePatterns = config.get('excludePatterns', []);
    // Check against exclude patterns using basic string matching
    for (const pattern of excludePatterns) {
        // Convert glob pattern to simple check
        const cleanPattern = pattern.replace(/\*\*/g, '').replace(/\*/g, '');
        if (fileName.includes(cleanPattern)) {
            return false;
        }
    }
    return true;
}
function getRelativePath(filePath) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        for (const folder of workspaceFolders) {
            if (filePath.startsWith(folder.uri.fsPath)) {
                return path.relative(folder.uri.fsPath, filePath);
            }
        }
    }
    return path.basename(filePath);
}
function log(level, message, category = 'general') {
    if (!state.isLoggingEnabled)
        return;
    const config = vscode.workspace.getConfiguration('localLogger');
    const minLevel = config.get('logLevel', 'info');
    // Check if this log level should be recorded
    const levels = { info: 0, warn: 1, error: 2 };
    if (levels[level] < levels[minLevel]) {
        return;
    }
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, category };
    // Format for output channel
    const levelIcon = { info: '📝', warn: '⚠️', error: '❌' }[level];
    const formatted = `[${timestamp}] ${levelIcon} [${category.toUpperCase()}] ${message}`;
    state.outputChannel.appendLine(formatted);
    // Write to file
    if (state.logFilePath) {
        try {
            const fileEntry = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(state.logFilePath, fileEntry, 'utf8');
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
}
function logInfo(message, category = 'general') {
    log('info', message, category);
}
function logWarn(message, category = 'general') {
    log('warn', message, category);
}
function logError(message, category = 'general') {
    log('error', message, category);
}
// Command implementations
function toggleLogging() {
    return __awaiter(this, void 0, void 0, function* () {
        state.isLoggingEnabled = !state.isLoggingEnabled;
        updateStatusBar();
        // Update configuration
        const config = vscode.workspace.getConfiguration('localLogger');
        yield config.update('enabled', state.isLoggingEnabled, vscode.ConfigurationTarget.Global);
        const status = state.isLoggingEnabled ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`Local Logger ${status}`);
        logInfo(`Logging ${status} via command`, 'system');
    });
}
function clearLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode.window.showWarningMessage('Are you sure you want to clear all current logs?', { modal: true }, 'Yes, Clear Logs');
        if (result === 'Yes, Clear Logs') {
            try {
                fs.writeFileSync(state.logFilePath, '', 'utf8');
                state.outputChannel.clear();
                vscode.window.showInformationMessage('Logs cleared successfully');
                logInfo('Logs cleared via command', 'system');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to clear logs: ${error}`);
                logError(`Failed to clear logs: ${error}`, 'system');
            }
        }
    });
}
function openLogFile() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(state.logFilePath)) {
            vscode.window.showWarningMessage('No log file exists yet');
            return;
        }
        try {
            const document = yield vscode.workspace.openTextDocument(state.logFilePath);
            yield vscode.window.showTextDocument(document);
            logInfo('Log file opened via command', 'system');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open log file: ${error}`);
            logError(`Failed to open log file: ${error}`, 'system');
        }
    });
}
function exportLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(state.logFilePath)) {
            vscode.window.showWarningMessage('No logs to export');
            return;
        }
        try {
            const config = vscode.workspace.getConfiguration('localLogger');
            const format = config.get('exportFormat', 'md');
            const today = new Date().toISOString().split('T')[0];
            const exportPath = path.join(path.dirname(state.logFilePath), `logs-export-${today}.${format}`);
            const rawLogs = fs.readFileSync(state.logFilePath, 'utf8');
            const logEntries = rawLogs
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                try {
                    return JSON.parse(line);
                }
                catch (_a) {
                    // Handle old format logs
                    return {
                        timestamp: new Date().toISOString(),
                        level: 'info',
                        message: line,
                        category: 'legacy'
                    };
                }
            });
            let exportContent = '';
            if (format === 'json') {
                exportContent = JSON.stringify(logEntries, null, 2);
            }
            else if (format === 'md') {
                exportContent = generateMarkdownExport(logEntries, today);
            }
            else { // txt
                exportContent = generateTextExport(logEntries, today);
            }
            fs.writeFileSync(exportPath, exportContent, 'utf8');
            const openResult = yield vscode.window.showInformationMessage(`Logs exported to: ${path.basename(exportPath)}`, 'Open File');
            if (openResult === 'Open File') {
                const document = yield vscode.workspace.openTextDocument(exportPath);
                yield vscode.window.showTextDocument(document);
            }
            logInfo(`Logs exported to: ${exportPath}`, 'system');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to export logs: ${error}`);
            logError(`Failed to export logs: ${error}`, 'system');
        }
    });
}
function processLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        // This is the legacy command, redirect to export
        yield exportLogs();
    });
}
function generateMarkdownExport(logEntries, date) {
    const header = `# 📊 Local Logger Report - ${date}\n\n`;
    const summary = generateSummary(logEntries);
    let content = header + summary + '\n\n## 📋 Detailed Logs\n\n';
    const groupedByCategory = logEntries.reduce((acc, entry) => {
        if (!acc[entry.category])
            acc[entry.category] = [];
        acc[entry.category].push(entry);
        return acc;
    }, {});
    for (const [category, entries] of Object.entries(groupedByCategory)) {
        content += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Events\n\n`;
        for (const entry of entries) {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            const levelIcon = { info: '📝', warn: '⚠️', error: '❌' }[entry.level];
            content += `- **${time}** ${levelIcon} ${entry.message}\n`;
        }
        content += '\n';
    }
    return content;
}
function generateTextExport(logEntries, date) {
    let content = `Local Logger Report - ${date}\n`;
    content += '='.repeat(50) + '\n\n';
    content += generateSummary(logEntries, false) + '\n\n';
    content += 'Detailed Logs:\n';
    content += '-'.repeat(20) + '\n\n';
    for (const entry of logEntries) {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        content += `[${time}] [${entry.level.toUpperCase()}] [${entry.category.toUpperCase()}] ${entry.message}\n`;
    }
    return content;
}
function generateSummary(logEntries, markdown = true) {
    const stats = {
        total: logEntries.length,
        info: logEntries.filter(e => e.level === 'info').length,
        warn: logEntries.filter(e => e.level === 'warn').length,
        error: logEntries.filter(e => e.level === 'error').length,
        categories: Object.keys(logEntries.reduce((acc, e) => (Object.assign(Object.assign({}, acc), { [e.category]: true })), {}))
    };
    if (markdown) {
        return `## 📈 Summary
- **Total Events**: ${stats.total}
- **Info**: ${stats.info} | **Warnings**: ${stats.warn} | **Errors**: ${stats.error}
- **Categories**: ${stats.categories.join(', ')}`;
    }
    else {
        return `Summary:
Total Events: ${stats.total}
Info: ${stats.info} | Warnings: ${stats.warn} | Errors: ${stats.error}
Categories: ${stats.categories.join(', ')}`;
    }
}
function checkAutoExport() {
    const config = vscode.workspace.getConfiguration('localLogger');
    if (config.get('autoExportDaily', false)) {
        // Check if we need to export logs from yesterday
        const lastExportDate = config.get('lastExportDate', '');
        const today = new Date().toISOString().split('T')[0];
        if (lastExportDate !== today && fs.existsSync(state.logFilePath)) {
            exportLogs().then(() => {
                config.update('lastExportDate', today, vscode.ConfigurationTarget.Global);
            });
        }
    }
}
// AI Usage Tracking Functions
function startAISession() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('productivityTracker');
        const individual = yield vscode.window.showInputBox({
            prompt: 'Enter your name',
            placeHolder: 'e.g., John Doe',
            value: config.get('aiTracking.defaultIndividual', '')
        });
        if (!individual)
            return;
        const team = yield vscode.window.showInputBox({
            prompt: 'Enter your team',
            placeHolder: 'e.g., ST7, ST8, ST9',
            value: config.get('aiTracking.defaultTeam', '')
        });
        if (!team)
            return;
        const jiraTicket = yield vscode.window.showInputBox({
            prompt: 'Enter JIRA ticket (optional)',
            placeHolder: 'e.g., WEB-12345'
        });
        const experimentSummary = yield vscode.window.showInputBox({
            prompt: 'Describe what you\'re working on',
            placeHolder: 'e.g., Create a table component for design library'
        });
        if (!experimentSummary)
            return;
        const toolsUsed = yield vscode.window.showQuickPick([
            { label: 'GitHub Copilot' },
            { label: 'Devin Agent' },
            { label: 'Claude' },
            { label: 'ChatGPT GPT-4o' },
            { label: 'Cursor' },
            { label: 'MCP Server' },
            { label: 'Windsurf' },
            { label: 'Other' }
        ], {
            placeHolder: 'Select AI tool you\'re using',
            canPickMany: true
        });
        if (!toolsUsed || toolsUsed.length === 0)
            return;
        const estimatedTimeWithoutAI = yield vscode.window.showInputBox({
            prompt: 'Estimated time without AI (hours)',
            placeHolder: 'e.g., 4',
            validateInput: (value) => {
                const num = parseFloat(value);
                return isNaN(num) || num <= 0 ? 'Please enter a valid positive number' : null;
            }
        });
        if (!estimatedTimeWithoutAI)
            return;
        // Start tracking session
        state.currentSession = {
            startTime: new Date().toISOString(),
            files: [],
            aiToolsDetected: [],
            commits: 0,
            testRuns: 0
        };
        const entry = {
            individual,
            team,
            date: new Date().toISOString().split('T')[0],
            jiraTicket: jiraTicket || '',
            experimentSummary,
            toolsUsed: toolsUsed.map(t => t.label).join(', '),
            notableOutcomes: '',
            estimatedTimeWithoutAI: parseFloat(estimatedTimeWithoutAI),
            estimatedTimeWithAI: 0,
            percentTimeWithAI: 0,
            percentTimeSaved: 0,
            sessionStartTime: state.currentSession.startTime
        };
        state.aiUsageEntries.push(entry);
        vscode.window.showInformationMessage(`AI session started! We'll track your progress automatically.`);
        logInfo(`AI session started for: ${experimentSummary}`, 'ai-tracking');
        // Update status bar to show active session
        updateStatusBarForSession();
    });
}
function endAISession() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!state.currentSession) {
            vscode.window.showWarningMessage('No active AI session to end');
            return;
        }
        const currentEntry = state.aiUsageEntries[state.aiUsageEntries.length - 1];
        if (!currentEntry || currentEntry.sessionEndTime) {
            vscode.window.showWarningMessage('No active session found');
            return;
        }
        const notableOutcomes = yield vscode.window.showInputBox({
            prompt: 'Describe the outcomes of using AI',
            placeHolder: 'e.g., Achieved about 65% of the desired outcomes from the prompt'
        });
        if (!notableOutcomes)
            return;
        const sessionEndTime = new Date().toISOString();
        const sessionDurationHours = (new Date(sessionEndTime).getTime() - new Date(state.currentSession.startTime).getTime()) / (1000 * 60 * 60);
        // Update the entry
        currentEntry.sessionEndTime = sessionEndTime;
        currentEntry.actualTimeSpent = sessionDurationHours;
        currentEntry.estimatedTimeWithAI = sessionDurationHours;
        currentEntry.notableOutcomes = notableOutcomes;
        currentEntry.percentTimeWithAI = Math.round((sessionDurationHours / currentEntry.estimatedTimeWithoutAI) * 100);
        currentEntry.percentTimeSaved = Math.round(100 - currentEntry.percentTimeWithAI);
        state.currentSession = undefined;
        vscode.window.showInformationMessage(`AI session ended! Duration: ${sessionDurationHours.toFixed(2)} hours`);
        logInfo(`AI session ended. Duration: ${sessionDurationHours.toFixed(2)} hours`, 'ai-tracking');
        // Auto-export to CSV
        yield exportToCSV();
        updateStatusBar();
    });
}
function exportToCSV() {
    return __awaiter(this, void 0, void 0, function* () {
        if (state.aiUsageEntries.length === 0) {
            vscode.window.showInformationMessage('No AI usage data to export');
            return;
        }
        try {
            const csvHeader = 'Individual,Team,Date,JIRA ticket,Experiment Summary,Tools and Model Used,Notable Outcomes,Estimated Time without AI (hours),Estimated Time with AI (hours),% time taken with AI vs no AI,% time saved with AI vs no AI\n';
            const csvRows = state.aiUsageEntries.map(entry => {
                return [
                    entry.individual,
                    entry.team,
                    entry.date,
                    entry.jiraTicket,
                    `"${entry.experimentSummary.replace(/"/g, '""')}"`,
                    entry.toolsUsed,
                    `"${entry.notableOutcomes.replace(/"/g, '""')}"`,
                    entry.estimatedTimeWithoutAI,
                    entry.estimatedTimeWithAI,
                    entry.percentTimeWithAI + '%',
                    entry.percentTimeSaved + '%'
                ].join(',');
            }).join('\n');
            const csvContent = csvHeader + csvRows;
            fs.writeFileSync(state.csvExportPath, csvContent, 'utf8');
            const openResult = yield vscode.window.showInformationMessage(`AI usage data exported to CSV: ${path.basename(state.csvExportPath)}`, 'Open File', 'Copy to Current Sheet');
            if (openResult === 'Open File') {
                const document = yield vscode.workspace.openTextDocument(state.csvExportPath);
                yield vscode.window.showTextDocument(document);
            }
            else if (openResult === 'Copy to Current Sheet') {
                // Copy CSV content to clipboard for easy pasting
                yield vscode.env.clipboard.writeText(csvRows);
                vscode.window.showInformationMessage('CSV data copied to clipboard! You can paste it into your existing sheet.');
            }
            logInfo(`AI usage data exported to: ${state.csvExportPath}`, 'ai-tracking');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to export CSV: ${error}`);
            logError(`Failed to export CSV: ${error}`, 'ai-tracking');
        }
    });
}
function viewAIUsageDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        if (state.aiUsageEntries.length === 0) {
            vscode.window.showInformationMessage('No AI usage data available yet. Start an AI session to begin tracking!');
            return;
        }
        // Create a simple dashboard view
        const totalSessions = state.aiUsageEntries.length;
        const completedSessions = state.aiUsageEntries.filter(e => e.sessionEndTime).length;
        const avgTimeSaved = state.aiUsageEntries
            .filter(e => e.percentTimeSaved > 0)
            .reduce((sum, e) => sum + e.percentTimeSaved, 0) / completedSessions || 0;
        const totalTimeWithoutAI = state.aiUsageEntries.reduce((sum, e) => sum + e.estimatedTimeWithoutAI, 0);
        const totalTimeWithAI = state.aiUsageEntries.reduce((sum, e) => sum + e.estimatedTimeWithAI, 0);
        const dashboard = `
# AI Usage Dashboard

## Summary
- **Total Sessions**: ${totalSessions}
- **Completed Sessions**: ${completedSessions}
- **Average Time Saved**: ${avgTimeSaved.toFixed(1)}%
- **Total Time Without AI**: ${totalTimeWithoutAI.toFixed(1)} hours
- **Total Time With AI**: ${totalTimeWithAI.toFixed(1)} hours
- **Total Time Saved**: ${(totalTimeWithoutAI - totalTimeWithAI).toFixed(1)} hours

## Recent Sessions
${state.aiUsageEntries.slice(-5).map(entry => `
### ${entry.individual} - ${entry.date}
- **Task**: ${entry.experimentSummary}
- **Tools**: ${entry.toolsUsed}
- **Time Saved**: ${entry.percentTimeSaved}%
- **Outcome**: ${entry.notableOutcomes || 'Session in progress...'}
`).join('')}

---
*Use "Export to CSV" to save this data to your team sheet*
`;
        // Show in a new untitled document
        const doc = yield vscode.workspace.openTextDocument({
            content: dashboard,
            language: 'markdown'
        });
        yield vscode.window.showTextDocument(doc);
    });
}
function updateStatusBarForSession() {
    if (state.currentSession) {
        state.statusBarItem.text = '$(record) AI Session Active';
        state.statusBarItem.color = '#00ff00';
        state.statusBarItem.command = 'localLogger.endAISession';
        state.statusBarItem.tooltip = 'Click to end AI session';
    }
    else {
        updateStatusBar();
    }
}
function detectAIToolUsage() {
    // Monitor for AI tool indicators in the workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return;
    // Look for common AI tool indicators
    const aiIndicators = [
        '.cursor',
        'copilot-chat',
        'claude',
        'devin' // Devin
    ];
    // This could be enhanced to detect actual AI tool usage patterns
    logInfo('AI tool detection active', 'ai-detection');
}
// Data management functions
function loadExistingData(context) {
    try {
        const dataPath = path.join(context.globalStoragePath, 'ai-usage-data.json');
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            state.aiUsageEntries = JSON.parse(data);
            logInfo(`Loaded ${state.aiUsageEntries.length} existing AI usage entries`, 'data');
        }
    }
    catch (error) {
        logError(`Failed to load existing data: ${error}`, 'data');
    }
}
function saveData(context) {
    try {
        const dataPath = path.join(context.globalStoragePath, 'ai-usage-data.json');
        fs.writeFileSync(dataPath, JSON.stringify(state.aiUsageEntries, null, 2), 'utf8');
        logInfo('AI usage data saved', 'data');
    }
    catch (error) {
        logError(`Failed to save data: ${error}`, 'data');
    }
}
function syncWithTeamSheet() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('productivityTracker');
        const teamSheetPath = config.get('csvExport.teamSheetPath');
        if (!teamSheetPath || !fs.existsSync(teamSheetPath)) {
            vscode.window.showWarningMessage('Team CSV file path not configured or file not found');
            return;
        }
        try {
            // Read existing team data
            const existingData = fs.readFileSync(teamSheetPath, 'utf8');
            const lines = existingData.split('\n');
            const header = lines[0];
            // Generate new rows from our data
            const newRows = state.aiUsageEntries
                .filter(entry => entry.sessionEndTime) // Only completed sessions
                .map(entry => {
                return [
                    entry.individual,
                    entry.team,
                    entry.date,
                    entry.jiraTicket,
                    `"${entry.experimentSummary.replace(/"/g, '""')}"`,
                    entry.toolsUsed,
                    `"${entry.notableOutcomes.replace(/"/g, '""')}"`,
                    entry.estimatedTimeWithoutAI,
                    entry.estimatedTimeWithAI,
                    entry.percentTimeWithAI + '%',
                    entry.percentTimeSaved + '%'
                ].join(',');
            });
            // Append new data
            const updatedContent = existingData + '\n' + newRows.join('\n');
            fs.writeFileSync(teamSheetPath, updatedContent, 'utf8');
            vscode.window.showInformationMessage(`Synced ${newRows.length} entries to team sheet`);
            logInfo(`Synced ${newRows.length} entries to team sheet: ${teamSheetPath}`, 'sync');
            // Clear synced entries
            state.aiUsageEntries = state.aiUsageEntries.filter(entry => !entry.sessionEndTime);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to sync with team sheet: ${error}`);
            logError(`Failed to sync with team sheet: ${error}`, 'sync');
        }
    });
}
// Quick setup command for team configuration
function quickSetup() {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('productivityTracker');
        const individual = yield vscode.window.showInputBox({
            prompt: 'Enter your name (this will be saved as default)',
            value: config.get('aiTracking.defaultIndividual', '')
        });
        if (!individual)
            return;
        const team = yield vscode.window.showInputBox({
            prompt: 'Enter your team (this will be saved as default)',
            value: config.get('aiTracking.defaultTeam', '')
        });
        if (!team)
            return;
        const useTeamSheet = yield vscode.window.showQuickPick([
            { label: 'Yes', detail: 'I want to sync with a shared team CSV file' },
            { label: 'No', detail: 'I\'ll export manually' }
        ], { placeHolder: 'Do you want to sync with a shared team CSV file?' });
        if ((useTeamSheet === null || useTeamSheet === void 0 ? void 0 : useTeamSheet.label) === 'Yes') {
            const teamSheetUri = yield vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: { 'CSV Files': ['csv'] },
                title: 'Select your team\'s CSV file'
            });
            if (teamSheetUri && teamSheetUri[0]) {
                yield config.update('csvExport.teamSheetPath', teamSheetUri[0].fsPath, vscode.ConfigurationTarget.Global);
                yield config.update('csvExport.autoSync', true, vscode.ConfigurationTarget.Global);
            }
        }
        // Save defaults
        yield config.update('aiTracking.defaultIndividual', individual, vscode.ConfigurationTarget.Global);
        yield config.update('aiTracking.defaultTeam', team, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('AI Usage Tracker configured successfully! Use "Start AI Session" to begin tracking.');
    });
}
//# sourceMappingURL=extension.js.map