const { app, BrowserWindow, screen, ipcMain } = require('electron');
const { Tray, Menu, nativeImage } = require('electron')

const path = require('path');

let overlaySettings = {
  opacity: 0.5,
  color: "255,0,0"
}

let tray = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false, // 移除視窗邊框 false
    transparent: true, // 開啟視窗透明 true
    alwaysOnTop: false, // 始終置頂 true
    fullscreen: true, // 全螢幕 true
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
    win.setIgnoreMouseEvents(true, { forward: true })
  });

  ipcMain.on('update-settings', (event, newSettings) => {
    overlaySettings = { ...overlaySettings, ...newSettings }
  })

  ipcMain.on('set-ignore-mouse', (event, active) => {
    win.setIgnoreMouseEvents(active, { forward: true });
  })

  ipcMain.on('set-show-taskbar', (event, active) => {
    win.setSkipTaskbar(!active);
  })

  // --- 建立 Tray (系統匣圖示) ---
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
  tray = new Tray(icon);
  // 設定滑鼠移上去顯示的文字
  tray.setToolTip('螢幕遮罩工具');
  // 建立右鍵選單
  const contextMenu = Menu.buildFromTemplate([
    { label: '顯示控制面板', click: () => win.webContents.send('show-panel', true) },
    { label: '隱藏控制面板', click: () => win.webContents.send('show-panel', false) },
    { label: '完全退出', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);
  // 選用：點擊圖示時切換顯示/隱藏
  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show();
  });
}

app.whenReady().then(createWindow);