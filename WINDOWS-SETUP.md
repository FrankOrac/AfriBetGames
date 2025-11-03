# Windows Setup Guide for AfriBet Games

This guide will help you run AfriBet Games on your Windows machine.

## Prerequisites

Before you begin, make sure you have **Node.js** installed on your Windows machine.

### Install Node.js

1. Download Node.js (LTS version recommended) from: https://nodejs.org/
2. Run the installer
3. Follow the installation wizard (keep all default settings)
4. Restart your computer after installation

### Verify Installation

Open Command Prompt (cmd) and run:
```
node --version
npm --version
```

You should see version numbers for both commands.

## Quick Start

### Option 1: Using Batch Scripts (Recommended)

1. **First Time Setup**
   - Double-click `setup-windows.bat`
   - Wait for all dependencies to install (this may take 3-5 minutes)
   - You'll see "Setup completed successfully!" when done

2. **Start the Application**
   - Double-click `start-windows.bat`
   - Wait for "serving on port 5000" message
   - Open your browser and go to: http://localhost:5000

3. **Stop the Application**
   - Press `Ctrl+C` in the command window
   - Type `Y` and press Enter to confirm

### Option 2: Using Command Prompt

1. **Open Command Prompt**
   - Press `Windows Key + R`
   - Type `cmd` and press Enter

2. **Navigate to Project Folder**
   ```
   cd path\to\afribet-games
   ```

3. **Install Dependencies (First Time Only)**
   ```
   npm install
   ```

4. **Start the Application**
   ```
   set NODE_ENV=development
   npm run dev
   ```

5. **Open in Browser**
   - Go to: http://localhost:5000

## Troubleshooting

### Port 5000 Already in Use

If you see an error about port 5000 being in use:

1. Find what's using the port:
   ```
   netstat -ano | findstr :5000
   ```

2. Kill the process (replace PID with the number from step 1):
   ```
   taskkill /PID <PID> /F
   ```

### "tsx: not found" Error

If you see this error, run:
```
npm install
```

### "NODE_ENV is not recognized" Error

This is automatically fixed! The project now uses `cross-env` to handle Windows environment variables. If you see this error:

1. Make sure you ran `setup-windows.bat` or `npm install`
2. The `cross-env` package should be installed automatically
3. Try running `npm install cross-env` if the issue persists

### Application Won't Start

1. Delete `node_modules` folder
2. Run `setup-windows.bat` again

### Browser Shows "Cannot connect"

1. Make sure the server is running (you should see "serving on port 5000")
2. Wait a few seconds for the server to fully start
3. Try refreshing the browser

## Development Notes

- **Hot Reload**: The app will automatically reload when you make changes to the code
- **Console**: Keep the command window open to see logs and errors
- **Stop Server**: Always use `Ctrl+C` to properly stop the server

## Building for Production

To create a production build:
```
npm run build
npm run start
```

## Need Help?

If you encounter any issues:
1. Make sure Node.js version is 18 or higher: `node --version`
2. Make sure you're in the correct project directory
3. Try deleting `node_modules` and running `npm install` again
4. Check that no antivirus is blocking Node.js

---

**Enjoy AfriBet Games!** 🎮
