# VS Code Setup Guide for AfriBet Games

This guide shows you how to run AfriBet Games directly from VS Code using TypeScript scripts.

## Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **VS Code** - [Download here](https://code.visualstudio.com/)
3. **Git** (optional) - For cloning the repository

**Note:** The project uses `cross-env` for Windows compatibility, which is automatically installed during setup.

## Quick Start in VS Code

### 1. Open Project in VS Code

**Option A: Using File Menu**
- Open VS Code
- Go to `File` → `Open Folder`
- Select the `afribet-games` folder

**Option B: Using Terminal**
```bash
cd path/to/afribet-games
code .
```

### 2. Open Integrated Terminal

Press `` Ctrl+` `` (backtick) or go to `View` → `Terminal`

### 3. Run Setup (First Time Only)

In the VS Code terminal, run:
```bash
npm run setup
```

This will:
- ✅ Check your Node.js version
- ✅ Install all dependencies automatically
- ✅ Display success message when complete

**Output:**
```
====================================
  AfriBet Games - Setup Script
====================================

✓ Node.js detected: v20.x.x
✓ npm detected: 10.x.x

📦 Installing dependencies...
This may take a few minutes. Please wait...

✓ Dependencies installed successfully!

====================================
  Setup Completed Successfully! ✓
====================================
```

### 4. Start Development Server

Run:
```bash
npm run start:dev
```

**Output:**
```
====================================
  Starting AfriBet Games Server
====================================

🚀 Starting development server...

The application will be available at:
  http://localhost:5000

Press Ctrl+C to stop the server
```

### 5. Open in Browser

- Open your browser
- Go to: `http://localhost:5000`
- Start playing! 🎮

## Available Scripts

All these scripts can be run from VS Code's terminal:

| Command | Description |
|---------|-------------|
| `npm run setup` | Install dependencies (first time only) |
| `npm run start:dev` | Start development server with nice UI |
| `npm run dev` | Start server (alternative method) |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | Type-check TypeScript |
| `npm run build:api` | Build Vercel API bundle |

## VS Code Extensions (Recommended)

Install these extensions for the best development experience:

1. **ESLint** - JavaScript/TypeScript linting
2. **Prettier** - Code formatter
3. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind
4. **TypeScript Vue Plugin (Volar)** - Better TypeScript support
5. **Error Lens** - Inline error messages

**To install:**
- Press `Ctrl+Shift+X`
- Search for each extension
- Click "Install"

## Running Tasks from VS Code

### Method 1: Using npm Scripts (Recommended)

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "npm"
4. Choose your script (setup, start:dev, etc.)

### Method 2: Create VS Code Task

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start AfriBet Dev Server",
      "type": "npm",
      "script": "start:dev",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Setup AfriBet",
      "type": "npm",
      "script": "setup",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Then press `Ctrl+Shift+B` to run tasks quickly!

## Debugging in VS Code

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**To debug:**
1. Press `F5` or click the play button in the Debug panel
2. Set breakpoints by clicking left of line numbers
3. Use Debug Console to inspect variables

## Troubleshooting

### "tsx: not found" Error

**Solution:**
```bash
npm install
```

### Port 5000 Already in Use

**Solution (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
lsof -i :5000
kill -9 <PID>
```

### Dependencies Not Installing

**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm run setup` again

### TypeScript Errors in VS Code

**Solution:**
1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### Hot Reload Not Working

**Solution:**
1. Stop the server (Ctrl+C)
2. Run `npm run start:dev` again
3. Hard refresh browser (Ctrl+Shift+R)

## Terminal Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `` Ctrl+` `` | Toggle terminal |
| `Ctrl+Shift+5` | Split terminal |
| `Ctrl+C` | Stop server |
| `Ctrl+L` | Clear terminal |
| `Up Arrow` | Previous command |

## Project Structure

```
afribet-games/
├── scripts/          # Setup and start scripts
│   ├── setup.ts      # Dependency installer
│   └── start-dev.ts  # Dev server launcher
├── client/           # Frontend React code
│   └── src/
│       ├── pages/    # Page components
│       └── components/ # Reusable components
├── server/           # Backend Express code
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes
│   └── storage.ts    # In-memory database
├── shared/           # Shared types
│   └── schema.ts     # Data models
└── package.json      # Dependencies & scripts
```

## Development Tips

1. **Auto-save**: Enable in VS Code settings for instant updates
2. **Split editor**: `Ctrl+\` to view multiple files
3. **Go to definition**: `F12` on any function/component
4. **Multi-cursor**: `Alt+Click` to edit multiple lines
5. **Command palette**: `Ctrl+Shift+P` for all commands

## Production Deployment

See `DEPLOYMENT.md` for deploying to:
- Vercel (serverless)
- Replit
- Traditional VPS

---

**Happy coding!** 🚀 If you need help, check the main README.md or create an issue on GitHub.
