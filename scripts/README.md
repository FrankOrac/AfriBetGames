# AfriBet Games - Scripts

This folder contains TypeScript scripts for easy project setup and development.

## Available Scripts

### setup.ts

**Purpose:** Install and verify all project dependencies

**Usage:**
```bash
npm run setup
```

**Features:**
- ✅ Checks Node.js version (warns if < 18)
- ✅ Checks npm installation
- ✅ Installs all dependencies automatically
- ✅ Colored terminal output for better visibility
- ✅ Clear success/error messages

**When to use:**
- First time setting up the project
- After pulling new changes with updated dependencies
- When dependencies are corrupted or missing

---

### start-dev.ts

**Purpose:** Start the development server with a nice UI

**Usage:**
```bash
npm run start:dev
```

**Features:**
- ✅ Checks if dependencies are installed
- ✅ Sets NODE_ENV=development automatically
- ✅ Starts Express backend and Vite frontend
- ✅ Shows clear URL to access the app
- ✅ Graceful shutdown on Ctrl+C
- ✅ Colored output for better UX

**What it does:**
- Verifies `node_modules` exists
- Sets environment variables
- Runs `npm run dev` with proper configuration
- Handles errors gracefully

---

## How It Works

Both scripts are written in TypeScript and use:

- **Node.js built-in modules** (`child_process`, `fs`, `path`)
- **ANSI color codes** for terminal styling
- **tsx** for TypeScript execution
- **Process management** for graceful shutdown

## Customization

You can modify these scripts to:
- Add pre-start checks
- Set additional environment variables
- Run database migrations
- Check for required services
- Add custom logging

## Cross-Platform Support

These scripts work on:
- ✅ Windows
- ✅ macOS
- ✅ Linux

No platform-specific code needed!

## Troubleshooting

### "tsx: not found"

**Solution:**
```bash
npm install
```

### Script won't run

**Solution:**
Make sure you're in the project root directory:
```bash
pwd  # or 'cd' on Windows
```

### Permission denied (Mac/Linux)

**Solution:**
```bash
chmod +x scripts/*.ts
```

## Contributing

When adding new scripts:
1. Create new `.ts` file in this folder
2. Add npm script in `package.json`
3. Use colored output for better UX
4. Add error handling
5. Update this README
