import * as vscode from 'vscode';
import * as https from 'https';

// Remove: import ollama from 'ollama';

export function activate(context: vscode.ExtensionContext) {
    console.log("CareerTeam 1.0 Devs extension activated");

    const disposable = vscode.commands.registerCommand('careerteam-1-0-devs.start', async () => {
        try {
            // Test Ollama connection first
            const isConnected = await testOllamaConnection();
            if (!isConnected) {
                vscode.window.showErrorMessage('Ollama is not running. Please start Ollama first.');
                return;
            }
            
            const panel = vscode.window.createWebviewPanel(
                'CT1-0Chat',
                'Career Team 1.0 Chat',
                vscode.ViewColumn.One, 
                { 
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getWebViewContent();

            panel.webview.onDidReceiveMessage(async (message: any) => {
                switch (message.command) {
                    case 'chat':
                        await handleChatMessage(panel, message.text);
                        break;
                    case 'testConnection':
                        await testOllamaConnection(panel);
                        break;
                }
            });

            context.subscriptions.push(panel);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start chat: ${error}`);
        }
    });

    context.subscriptions.push(disposable);

    const testDisposable = vscode.commands.registerCommand('careerteam-1-0-devs.test', async () => {
        const isConnected = await testOllamaConnection();
        if (isConnected) {
            vscode.window.showInformationMessage('✅ Ollama connection successful!');
        }
    });
    context.subscriptions.push(testDisposable);
}

async function testOllamaConnection(panel?: vscode.WebviewPanel): Promise<boolean> {
    try {
        console.log("Testing Ollama connection...");
        
        const response = await fetch('http://localhost:11434/api/tags');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Available models:", data.models?.map((m: any) => m.name) || []);
        
        if (panel) {
            panel.webview.postMessage({
                command: 'connectionStatus',
                status: 'connected',
                models: data.models?.map((m: any) => m.name) || []
            });
        }
        
        return true;
    } catch (error) {
        console.error("Ollama connection failed:", error);
        vscode.window.showErrorMessage(`Ollama connection failed: ${error}. Make sure Ollama is running.`);
        
        if (panel) {
            panel.webview.postMessage({
                command: 'connectionStatus',
                status: 'disconnected',
                error: String(error)
            });
        }
        
        return false;
    }
}

async function handleChatMessage(panel: vscode.WebviewPanel, userPrompt: string) {
    console.log("Received chat message:", userPrompt);
    
    // Add user message to chat
    panel.webview.postMessage({ 
        command: 'addUserMessage', 
        text: userPrompt 
    });

    // Show typing indicator
    panel.webview.postMessage({ command: 'showTyping' });

    try {
        console.log("Sending request to Ollama...");
        
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-r1:latest',
                messages: [{ role: 'user', content: userPrompt }],
                stream: true,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Ollama response received, starting stream...");
        
        // Hide typing indicator and start AI response
        panel.webview.postMessage({ command: 'hideTyping' });
        panel.webview.postMessage({ command: 'startAiResponse' });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let responseText = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            responseText += data.message.content;
                            panel.webview.postMessage({ 
                                command: 'updateAiResponse', 
                                text: responseText 
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e, 'Line:', line);
                    }
                }
            }
        }

        console.log("Stream completed, response length:", responseText.length);
        
        // Finalize AI response
        panel.webview.postMessage({ command: 'finalizeAiResponse' });
        
    } catch (err) {
        console.error('Ollama error:', err);
        panel.webview.postMessage({ 
            command: 'chatError', 
            text: `Error: ${String(err)}. Please check if Ollama is running and the model is available.` 
        });
        
        // Show error notification to user
        vscode.window.showErrorMessage(`Chat error: ${err}`);
    }
}

function getWebViewContent(): string {
	return '<!DOCTYPE html>' +
		'<html>' +
			'<head>' +
				'<meta charset="UTF-8" />' +
				'<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
				'<style>' +
					':root {' +
						'--bg-primary: #1e1e1e;' +
						'--bg-secondary: #252526;' +
						'--bg-tertiary: #2d2d30;' +
						'--text-primary: #cccccc;' +
						'--text-secondary: #969696;' +
						'--accent-blue: #007acc;' +
						'--accent-green: #4ec9b0;' +
						'--accent-orange: #ce9178;' +
						'--accent-purple: #c586c0;' +
						'--accent-yellow: #dcdcaa;' +
						'--border-color: #3e3e42;' +
						'--hover-bg: #2a2d2e;' +
					'}' +
					'* { margin: 0; padding: 0; box-sizing: border-box; }' +
					'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; background-color: var(--bg-primary); color: var(--text-primary); height: 100vh; display: flex; flex-direction: column; }' +
					'.header { background-color: var(--bg-secondary); padding: 1rem; border-bottom: 1px solid var(--border-color); text-align: center; }' +
					'.header h2 { color: var(--accent-blue); font-weight: 600; font-size: 1.2rem; }' +
					'.chat-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; }' +
					'#messages { flex: 1; overflow-y: auto; padding: 1rem; scroll-behavior: smooth; }' +
					'.message { margin-bottom: 1rem; animation: fadeIn 0.3s ease-in; display: flex; gap: 0.5rem; }' +
					'@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }' +
					'.user-avatar { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; background-color: var(--accent-blue); color: white; flex-shrink: 0; }' +
					'.ai-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--accent-green), var(--accent-blue)); color: white; padding: 2px; position: relative; box-shadow: 0 2px 8px rgba(78, 201, 176, 0.3); flex-shrink: 0; }' +
					'.ai-avatar .version { font-size: 10px; font-weight: 900; line-height: 1; letter-spacing: -0.5px; }' +
					'.ai-avatar .label { font-size: 6px; font-weight: 600; line-height: 1; opacity: 0.9; margin-top: -1px; }' +
					'.message-content { background-color: var(--bg-secondary); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); position: relative; flex: 1; line-height: 1.6; }' +
					'.user-message .message-content { background-color: var(--bg-tertiary); border-left: 3px solid var(--accent-blue); }' +
					'.ai-message .message-content { border-left: 3px solid var(--accent-green); }' +
					'.message-content pre { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; margin: 0.5rem 0; overflow-x: auto; position: relative; }' +
					'.message-content code { font-family: "Cascadia Code", "Fira Code", Consolas, monospace; font-size: 0.9rem; line-height: 1.5; }' +
					'.message-content pre code { color: var(--text-primary); white-space: pre; }' +
					'.message-content :not(pre) > code { background-color: var(--bg-tertiary); padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.85rem; color: var(--accent-orange); }' +
					'.copy-btn { position: absolute; top: 0.5rem; right: 0.5rem; background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; opacity: 0.7; transition: all 0.2s ease; }' +
					'.copy-btn:hover { opacity: 1; background-color: var(--hover-bg); color: var(--text-primary); }' +
					'.input-container { background-color: var(--bg-secondary); padding: 1rem; border-top: 1px solid var(--border-color); }' +
					'.input-wrapper { display: flex; flex-direction: column; gap: 0.5rem; }' +
					'#prompt { background-color: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.8rem; font-size: 0.9rem; font-family: inherit; resize: vertical; min-height: 60px; transition: border-color 0.2s ease; }' +
					'#prompt:focus { outline: none; border-color: var(--accent-blue); }' +
					'#prompt::placeholder { color: var(--text-secondary); }' +
					'#askBtn { background: linear-gradient(135deg, var(--accent-blue), var(--accent-green)); color: white; border: none; border-radius: 6px; padding: 0.8rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; align-self: flex-end; min-width: 100px; }' +
					'#askBtn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3); }' +
					'#askBtn:active { transform: translateY(0); }' +
					'#askBtn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }' +
					'#messages::-webkit-scrollbar { width: 8px; }' +
					'#messages::-webkit-scrollbar-track { background: var(--bg-primary); }' +
					'#messages::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }' +
					'#messages::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }' +
					'.keyword { color: var(--accent-purple); font-weight: bold; }' +
					'.string { color: var(--accent-orange); }' +
					'.number { color: #b5cea8; }' +
					'.comment { color: var(--text-secondary); font-style: italic; }' +
					'.function { color: var(--accent-yellow); font-weight: 600; }' +
					'.type { color: var(--accent-green); }' +
					'.variable { color: #9cdcfe; }' +
					'.php-tag { color: #569cd6; font-weight: bold; }' +
					'.sql-keyword { color: #c586c0; font-weight: bold; text-transform: uppercase; }' +
					'.jquery { color: #4fc3f7; font-weight: bold; }' +
					'.operator { color: #d4d4d4; }' +
					'.property { color: #9cdcfe; }' +
					'.attribute { color: #92c5f8; }' +
					'.error { color: #f44747; background-color: rgba(244, 71, 71, 0.1); padding: 2px 4px; border-radius: 3px; }' +
					'.message-content p { margin-bottom: 1rem; }' +
					'.message-content p:last-child { margin-bottom: 0; }' +
				'</style>' +
			'</head>' +
			'<body>' +
				'<div class="header">' +
					'<h2>🚀 Career Team 1.0 AI Chat</h2>' +
				'</div>' +
				'<div class="chat-container">' +
					'<div id="messages"></div>' +
				'</div>' +
				'<div class="input-container">' +
					'<div class="input-wrapper">' +
						'<textarea id="prompt" rows="2" placeholder="Ask me about PHP bugs, MySQL queries, jQuery issues, or any web development question..."></textarea>' +
						'<button id="askBtn">Send Message</button>' +
					'</div>' +
				'</div>' +
				'<script>' +
					'console.log("Script loading...");' +
					'const vscode = acquireVsCodeApi();' +
					'const promptTextarea = document.getElementById("prompt");' +
					'const askBtn = document.getElementById("askBtn");' +
					'const messagesDiv = document.getElementById("messages");' +
					'const codeBlocks = new Map();' +
					'let currentAiMessage = null;' +
					'console.log("Elements found:", promptTextarea, askBtn, messagesDiv);' +
					'if (askBtn) {' +
						'askBtn.addEventListener("click", function() {' +
							'console.log("Button clicked!");' +
							'const text = promptTextarea.value.trim();' +
							'console.log("Text to send:", text);' +
							'if (!text) return;' +
							'askBtn.disabled = true;' +
							'askBtn.textContent = "Sending...";' +
							'console.log("About to post message");' +
							'vscode.postMessage({ command: "chat", text: text });' +
							'promptTextarea.value = "";' +
						'});' +
					'}' +
					'function addMessage(role, content) {' +
						'const messageDiv = document.createElement("div");' +
						'messageDiv.className = "message " + role + "-message";' +
						'const avatarDiv = document.createElement("div");' +
						'if (role === "user") {' +
							'avatarDiv.className = "user-avatar";' +
							'avatarDiv.textContent = "U";' +
						'} else {' +
							'avatarDiv.className = "ai-avatar";' +
							'avatarDiv.innerHTML = "<span class=\\"version\\">1.0</span><span class=\\"label\\">AI</span>";' +
						'}' +
						'const contentDiv = document.createElement("div");' +
						'contentDiv.className = "message-content";' +
						'contentDiv.innerHTML = formatMessage(content);' +
						'messageDiv.appendChild(avatarDiv);' +
						'messageDiv.appendChild(contentDiv);' +
						'messagesDiv.appendChild(messageDiv);' +
						'messagesDiv.scrollTop = messagesDiv.scrollHeight;' +
						'return messageDiv;' +
					'}' +
					'function formatMessage(text) {' +
						'try {' +
							'console.log("Formatting message");' +
							'if (text.includes("```")) {' +
								'const parts = text.split("```");' +
								'let result = "";' +
								'for (let i = 0; i < parts.length; i++) {' +
									'if (i % 2 === 0) {' +
										'let textPart = parts[i];' +
										'textPart = textPart.replace(/\\n\\n/g, "</p><p>");' +
										'textPart = textPart.replace(/\\n/g, "<br>");' +
										'if (textPart.trim()) textPart = "<p>" + textPart + "</p>";' +
										'result += textPart;' +
									'} else {' +
										'const codeId = "code-" + Date.now() + "-" + i;' +
										'const code = parts[i].trim();' +
										'codeBlocks.set(codeId, code);' +
										'result += "<pre><code id=\\"" + codeId + "\\">" + escapeHtml(code) + "</code><button class=\\"copy-btn\\" data-code-id=\\"" + codeId + "\\">Copy</button></pre>";' +
									'}' +
								'}' +
								'return result;' +
							'} else {' +
								'text = text.replace(/\\n\\n/g, "</p><p>");' +
								'text = text.replace(/\\n/g, "<br>");' +
								'return "<p>" + text + "</p>";' +
							'}' +
						'} catch(e) {' +
							'console.error("Format error:", e);' +
							'return text;' +
						'}' +
					'}' +
					'function escapeHtml(text) {' +
						'const div = document.createElement("div");' +
						'div.textContent = text;' +
						'return div.innerHTML;' +
					'}' +
					'document.addEventListener("click", function(event) {' +
						'if (event.target && event.target.classList.contains("copy-btn")) {' +
							'const codeId = event.target.getAttribute("data-code-id");' +
							'const code = codeBlocks.get(codeId);' +
							'if (code) {' +
								'navigator.clipboard.writeText(code).then(() => {' +
									'const btn = event.target;' +
									'const oldText = btn.textContent;' +
									'btn.textContent = "Copied!";' +
									'btn.style.color = "#4ec9b0";' +
									'setTimeout(() => {' +
										'btn.textContent = oldText;' +
										'btn.style.color = "";' +
									'}, 2000);' +
								'}).catch(err => {' +
									'console.error("Copy failed:", err);' +
								'});' +
							'}' +
						'}' +
					'});' +
					'window.addEventListener("message", function(event) {' +
						'const { command, text } = event.data;' +
						'switch (command) {' +
							'case "addUserMessage":' +
								'addMessage("user", text);' +
								'break;' +
							'case "showTyping":' +
								'const typing = document.createElement("div");' +
								'typing.id = "typing";' +
								'typing.innerHTML = "<div class=\\"message ai-message\\"><div class=\\"ai-avatar\\"><span class=\\"version\\">1.0</span><span class=\\"label\\">AI</span></div><div class=\\"message-content\\"><em>AI is thinking...</em></div></div>";' +
								'messagesDiv.appendChild(typing);' +
								'messagesDiv.scrollTop = messagesDiv.scrollHeight;' +
								'break;' +
							'case "hideTyping":' +
								'const typingEl = document.getElementById("typing");' +
								'if (typingEl) typingEl.remove();' +
								'break;' +
							'case "startAiResponse":' +
								'currentAiMessage = addMessage("ai", "");' +
								'break;' +
							'case "updateAiResponse":' +
								'if (currentAiMessage) {' +
									'currentAiMessage.querySelector(".message-content").innerHTML = formatMessage(text);' +
									'messagesDiv.scrollTop = messagesDiv.scrollHeight;' +
								'}' +
								'break;' +
							'case "finalizeAiResponse":' +
								'currentAiMessage = null;' +
								'askBtn.disabled = false;' +
								'askBtn.textContent = "Send Message";' +
								'break;' +
							'case "chatError":' +
								'addMessage("ai", "❌ " + text);' +
								'askBtn.disabled = false;' +
								'askBtn.textContent = "Send Message";' +
								'break;' +
						'}' +
					'});' +
					'promptTextarea.focus();' +
				'</script>' +
			'</body>' +
		'</html>';
}

// This method is called when your extension is deactivated
export function deactivate() {}