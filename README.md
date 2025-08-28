# CareerTeam 1.0 Devs - AI Coding Assistant

A powerful VS Code extension that provides AI-powered coding assistance using locally installed AI models. Get unlimited coding help without hitting premium API limits or sending your code to external services.

## 🚀 Features

- **Local AI Processing**: Run AI models locally on your machine for complete privacy
- **No Premium Limits**: Unlimited usage without subscription fees or API rate limits
- **Code Privacy**: Your code never leaves your machine
- **Real-time Chat**: Interactive AI assistant integrated directly into VS Code
- **Multiple Language Support**: Get help with PHP, JavaScript, Python, SQL, and more
- **Syntax Highlighting**: Beautiful code formatting in chat responses

## 📋 Prerequisites

Before installing the extension, you'll need to set up the following:

### 1. Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Recommended: Latest LTS version
- Verify installation: `node --version` and `npm --version`

### 2. Install Ollama
Ollama allows you to run large language models locally on your machine.

#### Windows/Mac/Linux:
1. Visit [ollama.ai](https://ollama.ai/) and download the installer
2. Install Ollama following the platform-specific instructions
3. Verify installation by opening a terminal and running: `ollama --version`

#### Install the AI Model:
After installing Ollama, you need to download the AI model:

```bash
ollama pull deepseek-r1:latest
```

This will download the DeepSeek R1 model, which is optimized for coding assistance.

## 🛠️ Installation & Setup

### Step 1: Clone and Build the Extension

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd careerteam-1-0-devs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

### Step 2: Debug and Test the Extension

1. Open the project in VS Code
2. Press `Ctrl + P` (or `Cmd + P` on Mac)
3. Type: `> Debug: Select and Start Debugging`
4. This will open a new VS Code window with your extension installed

### Step 3: Start Using the AI Assistant

1. In the new VS Code window, press `Ctrl + P` (or `Cmd + P` on Mac)
2. Type: `> Career Team 1.0 Chat`
3. The AI chat interface will open in a new panel

## 💡 Usage

### Starting a Chat Session
- Use the command palette (`Ctrl + P`) and search for "Career Team 1.0 Chat"
- Or use "Test Ollama Connection" to verify your setup

### Getting Coding Help
The AI assistant can help you with:
- **Bug Fixes**: Describe your issue and get solutions
- **Code Explanation**: Paste code and ask for explanations
- **Code Generation**: Request specific functions or components
- **Database Queries**: Get help with SQL queries
- **Framework Questions**: Ask about PHP, jQuery, React, etc.
- **Best Practices**: Get advice on code structure and optimization

### Example Prompts:
- "Fix this PHP function that's not working properly: [paste code]"
- "Write a MySQL query to find users who haven't logged in for 30 days"
- "Explain how this JavaScript function works"
- "Create a responsive CSS layout for a dashboard"

## 🔧 Troubleshooting

### Ollama Connection Issues
1. **Ensure Ollama is running**: 
   ```bash
   ollama serve
   ```

2. **Verify the model is installed**:
   ```bash
   ollama list
   ```
   You should see `deepseek-r1:latest` in the list.

3. **Test the connection**: Use the "Test Ollama Connection" command in VS Code

### Extension Not Loading
1. Make sure you've run `npm run compile`
2. Check the VS Code developer console for errors (`Help > Toggle Developer Tools`)
3. Restart the debug session

### Performance Issues
- The AI model runs locally, so performance depends on your hardware
- For better performance, ensure you have adequate RAM (8GB+ recommended)
- Close unnecessary applications while using the AI assistant

## 🎯 Why Use This Extension?

### ✅ Advantages:
- **Complete Privacy**: Your code never leaves your machine
- **No Costs**: No subscription fees or API charges
- **Unlimited Usage**: No rate limits or usage caps
- **Offline Capable**: Works without internet connection (after initial setup)
- **Customizable**: Modify the extension to fit your needs

### 🆚 vs. Other AI Coding Tools:
- **GitHub Copilot**: Requires subscription, sends code to servers
- **ChatGPT/Claude**: Rate limits, subscription costs, privacy concerns
- **Other AI Tools**: Usually cloud-based with usage restrictions

## 🔄 Development

### Available Scripts:
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and auto-compile
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Project Structure:
```
├── src/
│   ├── extension.ts      # Main extension code
│   └── test/            # Test files
├── out/                 # Compiled JavaScript (auto-generated)
├── package.json         # Extension manifest
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test them
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Make sure Ollama is properly installed and running

## 🌟 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by [Ollama](https://ollama.ai/) for local AI inference
- Uses [DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1) model for coding assistance

---

**Happy Coding! 🚀**

*Get unlimited AI coding assistance while keeping your code private and secure.*