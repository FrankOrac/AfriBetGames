#!/usr/bin/env node
import { execSync } from 'child_process';
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

function checkNodeVersion() {
  log('\n====================================', colors.blue);
  log('  AfriBet Games - Setup Script', colors.bold);
  log('====================================\n', colors.blue);

  try {
    const version = execSync('node --version').toString().trim();
    log(`✓ Node.js detected: ${version}`, colors.green);
    
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion < 18) {
      log('⚠ Warning: Node.js 18+ is recommended', colors.yellow);
    }
  } catch (error) {
    log('✗ Node.js is not installed!', colors.red);
    log('Please install Node.js from https://nodejs.org/', colors.yellow);
    process.exit(1);
  }

  try {
    const npmVersion = execSync('npm --version').toString().trim();
    log(`✓ npm detected: ${npmVersion}`, colors.green);
  } catch (error) {
    log('✗ npm is not installed!', colors.red);
    process.exit(1);
  }
}

function installDependencies() {
  const nodeModulesPath = join(process.cwd(), 'node_modules');
  
  if (existsSync(nodeModulesPath)) {
    log('\n📦 Dependencies already installed', colors.yellow);
    log('Checking for updates...', colors.blue);
  } else {
    log('\n📦 Installing dependencies...', colors.blue);
    log('This may take a few minutes. Please wait...', colors.yellow);
  }

  try {
    execSync('npm install', { stdio: 'inherit' });
    log('\n✓ Dependencies installed successfully!', colors.green);
  } catch (error) {
    log('\n✗ Failed to install dependencies', colors.red);
    log('Please check your internet connection and try again', colors.yellow);
    process.exit(1);
  }
}

function displaySuccessMessage() {
  log('\n====================================', colors.green);
  log('  Setup Completed Successfully! ✓', colors.bold);
  log('====================================\n', colors.green);
  
  log('To start the development server, run:', colors.blue);
  log('  npm run start:dev', colors.bold);
  log('  or', colors.blue);
  log('  npm run dev\n', colors.bold);
  
  log('The app will be available at:', colors.blue);
  log('  http://localhost:5000\n', colors.bold);
}

async function main() {
  try {
    checkNodeVersion();
    installDependencies();
    displaySuccessMessage();
  } catch (error) {
    log(`\n✗ Setup failed: ${error}`, colors.red);
    process.exit(1);
  }
}

main();
