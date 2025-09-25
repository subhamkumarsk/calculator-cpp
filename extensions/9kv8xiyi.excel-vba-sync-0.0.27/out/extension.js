"use strict";
/*
    File: extension.ts
    Description: VBAモジュールをVSCodeと同期させる拡張機能
    Author: Eitaro SETA
    License: MIT License
    Copyright (c) 2025 Eitaro Seta

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.activate = activate;
exports.deactivate = deactivate;
// extension.ts
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const iconv = __importStar(require("iconv-lite"));
const promises_1 = require("fs/promises");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
let messages = {};
const outputChannel = vscode.window.createOutputChannel("Excel VBA Sync Messages");
let extCtx;
// MCP server settings
let mcpProc = null;
let channel;
let reqId = 0;
const pending = new Map();
// Load localized messages
function loadMessages(context) {
    const locale = vscode.env.language || 'en';
    const filePath = path.join(context.extensionPath, 'locales', `${locale}.json`);
    try {
        messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    catch (_a) {
        messages = JSON.parse(fs.readFileSync(path.join(context.extensionPath, 'locales', 'en.json'), 'utf-8'));
    }
}
// Simple i18n function
function t(key, values) {
    let msg = messages[key] || key;
    if (values) {
        for (const [k, v] of Object.entries(values)) {
            msg = msg.replace(`{${k}}`, v);
        }
    }
    return msg;
}
// Get current timestamp
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Watch a folder for changes
function watchFolder(folderPath, treeProvider) {
    fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
        const timestamp = getTimestamp();
        if (filename) {
            //outputChannel.appendLine(`[${timestamp}] Change detected: ${eventType} - ${filename}`);
            //outputChannel.show();
            treeProvider.refresh(); // Tree view refresh
        }
        else {
            //outputChannel.appendLine(`[${timestamp}] Change detected, but filename is undefined.`);
            //outputChannel.show();
        }
    });
}
// module field to string
function toModuleName(m) {
    if (typeof m === "string") {
        return m;
    }
    if (m && typeof m === "object" && typeof m.name === "string") {
        return m.name;
    }
    return String(m !== null && m !== void 0 ? m : "");
}
// extension from compType or exportExt
function inferExt(hit) {
    if (hit.exportExt) {
        return String(hit.exportExt);
    }
    switch (hit.compType) {
        case 1: return "bas";
        case 3: return "frm";
        default: return "cls";
    }
}
// sanitize for directory name
function safeName(s) {
    return s.replace(/[\\/:*?"<>|]/g, "_").trim();
}
// generate candidate directory names for a workbook
// ex: "Book1.xlsm" -> ["Book1.xlsm", "Book1"]
function workbookDirCandidates(workbook) {
    const withExt = safeName(workbook);
    const noExt = safeName(path.basename(workbook, path.extname(workbook)));
    // 重複除去
    return [...new Set([withExt, noExt])];
}
// infer export root folder
function resolveExportRoot() {
    var _a, _b, _c, _d, _e;
    // 1) globalState（activateで保持した extCtx を使う）
    const globalVal = extCtx === null || extCtx === void 0 ? void 0 : extCtx.globalState.get("vbaExportFolder");
    let base = globalVal && globalVal.trim().length ? globalVal : "";
    console.log(`resolveExportRoot: from globalState: ${base}`);
    // 2) 設定
    if (!base) {
        const cfg = vscode.workspace.getConfiguration("excelVbaSync");
        base = (_a = cfg.get("vbaExportFolder")) !== null && _a !== void 0 ? _a : "";
    }
    // 3) デフォルト
    if (!base) {
        const ws = (_c = (_b = vscode.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.uri.fsPath;
        base = ws ? path.join(ws, "vbaExport") : path.join(os.homedir(), "Excel-VBA-Sync", "vba");
    }
    // ~ と ${workspaceFolder} 展開
    if (base.startsWith("~")) {
        base = path.join(os.homedir(), base.slice(1));
    }
    const ws = (_e = (_d = vscode.workspace.workspaceFolders) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.uri.fsPath;
    if (ws) {
        base = base.replace(/\$\{workspaceFolder\}/g, ws);
    }
    return base;
}
// exported file search
/// 既存ファイルの探索：<root>/<Workbook候補>/<Module>.<ext> を優先
function findExportedFile(root, workbook, moduleName, ext) {
    const wbDirs = workbookDirCandidates(workbook);
    const candidates = [];
    for (const dir of wbDirs) {
        candidates.push(path.join(root, dir, `${moduleName}.${ext}`), // vba/Book1/Module1.bas  または vba/Book1.xlsm/Module1.bas
        path.join(root, dir, ext, `${moduleName}.${ext}`), // vba/Book1/bas/Module1.bas など（サブフォルダ運用している場合）
        path.join(root, dir, moduleName, `${moduleName}.${ext}`) // vba/Book1/Module1/Module1.bas（保険）
        );
    }
    // 平置きフォールバック
    candidates.push(path.join(root, `${moduleName}.${ext}`));
    for (const p of candidates) {
        try {
            if (fs.existsSync(p)) {
                return p;
            }
        }
        catch (_a) { }
    }
    return null;
}
// calculate header offset for exported files
function calcExportHeaderOffset(text, ext) {
    const lines = text.split(/\r\n|\n|\r/);
    let i = 0;
    // 1) 先頭の VERSION 行
    while (i < lines.length && /^\s*VERSION\b/i.test(lines[i])) {
        i++;
    }
    // 2) .frm のデザイナ領域: Begin ... End ブロックを丸ごと飛ばす（複数あり得る）
    if (ext.toLowerCase() === "frm") {
        let idx = i;
        while (idx < lines.length) {
            if (/^\s*Begin\b/i.test(lines[idx])) {
                // 対応する End までスキップ
                idx++;
                let depth = 1;
                while (idx < lines.length && depth > 0) {
                    if (/^\s*Begin\b/i.test(lines[idx])) {
                        depth++;
                    }
                    else if (/^\s*End\b/i.test(lines[idx])) {
                        depth--;
                    }
                    idx++;
                }
                i = idx; // 最後の End の次の行
            }
            else {
                break;
            }
        }
    }
    // 3) Attribute VB_* 行（連続していることが多い）
    while (i < lines.length && /^\s*Attribute\b/i.test(lines[i])) {
        i++;
    }
    // 4) ここまでが“非表示ヘッダ”。この直後からが CodeModule の先頭とみなす
    return i;
}
// get code from Excel and open in editor, then jump to line 
function openFromExcelAndJump(hit, moduleName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const res2 = yield callTool("excel_get_module_code", {
            workbook: (_a = hit.workbook) !== null && _a !== void 0 ? _a : "",
            module: moduleName,
        });
        const txt = ((_d = (_c = (_b = res2 === null || res2 === void 0 ? void 0 : res2.content) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : "").toString().trim();
        // JSONだけを安全に抽出
        const start = Math.min(...['{', '['].map(ch => {
            const i = txt.indexOf(ch);
            return i === -1 ? Number.POSITIVE_INFINITY : i;
        }));
        if (!Number.isFinite(start)) {
            //vscode.window.showWarningMessage(`コード取得に失敗（レスポンス不正）`);
            vscode.window.showWarningMessage(t('extension.error.invalidResponse'));
            return;
        }
        const payload = JSON.parse(txt.slice(start));
        if (!(payload === null || payload === void 0 ? void 0 : payload.ok) || typeof (payload === null || payload === void 0 ? void 0 : payload.code) !== "string") {
            //vscode.window.showWarningMessage(`コード取得に失敗: ${payload?.error ?? "unknown"}`);
            vscode.window.showWarningMessage(t('extension.error.codeRetrievalFailed', { error: (_e = payload === null || payload === void 0 ? void 0 : payload.error) !== null && _e !== void 0 ? _e : "unknown" }));
            return;
        }
        const doc = yield vscode.workspace.openTextDocument({ language: "vb", content: payload.code });
        const ed = yield vscode.window.showTextDocument(doc, { preview: false });
        const lineNum = ((_h = (_g = (_f = hit.matchLine) !== null && _f !== void 0 ? _f : hit.startLine) !== null && _g !== void 0 ? _g : hit.line) !== null && _h !== void 0 ? _h : 1);
        const pos = new vscode.Position(Math.max(0, lineNum - 1), 0);
        ed.selection = new vscode.Selection(pos, pos);
        ed.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        //vscode.window.setStatusBarMessage(`テンポラリ表示（保存するにはエクスポート先に保存してください）`, 5000);
        vscode.window.setStatusBarMessage(t('extension.statusBarMessage.temporaryDisplay'), 5000);
    });
}
// jump to existing exported file
function openHit(hit) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const moduleName = toModuleName(hit.module);
        const ext = inferExt(hit);
        const root = resolveExportRoot(); // ← context を渡す
        //console.log(`openHit: root=${root}, workbook=${hit.workbook}, module=${moduleName}, ext=${ext}`);
        const existing = (hit.workbook)
            ? findExportedFile(root, hit.workbook, moduleName, ext)
            : null;
        if (existing) {
            const doc = yield vscode.workspace.openTextDocument(existing);
            const ed = yield vscode.window.showTextDocument(doc, { preview: false });
            // calculate header offset
            const offset = calcExportHeaderOffset(doc.getText(), ext);
            const vbeLine = ((_c = (_b = (_a = hit.matchLine) !== null && _a !== void 0 ? _a : hit.startLine) !== null && _b !== void 0 ? _b : hit.line) !== null && _c !== void 0 ? _c : 1); // ← VBE基準（1始まり）
            const fileLine = Math.max(1, vbeLine + offset); // ← ファイル基準に補正
            const pos = new vscode.Position(fileLine - 1, 0);
            ed.selection = new vscode.Selection(pos, pos);
            ed.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
            return;
        }
        // If not found, show warning
        //vscode.window.showWarningMessage(`未エクスポートのモジュールです。`);
        vscode.window.showWarningMessage(t('extension.warning.unexportedModule'));
        // If not found, get code from Excel and open in editor
        //await openFromExcelAndJump(hit, moduleName);
    });
}
// ensure MCP server is running
function ensureServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mcpProc) {
            yield startServer(context);
        }
    });
}
// start MCP server
function startServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if (mcpProc) {
            vscode.window.showInformationMessage("VBA Tools server already running.");
            return;
        }
        if (os.platform() !== "win32") {
            vscode.window.showWarningMessage("VBA Tools features require Windows (Excel + PowerShell).");
            return;
        }
        const cfg = vscode.workspace.getConfiguration("vbaMcp");
        const serverJs = path.join(context.extensionPath, "dist-server", "server.js");
        const exists = yield vscode.workspace.fs.stat(vscode.Uri.file(serverJs)).then(() => true, () => false);
        if (!exists) {
            //vscode.window.showErrorMessage(`server.js が見つかりません: ${serverJs}`);
            vscode.window.showErrorMessage(t('extension.error.serverJsNotFound', { path: serverJs }));
            channel.appendLine(`[VBA Tools] NOT FOUND: ${serverJs}`);
            return;
        }
        channel.show(true); // 起動時に Output を前面に
        channel.appendLine(`[VBA Tools] launching: ${serverJs}`);
        const scriptsDir = path.join(context.extensionPath, "scripts");
        const listPs = path.join(scriptsDir, "FindAndRun-ExcelMacroByModule.ps1");
        const runPs = path.join(scriptsDir, "FindAndRun-ExcelMacroByModule.ps1");
        // ここで存在確認（OutputChannel に出力＆早期 return）
        const okList = yield vscode.workspace.fs.stat(vscode.Uri.file(listPs)).then(() => true, () => false);
        if (!okList) {
            channel.show(true);
            channel.appendLine(`[VBA Tools] NOT FOUND: ${listPs}`);
            //vscode.window.showErrorMessage(`.ps1 が見つかりません: ${listPs}（.vscodeignoreで除外していないか確認）`);
            vscode.window.showErrorMessage(t('extension.error.ps1NotFound', { path: listPs }));
            return;
        }
        const env = Object.assign(Object.assign({}, process.env), { 
            //MCP_VBA_ROOT: cfg.get<string>("vbaRoot") || (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd()),
            //MCP_PS_LIST: cfg.get<string>("psListPath") || path.join(scriptsDir, "FindAndRun-ExcelMacroByModule.ps1"),
            //MCP_PS_RUN:  cfg.get<string>("psRunPath")  || path.join(scriptsDir, "FindAndRun-ExcelMacroByModule.ps1")
            MCP_PS_LIST: listPs, MCP_PS_RUN: runPs, MCP_VBA_ROOT: (_c = (_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath) !== null && _c !== void 0 ? _c : process.cwd() });
        channel.appendLine(`[MCP] starting: ${serverJs}`);
        mcpProc = (0, child_process_1.spawn)(process.execPath, [serverJs], { env });
        mcpProc.stdout.on("data", (d) => {
            const text = d.toString();
            channel.append(text);
            // JSON-RPC のレスポンス取り出し
            for (const line of text.split(/\r?\n/)) {
                try {
                    const msg = JSON.parse(line);
                    if (msg.id && (msg.result || msg.error)) {
                        const h = pending.get(msg.id);
                        if (h) {
                            pending.delete(msg.id);
                            msg.error ? h.reject(msg.error) : h.resolve(msg.result);
                        }
                    }
                }
                catch ( /* ログ行などは無視 */_a) { /* ログ行などは無視 */ }
            }
        });
        mcpProc.stderr.on("data", (d) => channel.append(`[MCP:ERR] ${d}`));
        mcpProc.on("exit", (code) => {
            channel.appendLine(`[MCP] exited: ${code}`);
            mcpProc = null;
        });
        // JSON-RPC handshake（initialize）
        yield rpcSend("initialize", {
            protocolVersion: "2024-11-05", //  SDK version your SDK README.md refers to
            capabilities: {
                // クライアントが使える機能。最小なら空オブジェクトでOK
                tools: {}, // tools/call を使う
                resources: {} // 使わないなら空でも可
                // （notificationsなど他機能を使う場合はここに宣言を足す）
            },
            clientInfo: {
                name: "vscode-ext",
                version: "0.1.0"
            }
        });
        yield rpcSend("tools/list", {}); // ツール一覧取得（存在確認）
        vscode.window.showInformationMessage("MCP server started.");
    });
}
// stop MCP server
function stopServer() {
    if (mcpProc) {
        mcpProc.kill();
        mcpProc = null;
        vscode.window.showInformationMessage("MCP server stopped.");
    }
}
// Lightweight JSON-RPC client (line-delimited)
function rpcSend(method, params) {
    return new Promise((resolve, reject) => {
        if (!mcpProc) {
            return reject(new Error("MCP server not running"));
        }
        const id = ++reqId;
        pending.set(id, { resolve, reject });
        const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
        mcpProc.stdin.write(msg, "utf8");
    });
}
// Model Context Protocol tools/call
function callTool(name, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield rpcSend("tools/call", { name, arguments: args });
        // SDK標準のレスポンスは { content: [{type:"text", text:"..."}] } 等
        return res;
    });
}
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Command: Search and jump to line ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function cmdSearchAndJump() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const query = yield vscode.window.showInputBox({
            prompt: t('extension.prompt.searchQuery'),
            placeHolder: t('extension.placeholder.searchQuery')
        });
        if (!query) {
            return;
        }
        const isRegex = /^\/.*\/$/.test(query);
        const searchQuery = isRegex ? query.slice(1, -1) : query;
        // parameters are useRegex
        const res = yield callTool("vba_search_code", {
            query: searchQuery,
            useRegex: isRegex,
            // moduleFilter: "...", workbookFilter: "..." // 必要に応じて
        });
        // ---- Only JSON safe parse ----
        const raw = ((_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : "").toString().trim();
        const start = Math.min(...['{', '['].map(ch => {
            const i = raw.indexOf(ch);
            return i === -1 ? Number.POSITIVE_INFINITY : i;
        }));
        if (!Number.isFinite(start)) {
            vscode.window.showErrorMessage("検索結果の解析に失敗しました。");
            channel.appendLine("[ParseError] " + raw);
            return;
        }
        let payload;
        try {
            payload = JSON.parse(raw.slice(start));
        }
        catch (e) {
            vscode.window.showErrorMessage("検索結果の解析に失敗しました。");
            channel.appendLine("[ParseError] " + raw);
            return;
        }
        const hits = Array.isArray(payload.hits) ? payload.hits : [];
        const count = Number.isFinite(payload.count) ? payload.count : hits.length;
        if (!hits.length) {
            vscode.window.showInformationMessage("ヒットなし");
            return;
        }
        const items = hits.map((h) => {
            var _a, _b, _c, _d, _e;
            const wb = (_a = h.workbook) !== null && _a !== void 0 ? _a : "(unknown)";
            const mod = (_b = h.module) !== null && _b !== void 0 ? _b : "(unknown)";
            const pr = (_c = h.proc) !== null && _c !== void 0 ? _c : "";
            const line = (_d = h.line) !== null && _d !== void 0 ? _d : "?";
            const desc = pr ? `${mod}.${pr}` : `${mod}（実行不可）`;
            const qualified = h.qualified
                ? String(h.qualified).replace(/\\u0027/gi, "'")
                : (h.workbook && h.module && h.proc ? `'${h.workbook}'!${h.module}.${h.proc}` : null);
            return {
                label: `${wb}:${line}`,
                description: desc,
                detail: (_e = h.snippet) !== null && _e !== void 0 ? _e : "",
                hit: h, // ★ ここで保持
                qualified,
                runnable: !!(qualified && qualified.includes("!") && qualified.includes(".")),
            };
        });
        const picked = yield vscode.window.showQuickPick(items, { /* ... */});
        if (!picked) {
            return;
        }
        yield openHit(picked.hit);
    });
}
// ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Command: List and run macros ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
function cmdListAndRunMacro() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        //const moduleName = await vscode.window.showInputBox({ prompt: "VBA モジュール名（VB_Name）", placeHolder: "Module1" });
        const moduleName = yield vscode.window.showInputBox({
            prompt: t('extension.prompt.moduleName'),
            placeHolder: t('extension.placeholder.moduleName')
        });
        if (!moduleName) {
            return;
        }
        const active = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
        const basPath = active && active.fileName.toLowerCase().endsWith(".bas") ? active.fileName : undefined;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('extension.progress.fetchingMacroList'),
            cancellable: false
        }, (progress) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const listRes = yield callTool("excel_list_macros", { moduleName, basPath });
            const listText = ((_c = (_b = (_a = listRes === null || listRes === void 0 ? void 0 : listRes.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : "").toString();
            let ary = [];
            try {
                ary = JSON.parse(listText);
            }
            catch (_j) {
                //vscode.window.showErrorMessage("マクロ一覧の解析に失敗しました。Output: VBA Tools を確認してください。");
                vscode.window.showErrorMessage(t('extension.error.macroListParsingFailed'));
                return;
            }
            if (!ary.length) {
                //vscode.window.showWarningMessage("Public Sub が見つかりませんでした。");
                vscode.window.showWarningMessage(t('extension.warning.publicSubNotFound'));
                return;
            }
            const items = ary.map((x) => ({
                label: x.Proc,
                description: `${x.WorkbookName} / ${x.Module}`,
                detail: x.Qualified,
                macro: x, // ← 元データを保持
            }));
            const picked = yield vscode.window.showQuickPick(items, {
                //placeHolder: "実行するマクロを選択",
                placeHolder: t('extension.placeholder.selectMacroToRun'),
                matchOnDetail: true,
                ignoreFocusOut: true,
            });
            if (!picked) {
                return;
            }
            const m = picked.macro;
            // ★ Qualified を優先して渡す（完全修飾で一意）
            const runArgs = {
                qualified: m.Qualified, // 例：'Book1.xlsm'!Module1.aaa
                // 後方互換のために補助情報も添える（サーバ側で fallback に使える）
                moduleName: m.Module,
                procName: m.Proc,
                workbookName: m.WorkbookName,
                basPath,
                ActivateExcel: true, // 実行時は前面化
                ShowStatus: true // 実行時はステータスをON
            };
            const runRes = yield callTool("excel_run_macro", runArgs);
            progress.report({ message: `実行中: ${picked.detail}` });
            const runText = ((_f = (_e = (_d = runRes === null || runRes === void 0 ? void 0 : runRes.content) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) !== null && _f !== void 0 ? _f : "").toString();
            try {
                const payload = JSON.parse(runText);
                if (payload.ok) {
                    vscode.window.showInformationMessage(`実行完了: ${payload.ran}`);
                }
                else {
                    vscode.window.showErrorMessage(`実行失敗: ${payload.ran} (${(_h = (_g = payload.lastError) === null || _g === void 0 ? void 0 : _g.error) !== null && _h !== void 0 ? _h : "unknown"})`);
                }
            }
            catch (_k) {
                // JSONでなければ生文字列を通知
                vscode.window.showInformationMessage(runText || `Executed: ${picked.detail}`);
            }
        }));
    });
}
/** Tree Item */
class FileTreeItem extends vscode.TreeItem {
    constructor(uri, collapsibleState) {
        super(uri, collapsibleState);
        this.uri = uri;
        this.collapsibleState = collapsibleState;
        const isFile = collapsibleState === vscode.TreeItemCollapsibleState.None;
        const ext = path.extname(uri.fsPath).toLowerCase();
        this.label = path.basename(uri.fsPath);
        this.tooltip = this.label;
        this.resourceUri = uri;
        // アイコン：フォルダ / 通常ファイル / FRX(バイナリ)
        if (!isFile) {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
        else if (ext === '.frx') {
            this.iconPath = new vscode.ThemeIcon('file-binary'); // or 'lock'
        }
        else if (ext === '.bas') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        }
        else if (ext === '.cls') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        }
        else if (ext === '.frm') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        }
        else {
            this.iconPath = new vscode.ThemeIcon('file');
        }
        // クリック動作：.frx は開かないようにする
        this.command = (isFile && ext !== '.frx')
            ? {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [this.resourceUri, { preview: false, preserveFocus: false }]
            }
            : undefined;
        // 右クリック用の判定
        if (ext === '.frx') {
            this.contextValue = 'binaryFrx';
        }
        else if (['.bas', '.cls', '.frm'].includes(ext)) {
            this.contextValue = 'importableFile'; // インポート可能なファイル
        }
        else {
            this.contextValue = 'unknownFile'; // その他のファイル
        }
    }
}
/** Tree Provider */
class SimpleTreeProvider {
    constructor(folderPath) {
        this.folderPath = folderPath;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirPath = element ? element.uri.fsPath : this.folderPath;
            const timestamp = getTimestamp();
            if (!dirPath) {
                return [];
            }
            try {
                const entries = yield (0, promises_1.readdir)(dirPath, { withFileTypes: true });
                return entries.map(entry => {
                    const fullPath = path.join(dirPath, entry.name);
                    const uri = vscode.Uri.file(fullPath);
                    const collapsibleState = entry.isDirectory()
                        ? vscode.TreeItemCollapsibleState.Collapsed
                        : vscode.TreeItemCollapsibleState.None;
                    return new FileTreeItem(uri, collapsibleState);
                });
            }
            catch (err) {
                //vscode.window.showErrorMessage(t('extension.error.loadFolderFailed', { 0: `${dirPath}` }));
                outputChannel.appendLine(`[${timestamp}] ${t('extension.error.loadFolderFailed', { 0: `${dirPath}` })}`);
                outputChannel.show();
                console.error(err);
                return [];
            }
        });
    }
}
/** Webview Provider */
class VbaSyncViewProvider {
    resolveWebviewView(webviewView, _context, _token) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head><meta charset="UTF-8"><style>
        body { font-family: sans-serif; padding: 10px; }
        button { width: 100%; margin: 5px 0; font-size: 14px; }
      </style></head>
      <body>
        <button onclick="vscode.postMessage({ command: 'export' })"> Export VBA Modules</button>
        <button onclick="vscode.postMessage({ command: 'import' })"> Import VBA Modules</button>
        <script>const vscode = acquireVsCodeApi();</script>
      </body>
      </html>
    `;
        webviewView.webview.onDidReceiveMessage(msg => {
            if (msg.command === 'export') {
                vscode.commands.executeCommand('excel-vba-sync.exportVBA');
            }
            else if (msg.command === 'import') {
                vscode.commands.executeCommand('excel-vba-sync.importVBA');
            }
        });
    }
}
/** activate */
function activate(context) {
    loadMessages(context);
    const folderPath = context.globalState.get('vbaExportFolder');
    const treeProvider = new SimpleTreeProvider(folderPath);
    const treeView = vscode.window.createTreeView('exportPanel', { treeDataProvider: treeProvider });
    //for MCP
    channel = vscode.window.createOutputChannel("VBA Tools");
    context.subscriptions.push(channel);
    context.subscriptions.push(vscode.commands.registerCommand("excelVbaSync.searchAndJump", () => __awaiter(this, void 0, void 0, function* () {
        yield cmdSearchAndJump(); // ← 引数で渡さない
    })));
    extCtx = context;
    // Watch the folder for changes
    if (folderPath) {
        watchFolder(folderPath, treeProvider);
    }
    const timestamp = getTimestamp();
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Export VBA ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    context.subscriptions.push(vscode.commands.registerCommand('excel-vba-sync.exportVBA', (fp) => __awaiter(this, void 0, void 0, function* () {
        // Confirm export folder
        const folder = (typeof fp === 'string' ? fp : context.globalState.get('vbaExportFolder'));
        if (!folder || typeof folder !== 'string') {
            //vscode.window.showErrorMessage(t('extension.error.exportFolderNotConfigured'));
            outputChannel.appendLine(`[${timestamp}] ${t('extension.error.exportFolderNotConfigured')}`);
            outputChannel.show();
            return;
        }
        /*if (!folder) {
          return vscode.window.showErrorMessage(t('extension.error.exportFolderNotConfigured'));
        }*/
        // Get script path
        const script = path.join(context.extensionPath, 'scripts', 'export_opened_vba.ps1');
        //const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${script}" "${folder}"`;
        const cmd = `powershell -NoLogo -NoProfile -ExecutionPolicy Bypass `
            + `-Command "& { `
            + `$OutputEncoding=[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); `
            + `& '${script}' '${folder}' ;exit $LASTEXITCODE; `
            + `}"`;
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('extension.info.exporting'), cancellable: false
        }, () => new Promise(resolve => {
            outputChannel.appendLine(" > > > > > > > > > > > > > > > > > > > >");
            outputChannel.appendLine(`[${timestamp}] ${t('extension.info.exporting')}`);
            outputChannel.show();
            cp.exec(cmd, { encoding: 'buffer' }, (err, stdout, stderr) => {
                const out = iconv.decode(stdout, 'utf-8').trim();
                const errStr = iconv.decode(stderr, 'utf-8').trim();
                //vscode.window.createOutputChannel("Excel VBA Sync Messages").appendLine(out);
                outputChannel.append(out.endsWith('\n') ? out : out + '\n');
                // stderr も表示
                if (errStr && errStr.trim().length > 0) {
                    outputChannel.appendLine(`[${getTimestamp()}] STDERR: ${errStr.trim()}`);
                }
                const exitCode = err === null || err === void 0 ? void 0 : err.code;
                //console.log(exitCode);
                const timestamp = getTimestamp();
                // Powershell exit code handling
                switch (exitCode) {
                    case 1:
                        //vscode.window.showErrorMessage(t('common.error.noPath'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noPath')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 2:
                        //vscode.window.showErrorMessage(t('common.error.oneDriveFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.oneDriveFolder')}`);
                        outputChannel.show();
                        break;
                    case 3:
                        //vscode.window.showErrorMessage(t('common.error.noExcel'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noExcel')}`);
                        outputChannel.show();
                        break;
                    case 4:
                        //vscode.window.showErrorMessage(t('common.error.noSavedWorkbook'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noSavedWorkbook')}`);
                        outputChannel.show();
                        break;
                    case 5:
                        //vscode.window.showErrorMessage(t('common.error.invalidFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.invalidFolder')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 6:
                        //vscode.window.showErrorMessage(t('common.error.invalidFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.exportFailedFinal')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 0:
                        //vscode.window.showInformationMessage(t('common.info.exportCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.exportCompleted')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case undefined:
                        //vscode.window.showInformationMessage(t('common.info.exportCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.exportCompleted')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    default:
                        //vscode.window.showErrorMessage(t('common.error.exportFailed', { 0: exitCode.toString(), 1: errStr }));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.exportFailed', { 0: exitCode.toString(), 1: errStr })}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                }
                resolve();
            });
        }));
    })));
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Import VBA ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    context.subscriptions.push(vscode.commands.registerCommand('excel-vba-sync.importVBA', (item) => __awaiter(this, void 0, void 0, function* () {
        let filePath;
        const timestamp = getTimestamp();
        //if (!item || !(item.uri instanceof vscode.Uri)) {
        //  outputChannel.appendLine(`[${timestamp}] ${t('extension.error.noFileSelected')}`);
        //  outputChannel.show();
        //  return;
        //}
        //filePath = item.uri.fsPath;
        if (!item) {
            const result = yield vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Select Folder'
            });
            if (!result || result.length === 0) {
                outputChannel.appendLine(`[${timestamp}] ${t('extension.error.noFileSelected')}`);
                outputChannel.show();
                return;
            }
            filePath = result[0].fsPath;
        }
        else {
            filePath = item.uri.fsPath;
        }
        if (!filePath || filePath.length === 0) {
            //vscode.window.showWarningMessage(t('extension.error.noFileSelected'));
            outputChannel.appendLine(`[${timestamp}] ${t('extension.error.noFileSelected')}`);
            outputChannel.show();
            return;
        }
        //const folder = context.globalState.get<string>('vbaExportFolder');
        //if (!folder) {
        //if (!folder) {
        //vscode.window.showErrorMessage(t('extension.error.importFolderNotConfigured'));
        //  outputChannel.appendLine(`[${timestamp}] ${t('extension.error.importFolderNotConfigured')}`);
        //  outputChannel.show();
        //  return;
        //}
        // directory check and file type check
        const isDirectory = fs.statSync(filePath).isDirectory();
        const ext = path.extname(filePath).toLowerCase();
        if (!isDirectory && !['.bas', '.cls', '.frm'].includes(ext)) {
            outputChannel.appendLine(`[${timestamp}] ${t('extension.error.invalidFileType', { 0: ext })}`);
            outputChannel.show();
            return;
        }
        const script = path.join(context.extensionPath, 'scripts', 'import_opened_vba.ps1');
        //const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${script}" "${filePath}"`;
        const cmd = `powershell -NoLogo -NoProfile -ExecutionPolicy Bypass `
            + `-Command "& { `
            + `$OutputEncoding=[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); `
            + `& '${script}' '${filePath}' ;exit $LASTEXITCODE;`
            + `}"`;
        //vscode.window.showInformationMessage(t('extension.info.targetFolderFiles', { 0: filePath }));
        outputChannel.appendLine(" > > > > > > > > > > > > > > > > > > > >");
        outputChannel.appendLine(`[${timestamp}] ${t('extension.info.targetFolderFiles', { 0: filePath })}`);
        outputChannel.show();
        //vscode.window.showInformationMessage(t('extension.info.scriptFile', { 0: script }));
        outputChannel.appendLine(`[${timestamp}] ${t('extension.info.scriptFile', { 0: script })}`);
        outputChannel.show();
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('extension.info.importing'),
            cancellable: false
        }, () => new Promise((resolve) => {
            outputChannel.appendLine(`[${timestamp}] ${t('extension.info.importing')}`);
            outputChannel.show();
            cp.exec(cmd, { encoding: 'buffer' }, (err, stdout, stderr) => {
                const out = iconv.decode(stdout, 'utf-8').trim();
                const errStr = iconv.decode(stderr, 'utf-8').trim();
                //vscode.window.createOutputChannel("PS Msg(VBA Import)").appendLine(out);
                outputChannel.append(out.endsWith('\n') ? out : out + '\n');
                // stderr も表示
                if (errStr && errStr.trim().length > 0) {
                    outputChannel.appendLine(`[${getTimestamp()}] STDERR: ${errStr.trim()}`);
                }
                const exitCode = err === null || err === void 0 ? void 0 : err.code;
                //console.log(exitCode);
                const timestamp = getTimestamp();
                // PowerShellからのexit codeに応じてエラー処理
                switch (exitCode) {
                    case 1:
                        //vscode.window.showErrorMessage(t('common.error.noPath'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noPath')}`);
                        outputChannel.show();
                        break;
                    case 2:
                        //vscode.window.showErrorMessage(t('common.error.invalidImportFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.invalidImportFolder')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 3:
                        //vscode.window.showErrorMessage(t('common.error.noExcel'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noExcel')}`);
                        outputChannel.show();
                        break;
                    case 4:
                        //vscode.window.showErrorMessage(t('common.error.noSavedWorkbook'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noSavedWorkbook')}`);
                        outputChannel.show();
                        break;
                    case 5:
                        //vscode.window.showErrorMessage(t('common.error.importFailed', { 0: exitCode.toString(), 1: errStr }));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.importFailed')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 0:
                        //vscode.window.showInformationMessage(t('common.info.importCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.importCompleted')}`);
                        outputChannel.show();
                        break;
                    case undefined:
                        //vscode.window.showInformationMessage(t('common.info.importCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.importCompleted')}`);
                        outputChannel.show();
                        break;
                    default:
                        //vscode.window.showErrorMessage(t('common.error.importFailed', { 0: exitCode.toString(), 1: errStr }));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.importFailed', { 0: exitCode.toString(), 1: errStr })}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                }
                resolve();
            });
        }));
    })));
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Set Export Folder ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    context.subscriptions.push(outputChannel); // 拡張機能終了時にチャネルを破棄
    context.subscriptions.push(vscode.commands.registerCommand('excel-vba-sync.setExportFolder', () => __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode.window.showOpenDialog({ canSelectFolders: true });
        if (!result || result.length === 0) {
            return;
        }
        const selected = result[0].fsPath;
        yield context.globalState.update('vbaExportFolder', selected);
        //vscode.window.showInformationMessage(t('extension.info.exportFolderName', { 0: selected }));
        outputChannel.appendLine(`[${timestamp}] ${t('extension.info.exportFolderName', { 0: selected })}`);
        outputChannel.show();
        treeProvider['folderPath'] = selected;
        treeProvider.refresh();
    })));
    // ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ Export Module by Name ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    context.subscriptions.push(vscode.commands.registerCommand('excel-vba-sync.exportModuleByName', (item) => __awaiter(this, void 0, void 0, function* () {
        const timestamp = getTimestamp();
        if (!item || !(item.uri instanceof vscode.Uri)) {
            outputChannel.appendLine(`[${timestamp}] ${t('extension.error.noFileSelected')}`);
            outputChannel.show();
            return;
        }
        const fileName = path.basename(item.uri.fsPath, path.extname(item.uri.fsPath)); // ファイル名（拡張子なし）
        const exportFolder = context.globalState.get('vbaExportFolder');
        if (!exportFolder) {
            outputChannel.appendLine(`[${timestamp}] ${t('extension.error.exportFolderNotConfigured')}`);
            outputChannel.show();
            return;
        }
        const bookName = path.basename(path.dirname(item.uri.fsPath)); // フォルダ名（ブック名）
        let moduleName = path.basename(item.uri.fsPath, path.extname(item.uri.fsPath)); // モジュール名（拡張子なし）
        if (!moduleName) {
            let moduleName = yield vscode.window.showInputBox({
                prompt: "VBA モジュール名（VB_Name）", placeHolder: "Module1",
                validateInput: (v) => v.trim().length === 0 ? "モジュール名を入力してください" :
                    /\s/.test(v) ? "空白は使用できません" : null
            });
        }
        if (!moduleName) {
            vscode.window.showInformationMessage("キャンセルしました。");
            return;
        }
        const script = path.join(context.extensionPath, 'scripts', 'export_opened_vba.ps1');
        const cmd = `powershell -NoLogo -NoProfile -ExecutionPolicy Bypass `
            + `-Command "& { `
            + `$OutputEncoding=[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); `
            + `& '${script}' '${exportFolder}' '${bookName}' '${moduleName}' ;exit $LASTEXITCODE; `
            + `}"`;
        outputChannel.appendLine(" > > > > > > > > > > > > > > > > > > > >");
        outputChannel.appendLine(`[${timestamp}] ${t('extension.info.exportingModule', { 0: fileName })}`);
        outputChannel.show();
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('extension.info.exporting'),
            cancellable: false
        }, () => new Promise((resolve) => {
            cp.exec(cmd, { encoding: 'buffer' }, (err, stdout, stderr) => {
                const out = iconv.decode(stdout, 'utf-8').trim();
                const errStr = iconv.decode(stderr, 'utf-8').trim();
                outputChannel.append(out.endsWith('\n') ? out : out + '\n');
                if (errStr && errStr.trim().length > 0) {
                    outputChannel.appendLine(`[${getTimestamp()}] STDERR: ${errStr.trim()}`);
                }
                const exitCode = err === null || err === void 0 ? void 0 : err.code;
                //outputChannel.appendLine(`[${getTimestamp()}] Exit Code: ${exitCode}`);
                // PowerShellからのexit codeに応じてエラー処理
                switch (exitCode) {
                    case 1:
                        //vscode.window.showErrorMessage(t('common.error.noPath'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noPath')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 2:
                        //vscode.window.showErrorMessage(t('common.error.oneDriveFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.oneDriveFolder')}`);
                        outputChannel.show();
                        break;
                    case 3:
                        //vscode.window.showErrorMessage(t('common.error.noExcel'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noExcel')}`);
                        outputChannel.show();
                        break;
                    case 4:
                        //vscode.window.showErrorMessage(t('common.error.noSavedWorkbook'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.noSavedWorkbook')}`);
                        outputChannel.show();
                        break;
                    case 5:
                        //vscode.window.showErrorMessage(t('common.error.invalidFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.invalidFolder')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 6:
                        //vscode.window.showErrorMessage(t('common.error.invalidFolder'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.exportFailedFinal')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case 0:
                        //vscode.window.showInformationMessage(t('common.info.exportCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.exportCompleted')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    case undefined:
                        //vscode.window.showInformationMessage(t('common.info.exportCompleted'));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.info.exportCompleted')}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                    default:
                        //vscode.window.showErrorMessage(t('common.error.exportFailed', { 0: exitCode.toString(), 1: errStr }));
                        outputChannel.appendLine(`[${timestamp}] ${t('common.error.exportFailed', { 0: exitCode.toString(), 1: errStr })}`);
                        outputChannel.show();
                        treeProvider.refresh();
                        break;
                }
                resolve();
            });
        }));
    })));
    context.subscriptions.push(vscode.commands.registerCommand("vbaMcp.start", () => startServer(context)), vscode.commands.registerCommand("vbaMcp.stop", () => stopServer()), vscode.commands.registerCommand("vbaMcp.searchCode", () => __awaiter(this, void 0, void 0, function* () {
        yield ensureServer(context);
        yield cmdSearchAndJump();
    })), vscode.commands.registerCommand("vbaMcp.listAndRunMacro", () => __awaiter(this, void 0, void 0, function* () {
        yield ensureServer(context);
        yield cmdListAndRunMacro();
    })), { dispose: () => stopServer() });
    // スタートアップ時に表示されるステータスバーアイコンの登録
    const statusExport = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusExport.text = '$(cloud-download) Export';
    statusExport.command = 'excel-vba-sync.exportVBA';
    statusExport.tooltip = t('extension.info.tooltip_exportVBA');
    statusExport.show();
    const statusImport = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    statusImport.text = '$(cloud-upload) Import';
    statusImport.command = 'excel-vba-sync.importVBA';
    statusImport.tooltip = t('extension.info.tooltip_importVBA');
    statusImport.show();
    context.subscriptions.push(statusExport, statusImport, treeView);
    // Webview Panel 登録
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vbaSyncPanel', new VbaSyncViewProvider()));
}
//export function deactivate() {}
function deactivate() {
    stopServer();
    extCtx = undefined;
}
