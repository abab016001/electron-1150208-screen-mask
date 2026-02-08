const { app, BrowserWindow, screen, ipcMain } = require('electron');

const path = require('path');

let overlaySettings = {
  opacity: 0.5,
  color: "255,0,0"
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: true, // 移除視窗邊框 false
    transparent: false, // 開啟視窗透明 true
    alwaysOnTop: false, // 始終置頂 true
    fullscreen: false, // 全螢幕 true
    skipTaskbar: false, // 不在工具列顯示 true
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  })

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => {
    win.show();
    win.setAlwaysOnTop(true, 'screen-saver');
    // 當網頁載入完成後，把初始值丟給前端
    win.webContents.send('init-settings', overlaySettings);
  });

  ipcMain.on('update-settings', (event, newSettings) => {
    overlaySettings = { ...overlaySettings, ...newSettings }
  })
}

app.whenReady().then(createWindow);