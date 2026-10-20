const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    title: 'TrueTrace AI — Digital Identity Risk Assessment',
    backgroundColor: '#050811',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Strict Content Security Policy (CSP)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' http://127.0.0.1:8000 http://localhost:8000 http://localhost:5173; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;"
        ],
      },
    });
  });

  // Secure External Link Interception
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Only allow http and https external links in OS browser
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocalApp = url.startsWith('http://localhost:5173') || url.startsWith('file://');
    if (!isLocalApp) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Load URL or local production build
  const bundledDistPath = path.join(__dirname, '../web-dist/index.html');
  const localDistPath = path.join(__dirname, '../../web/dist/index.html');
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    });
  } else if (fs.existsSync(bundledDistPath)) {
    mainWindow.loadFile(bundledDistPath);
  } else if (fs.existsSync(localDistPath)) {
    mainWindow.loadFile(localDistPath);
  } else {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
