const { app, BrowserWindow, Tray, ipcMain, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let counter = 0;
let loopRunning = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 240,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile('index.html');
}

function setTrayIcon() {
  const iconPath = path.join(__dirname, 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray.setImage(icon);
}

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  tray.setToolTip('Memory Leak Demo');

  createWindow();

  ipcMain.handle('start-loop', async () => {
    counter = 0;
    loopRunning = true;
    for (let i = 0; i < 100; i++) {
      if (!loopRunning) break;
      counter++;
      setTrayIcon();
      const mem = process.memoryUsage();
      mainWindow.webContents.send('update', {
        counter,
        rss: (mem.rss / 1024 / 1024).toFixed(2),
        heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2),
        heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2),
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,
      });
      await new Promise((r) => setTimeout(r, 250));
    }
    loopRunning = false;
    mainWindow.webContents.send('stopped');
  });

  ipcMain.handle('stop-loop', () => {
    loopRunning = false;
  });
});

app.on('window-all-closed', () => app.quit());
