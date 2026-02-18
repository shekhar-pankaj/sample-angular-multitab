# Troubleshooting Guide

## Current Issue: Node.js Compatibility

You're running **Node.js v22.20.0**, which is very new. Angular 17 was built before Node.js 22 was released, so there may be compatibility issues.

## Solutions

### Option 1: Use Node Version Manager (Recommended)

Install and use an LTS version of Node.js (18.x or 20.x):

#### Using NVM for Windows:
```bash
# Install NVM from: https://github.com/coreybutler/nvm-windows

# Install Node 20 LTS
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Reinstall dependencies
cd c:\Users\shekhar.pankaj\source\repos\sample-angular-multitab
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
npm start
```

### Option 2: Upgrade to Angular 18+

Angular 18+ has better support for newer Node versions:

```bash
# Update package.json dependencies to Angular 18
npm install @angular/animations@^18.0.0 @angular/common@^18.0.0 @angular/compiler@^18.0.0 @angular/core@^18.0.0 @angular/forms@^18.0.0 @angular/platform-browser@^18.0.0 @angular/platform-browser-dynamic@^18.0.0 @angular/router@^18.0.0 --save

npm install @angular-devkit/build-angular@^18.0.0 @angular/cli@^18.0.0 @angular/compiler-cli@^18.0.0 --save-dev

npm start
```

### Option 3: Force Clean Install

If you want to continue with Node 22:

```powershell
# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Force remove node_modules
Remove-Item -Recurse -Force node_modules -ErrorAction Stop
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Install with legacy peer deps (helps with compatibility)
npm install --legacy-peer-deps

# Start the app
npm start
```

## Current Error Explanation

The error `Cannot find module './scope'` in the `ajv` package typically indicates:
1. Corrupted npm installation
2. Node.js version incompatibility
3. File system locking issues during installation

## Recommended Approach

**Use Node.js v20 LTS** as it's the most stable and widely supported version for Angular 17.

Check your Node.js version:
```bash
node --version
```

If it shows v22.x, switch to v20.x using NVM.

## Alternative: Use Docker

If you want to avoid version management issues:

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t angular-multitab .
docker run -p 4200:4200 angular-multitab
```

## Quick Test

Once dependencies are installed, test with:
```bash
# Check if Angular CLI works
npx ng version

# If that works, start the server
npm start
```

## If All Else Fails

Use the Angular CLI to create a fresh project and copy our source files:

```bash
# Install Angular CLI globally with Node 20
npm install -g @angular/cli@17

# Create new project
ng new sample-angular-multitab-fresh --routing --style=scss

# Copy our source files
Copy-Item -Recurse src\app\* sample-angular-multitab-fresh\src\app\
Copy-Item src\styles.scss sample-angular-multitab-fresh\src\

# Start
cd sample-angular-multitab-fresh
npm start
```
