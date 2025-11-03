#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkDependencies() {
  const nodeModulesPath = join(process.cwd(), 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    log('✗ Dependencies not installed!', colors.red);
    log('\nPlease run setup first:', colors.yellow);
    log('  npm run setup\n', colors.bold);
    process.exit(1);
  }
}

function startServer() {
  log('\n====================================', colors.blue);
  log('  Starting AfriBet Games Server', colors.bold);
  log('====================================\n', colors.blue);
  
  log('🚀 Starting development server...', colors.green);
  log('\nThe application will be available at:', colors.blue);
  log('  http://localhost:5000\n', colors.bold);
  
  log('Press Ctrl+C to stop the server\n', colors.yellow);

  // Set environment variable and start the dev server
  const env = { ...process.env, NODE_ENV: 'development' };
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env,
  });

  devProcess.on('error', (error) => {
    log(`\n✗ Failed to start server: ${error.message}`, colors.red);
    process.exit(1);
  });

  devProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n✗ Server exited with code ${code}`, colors.red);
      process.exit(code);
    }
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    log('\n\n👋 Shutting down server...', colors.yellow);
    devProcess.kill('SIGINT');
    process.exit(0);
  });
}

async function main() {
  try {
    checkDependencies();
    startServer();
  } catch (error) {
    log(`\n✗ Error: ${error}`, colors.red);
    process.exit(1);
  }
}

main();
