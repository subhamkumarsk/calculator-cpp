"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRequestHandler = void 0;
const vscode = __importStar(require("vscode"));
const MODEL_SELECTOR = { vendor: 'copilot', family: 'gpt-4o' };
async function chatRequestHandler(request, context, stream, token) {
    if (request.command === 'run') {
        vscode.commands.executeCommand('code-runner.run');
        stream.markdown('Calling "Code Runner" extension to run code...');
    }
    else {
        const messages = [
            vscode.LanguageModelChatMessage.User(`You are a VS Code expert to use "Code Runner" extension to run code in VS Code.  
                Your job is to explain how to use "Code Runner" extension to run code.

                Below are reference to help you explain:
                https://github.com/formulahendry/vscode-code-runner/blob/master/README.md
                https://github.com/formulahendry/vscode-code-runner/issues?q=is%3Aissue+label%3Afyi+is%3Aclosed
                https://stackoverflow.com/questions/tagged/vscode-code-runner

                Only answer questions that related to how to use "Code Runner" extension to run code in VS Code.`),
            vscode.LanguageModelChatMessage.User(request.prompt)
        ];
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        const chatResponse = await model.sendRequest(messages, {}, token);
        for await (const fragment of chatResponse.text) {
            stream.markdown(fragment);
        }
    }
}
exports.chatRequestHandler = chatRequestHandler;
//# sourceMappingURL=chatRequestHandler.js.map